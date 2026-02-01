namespace CAR.Application.Dtos
{
    public class ActivateSubscriptionRequestDto
    {
        public int PackageId { get; set; }

        public string Source { get; set; } = null!;
    }
}
