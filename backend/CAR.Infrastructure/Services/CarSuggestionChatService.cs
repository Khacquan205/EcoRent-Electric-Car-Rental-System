using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Net.Http.Json;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using CAR.Application.Dtos;
using CAR.Application.Dtos.Chat;
using CAR.Application.Interfaces.Repositories;
using CAR.Application.Interfaces.Services;
using CAR.Domain.Enums;
using CAR.Infrastructure.Options;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace CAR.Infrastructure.Services
{
    /// <summary>Parse user message → query posts (filter + sort ưu tiên quảng cáo) → gọi OpenAI để tạo câu trả lời chỉ từ danh sách xe thật.</summary>
    public class CarSuggestionChatService : ICarSuggestionChatService
    {
        private readonly IPostService _postService;
        private readonly IPostRepository _postRepository;
        private readonly IVehicleCategoryRepository _categoryRepository;
        private readonly ILocationRepository _locationRepository;
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly OpenAISettings _openAi;

        public CarSuggestionChatService(
            IPostService postService,
            IPostRepository postRepository,
            IVehicleCategoryRepository categoryRepository,
            ILocationRepository locationRepository,
            IHttpClientFactory httpClientFactory,
            IOptions<OpenAISettings> openAi)
        {
            _postService = postService;
            _postRepository = postRepository;
            _categoryRepository = categoryRepository;
            _locationRepository = locationRepository;
            _httpClientFactory = httpClientFactory;
            _openAi = openAi?.Value ?? new OpenAISettings();
        }

        public async Task<SuggestCarsResponseDto> SuggestCarsAsync(string userMessage)
        {
            if (string.IsNullOrWhiteSpace(userMessage))
            {
                return new SuggestCarsResponseDto
                {
                    Reply = "Bạn muốn tìm xe thuê theo tiêu chí gì? (Ví dụ: xe giá khoảng 400k/ngày, xe hãng Mercedes, xe theo danh mục hoặc khu vực...)"
                };
            }

            // Chào hỏi: trả lời dẫn dắt + gợi ý vài xe, không im re
            if (IsGreeting(userMessage))
            {
                var topPosts = await _postService.GetPublicPostsForSuggestionAsync(null, null, null, null, null, limit: 5).ConfigureAwait(false);
                var reply = "Xin chào! Bạn muốn tìm xe thuê theo tiêu chí gì? Ví dụ: xe giá dưới 500k, xe theo danh mục... ";
                if (topPosts.Count > 0)
                    reply += "Dưới đây là một số xe đang có sẵn để bạn tham khảo.";
                else
                    reply += "Hiện đang có xe trong hệ thống, bạn có thể thử tìm theo giá, hãng xe hoặc danh mục.";
                return new SuggestCarsResponseDto { Reply = reply, SuggestedPosts = topPosts };
            }

            // Cảm ơn / tạm biệt: trả lời ngắn, không cần query xe
            if (IsThanksOrBye(userMessage))
            {
                return new SuggestCarsResponseDto
                {
                    Reply = "Cảm ơn bạn! Chúc bạn tìm được xe ưng ý. Cần gì thêm cứ nhắn nhé."
                };
            }

            // Phase 2: AI extract intent khi có API key; fallback regex nếu AI lỗi
            SuggestionIntent intent;
            if (!string.IsNullOrWhiteSpace(_openAi.ApiKey))
            {
                try
                {
                    intent = await ExtractIntentWithOpenAiAsync(userMessage).ConfigureAwait(false);
                }
                catch
                {
                    intent = await ParseIntentAsync(userMessage).ConfigureAwait(false);
                }
            }
            else
            {
                intent = await ParseIntentAsync(userMessage).ConfigureAwait(false);
            }
            // Nếu tin nhắn lạc đề (phở, thời tiết...): lấy top posts, không semantic
            var useSemantic = !IsLikelyOffTopic(userMessage) && !intent.OrderByPriceDesc && !intent.OrderByPriceAsc;
            var posts = await _postService.GetPublicPostsForSuggestionAsync(
                intent.MaxPrice, intent.MinPrice, intent.CategoryId, intent.LocationIds, intent.BrandKeyword,
                limit: intent.Limit,
                semanticQueryForRanking: useSemantic ? userMessage : null,
                orderByPriceDesc: intent.OrderByPriceDesc,
                orderByPriceAsc: intent.OrderByPriceAsc).ConfigureAwait(false);

            // (1) Post-query validation: filter lại theo intent (đảm bảo giá, hãng đúng)
            posts = FilterPostsByIntent(posts, intent).ToList();

            // Khi không có xe: lấy danh mục để trả lời
            List<string>? categoryNamesForNoResult = null;
            if (posts.Count == 0)
            {
                categoryNamesForNoResult = await _categoryRepository.Query()
                    .Where(c => c.Status == 1)
                    .OrderBy(c => c.Name)
                    .Select(c => c.Name)
                    .ToListAsync()
                    .ConfigureAwait(false);
            }

            if (string.IsNullOrWhiteSpace(_openAi.ApiKey))
            {
                return BuildFallbackReply(posts, userMessage, categoryNamesForNoResult);
            }

            // (2) Intent rõ: dùng template (không cho AI kể giá), đảm bảo chính xác từ DB
            if (IsIntentClear(intent))
            {
                return BuildTemplateReply(posts, intent, categoryNamesForNoResult);
            }

            // (4) Intent mơ hồ: dùng AI với structured output JSON {intro, postIds}
            return await BuildReplyWithStructuredOutputAsync(posts, userMessage, categoryNamesForNoResult).ConfigureAwait(false);
        }

        /// <summary>(1) Post-query validation: lọc posts theo intent (giá, hãng).</summary>
        private static IEnumerable<PostListItemDto> FilterPostsByIntent(IEnumerable<PostListItemDto> posts, SuggestionIntent intent)
        {
            foreach (var p in posts)
            {
                if (intent.MaxPrice.HasValue && p.Price > intent.MaxPrice.Value) continue;
                if (intent.MinPrice.HasValue && p.Price < intent.MinPrice.Value) continue;
                if (!string.IsNullOrWhiteSpace(intent.BrandKeyword) && (p.Title == null || !p.Title.Contains(intent.BrandKeyword, StringComparison.OrdinalIgnoreCase))) continue;
                yield return p;
            }
        }

        /// <summary>(2) Intent rõ: có filter giá/category/brand hoặc order đắt nhất/rẻ nhất.</summary>
        private static bool IsIntentClear(SuggestionIntent intent)
        {
            return intent.MaxPrice.HasValue || intent.MinPrice.HasValue
                || intent.CategoryId.HasValue || (intent.LocationIds != null && intent.LocationIds.Count > 0)
                || !string.IsNullOrWhiteSpace(intent.BrandKeyword)
                || intent.OrderByPriceDesc || intent.OrderByPriceAsc;
        }

        /// <summary>(2) Template khi intent rõ: dữ liệu lấy từ DB, không cho AI kể giá.</summary>
        private static SuggestCarsResponseDto BuildTemplateReply(List<PostListItemDto> posts, SuggestionIntent intent, IReadOnlyList<string>? categoryNamesWhenEmpty)
        {
            if (posts.Count == 0)
                return BuildFallbackReply(posts, "", categoryNamesWhenEmpty);
            var items = string.Join("; ", posts.Take(10).Select(p => $"{p.Title} - {p.Price:N0} đ/ngày"));
            var reply = $"Đây là {posts.Count} xe phù hợp: {items}";
            if (posts.Count > 10) reply += $" (... và {posts.Count - 10} xe khác)";
            return new SuggestCarsResponseDto { Reply = reply, SuggestedPosts = posts };
        }

        /// <summary>(4) Structured output: AI trả JSON {intro, postIds}, ta build reply từ dữ liệu DB để đảm bảo chính xác.</summary>
        private async Task<SuggestCarsResponseDto> BuildReplyWithStructuredOutputAsync(List<PostListItemDto> posts, string userMessage, IReadOnlyList<string>? categoryNamesWhenEmpty = null)
        {
            if (posts.Count == 0)
                return BuildFallbackReply(posts, userMessage, categoryNamesWhenEmpty);

            var meta = await GetPlatformMetadataAsync().ConfigureAwait(false);
            var systemPrompt = BuildSystemPrompt(meta);
            var postIds = string.Join(",", posts.Select(p => p.Id));
            var carList = string.Join("\n", posts.Select((p, i) => $"{i + 1}. ID={p.Id}, {p.Title}, giá {p.Price:N0} đ/ngày"));

            var userPrompt = $@"DANH SÁCH XE (CHỈ ĐƯỢC NHẮC postIds CÓ TRONG DANH SÁCH NÀY):
{carList}

Tin nhắn khách: {userMessage}

Trả lời BẮT BUỘC bằng JSON: {{""intro"":""Câu mở đầu thân thiện"",""postIds"":[id1,id2,...]}}
- intro: câu dẫn ngắn bằng tiếng Việt.
- postIds: mảng ID xe gợi ý (CHỈ id có trong list trên, tối đa {Math.Min(posts.Count, 5)} id).";

            var client = _httpClientFactory.CreateClient();
            var url = $"{_openAi.BaseUrl.TrimEnd('/')}/v1/chat/completions";
            using var req = new HttpRequestMessage(HttpMethod.Post, url);
            req.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", _openAi.ApiKey);
            req.Content = JsonContent.Create(new
            {
                model = !string.IsNullOrWhiteSpace(_openAi.ChatModel) ? _openAi.ChatModel : _openAi.Model,
                messages = new[]
                {
                    new { role = "system", content = systemPrompt },
                    new { role = "user", content = userPrompt }
                },
                temperature = 0.3,
                max_tokens = 512,
                response_format = new { type = "json_object" }
            });

            using var res = await client.SendAsync(req).ConfigureAwait(false);
            if (!res.IsSuccessStatusCode)
                return BuildFallbackReply(posts, userMessage, categoryNamesWhenEmpty);

            var jsonRes = await res.Content.ReadFromJsonAsync<OpenAiChatCompletionResponse>().ConfigureAwait(false);
            var raw = jsonRes?.GetReplyText()?.Trim() ?? "";
            if (string.IsNullOrEmpty(raw))
                return BuildFallbackReply(posts, userMessage, categoryNamesWhenEmpty);

            raw = Regex.Replace(raw, @"^```(?:json)?\s*", "").Trim();
            raw = Regex.Replace(raw, @"\s*```\s*$", "").Trim();

            var postById = posts.ToDictionary(p => p.Id);
            string intro = "";
            var selectedIds = new List<int>();

            try
            {
                var doc = System.Text.Json.JsonDocument.Parse(raw);
                if (doc.RootElement.TryGetProperty("intro", out var introEl))
                    intro = introEl.GetString() ?? "";
                if (doc.RootElement.TryGetProperty("postIds", out var idsEl) && idsEl.ValueKind == System.Text.Json.JsonValueKind.Array)
                {
                    foreach (var el in idsEl.EnumerateArray())
                    {
                        if (el.TryGetInt32(out var id) && postById.ContainsKey(id))
                            selectedIds.Add(id);
                    }
                }
            }
            catch
            {
                return BuildFallbackReply(posts, userMessage, categoryNamesWhenEmpty);
            }

            var selectedPosts = selectedIds.Select(id => postById[id]).ToList();
            if (selectedPosts.Count == 0)
                selectedPosts = posts.Take(5).ToList();

            var lines = selectedPosts.Select(p => $"{p.Title} - {p.Price:N0} đ/ngày");
            var reply = string.IsNullOrWhiteSpace(intro)
                ? "Gợi ý một số xe phù hợp:\n" + string.Join("\n", lines.Select(l => "• " + l))
                : intro.TrimEnd() + "\n\n" + string.Join("\n", lines.Select(l => "• " + l));

            return new SuggestCarsResponseDto { Reply = reply, SuggestedPosts = selectedPosts };
        }

        /// <summary>Parse giá (dưới X, trên X, tầm X, giá rẻ), category, địa điểm, hãng xe, đắt nhất/rẻ nhất, X xe từ message.</summary>
        private async Task<SuggestionIntent> ParseIntentAsync(string message)
        {
            decimal? maxPrice = null;
            decimal? minPrice = null;
            bool orderByPriceDesc = false;
            bool orderByPriceAsc = false;
            int limit = 10;
            var normalized = message.Trim().ToLowerInvariant();
            var normalizedNoDiacritic = NormalizeForMatch(normalized);

            // --- Giá: dưới X, trên X, tầm X, khoảng X, X triệu, giá rẻ ---
            // "dưới" = d+ư+ơ+i (4 ký tự) nên không match d[uưở]i; thêm "duoi" (gõ thiếu dấu) và variants
            var underMatch = Regex.Match(normalized, @"(?:d[uơưở]+i|duoi)\s*(\d+)\s*(k|ngh[iì]n|tri[eệ]u)?", RegexOptions.IgnoreCase);
            if (underMatch.Success && decimal.TryParse(underMatch.Groups[1].Value, out var underVal))
            {
                maxPrice = underMatch.Groups[2].Value switch
                {
                    "k" => underVal * 1000,
                    "nghìn" or "nghin" => underVal * 1000,
                    "triệu" or "trieu" => underVal * 1_000_000,
                    _ => underVal <= 1000 ? underVal * 1000 : underVal
                };
            }

            var overMatch = Regex.Match(normalized, @"(tr[eê]n|t[uừ])\s*(\d+)\s*(k|ngh[iì]n|tri[eệ]u)?", RegexOptions.IgnoreCase);
            if (overMatch.Success && decimal.TryParse(overMatch.Groups[2].Value, out var overVal))
            {
                minPrice = overMatch.Groups[3].Value switch
                {
                    "k" => overVal * 1000,
                    "nghìn" or "nghin" => overVal * 1000,
                    "triệu" or "trieu" => overVal * 1_000_000,
                    _ => overVal <= 1000 ? overVal * 1000 : overVal
                };
            }

            // "giá chính xác X", "đúng X", "chính xác X" (số có thể có space: "100 000")
            var exactMatch = Regex.Match(normalized, @"(?:gi[aá]\s*)?(?:ch[ií]nh\s*x[aá]c|d[uú]ng)\s*([\d\s]+?)\s*(k|ngh[iì]n|tri[eệ]u)?\b", RegexOptions.IgnoreCase);
            if (exactMatch.Success && decimal.TryParse(exactMatch.Groups[1].Value.Replace(" ", ""), out var exactVal))
            {
                var unit = (exactMatch.Groups[2].Value ?? "").ToLowerInvariant();
                var price = unit switch
                {
                    "k" => exactVal * 1000,
                    "nghìn" or "nghin" => exactVal * 1000,
                    "triệu" or "trieu" => exactVal * 1_000_000,
                    _ => exactVal <= 1000 ? exactVal * 1000 : exactVal
                };
                minPrice = price;
                maxPrice = price;
            }

            // "giá X", "có con nào Xk", "xe Xk" - không có dưới/trên -> exact price (lấy đúng X, không lấy đắt hơn)
            if (!maxPrice.HasValue && !minPrice.HasValue)
            {
                var giaMatch = Regex.Match(normalized, @"(?:gi[aá]\s+|[có]\s+[^\s]+\s+)\s*([\d\s]+)\s*(k|ngh[iì]n|tri[eệ]u)?\b", RegexOptions.IgnoreCase);
                if (!giaMatch.Success)
                    giaMatch = Regex.Match(normalized, @"(?:con\s+nào|xe)\s+([\d\s]+)\s*(k|ngh[iì]n|tri[eệ]u)?\b", RegexOptions.IgnoreCase);
                if (!giaMatch.Success)
                    giaMatch = Regex.Match(normalized, @"(\d+)\s*(k|ngh[iì]n)\b", RegexOptions.IgnoreCase); // "100k", "500k" đứng một mình
                if (giaMatch.Success && decimal.TryParse(giaMatch.Groups[1].Value.Replace(" ", ""), out var giaVal))
                {
                    var unit = (giaMatch.Groups[2].Value ?? "").ToLowerInvariant();
                    var price = unit switch
                    {
                        "k" => giaVal * 1000,
                        "nghìn" or "nghin" => giaVal * 1000,
                        "triệu" or "trieu" => giaVal * 1_000_000,
                        _ => giaVal <= 1000 ? giaVal * 1000 : giaVal
                    };
                    minPrice = price;
                    maxPrice = price;
                }
            }

            // "tầm X", "khoảng X", "X triệu", "giá rẻ"
            if (!maxPrice.HasValue && !minPrice.HasValue)
            {
                var tamMatch = Regex.Match(normalized, @"(t[eầ]m|kho[eả]ng)\s*(\d+)\s*(k|tri[eệ]u)?", RegexOptions.IgnoreCase);
                if (tamMatch.Success && decimal.TryParse(tamMatch.Groups[2].Value, out var tamVal))
                {
                    var unit = (tamMatch.Groups[3].Value ?? "").ToLowerInvariant();
                    if (unit.Contains("tri")) // triệu
                    { minPrice = (tamVal - 0.5m) * 1_000_000; maxPrice = (tamVal + 0.5m) * 1_000_000; }
                    else if (tamVal >= 100) // 500 -> 400k-600k
                    { minPrice = (tamVal - 100) * 1000; maxPrice = (tamVal + 100) * 1000; }
                    else // tầm 2 (không rõ đơn vị) -> 1.5-2.5 triệu
                    { minPrice = (tamVal - 0.5m) * 1_000_000; maxPrice = (tamVal + 0.5m) * 1_000_000; }
                }
                else
                {
                    var soTrieu = Regex.Match(normalized, @"(\d+)\s*tri[eệ]u", RegexOptions.IgnoreCase);
                    if (soTrieu.Success && decimal.TryParse(soTrieu.Groups[1].Value, out var trieuVal))
                    { minPrice = (trieuVal - 0.5m) * 1_000_000; maxPrice = (trieuVal + 0.5m) * 1_000_000; }
                    else
                    {
                        // Chỉ "giá rẻ" / "giá thấp" (không có "nhất") -> max 500k. "Rẻ nhất" = sort order, xử lý ở block (3)
                        var giaRe = Regex.Match(normalized, @"gi[aá]\s*r[eẻ](?!\s*nh)|gi[aá]\s*th[aấ]p(?!\s*nh)");
                        if (giaRe.Success) maxPrice = 500_000; // "giá rẻ" = dưới 500k
                    }
                }
            }

            // --- Category: tên danh mục trong DB ---
            int? categoryId = null;
            var categories = await _categoryRepository.Query()
                .Where(c => c.Status == 1)
                .Select(c => new { c.Id, c.Name })
                .ToListAsync()
                .ConfigureAwait(false);
            foreach (var c in categories)
            {
                if (!string.IsNullOrEmpty(c.Name) && normalized.Contains(c.Name.Trim().ToLowerInvariant()))
                {
                    categoryId = c.Id;
                    break;
                }
            }

            // --- Địa điểm: match Province/District trong DB (bỏ dấu để "ha noi" match "Hà Nội") ---
            IReadOnlyList<int>? locationIds = null;
            var locations = await _locationRepository.Query()
                .Select(l => new { l.Id, l.Province, l.District })
                .ToListAsync()
                .ConfigureAwait(false);
            var matchedIds = new List<int>();
            foreach (var loc in locations)
            {
                var p = (loc.Province ?? "").Trim().ToLowerInvariant();
                var d = (loc.District ?? "").Trim().ToLowerInvariant();
                if (string.IsNullOrEmpty(p) && string.IsNullOrEmpty(d)) continue;
                var pNorm = NormalizeForMatch(p);
                var dNorm = NormalizeForMatch(d);
                if ((!string.IsNullOrEmpty(pNorm) && normalizedNoDiacritic.Contains(pNorm)) ||
                    (!string.IsNullOrEmpty(dNorm) && normalizedNoDiacritic.Contains(dNorm)) ||
                    (!string.IsNullOrEmpty(p) && normalized.Contains(p)) ||
                    (!string.IsNullOrEmpty(d) && normalized.Contains(d)))
                {
                    matchedIds.Add(loc.Id);
                }
            }
            if (matchedIds.Count > 0) locationIds = matchedIds;

            // --- Hãng xe: "hãng Mercedes", "xe Mercedes", "Mercedes", "mecxedes" (typo) ---
            string? brandKeyword = ParseBrandFromMessage(normalized);

            // --- (3) Đắt nhất / rẻ nhất / X xe ---
            var datNhat = Regex.Match(normalized, @"[đd]?[aăâấậắặ]t\s+nh[aấậất]|gi[aá]\s+(cao|[đd][aăâấậắặ]t)\s+nh[aấậất]|cao\s+nh[aấậất]", RegexOptions.IgnoreCase);
            var reNhat = Regex.Match(normalized, @"r[eẻ]\s+nh[aấậất]|gi[aá]\s+(r[eẻ]|th[aấập]p)\s+nh[aấậất]|th[aấập]p\s+nh[aấậất]", RegexOptions.IgnoreCase);
            if (datNhat.Success) orderByPriceDesc = true;
            if (reNhat.Success) orderByPriceAsc = true;
            var xeMatch = Regex.Match(normalized, @"(\d+)\s*(xe|chi[eế]c|con|b[aà]i)\b", RegexOptions.IgnoreCase);
            if (xeMatch.Success && int.TryParse(xeMatch.Groups[1].Value, out var n) && n >= 1 && n <= 20)
                limit = n;

            return new SuggestionIntent(maxPrice, minPrice, categoryId, locationIds, brandKeyword, orderByPriceDesc, orderByPriceAsc, limit);
        }

        /// <summary>Phase 2: AI extract intent từ tin nhắn, trả về filter để query DB. Fallback regex nếu lỗi.</summary>
        private async Task<SuggestionIntent> ExtractIntentWithOpenAiAsync(string message)
        {
            var categoryNames = await _categoryRepository.Query()
                .Where(c => c.Status == 1)
                .OrderBy(c => c.Name)
                .Select(c => c.Name ?? "")
                .Where(s => s != "")
                .ToListAsync()
                .ConfigureAwait(false);
            var locationRows = await _locationRepository.Query()
                .Select(l => new { l.Id, Province = (l.Province ?? "").Trim(), District = (l.District ?? "").Trim() })
                .Where(l => (l.Province != "" || l.District != ""))
                .ToListAsync()
                .ConfigureAwait(false);
            var locationNames = locationRows
                .Select(l => string.IsNullOrEmpty(l.Province) ? l.District : l.Province)
                .Where(s => s != "")
                .Distinct()
                .OrderBy(s => s)
                .Take(30)
                .ToList();
            var brandList = string.Join(", ", CarBrands.Select(x => x.SearchTerm));

            var prompt = $@"Trích xuất ý định tìm xe thuê từ tin nhắn. Trả về ĐÚNG 1 JSON (không markdown, không giải thích):
{{""maxPrice"":number|null,""minPrice"":number|null,""categoryName"":""string|null"",""locationName"":""string|null"",""brandKeyword"":""string|null"",""orderByPriceDesc"":boolean,""orderByPriceAsc"":boolean,""limit"":number}}

Quy tắc giá (VND): 
- dưới 400k -> maxPrice=400000, minPrice=null
- trên 1 triệu -> minPrice=1000000, maxPrice=null
- tầm/khoảng 500k -> minPrice=400000, maxPrice=600000
- giá rẻ -> maxPrice=500000, minPrice=null
- QUAN TRỌNG: Khi user nói giá X, có xe Xk, Xk (vd: giá 100k, có con nào 100k) mà KHÔNG có dưới/trên -> LUÔN set minPrice=X VÀ maxPrice=X (cùng giá trị, lấy ĐÚNG giá đó, không lấy xe đắt hơn)
- giá chính xác/đúng X -> minPrice=X, maxPrice=X
- Số có khoảng trắng (100 000) = 100000. k=1000, triệu=1000000
- orderByPriceDesc: true khi user muốn ""đắt nhất"", ""giá cao nhất"", ""xe đắt nhất"". Ngược lại false.
- orderByPriceAsc: true khi user muốn ""rẻ nhất"", ""giá thấp nhất"", ""xe rẻ nhất"", ""rẻ nhất có thể"". Ngược lại false.
- limit: số xe (1-20) khi user nói ""1 xe"", ""3 con"", ""5 chiếc"", ""1 bài"". Mặc định 10.
Danh mục hợp lệ (chọn đúng 1 hoặc null): {string.Join(", ", categoryNames.Take(15))}
Khu vực hợp lệ (chọn đúng 1 hoặc null): {string.Join(", ", locationNames)}
Hãng hợp lệ (lowercase): {brandList}

Tin nhắn: ""{message.Replace("\"", "\\\"")}""";

            var client = _httpClientFactory.CreateClient();
            var url = $"{_openAi.BaseUrl.TrimEnd('/')}/v1/chat/completions";
            using var req = new HttpRequestMessage(HttpMethod.Post, url);
            req.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", _openAi.ApiKey);
            req.Content = JsonContent.Create(new
            {
                model = !string.IsNullOrWhiteSpace(_openAi.ChatModel) ? _openAi.ChatModel : _openAi.Model,
                messages = new[] { new { role = "user", content = prompt } },
                temperature = 0.1,
                max_tokens = 256
            });
            using var res = await client.SendAsync(req).ConfigureAwait(false);
            if (!res.IsSuccessStatusCode) throw new InvalidOperationException("OpenAI intent extraction failed");
            var jsonRes = await res.Content.ReadFromJsonAsync<OpenAiChatCompletionResponse>().ConfigureAwait(false);
            var raw = jsonRes?.GetReplyText()?.Trim() ?? "";
            if (string.IsNullOrEmpty(raw)) throw new InvalidOperationException("Empty OpenAI response");
            raw = System.Text.RegularExpressions.Regex.Replace(raw, @"^```(?:json)?\s*", "").Trim();
            raw = System.Text.RegularExpressions.Regex.Replace(raw, @"\s*```\s*$", "").Trim();
            var parsed = System.Text.Json.JsonSerializer.Deserialize<IntentExtractionDto>(raw,
                new System.Text.Json.JsonSerializerOptions { PropertyNameCaseInsensitive = true });
            if (parsed == null) throw new InvalidOperationException("Failed to parse intent JSON");

            int? categoryId = null;
            if (!string.IsNullOrWhiteSpace(parsed.CategoryName))
            {
                var cat = categoryNames.FirstOrDefault(c =>
                    string.Equals(c?.Trim(), parsed.CategoryName!.Trim(), StringComparison.OrdinalIgnoreCase));
                if (cat != null)
                {
                    var cId = await _categoryRepository.Query()
                        .Where(x => x.Name == cat)
                        .Select(x => (int?)x.Id)
                        .FirstOrDefaultAsync()
                        .ConfigureAwait(false);
                    categoryId = cId;
                }
            }
            IReadOnlyList<int>? locationIds = null;
            if (!string.IsNullOrWhiteSpace(parsed.LocationName))
            {
                var normalizedInput = NormalizeForMatch(parsed.LocationName.Trim().ToLowerInvariant());
                var matched = locationRows
                    .Where(l =>
                    {
                        var p = NormalizeForMatch(l.Province.ToLowerInvariant());
                        var d = NormalizeForMatch(l.District.ToLowerInvariant());
                        return (!string.IsNullOrEmpty(p) && normalizedInput.Contains(p)) ||
                               (!string.IsNullOrEmpty(d) && normalizedInput.Contains(d)) ||
                               string.Equals(p, normalizedInput, StringComparison.OrdinalIgnoreCase) ||
                               string.Equals(d, normalizedInput, StringComparison.OrdinalIgnoreCase);
                    })
                    .Select(l => l.Id)
                    .Distinct()
                    .ToList();
                if (matched.Count > 0) locationIds = matched;
            }
            string? brandKeyword = null;
            if (!string.IsNullOrWhiteSpace(parsed.BrandKeyword))
            {
                var b = parsed.BrandKeyword.Trim().ToLowerInvariant();
                if (CarBrands.Any(x => x.SearchTerm.Equals(b, StringComparison.OrdinalIgnoreCase) ||
                    x.Keywords.Any(k => b.Contains(k))))
                    brandKeyword = CarBrands.First(x =>
                        x.SearchTerm.Equals(b, StringComparison.OrdinalIgnoreCase) ||
                        x.Keywords.Any(k => b.Contains(k))).SearchTerm;
            }
            return new SuggestionIntent(parsed.MaxPrice, parsed.MinPrice, categoryId, locationIds, brandKeyword,
                parsed.OrderByPriceDesc == true, parsed.OrderByPriceAsc == true, parsed.Limit ?? 10);
        }

        private class IntentExtractionDto
        {
            public decimal? MaxPrice { get; set; }
            public decimal? MinPrice { get; set; }
            public string? CategoryName { get; set; }
            public string? LocationName { get; set; }
            public string? BrandKeyword { get; set; }
            public bool? OrderByPriceDesc { get; set; }
            public bool? OrderByPriceAsc { get; set; }
            public int? Limit { get; set; }
        }

        /// <summary>Intent đã parse: filter + order + limit.</summary>
        private record SuggestionIntent(
            decimal? MaxPrice,
            decimal? MinPrice,
            int? CategoryId,
            IReadOnlyList<int>? LocationIds,
            string? BrandKeyword,
            bool OrderByPriceDesc,
            bool OrderByPriceAsc,
            int Limit);

        /// <summary>Danh sách hãng xe: từ khóa tìm trong Title/Description (chủ đăng thường ghi tên hãng).</summary>
        private static readonly IReadOnlyList<(string SearchTerm, string[] Keywords)> CarBrands = new List<(string, string[])>
        {
            ("mercedes", new[] { "mercedes", "mercedes-benz", "mecxedes", "meccedes", "benz" }),
            ("bmw", new[] { "bmw" }),
            ("audi", new[] { "audi" }),
            ("porsche", new[] { "porsche", "porshe" }),
            ("tesla", new[] { "tesla" }),
            ("vinfast", new[] { "vinfast", "vin fast" }),
            ("kia", new[] { "kia" }),
            ("hyundai", new[] { "hyundai", "hundai" }),
            ("toyota", new[] { "toyota" }),
            ("honda", new[] { "honda" }),
            ("ford", new[] { "ford" }),
            ("mazda", new[] { "mazda" }),
            ("lexus", new[] { "lexus" }),
            ("chevrolet", new[] { "chevrolet", "chevy" }),
            ("nissan", new[] { "nissan" }),
            ("mitsubishi", new[] { "mitsubishi" }),
            ("volkswagen", new[] { "volkswagen", "vw" }),
            ("volvo", new[] { "volvo" }),
            ("land rover", new[] { "land rover", "landrover" }),
            ("range rover", new[] { "range rover", "rangerover" }),
            ("bentley", new[] { "bentley" }),
            ("rolls royce", new[] { "rolls royce", "rolls-royce", "rollsroyce" }),
            ("maserati", new[] { "maserati" }),
            ("ferrari", new[] { "ferrari" }),
            ("lamborghini", new[] { "lamborghini", "lambo" }),
            ("peugeot", new[] { "peugeot" }),
            ("renault", new[] { "renault" }),
            ("fiat", new[] { "fiat" }),
        };

        private static string? ParseBrandFromMessage(string normalizedMessage)
        {
            foreach (var (searchTerm, keywords) in CarBrands)
            {
                if (keywords.Any(k => normalizedMessage.Contains(k)))
                    return searchTerm;
            }
            return null;
        }

        /// <summary>Bỏ dấu tiếng Việt để so khớp "ha noi" với "Hà Nội".</summary>
        private static string NormalizeForMatch(string s)
        {
            if (string.IsNullOrEmpty(s)) return s;
            var chars = s.ToLowerInvariant().Normalize(System.Text.NormalizationForm.FormD)
                .Where(c => CharUnicodeInfo.GetUnicodeCategory(c) != UnicodeCategory.NonSpacingMark);
            return new string(chars.ToArray()).Normalize(System.Text.NormalizationForm.FormC);
        }

        /// <summary>Nhận diện tin nhắn chỉ là chào hỏi để trả lời dẫn dắt, không im re.</summary>
        private static bool IsGreeting(string message)
        {
            var t = message.Trim().ToLowerInvariant();
            if (t.Length > 50) return false;
            var greetings = new[] { "xin chào", "xin chao", "chào", "chao", "hello", "hi", "halo", "hey" };
            return greetings.Any(g => t == g || (t.Length > g.Length && (t.StartsWith(g + " ") || t.StartsWith(g + "!"))));
        }

        /// <summary>Cảm ơn / tạm biệt: trả lời ngắn, không query xe.</summary>
        private static bool IsThanksOrBye(string message)
        {
            var t = message.Trim().ToLowerInvariant();
            if (t.Length > 40) return false;
            var phrases = new[] { "cảm ơn", "cam on", "thanks", "thank you", "tạm biệt", "tam biet", "bye", "goodbye", "hẹn gặp lại", "hen gap lai" };
            return phrases.Any(p => t == p || t.StartsWith(p + " ") || t.StartsWith(p + "!"));
        }

        /// <summary>Tin nhắn có vẻ lạc đề (phở, thời tiết, chuyện vui...) - không dùng semantic search.</summary>
        private static bool IsLikelyOffTopic(string message)
        {
            var t = message.Trim().ToLowerInvariant();
            if (t.Length > 80) return false; // Tin dài thường có nội dung
            var carRelated = new[] { "xe", "thuê", "thue", "giá", "gia", "triệu", "trieu", "k ", "k/", "hãng", "hang", "danh mục", "khu vực", "địa điểm", "dia diem" };
            if (carRelated.Any(k => t.Contains(k))) return false;
            if (CarBrands.Any(b => t.Contains(b.SearchTerm))) return false;
            // Số + k/triệu = có thể đang nói giá
            if (Regex.IsMatch(t, @"\d+\s*(k|tri[eệ]u|ngh[iì]n)")) return false;
            var offTopic = new[] { "phở", "pho", "bún", "bun", "cơm", "com", "ăn", "an", "trời", "troi", "mưa", "mua", "nắng", "nang", "hôm nay", "hom nay", "vui", "buồn", "buon" };
            return offTopic.Any(k => t.Contains(k));
        }

        /// <summary>Phase 1: Lấy metadata platform để AI hiểu rõ bức tranh data của EcoRent.</summary>
        private async Task<PlatformMetadata> GetPlatformMetadataAsync()
        {
            var now = DateTime.UtcNow;
            var baseQuery = _postRepository.Query()
                .Where(p => p.Status == (short)PostStatus.Approved)
                .Where(p => p.ExpiredAt == null || p.ExpiredAt >= now);

            var totalCount = await baseQuery.CountAsync().ConfigureAwait(false);
            decimal? minPrice = null, maxPrice = null;
            if (totalCount > 0)
            {
                minPrice = await baseQuery.MinAsync(p => p.Price).ConfigureAwait(false);
                maxPrice = await baseQuery.MaxAsync(p => p.Price).ConfigureAwait(false);
            }

            var categoryNames = await _categoryRepository.Query()
                .Where(c => c.Status == 1)
                .OrderBy(c => c.Name)
                .Select(c => c.Name ?? "")
                .Where(s => s != "")
                .ToListAsync()
                .ConfigureAwait(false);

            var locationIdsWithPosts = await baseQuery
                .Where(p => p.LocationId != null)
                .Select(p => p.LocationId!.Value)
                .Distinct()
                .ToListAsync()
                .ConfigureAwait(false);
            var locationNames = new List<string>();
            if (locationIdsWithPosts.Count > 0)
            {
                locationNames = await _locationRepository.Query()
                    .Where(l => locationIdsWithPosts.Contains(l.Id))
                    .Select(l => (l.Province ?? l.District ?? "").Trim())
                    .Where(s => s != "")
                    .Distinct()
                    .OrderBy(s => s)
                    .ToListAsync()
                    .ConfigureAwait(false);
            }

            return new PlatformMetadata(totalCount, minPrice, maxPrice, categoryNames, locationNames);
        }

        private record PlatformMetadata(
            int TotalCarCount,
            decimal? MinPrice,
            decimal? MaxPrice,
            IReadOnlyList<string> CategoryNames,
            IReadOnlyList<string> LocationNames);

        /// <summary>Phase 1: System prompt với business context EcoRent + metadata platform.</summary>
        private static string BuildSystemPrompt(PlatformMetadata meta)
        {
            var priceRange = meta.MinPrice.HasValue && meta.MaxPrice.HasValue
                ? $"giá từ {meta.MinPrice:N0} đến {meta.MaxPrice:N0} đ/ngày"
                : meta.TotalCarCount > 0 ? "đa dạng mức giá" : "chưa có xe";
            var categories = meta.CategoryNames.Count > 0 ? string.Join(", ", meta.CategoryNames.Take(12)) : "nhiều danh mục";
            var locations = meta.LocationNames.Count > 0 ? string.Join(", ", meta.LocationNames.Take(10)) : "nhiều khu vực";
            var brands = "Vinfast, BMW, Mercedes, Tesla, Audi, Porsche, Kia, Hyundai, Toyota, Honda, Ford, Mazda, Lexus";

            return $@"Bạn là trợ lý tư vấn thuê xe điện của EcoRent - trò chuyện tự nhiên như người thật, thân thiện, dễ gần. EcoRent là nền tảng kết nối chủ xe và khách thuê xe điện tại Việt Nam.

NGỮ CẢNH PLATFORM:
- Số xe đang cho thuê: {meta.TotalCarCount} xe, giá {priceRange}
- Danh mục: {categories}
- Khu vực: {locations}
- Hãng: {brands}

CÁCH TRẢ LỜI (linh hoạt như người thật):
- Khi khách HỎI VỀ XE: gợi ý từ danh sách, không bịa thông tin.
- Khi khách NÓI LẠC ĐỀ (phở, thời tiết, chuyện vui...): đáp ngắn gọn, có thể hài hước nhẹ, rồi hỏi xem họ có cần tìm xe không. Ví dụ: ""Haha mình chỉ biết tư vấn xe thuê thôi 😄 Bạn có muốn xem xe nào không?""
- Khi khách NÓI MƠ HỒ (gì cũng được, xe nào cũng ok): gợi ý vài xe phổ biến, hỏi thêm nhu cầu.
- Khi KHÔNG CÓ XE phù hợp: an ủi, gợi ý mở rộng tiêu chí.
- Luôn bằng tiếng Việt, tự nhiên, đừng cứng nhắc như bot.";
        }

        /// <summary>Phase 1: Structured summary inject vào user prompt.</summary>
        private static string BuildStructuredSummary(PlatformMetadata meta)
        {
            var priceRange = meta.MinPrice.HasValue && meta.MaxPrice.HasValue
                ? $"{meta.MinPrice:N0} - {meta.MaxPrice:N0} đ/ngày" : "đa dạng";
            return $@"[Tổng quan EcoRent: {meta.TotalCarCount} xe, giá {priceRange}]";
        }

        private static SuggestCarsResponseDto BuildFallbackReply(List<PostListItemDto> posts, string userMessage, IReadOnlyList<string>? categoryNamesWhenEmpty = null)
        {
            if (posts.Count == 0)
            {
                // Có danh mục → trả lời kiểu "hiện có các danh mục ..., nhưng chưa có xe phù hợp (vd. giá 300k)"
                if (categoryNamesWhenEmpty != null && categoryNamesWhenEmpty.Count > 0)
                {
                    var list = string.Join(", ", categoryNamesWhenEmpty.Take(15));
                    if (categoryNamesWhenEmpty.Count > 15) list += ", ...";
                    return new SuggestCarsResponseDto
                    {
                        Reply = "Hiện EcoRent có các danh mục xe: " + list + ". Tiếc là chưa có xe nào phù hợp với tiêu chí bạn đang tìm (ví dụ giá từ 300k). Bạn thử mở rộng khoảng giá hoặc chọn một hãng/danh mục cụ thể nhé."
                    };
                }
                return new SuggestCarsResponseDto
                {
                    Reply = "Hiện chưa có xe phù hợp với tiêu chí này. Bạn thử mở rộng khoảng giá, đổi hãng xe/khu vực hoặc bỏ bớt điều kiện để xem thêm nhé."
                };
            }

            var lines = posts.Take(5).Select(p => $"• {p.Title} - {p.Price:N0} đ/ngày ({p.CategoryName})");
            return new SuggestCarsResponseDto
            {
                Reply = "Gợi ý một số xe phù hợp:\n" + string.Join("\n", lines) + (posts.Count > 5 ? $"\n(... và {posts.Count - 5} xe khác)" : ""),
                SuggestedPosts = posts
            };
        }

        private async Task<SuggestCarsResponseDto> BuildReplyWithOpenAiAsync(List<PostListItemDto> posts, string userMessage, IReadOnlyList<string>? categoryNamesWhenEmpty = null)
        {
            var meta = await GetPlatformMetadataAsync().ConfigureAwait(false);

            // Phase 1: Business context + structured summary
            var systemPrompt = BuildSystemPrompt(meta);
            var structuredSummary = BuildStructuredSummary(meta);

            var carList = posts.Count == 0
                ? "(Không có xe nào trong hệ thống phù hợp với yêu cầu.)"
                : string.Join("\n", posts.Select((p, i) => $"{i + 1}. ID={p.Id}, {p.Title}, giá {p.Price:N0} đ/ngày, {p.CategoryName}"));

            var userPrompt = $@"{structuredSummary}

DANH SÁCH XE ĐƯỢC PHÉP GỢI Ý (CHỈ ĐƯỢC NHẮC ĐẾN CÁC XE TRONG DANH SÁCH NÀY - KHÔNG BỊA TÊN, GIÁ HAY HÃNG XE):
{carList}

Tin nhắn khách: {userMessage}

Hãy trả lời ngắn gọn, thân thiện bằng tiếng Việt. CHỈ gợi ý xe có trong danh sách trên. TUYỆT ĐỐI không bịa tên xe, giá, hãng xe không có trong list. Nếu không có xe phù hợp: nói lịch sự và gợi ý họ thử mở rộng giá, đổi hãng/khu vực hoặc bỏ bớt điều kiện.";

            var client = _httpClientFactory.CreateClient();
            var url = $"{_openAi.BaseUrl.TrimEnd('/')}/v1/chat/completions";
            using var request = new HttpRequestMessage(HttpMethod.Post, url);
            request.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", _openAi.ApiKey);

            var requestBody = new
            {
                model = !string.IsNullOrWhiteSpace(_openAi.ChatModel) ? _openAi.ChatModel : _openAi.Model,
                messages = new[]
                {
                    new { role = "system", content = systemPrompt },
                    new { role = "user", content = userPrompt }
                },
                temperature = 0.35,
                max_tokens = 512
            };

            request.Content = JsonContent.Create(requestBody);

            using var response = await client.SendAsync(request).ConfigureAwait(false);

            // OpenAI lỗi hoặc timeout: vẫn trả reply hữu ích (fallback), không báo "Đang bận"
            if (!response.IsSuccessStatusCode)
            {
                return BuildFallbackReply(posts, userMessage, categoryNamesWhenEmpty);
            }

            var json = await response.Content.ReadFromJsonAsync<OpenAiChatCompletionResponse>().ConfigureAwait(false);
            var reply = json?.GetReplyText()?.Trim();
            if (string.IsNullOrEmpty(reply))
                return BuildFallbackReply(posts, userMessage, categoryNamesWhenEmpty);

            return new SuggestCarsResponseDto
            {
                Reply = reply,
                SuggestedPosts = posts
            };
        }

        // DTO for OpenAI Chat Completions API response (chỉ cần lấy text)
        private class OpenAiChatCompletionResponse
        {
            public OpenAiChoice[]? Choices { get; set; }
            public string GetReplyText()
            {
                if (Choices == null || Choices.Length == 0) return string.Empty;
                var content = Choices[0]?.Message?.Content;
                return content ?? string.Empty;
            }
        }

        private class OpenAiChoice
        {
            public OpenAiMessage? Message { get; set; }
        }

        private class OpenAiMessage
        {
            public string? Role { get; set; }
            public string? Content { get; set; }
        }
    }
}
