// Author: Salaams
namespace HMS.Application.Interfaces.Security;

public interface IJwtTokenService
{
    (string Token, DateTime ExpiresAt) GenerateToken(int userId, string email, string role);
}
