// Author: S2401265 Ahmed Aslan Ibrahim
using HMS.Domain.Entities;

namespace HMS.Application.Interfaces.Repositories;

public interface IAncillaryServiceRepository
{
    Task<IEnumerable<AncillaryService>> GetAllActiveAsync();
    Task<AncillaryService?> GetByIdAsync(int id);
}
