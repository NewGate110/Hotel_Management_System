// Author: Salaams
namespace HMS.Domain.Enums;

public enum RoomType
{
    StandardDouble    = 0,
    DeluxeKing        = 1,
    FamilySuite       = 2,

    // Upgrade tiers (formerly resort villa types — integer values preserved)
    ExecutiveSuite    = 3,   // was BeachVilla
    PenthouseSuite    = 4,   // was WaterVilla
    GrandSuite        = 5,   // was OverwaterBungalow
    JuniorSuite       = 6,   // was HoneymoonVilla
    PresidentialSuite = 7,   // was PresidentialVilla
}
