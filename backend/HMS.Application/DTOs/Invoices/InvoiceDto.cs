// Author: Salaams
namespace HMS.Application.DTOs.Invoices;

public class InvoiceDto
{
    public int Id { get; set; }
    public int BookingId { get; set; }
    public string InvoiceNumber { get; set; } = string.Empty;
    public DateTime IssuedAt { get; set; }
    public decimal Subtotal { get; set; }
    public decimal TaxAmount { get; set; }
    public decimal TotalAmount { get; set; }
    public List<InvoiceLineItemDto> LineItems { get; set; } = new();
}
