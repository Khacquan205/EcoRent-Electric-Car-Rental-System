using CAR.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

public class PaymentConfiguration : IEntityTypeConfiguration<MPayment>
{
    public void Configure(EntityTypeBuilder<MPayment> builder)
    {
        builder.ToTable("m_payment");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Id)
               .HasColumnName("id")
               .ValueGeneratedOnAdd()
               .IsRequired();

        builder.Property(x => x.SubscriptionId)
               .HasColumnName("subscription_id")
               .IsRequired();

        builder.Property(x => x.Amount)
               .HasColumnName("amount")
               .HasColumnType("decimal(18,2)")
               .IsRequired();

        builder.Property(x => x.PaymentMethod)
               .HasColumnName("payment_method")
               .IsRequired();

        builder.Property(x => x.PaymentStatus)
               .HasColumnName("payment_status")
               .IsRequired();

        builder.Property(x => x.TransactionCode)
               .HasColumnName("transaction_code")
               .HasMaxLength(100);

        builder.Property(x => x.VnpayTransactionId)
               .HasColumnName("vnpay_transaction_id")
               .HasMaxLength(50);

        builder.Property(x => x.ResponseCode)
               .HasColumnName("response_code")
               .HasMaxLength(10);

        builder.Property(x => x.PayDate)
               .HasColumnName("pay_date")
               .HasColumnType("timestamptz");

        builder.Property(x => x.CreatedAt)
               .HasColumnName("created_at")
               .HasColumnType("timestamptz")
               .IsRequired();

        builder.Property(x => x.UpdatedAt)
               .HasColumnName("updated_at")
               .HasColumnType("timestamptz");

        builder.HasOne(x => x.Subscription)
               .WithMany(x => x.Payments)
               .HasForeignKey(x => x.SubscriptionId)
               .OnDelete(DeleteBehavior.Cascade);
    }
}
