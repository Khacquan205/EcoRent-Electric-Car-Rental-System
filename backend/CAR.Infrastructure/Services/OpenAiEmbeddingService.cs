using System;
using System.Linq;
using System.Net.Http.Json;
using System.Threading.Tasks;
using CAR.Application.Interfaces.Services;
using CAR.Infrastructure.Options;
using Microsoft.Extensions.Options;

namespace CAR.Infrastructure.Services
{
    /// <summary>Phase 3: Gọi OpenAI Embeddings API - text-embedding-3-small (1536 dims, $0.02/1M tokens).</summary>
    public class OpenAiEmbeddingService : IEmbeddingService
    {
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly OpenAISettings _openAi;

        public OpenAiEmbeddingService(IHttpClientFactory httpClientFactory, IOptions<OpenAISettings> openAi)
        {
            _httpClientFactory = httpClientFactory;
            _openAi = openAi?.Value ?? new OpenAISettings();
        }

        public async Task<float[]?> GetEmbeddingAsync(string text)
        {
            if (string.IsNullOrWhiteSpace(text) || string.IsNullOrWhiteSpace(_openAi.ApiKey))
                return null;

            var client = _httpClientFactory.CreateClient();
            var url = $"{_openAi.BaseUrl.TrimEnd('/')}/v1/embeddings";
            using var req = new HttpRequestMessage(HttpMethod.Post, url);
            req.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", _openAi.ApiKey);
            var model = string.IsNullOrWhiteSpace(_openAi.EmbeddingModel) ? "text-embedding-3-small" : _openAi.EmbeddingModel.Trim();
            req.Content = JsonContent.Create(new { model, input = text.Trim() });

            using var res = await client.SendAsync(req).ConfigureAwait(false);
            if (!res.IsSuccessStatusCode) return null;

            var json = await res.Content.ReadFromJsonAsync<EmbeddingResponse>().ConfigureAwait(false);
            return json?.Data?.FirstOrDefault()?.Embedding;
        }
    }

    file class EmbeddingResponse
    {
        public EmbeddingItem[]? Data { get; set; }
    }

    file class EmbeddingItem
    {
        public float[]? Embedding { get; set; }
    }
}
