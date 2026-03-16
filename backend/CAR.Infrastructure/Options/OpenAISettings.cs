namespace CAR.Infrastructure.Options
{
    /// <summary>OpenAI API config. Get key at: https://platform.openai.com/</summary>
    public class OpenAISettings
    {
        public const string SectionName = "OpenAI";
        public string ApiKey { get; set; } = string.Empty;
        /// <summary>Model mặc định cho intent extraction + chat. Ví dụ: gpt-4.1-mini.</summary>
        public string Model { get; set; } = "gpt-4.1-mini";
        /// <summary>Model dùng cho câu trả lời chat (nếu set). Dùng gpt-4o để chat thông minh hơn; để trống = dùng Model.</summary>
        public string? ChatModel { get; set; }
        /// <summary>Embedding model cho RAG. text-embedding-3-small (1536d) hoặc text-embedding-3-large (3072d, cần migrate DB).</summary>
        public string EmbeddingModel { get; set; } = "text-embedding-3-small";
        /// <summary>Base URL for OpenAI API. Default: https://api.openai.com</summary>
        public string BaseUrl { get; set; } = "https://api.openai.com";
    }
}

