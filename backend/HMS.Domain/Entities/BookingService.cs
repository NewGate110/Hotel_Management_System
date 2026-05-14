// Author: Salaams
namespace HMS.Domain.Entities;

public class BookingService
{
    public int Id { get; set; }
    public int BookingId { get; set; }
    public int ServiceId { get; set; }
    public int Quantity { get; set; }
    public DateTime ServiceDate { get; set; }
    public decimal TotalFee { get; set; }

    public Booking Booking { get; set; } = null!;
    public AncillaryService Service { get; set; } = null!;
}
