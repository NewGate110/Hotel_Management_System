// Author: S2401265 Ahmed Aslan Ibrahim
namespace HMS.Application.DTOs.Payments;

public class PaymentDto
{
    public int Id { get; set; }
    public int BookingId { get; set; }
    public decimal Amount { get; set; }
    public string Method { get; set; } = string.Empty;     // enum serialised as string
    public string Status { get; set; } = string.Empty;     // enum serialised as string
    public string TransactionRef { get; set; } = string.Empty;
    public DateTime ProcessedAt { get; set; }
}
