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
}
