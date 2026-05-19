// Author: S2401265 Ahmed Aslan Ibrahim
using HMS.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HMS.Infrastructure.Persistence.Configurations;

public class InvoiceLineItemConfiguration : IEntityTypeConfiguration<InvoiceLineItem>
{
    public void Configure(EntityTypeBuilder<InvoiceLineItem> builder)
    {
        builder.ToTable("InvoiceLineItems");
        builder.HasKey(li => li.Id);

        builder.Property(li => li.Description).IsRequired().HasMaxLength(200);
        builder.Property(li => li.UnitPrice).HasColumnType("decimal(10,2)");
        builder.Property(li => li.LineTotal).HasColumnType("decimal(10,2)");

        builder.HasOne(li => li.Invoice)
               .WithMany(i => i.LineItems)
               .HasForeignKey(li => li.InvoiceId)
               .OnDelete(DeleteBehavior.Cascade);
    }
}
