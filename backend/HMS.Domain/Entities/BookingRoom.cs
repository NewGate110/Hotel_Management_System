// Author: Salaams
namespace HMS.Domain.Entities;

public class BookingRoom
{
    public int BookingId { get; set; }
    public int RoomId { get; set; }
    public decimal PriceAtBooking { get; set; }

    public Booking Booking { get; set; } = null!;
    public Room Room { get; set; } = null!;
}
