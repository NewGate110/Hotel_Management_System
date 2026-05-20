// Author: S2401265 Ahmed Aslan Ibrahim
using Microsoft.AspNetCore.Mvc;

namespace HMS.API.Controllers;

/// <summary>
/// Base controller that exposes JWT caller identity helpers used by ownership guards.
/// RoleClaimType = "role" and NameClaimType = "sub" are configured in Program.cs,
/// so User.IsInRole() and User.FindFirst("sub") resolve correctly without claim remapping.
/// </summary>
public abstract class HmsControllerBase : ControllerBase
{
    /// <summary>True when the authenticated caller holds the Guest role.</summary>
    protected bool IsGuest => User.IsInRole("Guest");

    /// <summary>
    /// The authenticated caller's user ID, parsed from the "sub" JWT claim.
    /// Returns 0 if the claim is absent or unparseable (should never happen for a valid token).
    /// </summary>
    protected int CallerId =>
        int.TryParse(User.FindFirst("sub")?.Value, out var id) ? id : 0;

    /// <summary>
    /// Returns Forbid() when the caller is a Guest and does not own the resource identified by
    /// <paramref name="ownerId"/>. Returns null when access is allowed (caller is staff/admin,
    /// or the Guest owns the resource).
    /// </summary>
    protected ForbidResult? EnforceGuestOwnership(int ownerId) =>
        IsGuest && CallerId != ownerId ? Forbid() : null;
}
