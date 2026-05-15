// Author: Salaams
using HMS.Domain.Entities;
using HMS.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using BcryptHelper = BCrypt.Net.BCrypt;

namespace HMS.Infrastructure.Persistence;

public static class DataSeeder
{
    public static async Task SeedAsync(IServiceProvider serviceProvider)
    {
        using var scope = serviceProvider.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<HmsDbContext>();
        var logger = scope.ServiceProvider.GetRequiredService<ILogger<HmsDbContext>>();

        await db.Database.MigrateAsync();

        if (await db.Hotels.AnyAsync()) return;

        logger.LogInformation("Seeding database...");

        // ── Hotels ────────────────────────────────────────────────────────────
        var hotels = new List<Hotel>
        {
            new()
            {
                Name    = "Grand Plaza Sunset Reef Hotel",
                City    = "Maafushi",
                Country = "Maldives",
                Address = "Maafushi Island, Kaafu Atoll, Maldives",
                Phone   = "+960 400 1002",
                Email   = "sunsetreef@grandplaza.mv"
            },
            new()
            {
                Name    = "Grand Plaza Coconut Breeze Hotel",
                City    = "Addu City",
                Country = "Maldives",
                Address = "Hithadhoo, Addu Atoll (Seenu), Maldives",
                Phone   = "+960 400 1003",
                Email   = "coconutbreeze@grandplaza.mv"
            },
            new()
            {
                Name    = "Grand Plaza Pearl Sands Hotel",
                City    = "Dhigurah",
                Country = "Maldives",
                Address = "Dhigurah Island, South Ari Atoll, Maldives",
                Phone   = "+960 400 1004",
                Email   = "pearlsands@grandplaza.mv"
            },
            new()
            {
                Name    = "Grand Plaza Coral Tide Hotel",
                City    = "Dhidhdhoo",
                Country = "Maldives",
                Address = "Dhidhdhoo Island, Haa Alif Atoll, Maldives",
                Phone   = "+960 400 1005",
                Email   = "coraltide@grandplaza.mv"
            },
            new()
            {
                Name    = "Grand Plaza Equator Sands Hotel",
                City    = "Fuvahmulah",
                Country = "Maldives",
                Address = "Fuvahmulah Island, Gnaviyani Atoll, Maldives",
                Phone   = "+960 400 1006",
                Email   = "equatorsands@grandplaza.mv"
            },
        };

        // ── Luxury Properties ─────────────────────────────────────────────────
        var luxuryHotels = new List<Hotel>
        {
            new()
            {
                Name    = "Grand Plaza Azure Lagoon Hotel",
                City    = "Male",
                Country = "Maldives",
                Address = "North Malé Atoll (Kaafu), Maldives",
                Phone   = "+960 400 1001",
                Email   = "azurelagoon@grandplaza.mv"
            },
            new()
            {
                Name    = "Grand Plaza Manta Bay Hotel",
                City    = "Hanifaru Bay",
                Country = "Maldives",
                Address = "Baa Atoll, UNESCO Biosphere Reserve, Maldives",
                Phone   = "+960 400 1007",
                Email   = "mantabay@grandplaza.mv"
            },
        };

        db.Hotels.AddRange(hotels);
        db.Hotels.AddRange(luxuryHotels);
        await db.SaveChangesAsync();

        // ── Rooms ─────────────────────────────────────────────────────────────
        var rooms = new List<Room>();

        // Standard hotels — 5 rooms each
        foreach (var hotel in hotels)
        {
            rooms.AddRange(new[]
            {
                new Room
                {
                    HotelId      = hotel.Id,
                    RoomNumber   = "101",
                    Type         = RoomType.StandardDouble,
                    Capacity     = 2,
                    PriceOffPeak = 140,
                    PricePeak    = 195,
                    FloorNumber  = 1,
                    Status       = RoomStatus.Available,
                    Description  = "Comfortable standard room with ocean-inspired interior design and a private balcony."
                },
                new Room
                {
                    HotelId      = hotel.Id,
                    RoomNumber   = "102",
                    Type         = RoomType.StandardDouble,
                    Capacity     = 2,
                    PriceOffPeak = 165,
                    PricePeak    = 225,
                    FloorNumber  = 1,
                    Status       = RoomStatus.Available,
                    Description  = "Ocean-view standard room with king bed, rainfall shower, and in-room espresso machine."
                },
                new Room
                {
                    HotelId      = hotel.Id,
                    RoomNumber   = "201",
                    Type         = RoomType.DeluxeKing,
                    Capacity     = 2,
                    PriceOffPeak = 285,
                    PricePeak    = 385,
                    FloorNumber  = 2,
                    Status       = RoomStatus.Available,
                    Description  = "Spacious deluxe room with premium amenities, panoramic sea views, and a deep-soak bathtub."
                },
                new Room
                {
                    HotelId      = hotel.Id,
                    RoomNumber   = "202",
                    Type         = RoomType.DeluxeKing,
                    Capacity     = 2,
                    PriceOffPeak = 325,
                    PricePeak    = 430,
                    FloorNumber  = 2,
                    Status       = RoomStatus.Cleaning,
                    Description  = "Deluxe sunset-facing room with lounge area, minibar, and a private soaking tub."
                },
                new Room
                {
                    HotelId      = hotel.Id,
                    RoomNumber   = "301",
                    Type         = RoomType.FamilySuite,
                    Capacity     = 4,
                    PriceOffPeak = 510,
                    PricePeak    = 665,
                    FloorNumber  = 3,
                    Status       = RoomStatus.Available,
                    Description  = "Two-bedroom family suite with a private living area, kitchenette, and partial ocean view."
                },
            });
        }

        // Luxury properties — 6 rooms each with upgrade tier types
        foreach (var hotel in luxuryHotels)
        {
            rooms.AddRange(new[]
            {
                new Room
                {
                    HotelId      = hotel.Id,
                    RoomNumber   = "101",
                    Type         = RoomType.ExecutiveSuite,
                    Capacity     = 2,
                    PriceOffPeak = 660,
                    PricePeak    = 910,
                    FloorNumber  = 1,
                    Status       = RoomStatus.Available,
                    Description  = "Executive suite with private terrace, butler service, and a tropical garden view."
                },
                new Room
                {
                    HotelId      = hotel.Id,
                    RoomNumber   = "102",
                    Type         = RoomType.ExecutiveSuite,
                    Capacity     = 2,
                    PriceOffPeak = 730,
                    PricePeak    = 990,
                    FloorNumber  = 1,
                    Status       = RoomStatus.Available,
                    Description  = "Luxury executive suite with private plunge pool, espresso bar, and direct lagoon access."
                },
                new Room
                {
                    HotelId      = hotel.Id,
                    RoomNumber   = "201",
                    Type         = RoomType.PenthouseSuite,
                    Capacity     = 2,
                    PriceOffPeak = 960,
                    PricePeak    = 1370,
                    FloorNumber  = 2,
                    Status       = RoomStatus.Available,
                    Description  = "Penthouse suite with floor-to-ceiling windows, private sundeck, and panoramic horizon views."
                },
                new Room
                {
                    HotelId      = hotel.Id,
                    RoomNumber   = "301",
                    Type         = RoomType.GrandSuite,
                    Capacity     = 2,
                    PriceOffPeak = 1250,
                    PricePeak    = 1750,
                    FloorNumber  = 3,
                    Status       = RoomStatus.Available,
                    Description  = "Grand suite with infinity pool terrace, premium sound system, and unobstructed horizon views."
                },
                new Room
                {
                    HotelId      = hotel.Id,
                    RoomNumber   = "401",
                    Type         = RoomType.JuniorSuite,
                    Capacity     = 2,
                    PriceOffPeak = 1650,
                    PricePeak    = 2250,
                    FloorNumber  = 4,
                    Status       = RoomStatus.Available,
                    Description  = "Junior suite with dedicated concierge, in-suite dining, and an outdoor soaking tub."
                },
                new Room
                {
                    HotelId      = hotel.Id,
                    RoomNumber   = "501",
                    Type         = RoomType.PresidentialSuite,
                    Capacity     = 6,
                    PriceOffPeak = 3600,
                    PricePeak    = 5200,
                    FloorNumber  = 5,
                    Status       = RoomStatus.Available,
                    Description  = "Presidential suite spanning the entire top floor, with private pool, personal chef, and 360° ocean panorama."
                },
            });
        }

        db.Rooms.AddRange(rooms);
        await db.SaveChangesAsync();

        // ── Users ─────────────────────────────────────────────────────────────
        var admin = new StaffUser
        {
            Email              = "admin@grandplaza.com",
            PasswordHash       = BcryptHelper.HashPassword("Admin@1234!", workFactor: 12),
            Role               = UserRole.Admin,
            FirstName          = "Admin",
            LastName           = "User",
            EmployeeId         = "EMP001",
            Department         = "Administration",
            IsActive           = true,
            LastPasswordChange = DateTime.UtcNow,
            CreatedAt          = DateTime.UtcNow,
        };

        var manager = new StaffUser
        {
            Email              = "manager@grandplaza.com",
            PasswordHash       = BcryptHelper.HashPassword("Manager@1234!", workFactor: 12),
            Role               = UserRole.HotelManager,
            FirstName          = "Aishath",
            LastName           = "Latheef",
            EmployeeId         = "EMP002",
            Department         = "Hotel Operations",
            IsActive           = true,
            LastPasswordChange = DateTime.UtcNow,
            CreatedAt          = DateTime.UtcNow,
        };

        var staff = new StaffUser
        {
            Email              = "staff@grandplaza.com",
            PasswordHash       = BcryptHelper.HashPassword("Staff@1234!", workFactor: 12),
            Role               = UserRole.FrontDeskStaff,
            FirstName          = "Mohamed",
            LastName           = "Shifan",
            EmployeeId         = "EMP003",
            Department         = "Front Desk",
            IsActive           = true,
            LastPasswordChange = DateTime.UtcNow,
            CreatedAt          = DateTime.UtcNow,
        };

        var guest1 = new GuestUser
        {
            Email              = "guest@example.com",
            PasswordHash       = BcryptHelper.HashPassword("Guest@1234!", workFactor: 12),
            Role               = UserRole.Guest,
            FirstName          = "Grace",
            LastName           = "Taylor",
            Phone              = "+960 7778899",
            Address            = "M. Blue Reef, Male, Maldives",
            IsActive           = true,
            LastPasswordChange = DateTime.UtcNow,
            CreatedAt          = DateTime.UtcNow,
        };

        var guest2 = new GuestUser
        {
            Email              = "ibrahim.fathimath@example.mv",
            PasswordHash       = BcryptHelper.HashPassword("Guest@1234!", workFactor: 12),
            Role               = UserRole.Guest,
            FirstName          = "Fathimath",
            LastName           = "Ibrahim",
            Phone              = "+960 7889941",
            Address            = "K. Kaashidhoo, North Malé Atoll, Maldives",
            IsActive           = true,
            LastPasswordChange = DateTime.UtcNow,
            CreatedAt          = DateTime.UtcNow,
        };

        db.Users.AddRange(admin, manager, staff, guest1, guest2);
        await db.SaveChangesAsync();

        // ── Ancillary Services ─────────────────────────────────────────────────
        var services = new List<AncillaryService>
        {
            new()
            {
                Name        = "Airport Transfer",
                Description = "Private car transfer to or from the nearest international airport.",
                Fee         = 75,
                Unit        = "per booking"
            },
            new()
            {
                Name        = "Breakfast Package",
                Description = "Full buffet breakfast for two, served at the hotel restaurant.",
                Fee         = 45,
                Unit        = "per day"
            },
            new()
            {
                Name        = "Spa & Wellness Treatment",
                Description = "60-minute signature massage and access to the wellness suite.",
                Fee         = 150,
                Unit        = "per session"
            },
            new()
            {
                Name        = "In-Room Dining — Dinner",
                Description = "Three-course dinner delivered to your room, prepared by our chef.",
                Fee         = 90,
                Unit        = "per person"
            },
            new()
            {
                Name        = "Guided City Tour",
                Description = "Half-day guided tour of local cultural sites with a hotel concierge.",
                Fee         = 60,
                Unit        = "per person"
            },
            new()
            {
                Name        = "Late Check-out",
                Description = "Extend your stay until 18:00 (subject to availability).",
                Fee         = 50,
                Unit        = "per booking"
            },
        };

        db.AncillaryServices.AddRange(services);
        await db.SaveChangesAsync();

        // ── Bookings ──────────────────────────────────────────────────────────
        var now = DateTime.UtcNow.Date;

        var confirmedRoom  = rooms.First(r => r.HotelId == hotels[0].Id && r.Type == RoomType.DeluxeKing);
        var checkedInRoom  = rooms.First(r => r.HotelId == hotels[1].Id && r.Type == RoomType.StandardDouble);
        var completedRoom  = rooms.First(r => r.HotelId == hotels[2].Id && r.Type == RoomType.FamilySuite);
        var cancelledRoom  = rooms.First(r => r.HotelId == luxuryHotels[0].Id && r.Type == RoomType.ExecutiveSuite);

        var bookingConfirmed = new Booking
        {
            GuestId         = guest1.Id,
            HotelId         = hotels[0].Id,
            CheckInDate     = now.AddDays(16),
            CheckOutDate    = now.AddDays(20),
            Status          = BookingStatus.Confirmed,
            TotalAmount     = confirmedRoom.PriceOffPeak * 4,
            CancellationFee = 0,
            Notes           = "Guest requested early check-in.",
            CreatedAt       = now.AddDays(-3),
        };

        var bookingCheckedIn = new Booking
        {
            GuestId         = guest2.Id,
            HotelId         = hotels[1].Id,
            CheckInDate     = now.AddDays(-1),
            CheckOutDate    = now.AddDays(3),
            Status          = BookingStatus.CheckedIn,
            TotalAmount     = checkedInRoom.PriceOffPeak * 4,
            CancellationFee = 0,
            Notes           = "Connecting room requested.",
            CreatedAt       = now.AddDays(-10),
        };

        var bookingCompleted = new Booking
        {
            GuestId         = guest1.Id,
            HotelId         = hotels[2].Id,
            CheckInDate     = now.AddDays(-35),
            CheckOutDate    = now.AddDays(-30),
            Status          = BookingStatus.CheckedOut,
            TotalAmount     = completedRoom.PriceOffPeak * 5,
            CancellationFee = 0,
            Notes           = "Family trip — extra rollaway bed added on arrival.",
            CreatedAt       = now.AddDays(-50),
        };

        var bookingCancelled = new Booking
        {
            GuestId         = guest2.Id,
            HotelId         = luxuryHotels[0].Id,
            CheckInDate     = now.AddDays(5),
            CheckOutDate    = now.AddDays(10),
            Status          = BookingStatus.Cancelled,
            TotalAmount     = cancelledRoom.PriceOffPeak * 5,
            CancellationFee = cancelledRoom.PriceOffPeak,
            Notes           = "Cancelled within 14-day window; one-night fee retained.",
            CreatedAt       = now.AddDays(-14),
        };

        db.Bookings.AddRange(bookingConfirmed, bookingCheckedIn, bookingCompleted, bookingCancelled);
        await db.SaveChangesAsync();

        db.BookingRooms.AddRange(
            new BookingRoom { BookingId = bookingConfirmed.Id,  RoomId = confirmedRoom.Id,  PriceAtBooking = confirmedRoom.PriceOffPeak  },
            new BookingRoom { BookingId = bookingCheckedIn.Id,  RoomId = checkedInRoom.Id,  PriceAtBooking = checkedInRoom.PriceOffPeak  },
            new BookingRoom { BookingId = bookingCompleted.Id,  RoomId = completedRoom.Id,  PriceAtBooking = completedRoom.PriceOffPeak  },
            new BookingRoom { BookingId = bookingCancelled.Id,  RoomId = cancelledRoom.Id,  PriceAtBooking = cancelledRoom.PriceOffPeak  }
        );

        db.BookingServices.AddRange(
            new BookingService
            {
                BookingId   = bookingConfirmed.Id,
                ServiceId   = services[0].Id,
                Quantity    = 2,
                ServiceDate = bookingConfirmed.CheckInDate,
                TotalFee    = services[0].Fee * 2,
            },
            new BookingService
            {
                BookingId   = bookingConfirmed.Id,
                ServiceId   = services[1].Id,
                Quantity    = 2,
                ServiceDate = bookingConfirmed.CheckInDate.AddDays(1),
                TotalFee    = services[1].Fee * 2,
            },
            new BookingService
            {
                BookingId   = bookingCheckedIn.Id,
                ServiceId   = services[0].Id,
                Quantity    = 2,
                ServiceDate = bookingCheckedIn.CheckInDate,
                TotalFee    = services[0].Fee * 2,
            },
            new BookingService
            {
                BookingId   = bookingCompleted.Id,
                ServiceId   = services[2].Id,
                Quantity    = 2,
                ServiceDate = bookingCompleted.CheckInDate.AddDays(1),
                TotalFee    = services[2].Fee * 2,
            },
            new BookingService
            {
                BookingId   = bookingCompleted.Id,
                ServiceId   = services[4].Id,
                Quantity    = 2,
                ServiceDate = bookingCompleted.CheckInDate.AddDays(2),
                TotalFee    = services[4].Fee * 2,
            },
            new BookingService
            {
                BookingId   = bookingCancelled.Id,
                ServiceId   = services[1].Id,
                Quantity    = 2,
                ServiceDate = bookingCancelled.CheckInDate,
                TotalFee    = services[1].Fee * 2,
            }
        );

        await db.SaveChangesAsync();
        logger.LogInformation("Database seeding complete.");
    }
}
