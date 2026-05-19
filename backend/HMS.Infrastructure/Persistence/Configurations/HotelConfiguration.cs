// Author: S2401265 Ahmed Aslan Ibrahim
using HMS.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HMS.Infrastructure.Persistence.Configurations;

public class HotelConfiguration : IEntityTypeConfiguration<Hotel>
{
    public void Configure(EntityTypeBuilder<Hotel> builder)
    {
        builder.ToTable("Hotels");
        builder.HasKey(h => h.Id);

        builder.Property(h => h.Name).IsRequired().HasMaxLength(200);
        builder.Property(h => h.City).IsRequired().HasMaxLength(100);
        builder.Property(h => h.Country).IsRequired().HasMaxLength(100);
        builder.Property(h => h.Address).IsRequired().HasMaxLength(500);
        builder.Property(h => h.Phone).HasMaxLength(30);
        builder.Property(h => h.Email).HasMaxLength(200);

        builder.HasIndex(h => h.City);
    }
}
