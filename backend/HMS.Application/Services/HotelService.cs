// Author: S2401265 Ahmed Aslan Ibrahim
using AutoMapper;
using HMS.Application.DTOs.Hotels;
using HMS.Application.DTOs.Rooms;
using HMS.Application.Interfaces.Repositories;
using HMS.Application.Interfaces.Services;
using HMS.Domain.Entities;

namespace HMS.Application.Services;

public class HotelService : IHotelService
{
    private readonly IHotelRepository _hotels;
    private readonly IRoomRepository _rooms;
    private readonly IMapper _mapper;

    public HotelService(IHotelRepository hotels, IRoomRepository rooms, IMapper mapper)
    {
        _hotels = hotels;
        _rooms  = rooms;
        _mapper = mapper;
    }

    public async Task<IEnumerable<HotelSummaryDto>> GetAllHotelsAsync()
    {
        var hotels = await _hotels.GetAllAsync();
        return _mapper.Map<IEnumerable<HotelSummaryDto>>(hotels);
    }

    public async Task<HotelDto?> GetHotelByIdAsync(int id)
    {
        var hotel = await _hotels.GetByIdAsync(id);
        return hotel is null ? null : _mapper.Map<HotelDto>(hotel);
    }

    public async Task<IEnumerable<RoomDto>> GetRoomsForHotelAsync(int hotelId)
    {
        var rooms = await _rooms.GetByHotelIdAsync(hotelId);
        return _mapper.Map<IEnumerable<RoomDto>>(rooms);
    }

    public async Task<HotelDto> UpdateHotelAsync(int id, UpdateHotelDto dto)
    {
        var hotel = await _hotels.GetByIdAsync(id)
            ?? throw new KeyNotFoundException($"Hotel {id} not found.");

        hotel.Name     = dto.Name.Trim();
        hotel.City     = dto.City.Trim();
        hotel.Country  = dto.Country.Trim();
        hotel.Address  = dto.Address.Trim();
        hotel.Phone    = dto.Phone.Trim();
        hotel.Email    = dto.Email.Trim();
        hotel.IsActive = dto.IsActive;
        hotel.ImageUrl = dto.ImageUrl;

        await _hotels.UpdateAsync(hotel);
        return _mapper.Map<HotelDto>(hotel);
    }

    public async Task<HotelDto> UpdateHotelImageAsync(int hotelId, string? imageUrl)
    {
        var hotel = await _hotels.GetByIdAsync(hotelId)
            ?? throw new KeyNotFoundException($"Hotel {hotelId} not found.");
        hotel.ImageUrl = imageUrl;
        await _hotels.UpdateAsync(hotel);
        return _mapper.Map<HotelDto>(hotel);
    }

    public async Task<HotelDto> CreateHotelAsync(CreateHotelDto dto)
    {
        var hotel = new Hotel
        {
            Name     = dto.Name.Trim(),
            City     = dto.City.Trim(),
            Country  = dto.Country.Trim(),
            Address  = dto.Address.Trim(),
            Phone    = dto.Phone.Trim(),
            Email    = dto.Email.Trim(),
            ImageUrl = dto.ImageUrl?.Trim(),
            IsActive = true,
        };
        await _hotels.AddAsync(hotel);
        return _mapper.Map<HotelDto>(hotel);
    }

    public async Task DeleteHotelAsync(int id) => await _hotels.SoftDeleteAsync(id);
}
