// Author: S2401265 Ahmed Aslan Ibrahim
using HMS.Application.Interfaces.Security;
using BcryptHelper = BCrypt.Net.BCrypt;

namespace HMS.Infrastructure.Security;

public class BcryptPasswordHasher : IPasswordHasher
{
    public string Hash(string password) =>
        BcryptHelper.HashPassword(password, workFactor: 12);

    public bool Verify(string password, string hash) =>
        BcryptHelper.Verify(password, hash);
}
