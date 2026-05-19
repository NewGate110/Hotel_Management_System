// Author: S2401265 Ahmed Aslan Ibrahim
namespace HMS.Application.DTOs.Services;

public class AncillaryServiceDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Fee { get; set; }
    public string Unit { get; set; } = string.Empty;
    public bool IsActive { get; set; }
}
