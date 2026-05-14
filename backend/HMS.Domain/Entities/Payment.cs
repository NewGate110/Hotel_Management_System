// Author: Salaams
using HMS.Domain.Enums;

namespace HMS.Domain.Entities;

public class Payment
{
    public int Id { get; set; }
    public int BookingId { get; set; }
    public decimal Amount { get; set; }
    public PaymentMethod Method { get; set; }
    public PaymentStatus Status { get; set; } = PaymentStatus.Pending;
    public string TransactionRef { get; set; } = string.Empty;
    public DateTime ProcessedAt { get; set; } = DateTime.UtcNow;
    public int? ProcessedByStaffId { get; set; }

    public Booking Booking { get; set; } = null!;
}
