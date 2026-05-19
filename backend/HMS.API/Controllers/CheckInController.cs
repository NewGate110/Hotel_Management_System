// Author: S2401265 Ahmed Aslan Ibrahim
using System.Security.Claims;
using HMS.Application.DTOs.Bookings;
using HMS.Application.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HMS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
[Authorize(Roles = "FrontDeskStaff,HotelManager,Admin")]
public class CheckInController : ControllerBase
{
    private readonly IBookingService _bookingService;

    public CheckInController(IBookingService bookingService) => _bookingService = bookingService;

    /// <summary>Checks in a confirmed booking. Staff ID is extracted from the JWT token.</summary>
    [HttpPost("{bookingId:int}")]
    [ProducesResponseType(typeof(BookingDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<BookingDto>> CheckIn(int bookingId)
    {
        var staffId = int.TryParse(User.FindFirst("sub")?.Value, out var id) ? id : 0;
        try
        {
            var booking = await _bookingService.CheckInAsync(bookingId, staffId);
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
        var staffId = int.TryParse(User.FindFirst("sub")?.Value, out var id) ? id : 0;
        try
        {
            var booking = await _bookingService.CheckOutAsync(bookingId, staffId);
            return Ok(booking);
        }
        catch (KeyNotFoundException ex) { return NotFound(ex.Message); }
        catch (InvalidOperationException ex) { return BadRequest(ex.Message); }
    }
}
