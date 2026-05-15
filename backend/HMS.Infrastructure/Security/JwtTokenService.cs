// Author: Salaams
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using HMS.Application.Interfaces.Security;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace HMS.Infrastructure.Security;

public class JwtTokenService : IJwtTokenService
{
    private readonly string _key;
    private readonly string _issuer;
    private readonly string _audience;
    private readonly int    _expiryMinutes;

    public JwtTokenService(IConfiguration configuration)
    {
        var section   = configuration.GetSection("Jwt");
        _key          = section["Key"]          ?? throw new InvalidOperationException("Jwt:Key not configured.");
        _issuer       = section["Issuer"]       ?? "HMS";
        _audience     = section["Audience"]     ?? "HMS";
        _expiryMinutes = int.TryParse(section["ExpiryMinutes"], out var m) ? m : 60;
    }

    public (string Token, DateTime ExpiresAt) GenerateToken(
        int userId, string email, string role, bool canManageMedia = false)
    {
        var expiresAt   = DateTime.UtcNow.AddMinutes(_expiryMinutes);
        var signingKey  = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_key));
        var credentials = new SigningCredentials(signingKey, SecurityAlgorithms.HmacSha256);

        var claims = new List<Claim>
        {
            new Claim(JwtRegisteredClaimNames.Sub,   userId.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, email),
            new Claim("role",                        role),  // short name; MapInboundClaims=false
            new Claim(JwtRegisteredClaimNames.Jti,   Guid.NewGuid().ToString()),
        };

        if (canManageMedia)
            claims.Add(new Claim("canManageMedia", "true"));

        var token = new JwtSecurityToken(
            issuer:             _issuer,
            audience:           _audience,
            claims:             claims,
            notBefore:          DateTime.UtcNow,
            expires:            expiresAt,
            signingCredentials: credentials);

        return (new JwtSecurityTokenHandler().WriteToken(token), expiresAt);
    }
}
