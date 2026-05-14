// Author: Salaams
namespace HMS.Application.DTOs.Bookings;

public class BookingServiceDto
{
    public int ServiceId { get; set; }
    public string ServiceName { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public DateTime ServiceDate { get; set; }
    public decimal TotalFee { get; set; }
}
