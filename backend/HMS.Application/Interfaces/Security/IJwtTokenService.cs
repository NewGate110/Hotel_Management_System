// Author: S2401265 Ahmed Aslan Ibrahim
namespace HMS.Application.Interfaces.Security;

public interface IJwtTokenService
{
    (string Token, DateTime ExpiresAt) GenerateToken(
        int userId, string email, string role, bool canManageMedia = false);
}
