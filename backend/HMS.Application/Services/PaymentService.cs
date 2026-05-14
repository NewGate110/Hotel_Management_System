// Author: Salaams
using AutoMapper;
using HMS.Application.DTOs.Invoices;
using HMS.Application.DTOs.Payments;
using HMS.Application.Interfaces.Repositories;
using HMS.Application.Interfaces.Services;

namespace HMS.Application.Services;

public class PaymentService : IPaymentService
{
    private readonly IPaymentRepository _payments;
    private readonly IInvoiceRepository _invoices;
    private readonly IMapper _mapper;

    public PaymentService(IPaymentRepository payments, IInvoiceRepository invoices, IMapper mapper)
    {
        _payments = payments;
        _invoices = invoices;
        _mapper   = mapper;
    }

    public async Task<IEnumerable<PaymentDto>> GetPaymentsByBookingAsync(int bookingId)
    {
        var payments = await _payments.GetByBookingIdAsync(bookingId);
        return _mapper.Map<IEnumerable<PaymentDto>>(payments);
    }

    public async Task<InvoiceDto?> GetInvoiceByBookingAsync(int bookingId)
    {
        var invoice = await _invoices.GetByBookingIdAsync(bookingId);
        return invoice is null ? null : _mapper.Map<InvoiceDto>(invoice);
    }
}
