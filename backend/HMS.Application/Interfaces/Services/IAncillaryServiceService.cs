// Author: S2401265 Ahmed Aslan Ibrahim
using HMS.Application.DTOs.Services;

namespace HMS.Application.Interfaces.Services;

public interface IAncillaryServiceService
{
    Task<IEnumerable<AncillaryServiceDto>> GetAllServicesAsync();
    Task<AncillaryServiceDto?> GetServiceByIdAsync(int id);
}
