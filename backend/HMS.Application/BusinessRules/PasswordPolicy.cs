// Author: S2401265 Ahmed Aslan Ibrahim
namespace HMS.Application.BusinessRules;

/// <summary>
/// Enforces the password complexity rules:
///   - Minimum 8 characters
///   - At least one uppercase letter
///   - At least one lowercase letter
///   - At least one digit
///   - At least one special character (!@#$%^&*()_+-=[]{}|;:,.<>?)
/// </summary>
public static class PasswordPolicy
{
    private const string SpecialChars = "!@#$%^&*()_+-=[]{}|;:,.<>?";

    public static void Validate(string password)
    {
        if (password.Length < 8)
            throw new InvalidOperationException("Password must be at least 8 characters long.");
        if (!password.Any(char.IsUpper))
            throw new InvalidOperationException("Password must contain at least one uppercase letter.");
        if (!password.Any(char.IsLower))
            throw new InvalidOperationException("Password must contain at least one lowercase letter.");
        if (!password.Any(char.IsDigit))
            throw new InvalidOperationException("Password must contain at least one digit.");
        if (!password.Any(c => SpecialChars.Contains(c)))
            throw new InvalidOperationException("Password must contain at least one special character (!@#$%^&* etc.).");
    }
}
