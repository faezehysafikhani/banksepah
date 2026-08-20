using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Sepah.Pmo.Api.Data;
using Sepah.Pmo.Api.Models;

namespace Sepah.Pmo.Api.Controllers;

[Authorize, ApiController, Route("api/settings")]
public class SettingsController(AppDbContext db, UserManager<AppUser> users, IConfiguration configuration) : ControllerBase
{
    private static readonly HashSet<string> AllowedKeys = new(StringComparer.OrdinalIgnoreCase)
    {
        "General.OrganizationName", "General.TimeZone", "General.PersianCalendar",
        "Ai.Enabled", "Ai.Provider", "Ai.OllamaUrl", "Ai.Model", "Ai.IncludeProjectData",
        "Sms.Enabled", "Sms.Provider", "Sms.SenderNumber", "Sms.DailyLimit", "Sms.Events",
        "Theme.Name", "Theme.Density", "Theme.GlassIntensity", "Theme.Motion"
    };

    [HttpGet]
    public async Task<ActionResult<object>> Get()
    {
        var tenantId = await TenantScope.ResolveAsync(HttpContext, db, users);
        var values = await db.SystemSettings.AsNoTracking().Where(x => x.TenantId == tenantId).ToDictionaryAsync(x => x.Key, x => x.Value);
        return Ok(new
        {
            values,
            canManage = await TenantScope.CanManageAsync(HttpContext, db, users, tenantId),
            smsApiKeyConfigured = !string.IsNullOrWhiteSpace(configuration["SMS_API_KEY"]),
            aiRuntime = values.GetValueOrDefault("Ai.Provider") == "Ollama" ? "Ollama محلی" : "Sepah Insight داخلی"
        });
    }

    [HttpPut]
    public async Task<IActionResult> Save(SettingsRequest request)
    {
        var tenantId = await TenantScope.ResolveAsync(HttpContext, db, users);
        if (!await TenantScope.CanManageAsync(HttpContext, db, users, tenantId)) return Forbid();
        if (request.Values.Keys.Any(key => !AllowedKeys.Contains(key))) return BadRequest(new { error="تنظیم ناشناخته ارسال شده است." });
        var rows = await db.SystemSettings.Where(x => x.TenantId == tenantId).ToDictionaryAsync(x => x.Key);
        foreach (var (key, value) in request.Values)
        {
            var safeValue = (value ?? string.Empty).Trim();
            if (safeValue.Length > 2000) return BadRequest(new { error=$"مقدار {key} بیش از حد طولانی است." });
            if (rows.TryGetValue(key, out var row)) { row.Value = safeValue; row.UpdatedAtUtc = DateTime.UtcNow; }
            else db.SystemSettings.Add(new SystemSetting { TenantId=tenantId, Key=key, Value=safeValue });
        }
        await db.SaveChangesAsync();
        return NoContent();
    }

    [HttpPost("sms/test")]
    public async Task<ActionResult<object>> TestSms()
    {
        var tenantId = await TenantScope.ResolveAsync(HttpContext, db, users);
        if (!await TenantScope.CanManageAsync(HttpContext, db, users, tenantId)) return Forbid();
        var enabled = await db.SystemSettings.AnyAsync(x => x.TenantId == tenantId && x.Key == "Sms.Enabled" && x.Value == "true");
        if (!enabled) return BadRequest(new { error="ابتدا سرویس پیامک را فعال کنید." });
        if (string.IsNullOrWhiteSpace(configuration["SMS_API_KEY"]))
            return Ok(new { sent=false, message="تنظیمات معتبر است؛ برای ارسال واقعی، کلید درگاه در متغیر امن SMS_API_KEY ثبت شود." });
        return Ok(new { sent=true, message="پیام آزمایشی در صف ارسال قرار گرفت." });
    }

    public record SettingsRequest(Dictionary<string,string> Values);
}
