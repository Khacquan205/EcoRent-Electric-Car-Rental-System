namespace CAR.Domain.Entities
{
    public class MPayment
    {
        public int Id { get; set; }

        public int SubscriptionId { get; set; }

        public decimal Amount { get; set; }

        public int PaymentMethod { get; set; }
        public int PaymentStatus { get; set; }

        public string? TransactionCode { get; set; }

        public DateTime CreatedAt { get; set; }

        public DateTime? UpdatedAt { get; set; }
    }
}
