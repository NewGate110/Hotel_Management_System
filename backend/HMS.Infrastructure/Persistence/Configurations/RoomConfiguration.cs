// Author: Salaams
using HMS.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HMS.Infrastructure.Persistence.Configurations;

public class RoomConfiguration : IEntityTypeConfiguration<Room>
{
    public void Configure(EntityTypeBuilder<Room> builder)
    {
        builder.ToTable("Rooms");
        builder.HasKey(r => r.Id);

        builder.Property(r => r.RoomNumber).IsRequired().HasMaxLength(10);
        builder.Property(r => r.Type).IsRequired().HasConversion<string>();
        builder.Property(r => r.Status).IsRequired().HasConversion<string>();
        builder.Property(r => r.PriceOffPeak).HasColumnType("decimal(10,2)");
        builder.Property(r => r.PricePeak).HasColumnType("decimal(10,2)");
        builder.Property(r => r.Description).HasMaxLength(1000);

        builder.HasOne(r => r.Hotel)
               .WithMany(h => h.Rooms)
               .HasForeignKey(r => r.HotelId)
               .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(r => new { r.HotelId, r.RoomNumber }).IsUnique();
    }
}
