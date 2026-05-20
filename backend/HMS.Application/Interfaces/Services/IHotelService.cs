// Author: S2401265 Ahmed Aslan Ibrahim
using HMS.Application.DTOs.Hotels;
using HMS.Application.DTOs.Rooms;

namespace HMS.Application.Interfaces.Services;

public interface IHotelService
{
    Task<IEnumerable<HotelSummaryDto>> GetAllHotelsAsync();
    Task<HotelDto?> GetHotelByIdAsync(int id);
    Task<IEnumerable<RoomDto>> GetRoomsForHotelAsync(int hotelId);
    Task<HotelDto> UpdateHotelAsync(int id, UpdateHotelDto dto);
    Task<HotelDto> UpdateHotelImageAsync(int hotelId, string? imageUrl);
    Task<HotelDto> CreateHotelAsync(CreateHotelDto dto);
    Task DeleteHotelAsync(int id);
}
