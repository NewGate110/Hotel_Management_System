// Author: Salaams
namespace HMS.Domain.Entities;

public class AncillaryService
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Fee { get; set; }
    public string Unit { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;

    public ICollection<BookingService> BookingServices { get; set; } = new List<BookingService>();
}
