// Author: Salaams
using HMS.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HMS.Infrastructure.Persistence.Configurations;

public class BookingRoomConfiguration : IEntityTypeConfiguration<BookingRoom>
{
    public void Configure(EntityTypeBuilder<BookingRoom> builder)
    {
        builder.ToTable("BookingRooms");
        builder.HasKey(br => new { br.BookingId, br.RoomId });

        builder.Property(br => br.PriceAtBooking).HasColumnType("decimal(10,2)");

        builder.HasOne(br => br.Booking)
               .WithMany(b => b.BookingRooms)
               .HasForeignKey(br => br.BookingId)
               .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(br => br.Room)
               .WithMany(r => r.BookingRooms)
               .HasForeignKey(br => br.RoomId)
               .OnDelete(DeleteBehavior.Restrict);
    }
}
