// Author: Salaams
namespace HMS.Application.DTOs.Reports;

public class RevenueReportDto
{
    public int HotelId { get; set; }
    public string HotelName { get; set; } = string.Empty;
    public DateTime From { get; set; }
    public DateTime To { get; set; }
    public decimal TotalRevenue { get; set; }
    public int TotalBookings { get; set; }
    public decimal AverageBookingValue { get; set; }
}
