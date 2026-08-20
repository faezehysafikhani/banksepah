using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Sepah.Pmo.Api.Data;
using Sepah.Pmo.Api.Models;

namespace Sepah.Pmo.Api.Controllers;

[Authorize, ApiController, Route("api/notifications")]
public class NotificationsController(AppDbContext db, UserManager<AppUser> users) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<object>> List([FromQuery] int take = 30)
    {
        var tenantId = await TenantScope.ResolveAsync(HttpContext, db, users);
        var userId = int.Parse(users.GetUserId(User)!);
        take = Math.Clamp(take, 1, 100);
        var query = db.AppNotifications.AsNoTracking().Where(x => x.TenantId == tenantId && x.UserId == userId);
        return Ok(new
        {
            unread = await query.CountAsync(x => !x.IsRead),
            items = await query.OrderByDescending(x => x.CreatedAtUtc).Take(take).Select(x => new
            {
                x.Id, x.Title, x.Message, x.Category, x.Priority, x.IsRead, x.CreatedAtUtc
            }).ToListAsync()
        });
    }

    [HttpPut("{id:int}/read")]
    public async Task<IActionResult> Read(int id)
    {
        var tenantId = await TenantScope.ResolveAsync(HttpContext, db, users);
        var userId = int.Parse(users.GetUserId(User)!);
        var item = await db.AppNotifications.SingleOrDefaultAsync(x => x.Id == id && x.TenantId == tenantId && x.UserId == userId);
        if (item is null) return NotFound();
        item.IsRead = true;
        await db.SaveChangesAsync();
        return NoContent();
    }

    [HttpPut("read-all")]
    public async Task<IActionResult> ReadAll()
    {
        var tenantId = await TenantScope.ResolveAsync(HttpContext, db, users);
        var userId = int.Parse(users.GetUserId(User)!);
        await db.AppNotifications.Where(x => x.TenantId == tenantId && x.UserId == userId && !x.IsRead)
            .ExecuteUpdateAsync(update => update.SetProperty(x => x.IsRead, true));
        return NoContent();
    }
}
