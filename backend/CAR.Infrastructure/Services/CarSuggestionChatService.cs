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
using CAR.Infrastructure.Options;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace CAR.Infrastructure.Services
{
    /// <summary>Parse user message → query posts (filter + sort ưu tiên quảng cáo) → gọi Gemini để tạo câu trả lời chỉ từ danh sách xe thật.</summary>
    public class CarSuggestionChatService : ICarSuggestionChatService
    {
        private readonly IPostService _postService;
        private readonly IVehicleCategoryRepository _categoryRepository;
        private readonly ILocationRepository _locationRepository;
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly GeminiSettings _gemini;

        public CarSuggestionChatService(
            IPostService postService,
            IVehicleCategoryRepository categoryRepository,
            ILocationRepository locationRepository,
            IHttpClientFactory httpClientFactory,
            IOptions<GeminiSettings> gemini)
        {
            _postService = postService;
            _categoryRepository = categoryRepository;
            _locationRepository = locationRepository;
            _httpClientFactory = httpClientFactory;
            _gemini = gemini?.Value ?? new GeminiSettings();
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

            var (maxPrice, minPrice, categoryId, locationIds, brandKeyword) = await ParseIntentAsync(userMessage).ConfigureAwait(false);
            var posts = await _postService.GetPublicPostsForSuggestionAsync(maxPrice, minPrice, categoryId, locationIds, brandKeyword, limit: 10);

            // Khi không có xe: lấy danh mục để trả lời kiểu "hiện có các danh mục ..., nhưng chưa có xe 300k"
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

            if (string.IsNullOrWhiteSpace(_gemini.ApiKey))
            {
                return BuildFallbackReply(posts, userMessage, categoryNamesForNoResult);
            }

            return await BuildReplyWithGeminiAsync(posts, userMessage, categoryNamesForNoResult);
        }

        /// <summary>Parse giá (dưới X, trên X, tầm X, giá rẻ), category, địa điểm và hãng xe từ message.</summary>
        private async Task<(decimal? maxPrice, decimal? minPrice, int? categoryId, IReadOnlyList<int>? locationIds, string? brandKeyword)> ParseIntentAsync(string message)
        {
            decimal? maxPrice = null;
            decimal? minPrice = null;
            var normalized = message.Trim().ToLowerInvariant();
            var normalizedNoDiacritic = NormalizeForMatch(normalized);

            // --- Giá: dưới X, trên X, tầm X, khoảng X, X triệu, giá rẻ ---
            var underMatch = Regex.Match(normalized, @"d[uưở]i\s*(\d+)\s*(k|ngh[iì]n|tri[eệ]u)?", RegexOptions.IgnoreCase);
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
                        var giaRe = Regex.Match(normalized, @"gi[aá]\s*r[eẻ]|r[eẻ]\s*nh[eấ]t|gi[aá]\s*th[aấ]p");
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

            return (maxPrice, minPrice, categoryId, locationIds, brandKeyword);
        }

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

        private async Task<SuggestCarsResponseDto> BuildReplyWithGeminiAsync(List<PostListItemDto> posts, string userMessage, IReadOnlyList<string>? categoryNamesWhenEmpty = null)
        {
            var carList = posts.Count == 0
                ? "(Không có xe nào trong hệ thống phù hợp với yêu cầu.)"
                : string.Join("\n", posts.Select((p, i) => $"{i + 1}. ID={p.Id}, {p.Title}, giá {p.Price:N0} đ/ngày, {p.CategoryName}"));

            var userPrompt = $@"Danh sách xe được phép gợi ý (chỉ được nhắc đến các xe trong danh sách này):
{carList}

Tin nhắn khách: {userMessage}

Hãy trả lời ngắn gọn, thân thiện bằng tiếng Việt. Chỉ gợi ý xe có trong danh sách. Nếu không có xe phù hợp: nói lịch sự và gợi ý họ thử mở rộng giá, đổi hãng/khu vực hoặc bỏ bớt điều kiện.";

            var requestBody = new
            {
                systemInstruction = new
                {
                    parts = new[] { new { text = "Bạn là trợ lý tư vấn thuê xe điện EcoRent (nền tảng trung gian cho thuê xe giữa chủ xe và khách). Trả lời ngắn, thân thiện, chỉ đề cập xe có trong danh sách được cung cấp. Khi không có xe phù hợp: an ủi và hướng dẫn khách thử điều chỉnh tiêu chí (giá, hãng xe, khu vực, loại xe). Luôn bằng tiếng Việt." } }
                },
                contents = new[]
                {
                    new { parts = new[] { new { text = userPrompt } } }
                },
                generationConfig = new
                {
                    temperature = 0.2,
                    maxOutputTokens = 512
                }
            };

            var client = _httpClientFactory.CreateClient();
            var url = $"https://generativelanguage.googleapis.com/v1beta/models/{_gemini.Model}:generateContent?key={_gemini.ApiKey}";
            using var response = await client.PostAsJsonAsync(url, requestBody).ConfigureAwait(false);

            // Gemini lỗi hoặc timeout: vẫn trả reply hữu ích (fallback), không báo "Đang bận"
            if (!response.IsSuccessStatusCode)
            {
                return BuildFallbackReply(posts, userMessage, categoryNamesWhenEmpty);
            }

            var json = await response.Content.ReadFromJsonAsync<GeminiGenerateContentResponse>().ConfigureAwait(false);
            var reply = json?.GetReplyText()?.Trim();
            if (string.IsNullOrEmpty(reply))
                return BuildFallbackReply(posts, userMessage, categoryNamesWhenEmpty);

            return new SuggestCarsResponseDto
            {
                Reply = reply,
                SuggestedPosts = posts
            };
        }

        // DTO for Gemini API response (chỉ cần lấy text)
        private class GeminiGenerateContentResponse
        {
            public GeminiCandidate[]? Candidates { get; set; }
            public string GetReplyText()
            {
                if (Candidates == null || Candidates.Length == 0) return string.Empty;
                var part = Candidates[0]?.Content?.Parts?[0]?.Text;
                return part ?? string.Empty;
            }
        }

        private class GeminiCandidate
        {
            public GeminiContent? Content { get; set; }
        }

        private class GeminiContent
        {
            public GeminiPart[]? Parts { get; set; }
        }

        private class GeminiPart
        {
            public string? Text { get; set; }
        }
    }
}
