// Author: Salaams
using HMS.Domain.Entities;

namespace HMS.Application.Interfaces.Repositories;

public interface IPaymentRepository
{
    Task<IEnumerable<Payment>> GetByBookingIdAsync(int bookingId);
    Task AddAsync(Payment payment);
    Task UpdateAsync(Payment payment);
}
