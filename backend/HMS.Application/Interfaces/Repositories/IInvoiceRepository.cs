// Author: Salaams
using HMS.Domain.Entities;

namespace HMS.Application.Interfaces.Repositories;

public interface IInvoiceRepository
{
    Task<Invoice?> GetByBookingIdAsync(int bookingId);
    Task AddAsync(Invoice invoice);
}
