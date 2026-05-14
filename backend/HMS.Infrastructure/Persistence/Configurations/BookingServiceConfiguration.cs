// Author: Salaams
using HMS.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HMS.Infrastructure.Persistence.Configurations;

public class BookingServiceConfiguration : IEntityTypeConfiguration<BookingService>
{
    public void Configure(EntityTypeBuilder<BookingService> builder)
    {
        builder.ToTable("BookingServices");
        builder.HasKey(bs => bs.Id);

        builder.Property(bs => bs.TotalFee).HasColumnType("decimal(10,2)");

        builder.HasOne(bs => bs.Booking)
               .WithMany(b => b.BookingServices)
               .HasForeignKey(bs => bs.BookingId)
               .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(bs => bs.Service)
               .WithMany(s => s.BookingServices)
               .HasForeignKey(bs => bs.ServiceId)
               .OnDelete(DeleteBehavior.Restrict);
    }
}
