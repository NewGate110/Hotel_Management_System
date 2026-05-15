// Author: Salaams
using System.ComponentModel.DataAnnotations;

namespace HMS.Application.DTOs.Rooms;

public class UpdateImageDto
{
    [MaxLength(2000)]
    public string? ImageUrl { get; set; }
}
