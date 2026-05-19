// Author: S2401265 Ahmed Aslan Ibrahim
using HMS.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HMS.Infrastructure.Persistence.Configurations;

public class InvoiceConfiguration : IEntityTypeConfiguration<Invoice>
{
    public void Configure(EntityTypeBuilder<Invoice> builder)
    {
        builder.ToTable("Invoices");
        builder.HasKey(i => i.Id);

        builder.Property(i => i.InvoiceNumber).IsRequired().HasMaxLength(50);
        builder.Property(i => i.Subtotal).HasColumnType("decimal(10,2)");
        builder.Property(i => i.TaxAmount).HasColumnType("decimal(10,2)");
        builder.Property(i => i.TotalAmount).HasColumnType("decimal(10,2)");

        builder.HasOne(i => i.Booking)
               .WithOne(b => b.Invoice)
               .HasForeignKey<Invoice>(i => i.BookingId)
               .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(i => i.InvoiceNumber).IsUnique();
    }
}
