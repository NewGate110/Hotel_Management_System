// Author: S2401265 Ahmed Aslan Ibrahim
using HMS.Application.DTOs.Hotels;
using HMS.Application.DTOs.Rooms;
using HMS.Application.Interfaces.Services;
using Microsoft.AspNetCore.Mvc;

namespace HMS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class HotelsController : ControllerBase
{
    private readonly IHotelService _hotelService;

    public HotelsController(IHotelService hotelService) => _hotelService = hotelService;

    /// <summary>Returns all active hotels.</summary>
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<HotelSummaryDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<HotelSummaryDto>>> GetAll()
    {
        var hotels = await _hotelService.GetAllHotelsAsync();
        return Ok(hotels);
    }

    /// <summary>Returns a single hotel by ID.</summary>
    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(HotelDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<HotelDto>> GetById(int id)
    {
        var hotel = await _hotelService.GetHotelByIdAsync(id);
        return hotel is null ? NotFound($"Hotel {id} not found.") : Ok(hotel);
    }

    /// <summary>Returns all rooms belonging to a hotel.</summary>
    [HttpGet("{id:int}/rooms")]
    [ProducesResponseType(typeof(IEnumerable<RoomDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<IEnumerable<RoomDto>>> GetRooms(int id)
    {
        var hotel = await _hotelService.GetHotelByIdAsync(id);
        if (hotel is null) return NotFound($"Hotel {id} not found.");

        var rooms = await _hotelService.GetRoomsForHotelAsync(id);
        return Ok(rooms);
    }
}
