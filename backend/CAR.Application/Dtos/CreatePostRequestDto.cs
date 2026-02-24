using System;

namespace CAR.Application.Dtos
{
    public class CreatePostRequestDto
    {
        public int CategoryId { get; set; }

        public int? LocationId { get; set; }

        public string Title { get; set; } = null!;

        public string? Description { get; set; }

        public decimal Price { get; set; }

        public string? ContactPhone { get; set; }
    }
}
