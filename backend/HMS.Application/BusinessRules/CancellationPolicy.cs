// Author: S2401265 Ahmed Aslan Ibrahim
using HMS.Domain.Entities;

namespace HMS.Application.BusinessRules;

/// <summary>
/// Calculates cancellation fees per the hotel policy:
///   &gt; 14 days before check-in  → Free
///   3 – 14 days before check-in → 50% of first-night room rate
///   &lt; 72 hours before check-in  → 100% of first-night room rate
///   No-show                      → 100% of entire booking total
/// </summary>
public static class CancellationPolicy
{
    private const double FreeCancellationHours   = 14 * 24; // 336 h
    private const double PartialFeeHours         = 72;       // 3 days

    /// <summary>
    /// Returns the cancellation fee for a booking cancelled at <paramref name="now"/>.
    /// </summary>
    public static decimal CalculateFee(Booking booking, DateTime now)
    {
        var hoursUntilCheckIn = (booking.CheckInDate - now).TotalHours;

        if (hoursUntilCheckIn > FreeCancellationHours)
            return 0m;

        // First-night rate: the price of the first room at booking time
        var firstNightRate = booking.BookingRooms
            .Select(br => br.PriceAtBooking)
            .DefaultIfEmpty(0m)
            .First();

        if (hoursUntilCheckIn > PartialFeeHours)
            return Math.Round(firstNightRate * 0.5m, 2);   // 50% — 3–14 day window

        return firstNightRate;                              // 100% — under 72 hours
    }

    /// <summary>
    /// Returns the no-show fee (100% of the full booking total).
    /// Called by staff when a guest fails to arrive.
    /// </summary>
    public static decimal NoShowFee(Booking booking) => booking.TotalAmount;
}
