// Author: S2401265 Ahmed Aslan Ibrahim
namespace HMS.Application.DTOs.Invoices;

public class InvoiceLineItemDto
{
    public int Id { get; set; }
    public string Description { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal LineTotal { get; set; }
}
