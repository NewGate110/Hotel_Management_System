// Author: Salaams
namespace HMS.Application.DTOs.Rooms;

public class RoomDto
{
    public int Id { get; set; }
    public int HotelId { get; set; }
    public string HotelName { get; set; } = string.Empty;
    public string RoomNumber { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;        // enum serialised as string
    public int Capacity { get; set; }
    public decimal PriceOffPeak { get; set; }
    public decimal PricePeak { get; set; }
    public string Status { get; set; } = string.Empty;      // enum serialised as string
    public string Description { get; set; } = string.Empty;
    public string? ImageUrl { get; set; }
    public int FloorNumber { get; set; }
}
