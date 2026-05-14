// Author: Salaams
using HMS.Domain.Entities;

namespace HMS.Application.Interfaces.Repositories;

public interface IAncillaryServiceRepository
{
    Task<IEnumerable<AncillaryService>> GetAllActiveAsync();
    Task<AncillaryService?> GetByIdAsync(int id);
}
