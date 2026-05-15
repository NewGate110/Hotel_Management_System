// Author: Salaams
using HMS.Domain.Enums;

namespace HMS.Domain.Entities;

public class Room
{
    public int Id { get; set; }
    public int HotelId { get; set; }
    public string RoomNumber { get; set; } = string.Empty;
    public RoomType Type { get; set; }
    public int Capacity { get; set; }
    public decimal PriceOffPeak { get; set; }
    public decimal PricePeak { get; set; }
    public RoomStatus Status { get; set; } = RoomStatus.Available;
    public string Description { get; set; } = string.Empty;
    public string? ImageUrl { get; set; }
    public int FloorNumber { get; set; }

    public Hotel Hotel { get; set; } = null!;
    public ICollection<BookingRoom> BookingRooms { get; set; } = new List<BookingRoom>();
}
