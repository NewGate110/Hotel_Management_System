// Author: S2401265 Ahmed Aslan Ibrahim
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
using HMS.Domain.Enums;

namespace HMS.Application.DTOs.Rooms;

public class CreateRoomDto
{
    [Required, MaxLength(20)]    public string RoomNumber    { get; set; } = string.Empty;
    [JsonConverter(typeof(JsonStringEnumConverter))]
                                  public RoomType Type         { get; set; }
    [Range(1, 20)]                public int Capacity          { get; set; }
    [Range(0.01, 100_000)]        public decimal PriceOffPeak  { get; set; }
    [Range(0.01, 100_000)]        public decimal PricePeak     { get; set; }
    [MaxLength(1000)]             public string Description    { get; set; } = string.Empty;
    [MaxLength(2000)]             public string? ImageUrl      { get; set; }
    [Range(0, 200)]               public int FloorNumber       { get; set; }
}
