// Author: S2401265 Ahmed Aslan Ibrahim
// HMS.Tests/UnitTests/JwtTokenServiceTests.cs
using HMS.Infrastructure.Security;
using Microsoft.Extensions.Configuration;
using System.IdentityModel.Tokens.Jwt;
using Xunit;

namespace HMS.Tests.UnitTests;

public class JwtTokenServiceTests
{
    private static JwtTokenService CreateService()
    {
        var config = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["Jwt:Key"]           = "super-secret-key-at-least-32-chars-long!!",
                ["Jwt:Issuer"]        = "HMS",
                ["Jwt:Audience"]      = "HMS",
                ["Jwt:ExpiryMinutes"] = "60",
            })
            .Build();
        return new JwtTokenService(config);
    }

    [Fact]
    public void GenerateToken_WithCanManageMedia_True_IncludesClaim()
    {
        var svc = CreateService();
        var (tokenStr, _) = svc.GenerateToken(1, "staff@test.com", "FrontDeskStaff", canManageMedia: true);

        var handler = new JwtSecurityTokenHandler();
        var token   = handler.ReadJwtToken(tokenStr);
        var claim   = token.Claims.FirstOrDefault(c => c.Type == "canManageMedia");

        Assert.NotNull(claim);
        Assert.Equal("true", claim.Value);
    }

    [Fact]
    public void GenerateToken_WithCanManageMedia_False_OmitsClaim()
    {
        var svc = CreateService();
        var (tokenStr, _) = svc.GenerateToken(1, "staff@test.com", "FrontDeskStaff", canManageMedia: false);

        var handler = new JwtSecurityTokenHandler();
        var token   = handler.ReadJwtToken(tokenStr);
        var claim   = token.Claims.FirstOrDefault(c => c.Type == "canManageMedia");

        Assert.Null(claim);
    }
}
