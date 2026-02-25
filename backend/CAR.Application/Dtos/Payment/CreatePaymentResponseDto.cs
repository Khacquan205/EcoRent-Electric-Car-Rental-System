namespace CAR.Application.Dtos.Payment
{
    public class CreatePaymentResponseDto
    {
        public string PaymentUrl { get; set; } = string.Empty;
        public string TransactionCode { get; set; } = string.Empty;
    }
}
