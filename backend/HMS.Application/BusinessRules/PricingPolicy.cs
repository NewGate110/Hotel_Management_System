// Author: Salaams
using HMS.Domain.Entities;

namespace HMS.Application.BusinessRules;

/// <summary>
/// Determines the applicable nightly rate for a room.
/// Peak season: June–August (summer) and 20 Dec–5 Jan (Christmas/New Year).
/// All other dates are off-peak.
/// The rate is fixed by the check-in date for the entire stay.
/// </summary>
public static class PricingPolicy
{
    public static bool IsPeakSeason(DateTime date)
    {
        var month = date.Month;
        var day   = date.Day;

        if (month is 6 or 7 or 8)          return true;  // Summer
        if (month == 12 && day >= 20)       return true;  // Christmas
        if (month == 1  && day <= 5)        return true;  // New Year

        return false;
    }

    /// <summary>
    /// Returns the nightly rate for a room, based on the check-in date.
    /// </summary>
    public static decimal GetNightlyRate(Room room, DateTime checkInDate) =>
        IsPeakSeason(checkInDate) ? room.PricePeak : room.PriceOffPeak;
}
