// Author: S2401265 Ahmed Aslan Ibrahim
using HMS.Application.DTOs.Bookings;
using HMS.Application.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HMS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
[Authorize(Roles = "FrontDeskStaff,HotelManager,Admin")]
public class CheckInController : HmsControllerBase
{
    private readonly IBookingService _bookingService;

    public CheckInController(IBookingService bookingService) => _bookingService = bookingService;

    /// <summary>Returns Confirmed bookings with a check-in date of today (UTC).</summary>
    [HttpGet("arrivals")]
    [ProducesResponseType(typeof(IEnumerable<BookingDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<BookingDto>>> GetArrivals()
    {
        var arrivals = await _bookingService.GetTodayArrivalsAsync();
        return Ok(arrivals);
    }

    /// <summary>Returns all bookings currently in CheckedIn status.</summary>
    [HttpGet("departures")]
    [ProducesResponseType(typeof(IEnumerable<BookingDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<BookingDto>>> GetDepartures()
    {
        var departures = await _bookingService.GetCheckedInAsync();
        return Ok(departures);
    }

    /// <summary>Checks in a confirmed booking. Staff ID is extracted from the JWT token.</summary>
    [HttpPost("{bookingId:int}")]
    [ProducesResponseType(typeof(BookingDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<BookingDto>> CheckIn(int bookingId)
    {
        try
        {
            var booking = await _bookingService.CheckInAsync(bookingId, CallerId);
            return Ok(booking);
        }
        catch (KeyNotFoundException ex) { return NotFound(ex.Message); }
        catch (InvalidOperationException ex) { return BadRequest(ex.Message); }
    }

    /// <summary>Checks out a booking that is currently checked in. Staff ID is extracted from the JWT token.</summary>
    [HttpPost("{bookingId:int}/checkout")]
    [ProducesResponseType(typeof(BookingDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<BookingDto>> CheckOut(int bookingId)
    {
        try
        {
            var booking = await _bookingService.CheckOutAsync(bookingId, CallerId);
            return Ok(booking);
        }
        catch (KeyNotFoundException ex) { return NotFound(ex.Message); }
        catch (InvalidOperationException ex) { return BadRequest(ex.Message); }
    }
}
