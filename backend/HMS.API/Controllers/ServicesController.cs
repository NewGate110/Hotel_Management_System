// Author: Salaams
using HMS.Application.DTOs.Services;
using HMS.Application.Interfaces.Services;
using Microsoft.AspNetCore.Mvc;

namespace HMS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class ServicesController : ControllerBase
{
    private readonly IAncillaryServiceService _servicesCatalog;

    public ServicesController(IAncillaryServiceService servicesCatalog) =>
        _servicesCatalog = servicesCatalog;

    /// <summary>Returns all active ancillary services (breakfast, spa, transfers, etc.).</summary>
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<AncillaryServiceDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<AncillaryServiceDto>>> GetAll()
    {
        var services = await _servicesCatalog.GetAllServicesAsync();
        return Ok(services);
    }

    /// <summary>Returns a single ancillary service by ID.</summary>
    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(AncillaryServiceDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<AncillaryServiceDto>> GetById(int id)
    {
        var service = await _servicesCatalog.GetServiceByIdAsync(id);
        return service is null ? NotFound($"Service {id} not found.") : Ok(service);
    }
}
