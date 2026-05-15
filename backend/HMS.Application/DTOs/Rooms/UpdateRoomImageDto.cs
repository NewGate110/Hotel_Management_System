// Author: Salaams
using System.ComponentModel.DataAnnotations;

namespace HMS.Application.DTOs.Rooms;

public class UpdateRoomImageDto
{
    [MaxLength(2000)]
    public string? ImageUrl { get; set; }
}
