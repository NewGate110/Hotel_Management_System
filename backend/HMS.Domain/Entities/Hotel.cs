// Author: S2401265 Ahmed Aslan Ibrahim
namespace HMS.Domain.Entities;

public class Hotel
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string Country { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? ImageUrl { get; set; }
    public bool IsActive { get; set; } = true;

    public ICollection<Room> Rooms { get; set; } = new List<Room>();
    public ICollection<Booking> Bookings { get; set; } = new List<Booking>();
}
