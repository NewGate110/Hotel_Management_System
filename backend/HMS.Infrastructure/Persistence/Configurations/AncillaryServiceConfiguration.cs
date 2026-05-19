// Author: S2401265 Ahmed Aslan Ibrahim
using HMS.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HMS.Infrastructure.Persistence.Configurations;

public class AncillaryServiceConfiguration : IEntityTypeConfiguration<AncillaryService>
{
    public void Configure(EntityTypeBuilder<AncillaryService> builder)
    {
        builder.ToTable("AncillaryServices");
        builder.HasKey(s => s.Id);

        builder.Property(s => s.Name).IsRequired().HasMaxLength(100);
        builder.Property(s => s.Description).HasMaxLength(500);
        builder.Property(s => s.Fee).HasColumnType("decimal(10,2)");
        builder.Property(s => s.Unit).HasMaxLength(50);
    }
}
