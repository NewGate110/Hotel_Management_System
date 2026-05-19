// Author: S2401265 Ahmed Aslan Ibrahim
using HMS.Application.Interfaces.Repositories;
using HMS.Domain.Entities;
using HMS.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace HMS.Infrastructure.Repositories;

public class PaymentRepository : IPaymentRepository
{
    private readonly HmsDbContext _db;
    public PaymentRepository(HmsDbContext db) => _db = db;

    public async Task<IEnumerable<Payment>> GetByBookingIdAsync(int bookingId) =>
        await _db.Payments
            .Where(p => p.BookingId == bookingId)
            .OrderByDescending(p => p.ProcessedAt)
            .ToListAsync();

    public async Task AddAsync(Payment payment)
    {
        _db.Payments.Add(payment);
        await _db.SaveChangesAsync();
    }

    public async Task UpdateAsync(Payment payment)
    {
        _db.Payments.Update(payment);
        await _db.SaveChangesAsync();
    }
}
