using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Sepah.Pmo.Api.Models;

namespace Sepah.Pmo.Api.Data;

public static class TenantScope
{
    public const string CookieName = "sepah.pmo.tenant";

    public static async Task<int> ResolveAsync(HttpContext context, AppDbContext db, UserManager<AppUser> users)
    {
        var userIdValue = users.GetUserId(context.User);
        if (!int.TryParse(userIdValue, out var userId)) throw new UnauthorizedAccessException();
        var requested = int.TryParse(context.Request.Cookies[CookieName], out var cookieTenantId) ? cookieTenantId : 0;
        if (context.User.IsInRole("Administrator"))
        {
            if (requested > 0 && await db.Tenants.AnyAsync(x => x.Id == requested && x.IsActive)) return requested;
            return await db.Tenants.Where(x => x.IsActive).OrderBy(x => x.Id).Select(x => x.Id).FirstAsync();
        }
        var memberships = db.TenantMemberships.Where(x => x.UserId == userId && x.Tenant!.IsActive);
        if (requested > 0 && await memberships.AnyAsync(x => x.TenantId == requested)) return requested;
        return await memberships.OrderBy(x => x.TenantId).Select(x => x.TenantId).FirstAsync();
    }

    public static async Task<bool> CanManageAsync(HttpContext context, AppDbContext db, UserManager<AppUser> users, int tenantId)
    {
        if (context.User.IsInRole("Administrator")) return true;
        var userId = int.Parse(users.GetUserId(context.User)!);
        return await db.TenantMemberships.AnyAsync(x => x.TenantId == tenantId && x.UserId == userId && (x.Role == "مالک سامانه" || x.Role == "مدیر سازمان"));
    }
}
