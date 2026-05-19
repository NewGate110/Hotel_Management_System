// Author: S2401265 Ahmed Aslan Ibrahim
namespace HMS.Application.DTOs.Hotels;

public class HotelSummaryDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string Country { get; set; } = string.Empty;
    public string? ImageUrl { get; set; }
}
