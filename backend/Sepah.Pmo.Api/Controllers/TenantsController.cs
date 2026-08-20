using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Sepah.Pmo.Api.Data;
using Sepah.Pmo.Api.Models;

namespace Sepah.Pmo.Api.Controllers;

[Authorize, ApiController, Route("api/tenants")]
public class TenantsController(AppDbContext db, UserManager<AppUser> users) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<object>> List()
    {
        var userId = int.Parse(users.GetUserId(User)!);
        var currentId = await TenantScope.ResolveAsync(HttpContext, db, users);
        var query = db.Tenants.AsNoTracking().Where(x => x.IsActive);
        if (!User.IsInRole("Administrator"))
            query = query.Where(x => x.Memberships.Any(m => m.UserId == userId));

        return Ok(await query.OrderBy(x => x.Id).Select(x => new
        {
            x.Id, x.Code, x.Name, x.IsActive,
            role = x.Memberships.Where(m => m.UserId == userId).Select(m => m.Role).FirstOrDefault() ?? "مدیر سیستم",
            projectCount = x.Projects.Count,
            memberCount = x.Memberships.Count,
            isCurrent = x.Id == currentId
        }).ToListAsync());
    }

    [HttpGet("current")]
    public async Task<ActionResult<object>> Current()
    {
        var tenantId = await TenantScope.ResolveAsync(HttpContext, db, users);
        var tenant = await db.Tenants.AsNoTracking().SingleAsync(x => x.Id == tenantId);
        var canManage = await TenantScope.CanManageAsync(HttpContext, db, users, tenantId);
        var members = await db.TenantMemberships.AsNoTracking().Where(x => x.TenantId == tenantId)
            .OrderBy(x => x.Id).Select(x => new
            {
                x.UserId, x.Role, x.User!.DisplayName, username = x.User.UserName,
                x.User.JobTitle, x.User.Department
            }).ToListAsync();
        var projects = await db.Projects.AsNoTracking().Where(x => x.TenantId == tenantId).OrderBy(x => x.Id)
            .Select(x => new { x.Id, x.Code, x.Name, x.Status, x.OwnerUnit, accessCount = x.UserAccess.Count(a => a.CanView) }).ToListAsync();

        return Ok(new { tenant.Id, tenant.Code, tenant.Name, canManage, members, projects });
    }

    [HttpPost("select")]
    public async Task<ActionResult<object>> Select(SelectTenantRequest request)
    {
        var userId = int.Parse(users.GetUserId(User)!);
        var allowed = User.IsInRole("Administrator")
            ? await db.Tenants.AnyAsync(x => x.Id == request.TenantId && x.IsActive)
            : await db.TenantMemberships.AnyAsync(x => x.TenantId == request.TenantId && x.UserId == userId && x.Tenant!.IsActive);
        if (!allowed) return Forbid();
        Response.Cookies.Append(TenantScope.CookieName, request.TenantId.ToString(), new CookieOptions
        {
            HttpOnly = true, SameSite = SameSiteMode.Lax, Secure = Request.IsHttps,
            IsEssential = true, Expires = DateTimeOffset.UtcNow.AddDays(30)
        });
        return Ok(new { tenantId = request.TenantId });
    }

    [Authorize(Roles = "Administrator"), HttpPost]
    public async Task<ActionResult<object>> Create(CreateTenantRequest request)
    {
        var code = request.Code.Trim().ToUpperInvariant();
        var name = request.Name.Trim();
        if (code.Length < 2 || name.Length < 2) return BadRequest(new { error = "نام و کد سازمان الزامی است." });
        if (await db.Tenants.AnyAsync(x => x.Code == code)) return Conflict(new { error = "این کد سازمان قبلاً ثبت شده است." });
        var tenant = new Tenant { Code = code, Name = name };
        db.Tenants.Add(tenant);
        await db.SaveChangesAsync();
        db.TenantMemberships.Add(new TenantMembership { TenantId = tenant.Id, UserId = int.Parse(users.GetUserId(User)!), Role = "مالک سامانه" });
        await db.SaveChangesAsync();
        return Ok(new { tenant.Id, tenant.Code, tenant.Name });
    }

    [HttpPut("{tenantId:int}/members/{userId:int}")]
    public async Task<IActionResult> UpdateMember(int tenantId, int userId, UpdateTenantMemberRequest request)
    {
        if (tenantId != await TenantScope.ResolveAsync(HttpContext, db, users) || !await TenantScope.CanManageAsync(HttpContext, db, users, tenantId)) return Forbid();
        if (!await users.Users.AnyAsync(x => x.Id == userId)) return NotFound();
        var allowedRoles = new[] { "مالک سامانه", "مدیر سازمان", "مدیر پروژه", "کاربر", "مشاهده‌گر" };
        if (!allowedRoles.Contains(request.Role)) return BadRequest(new { error = "نقش سازمانی معتبر نیست." });
        var membership = await db.TenantMemberships.SingleOrDefaultAsync(x => x.TenantId == tenantId && x.UserId == userId);
        if (membership is null) db.TenantMemberships.Add(new TenantMembership { TenantId = tenantId, UserId = userId, Role = request.Role });
        else membership.Role = request.Role;
        await db.SaveChangesAsync();
        return NoContent();
    }

    public record SelectTenantRequest(int TenantId);
    public record CreateTenantRequest(string Code, string Name);
    public record UpdateTenantMemberRequest(string Role);
}
