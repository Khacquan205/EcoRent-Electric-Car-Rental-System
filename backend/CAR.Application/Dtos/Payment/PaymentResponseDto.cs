namespace CAR.Application.Dtos.Payment
{
    public class PaymentResponseDto
    {
        public bool Success { get; set; }
        public string? OrderId { get; set; }
        public string? TransactionId { get; set; }
        public decimal Amount { get; set; }
        public string? ResponseCode { get; set; }
        public string? Message { get; set; }
        public DateTime? PayDate { get; set; }
    }
}
