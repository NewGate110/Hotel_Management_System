// Author: Salaams
using HMS.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HMS.Infrastructure.Persistence.Configurations;

public class PaymentConfiguration : IEntityTypeConfiguration<Payment>
{
    public void Configure(EntityTypeBuilder<Payment> builder)
    {
        builder.ToTable("Payments");
        builder.HasKey(p => p.Id);

        builder.Property(p => p.Amount).HasColumnType("decimal(10,2)");
        builder.Property(p => p.Method).IsRequired().HasConversion<string>();
        builder.Property(p => p.Status).IsRequired().HasConversion<string>();
        builder.Property(p => p.TransactionRef).HasMaxLength(100);

        builder.HasOne(p => p.Booking)
               .WithMany(b => b.Payments)
               .HasForeignKey(p => p.BookingId)
               .OnDelete(DeleteBehavior.Cascade);
    }
}
