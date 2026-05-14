// Author: Salaams
using HMS.Application.Interfaces.Repositories;
using HMS.Domain.Entities;
using HMS.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace HMS.Infrastructure.Repositories;

public class InvoiceRepository : IInvoiceRepository
{
    private readonly HmsDbContext _db;
    public InvoiceRepository(HmsDbContext db) => _db = db;

    public async Task<Invoice?> GetByBookingIdAsync(int bookingId) =>
        await _db.Invoices
            .Include(i => i.LineItems)
            .FirstOrDefaultAsync(i => i.BookingId == bookingId);

    public async Task AddAsync(Invoice invoice)
    {
        _db.Invoices.Add(invoice);
        await _db.SaveChangesAsync();
    }
}
