// Author: S2401265 Ahmed Aslan Ibrahim
namespace HMS.Domain.Entities;

public class StaffUser : User
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string EmployeeId { get; set; } = string.Empty;
    public string Department { get; set; } = string.Empty;
    public bool CanManageMedia { get; set; } = false;
}
