namespace CAR.Application.Dtos.Admin
{
    public class CreateLocationRequestDto
    {
        public string? Province { get; set; }
        public string? District { get; set; }
        public string? Ward { get; set; }
        public string? AddressDetail { get; set; }
    }

    public class UpdateLocationRequestDto
    {
        public string? Province { get; set; }
        public string? District { get; set; }
        public string? Ward { get; set; }
        public string? AddressDetail { get; set; }
    }
}
