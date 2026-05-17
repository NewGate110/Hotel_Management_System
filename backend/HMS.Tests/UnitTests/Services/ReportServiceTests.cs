// Author: Salaams
using HMS.Application.Interfaces.Repositories;
using HMS.Application.Services;
using HMS.Domain.Entities;
using HMS.Domain.Enums;
using Moq;

namespace HMS.Tests.UnitTests.Services;

public class ReportServiceTests
{
    private readonly Mock<IHotelRepository>   _hotelRepo   = new();
    private readonly Mock<IRoomRepository>    _roomRepo    = new();
    private readonly Mock<IBookingRepository> _bookingRepo = new();
    private readonly Mock<IUserRepository>    _userRepo    = new();

    private ReportService BuildSut() => new(
        _hotelRepo.Object,
        _roomRepo.Object,
        _bookingRepo.Object,
        _userRepo.Object);

    private Hotel FakeHotel(int id = 1) =>
        new() { Id = id, Name = "Test Hotel" };

    // ── GetOccupancyReportAsync ───────────────────────────────────────────────

    [Fact]
    public async Task Occupancy_NoBookings_ReturnsZeroRate()
    {
        _hotelRepo.Setup(h => h.GetByIdAsync(1)).ReturnsAsync(FakeHotel());
        _roomRepo.Setup(r => r.GetByHotelIdAsync(1))
                 .ReturnsAsync(new List<Room> { new() { Id = 1 }, new() { Id = 2 } });
        _bookingRepo.Setup(b => b.GetByHotelIdAsync(1)).ReturnsAsync([]);

        var result = await BuildSut().GetOccupancyReportAsync(1, DateTime.Today, DateTime.Today.AddDays(7));

        Assert.Equal(0,  result.OccupiedRooms);
        Assert.Equal(0d, result.OccupancyRate);
        Assert.Equal(2,  result.TotalRooms);
    }

    [Fact]
    public async Task Occupancy_OneOfFiveRoomsOccupied_Returns20Percent()
    {
        var from = new DateTime(2027, 3, 1);
        var to   = new DateTime(2027, 3, 8);

        _hotelRepo.Setup(h => h.GetByIdAsync(1)).ReturnsAsync(FakeHotel());
        _roomRepo.Setup(r => r.GetByHotelIdAsync(1))
                 .ReturnsAsync(Enumerable.Range(1, 5).Select(i => new Room { Id = i }).ToList());

        var booking = new Booking
        {
            Status       = BookingStatus.Confirmed,
            CheckInDate  = new DateTime(2027, 3, 3),
            CheckOutDate = new DateTime(2027, 3, 5),
        };
        booking.BookingRooms.Add(new BookingRoom { RoomId = 1 });

        _bookingRepo.Setup(b => b.GetByHotelIdAsync(1)).ReturnsAsync([booking]);

        var result = await BuildSut().GetOccupancyReportAsync(1, from, to);

        Assert.Equal(1,    result.OccupiedRooms);
        Assert.Equal(20.0, result.OccupancyRate);
    }

    [Fact]
    public async Task Occupancy_CancelledBookings_AreExcluded()
    {
        var from = new DateTime(2027, 3, 1);
        var to   = new DateTime(2027, 3, 8);

        _hotelRepo.Setup(h => h.GetByIdAsync(1)).ReturnsAsync(FakeHotel());
        _roomRepo.Setup(r => r.GetByHotelIdAsync(1))
                 .ReturnsAsync(new List<Room> { new() { Id = 1 } });

        var cancelled = new Booking
        {
            Status       = BookingStatus.Cancelled,
            CheckInDate  = new DateTime(2027, 3, 3),
            CheckOutDate = new DateTime(2027, 3, 5),
        };
        cancelled.BookingRooms.Add(new BookingRoom { RoomId = 1 });

        _bookingRepo.Setup(b => b.GetByHotelIdAsync(1)).ReturnsAsync([cancelled]);

        var result = await BuildSut().GetOccupancyReportAsync(1, from, to);

        Assert.Equal(0,  result.OccupiedRooms);
        Assert.Equal(0d, result.OccupancyRate);
    }

    [Fact]
    public async Task Occupancy_SameRoomInMultipleBookings_CountedOnce()
    {
        var from = new DateTime(2027, 3, 1);
        var to   = new DateTime(2027, 3, 31);

        _hotelRepo.Setup(h => h.GetByIdAsync(1)).ReturnsAsync(FakeHotel());
        _roomRepo.Setup(r => r.GetByHotelIdAsync(1))
                 .ReturnsAsync(new List<Room> { new() { Id = 1 } });

        var b1 = new Booking
        {
            Status       = BookingStatus.CheckedOut,
            CheckInDate  = new DateTime(2027, 3, 2),
            CheckOutDate = new DateTime(2027, 3, 5),
        };
        b1.BookingRooms.Add(new BookingRoom { RoomId = 1 });

        var b2 = new Booking
        {
            Status       = BookingStatus.Confirmed,
            CheckInDate  = new DateTime(2027, 3, 10),
            CheckOutDate = new DateTime(2027, 3, 12),
        };
        b2.BookingRooms.Add(new BookingRoom { RoomId = 1 });

        _bookingRepo.Setup(b => b.GetByHotelIdAsync(1)).ReturnsAsync([b1, b2]);

        var result = await BuildSut().GetOccupancyReportAsync(1, from, to);

        Assert.Equal(1, result.OccupiedRooms);
    }

    // ── GetRevenueReportAsync ─────────────────────────────────────────────────

    [Fact]
    public async Task Revenue_NoQualifyingBookings_ReturnsZero()
    {
        _hotelRepo.Setup(h => h.GetByIdAsync(1)).ReturnsAsync(FakeHotel());
        _bookingRepo.Setup(b => b.GetByHotelIdAsync(1)).ReturnsAsync([]);

        var result = await BuildSut().GetRevenueReportAsync(1, DateTime.Today, DateTime.Today.AddDays(30));

        Assert.Equal(0m, result.TotalRevenue);
        Assert.Equal(0,  result.TotalBookings);
        Assert.Equal(0m, result.AverageBookingValue);
    }

    [Fact]
    public async Task Revenue_SumsCheckedOutBookings()
    {
        var from = new DateTime(2027, 1, 1);
        var to   = new DateTime(2027, 2, 1);

        _hotelRepo.Setup(h => h.GetByIdAsync(1)).ReturnsAsync(FakeHotel());

        var b1 = new Booking { Status = BookingStatus.CheckedOut, CheckInDate = new DateTime(2027, 1, 5),  TotalAmount = 300m };
        var b2 = new Booking { Status = BookingStatus.CheckedOut, CheckInDate = new DateTime(2027, 1, 15), TotalAmount = 200m };

        _bookingRepo.Setup(b => b.GetByHotelIdAsync(1)).ReturnsAsync([b1, b2]);

        var result = await BuildSut().GetRevenueReportAsync(1, from, to);

        Assert.Equal(500m, result.TotalRevenue);
        Assert.Equal(2,    result.TotalBookings);
        Assert.Equal(250m, result.AverageBookingValue);
    }

    [Fact]
    public async Task Revenue_CancelledBookings_ExcludedFromRevenue()
    {
        var from = new DateTime(2027, 1, 1);
        var to   = new DateTime(2027, 2, 1);

        _hotelRepo.Setup(h => h.GetByIdAsync(1)).ReturnsAsync(FakeHotel());

        var good      = new Booking { Status = BookingStatus.CheckedOut, CheckInDate = new DateTime(2027, 1, 5),  TotalAmount = 300m };
        var cancelled = new Booking { Status = BookingStatus.Cancelled,  CheckInDate = new DateTime(2027, 1, 10), TotalAmount = 200m };

        _bookingRepo.Setup(b => b.GetByHotelIdAsync(1)).ReturnsAsync([good, cancelled]);

        var result = await BuildSut().GetRevenueReportAsync(1, from, to);

        Assert.Equal(300m, result.TotalRevenue);
        Assert.Equal(1,    result.TotalBookings);
    }

    [Fact]
    public async Task Revenue_IncludesConfirmedAndCheckedInBookings()
    {
        var from = new DateTime(2027, 3, 1);
        var to   = new DateTime(2027, 4, 1);

        _hotelRepo.Setup(h => h.GetByIdAsync(1)).ReturnsAsync(FakeHotel());

        var confirmed  = new Booking { Status = BookingStatus.Confirmed,  CheckInDate = new DateTime(2027, 3, 5),  TotalAmount = 100m };
        var checkedIn  = new Booking { Status = BookingStatus.CheckedIn,  CheckInDate = new DateTime(2027, 3, 10), TotalAmount = 200m };
        var checkedOut = new Booking { Status = BookingStatus.CheckedOut, CheckInDate = new DateTime(2027, 3, 15), TotalAmount = 300m };

        _bookingRepo.Setup(b => b.GetByHotelIdAsync(1)).ReturnsAsync([confirmed, checkedIn, checkedOut]);

        var result = await BuildSut().GetRevenueReportAsync(1, from, to);

        Assert.Equal(600m, result.TotalRevenue);
        Assert.Equal(3,    result.TotalBookings);
    }

    // ── GetStaffPerformanceAsync ──────────────────────────────────────────────

    [Fact]
    public async Task StaffPerformance_CountsBookingsCreatedByStaff()
    {
        var staff = new StaffUser
        {
            Id         = 10,
            FirstName  = "Alice",
            LastName   = "Smith",
            Department = "Front Desk",
            Role       = UserRole.FrontDeskStaff,
        };
        _userRepo.Setup(u => u.GetAllStaffAsync()).ReturnsAsync([staff]);

        var b1 = new Booking { CreatedByStaffId = 10 };
        var b2 = new Booking { CreatedByStaffId = 10 };
        var b3 = new Booking { CreatedByStaffId = 99 }; // different staff

        _bookingRepo.Setup(b => b.GetByHotelIdAsync(1)).ReturnsAsync([b1, b2, b3]);

        var result = (await BuildSut().GetStaffPerformanceAsync(1)).ToList();

        Assert.Single(result);
        Assert.Equal(2, result[0].BookingsCreated);
    }

    [Fact]
    public async Task StaffPerformance_CountsCheckInsByPaymentStaffId()
    {
        var staff = new StaffUser
        {
            Id         = 5,
            FirstName  = "Bob",
            LastName   = "Jones",
            Department = "Reception",
            Role       = UserRole.FrontDeskStaff,
        };
        _userRepo.Setup(u => u.GetAllStaffAsync()).ReturnsAsync([staff]);

        var booking = new Booking { Status = BookingStatus.CheckedIn };
        booking.Payments.Add(new Payment { ProcessedByStaffId = 5, Status = PaymentStatus.Authorised });

        _bookingRepo.Setup(b => b.GetByHotelIdAsync(1)).ReturnsAsync([booking]);

        var result = (await BuildSut().GetStaffPerformanceAsync(1)).ToList();

        Assert.Equal(1, result[0].CheckIns);
        Assert.Equal(0, result[0].CheckOuts);
    }

    [Fact]
    public async Task StaffPerformance_NoBookings_ReturnsZeroCounts()
    {
        var staff = new StaffUser
        {
            Id         = 1,
            FirstName  = "Carol",
            LastName   = "T",
            Department = "Mgmt",
            Role       = UserRole.HotelManager,
        };
        _userRepo.Setup(u => u.GetAllStaffAsync()).ReturnsAsync([staff]);
        _bookingRepo.Setup(b => b.GetByHotelIdAsync(It.IsAny<int>())).ReturnsAsync([]);

        var result = (await BuildSut().GetStaffPerformanceAsync(1)).ToList();

        Assert.Single(result);
        Assert.Equal(0, result[0].BookingsCreated);
        Assert.Equal(0, result[0].CheckIns);
        Assert.Equal(0, result[0].CheckOuts);
    }
}
