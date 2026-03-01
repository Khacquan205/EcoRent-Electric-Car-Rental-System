namespace CAR.Application.Dtos
{
    public class CreateSubscriptionRequestDto
    {
        public int PackageId { get; set; }

        public string Source { get; set; } = null!;
    }
}
