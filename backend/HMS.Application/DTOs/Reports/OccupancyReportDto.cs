// Author: Salaams
namespace HMS.Application.DTOs.Reports;

public class OccupancyReportDto
{
    public int HotelId { get; set; }
    public string HotelName { get; set; } = string.Empty;
    public DateTime From { get; set; }
    public DateTime To { get; set; }
    public int TotalRooms { get; set; }
    public int OccupiedRooms { get; set; }
    public double OccupancyRate { get; set; }   // percentage 0–100
}
