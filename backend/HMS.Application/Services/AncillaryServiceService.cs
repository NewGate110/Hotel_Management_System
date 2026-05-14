// Author: Salaams
using AutoMapper;
using HMS.Application.DTOs.Services;
using HMS.Application.Interfaces.Repositories;
using HMS.Application.Interfaces.Services;

namespace HMS.Application.Services;

public class AncillaryServiceService : IAncillaryServiceService
{
    private readonly IAncillaryServiceRepository _services;
    private readonly IMapper _mapper;

    public AncillaryServiceService(IAncillaryServiceRepository services, IMapper mapper)
    {
        _services = services;
        _mapper   = mapper;
    }

    public async Task<IEnumerable<AncillaryServiceDto>> GetAllServicesAsync()
    {
        var services = await _services.GetAllActiveAsync();
        return _mapper.Map<IEnumerable<AncillaryServiceDto>>(services);
    }

    public async Task<AncillaryServiceDto?> GetServiceByIdAsync(int id)
    {
        var service = await _services.GetByIdAsync(id);
        return service is null ? null : _mapper.Map<AncillaryServiceDto>(service);
    }
}
