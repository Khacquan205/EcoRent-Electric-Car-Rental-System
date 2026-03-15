using CAR.Domain.Enums;

namespace CAR.Application.Dtos
{
    public class CreatePackageResponseDto
    {
        public int Id { get; set; }

        public required string Name { get; set; }

        public required string Description { get; set; }

        public decimal Price { get; set; }

        public int DurationDays { get; set; }

        public int MaxPosts { get; set; }

        public int PriorityLevel { get; set; }

        public OwnerPackageStatus Status { get; set; }
    }
}
