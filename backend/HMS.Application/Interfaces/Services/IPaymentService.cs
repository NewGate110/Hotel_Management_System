// Author: Salaams
using HMS.Application.DTOs.Invoices;
using HMS.Application.DTOs.Payments;

namespace HMS.Application.Interfaces.Services;

public interface IPaymentService
{
    Task<IEnumerable<PaymentDto>> GetPaymentsByBookingAsync(int bookingId);
    Task<InvoiceDto?> GetInvoiceByBookingAsync(int bookingId);
}
