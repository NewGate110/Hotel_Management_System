// Author: S2401265 Ahmed Aslan Ibrahim
namespace HMS.Application.Interfaces.Security;

public interface IPasswordHasher
{
    string Hash(string password);
    bool Verify(string password, string hash);
}
