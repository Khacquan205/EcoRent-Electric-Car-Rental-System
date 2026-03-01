namespace CAR.Application.Dtos.Admin
{
    public class CreateCategoryRequestDto
    {
        public string Name { get; set; } = null!;
        public string? Description { get; set; }
        public short Status { get; set; } = 1;
    }

    public class UpdateCategoryRequestDto
    {
        public string Name { get; set; } = null!;
        public string? Description { get; set; }
        public short Status { get; set; }
    }
}
