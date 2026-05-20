// Author: S2401265 Ahmed Aslan Ibrahim
using HMS.Domain.Entities;

namespace HMS.Application.Interfaces.Repositories;

public interface IBookingRepository
{
    Task<Booking?> GetByIdAsync(int id);
    Task<Booking?> GetByIdWithDetailsAsync(int id);
    Task<IEnumerable<Booking>> GetByGuestIdAsync(int guestId);
    Task<IEnumerable<Booking>> GetByHotelIdAsync(int hotelId);
    /// <summary>Returns all bookings (lightweight — no navigation properties loaded).</summary>
    Task<IEnumerable<Booking>> GetAllAsync();
    /// <summary>Returns Confirmed bookings whose check-in date is today (UTC).</summary>
    Task<IEnumerable<Booking>> GetTodayArrivalsAsync();
    /// <summary>Returns all bookings currently in CheckedIn status.</summary>
    Task<IEnumerable<Booking>> GetCheckedInAsync();
    Task AddAsync(Booking booking);
    Task UpdateAsync(Booking booking);
}
