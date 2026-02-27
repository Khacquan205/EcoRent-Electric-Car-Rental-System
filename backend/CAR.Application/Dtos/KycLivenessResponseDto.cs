namespace CAR.Application.Dtos
{
    public class KycLivenessResponseDto
    {
        public bool IsLive { get; set; }
        public bool IsMatch { get; set; }
        public double Confidence { get; set; }
        public object Raw { get; set; }
        public string ErrorMessage { get; set; }
    }
}
