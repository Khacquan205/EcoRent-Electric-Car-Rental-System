using System.Collections.Generic;
using CAR.Application.Dtos;

namespace CAR.Application.Dtos.Chat
{
    public class SuggestCarsRequestDto
    {
        public string Message { get; set; } = string.Empty;
    }

    public class SuggestCarsResponseDto
    {
        public string Reply { get; set; } = string.Empty;
        public List<PostListItemDto> SuggestedPosts { get; set; } = new List<PostListItemDto>();
    }

    public class SuggestCarsTrainingSampleDto
    {
        public string Query { get; set; } = string.Empty;
        public int PositivePostId { get; set; }
        public List<int> CandidatePostIds { get; set; } = new List<int>();
        public string Rationale { get; set; } = string.Empty;
        public string Language { get; set; } = "vi";
    }
}
