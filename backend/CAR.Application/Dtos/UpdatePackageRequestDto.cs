using CAR.Domain.Enums;

namespace CAR.Application.Dtos
{
    public class UpdatePackageRequestDto
    {
        public string Name { get; set; }

        public string Description { get; set; }

        public double Price { get; set; }

        public int DurationDays { get; set; }

        public int MaxPosts { get; set; }

        public int PriorityLevel { get; set; }

        public OwnerPackageStatus Status { get; set; }
    }
}
