// Author: S2401265 Ahmed Aslan Ibrahim
using System.Text.Json.Serialization;
using HMS.Domain.Enums;

namespace HMS.Application.DTOs.Rooms;

public class UpdateRoomStatusDto
{
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public RoomStatus Status { get; set; }
}
