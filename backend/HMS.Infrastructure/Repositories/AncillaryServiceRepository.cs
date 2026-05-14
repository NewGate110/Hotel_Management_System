// Author: Salaams
using HMS.Application.Interfaces.Repositories;
using HMS.Domain.Entities;
using HMS.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace HMS.Infrastructure.Repositories;

public class AncillaryServiceRepository : IAncillaryServiceRepository
{
    private readonly HmsDbContext _db;
    public AncillaryServiceRepository(HmsDbContext db) => _db = db;

    public async Task<IEnumerable<AncillaryService>> GetAllActiveAsync() =>
        await _db.AncillaryServices
            .Where(s => s.IsActive)
            .OrderBy(s => s.Name)
            .ToListAsync();

    public async Task<AncillaryService?> GetByIdAsync(int id) =>
        await _db.AncillaryServices.FirstOrDefaultAsync(s => s.Id == id);
}
