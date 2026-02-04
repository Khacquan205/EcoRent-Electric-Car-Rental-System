namespace CAR.Application.Dtos
{
    public class KycOcrResponseDto
    {
        public string FullName { get; set; }
        
        public string Dob { get; set; }
        
        public string Gender { get; set; }
        
        public string CccdNumber { get; set; }
        
        public string? ErrorMessage { get; set; }
    }
}
