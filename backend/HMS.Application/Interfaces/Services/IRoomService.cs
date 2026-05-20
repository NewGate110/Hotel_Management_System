// Author: S2401265 Ahmed Aslan Ibrahim
using HMS.Application.DTOs.Rooms;
using HMS.Domain.Enums;

namespace HMS.Application.Interfaces.Services;

public interface IRoomService
{
    Task<RoomDto?> GetRoomByIdAsync(int id);
    Task<IEnumerable<RoomDto>> SearchAvailableRoomsAsync(
        int hotelId, DateTime checkIn, DateTime checkOut, int? minCapacity = null);
    Task<RoomSearchResponse> SearchRoomsAsync(
        string? location, DateTime? checkIn, DateTime? checkOut,
        int? guests, RoomType? roomType, decimal? minPrice, decimal? maxPrice);
    Task<IEnumerable<DateRangeDto>> GetUnavailableDatesAsync(int roomId);
    Task<RoomDto> UpdateRoomPricingAsync(int roomId, UpdateRoomPricingDto dto);
    Task<RoomDto> UpdateRoomImageAsync(int roomId, UpdateImageDto dto);
    Task<RoomDto> UpdateRoomStatusAsync(int roomId, RoomStatus status);
    Task<RoomDto> CreateRoomAsync(int hotelId, CreateRoomDto dto);
    Task DeleteRoomAsync(int id);
}
