using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Sepah.Pmo.Api.Data;
using Sepah.Pmo.Api.Models;

namespace Sepah.Pmo.Api.Controllers;

[Authorize, ApiController, Route("api/ai")]
public class AiController(AppDbContext db, UserManager<AppUser> users, IHttpClientFactory httpClients) : ControllerBase
{
    [HttpPost("chat")]
    public async Task<ActionResult<object>> Chat(AiChatRequest request, CancellationToken cancellationToken)
    {
        var message = request.Message?.Trim() ?? string.Empty;
        if (message.Length < 2) return BadRequest(new { error = "سؤال خود را کمی کامل‌تر بنویسید." });
        var tenantId = await TenantScope.ResolveAsync(HttpContext, db, users);
        var tenant = await db.Tenants.AsNoTracking().SingleAsync(x => x.Id == tenantId, cancellationToken);
        var settings = await db.SystemSettings.AsNoTracking().Where(x => x.TenantId == tenantId && x.Key.StartsWith("Ai."))
            .ToDictionaryAsync(x => x.Key, x => x.Value, cancellationToken);
        if (settings.GetValueOrDefault("Ai.Enabled", "true") != "true") return BadRequest(new { error="دستیار هوشمند برای این سازمان غیرفعال است." });
        if (settings.GetValueOrDefault("Ai.IncludeProjectData", "true") != "true")
            return Ok(new { answer="دسترسی AI به داده پروژه‌ها در تنظیمات این سازمان غیرفعال است.", provider="Sepah Insight محلی (رایگان)", tenant=tenant.Name, suggestions=Array.Empty<string>() });
        var projectQuery = db.Projects.AsNoTracking().Where(x => x.TenantId == tenantId);
        if (!User.IsInRole("Administrator"))
        {
            var userId = int.Parse(users.GetUserId(User)!);
            projectQuery = projectQuery.Where(x => x.UserAccess.Any(a => a.UserId == userId && a.CanView));
        }
        var projects = await projectQuery.OrderBy(x => x.Id).ToListAsync(cancellationToken);
        var projectIds = projects.Select(x => x.Id).ToList();
        var risks = await db.ProjectRisks.AsNoTracking().Where(x => projectIds.Contains(x.ProjectId))
            .Select(x => new RiskInsight(x.Title, x.Probability, x.Severity, x.Impact, x.ResponsePlan, x.Project!.Name)).ToListAsync(cancellationToken);
        var names = projects.Select(x => x.Name).ToList();
        var tasks = await db.WorkTasks.AsNoTracking().Where(x => names.Contains(x.ProjectName)).ToListAsync(cancellationToken);
        var localAnswer = BuildLocalAnswer(message, tenant.Name, projects, risks, tasks);
        var answer = await TryOllamaAsync(message, localAnswer, settings, cancellationToken) ?? localAnswer;
        var usesOllama = settings.GetValueOrDefault("Ai.Provider") == "Ollama";
        return Ok(new
        {
            answer,
            provider = usesOllama ? "Ollama محلی (رایگان)" : "Sepah Insight محلی (رایگان)",
            tenant = tenant.Name,
            suggestions = new[] { "پروژه‌های پرریسک کدام‌اند؟", "خلاصه وضعیت سبد را بده", "بودجه پروژه‌ها را تحلیل کن", "اقدامات باز را جمع‌بندی کن" }
        });
    }

    private static string BuildLocalAnswer(string question, string tenantName, List<Project> projects, List<RiskInsight> risks, List<WorkTask> tasks)
    {
        var active = projects.Count(x => x.Status == "در حال انجام");
        var planning = projects.Count(x => x.Status == "برنامه‌ریزی");
        var completed = projects.Count(x => x.Status == "تکمیل شده");
        var totalBudget = projects.Sum(x => x.Budget);
        var criticalRisks = risks.Where(x => x.Probability * x.Severity * x.Impact >= 24).OrderByDescending(x => x.Probability * x.Severity * x.Impact).ToList();
        string Number(decimal value) => value.ToString("N0", new System.Globalization.CultureInfo("fa-IR"));

        if (question.Contains("ریسک"))
        {
            var top = criticalRisks.Take(3).Select((x, i) => $"{i + 1}) {x.Title} — {x.ProjectName}").ToArray();
            return $"در سازمان «{tenantName}» {risks.Count} ریسک ثبت شده و {criticalRisks.Count} مورد در محدوده بحرانی است.\n" +
                (top.Length == 0 ? "در حال حاضر ریسک بحرانی ثبت نشده است." : $"مهم‌ترین موارد:\n{string.Join("\n", top)}\nپیشنهاد مدیریتی: مالک پاسخ، موعد کنترل و وضعیت اقدام کاهشی این موارد در جلسه بعد تثبیت شود.");
        }
        if (question.Contains("بودجه") || question.Contains("هزینه"))
        {
            var topUnits = projects.GroupBy(x => x.OwnerUnit).OrderByDescending(x => x.Sum(p => p.Budget)).Take(3)
                .Select(x => $"{x.Key}: {Number(x.Sum(p => p.Budget))} ریال");
            return $"بودجه کل سبد «{tenantName}» برابر {Number(totalBudget)} ریال است. بیشترین تمرکز بودجه:\n{string.Join("\n", topUnits)}\nپیشنهاد: پروژه‌های با بودجه بالا و وضعیت برنامه‌ریزی در اولویت کنترل خط مبنا قرار بگیرند.";
        }
        if (question.Contains("اقدام") || question.Contains("وظیفه"))
        {
            var open = tasks.Count(x => x.Status != "تکمیل شده");
            var assignees = tasks.Where(x => x.Status != "تکمیل شده").GroupBy(x => x.Assignee).OrderByDescending(x => x.Count()).Take(3).Select(x => $"{x.Key}: {x.Count()} مورد");
            return $"از {tasks.Count} اقدام و وظیفه ثبت‌شده، {open} مورد باز است. بیشترین بار کاری فعال:\n{string.Join("\n", assignees)}\nپیشنهاد: اقدامات بدون مسئول یا موعد مشخص قبل از گزارش بعدی تکمیل اطلاعات شوند.";
        }
        if (question.Contains("تاخیر") || question.Contains("تأخیر") || question.Contains("بحران"))
        {
            var attention = projects.Where(x => x.Status is "متوقف شده" or "برنامه‌ریزی").Take(5).Select(x => $"• {x.Name} ({x.Status})");
            return $"{projects.Count(x => x.Status == "متوقف شده")} پروژه متوقف و {planning} پروژه در برنامه‌ریزی است. موارد نیازمند توجه:\n{string.Join("\n", attention)}\nپیشنهاد: خط مبنا، وابستگی‌های WBS و تصمیمات معوق این پروژه‌ها بازبینی شود.";
        }
        return $"خلاصه مدیریتی «{tenantName}»: {projects.Count} پروژه شامل {active} در حال انجام، {planning} در برنامه‌ریزی و {completed} تکمیل‌شده است. بودجه کل {Number(totalBudget)} ریال، اقدامات باز {tasks.Count(x => x.Status != "تکمیل شده")} و ریسک‌های بحرانی {criticalRisks.Count} مورد است.\nاولویت پیشنهادی: رسیدگی به ریسک‌های بحرانی، تثبیت خط مبنای پروژه‌های برنامه‌ریزی و بستن اقدامات معوق.";
    }

    private async Task<string?> TryOllamaAsync(string question, string facts, Dictionary<string,string> settings, CancellationToken cancellationToken)
    {
        if (settings.GetValueOrDefault("Ai.Provider") != "Ollama") return null;
        try
        {
            using var client = httpClients.CreateClient();
            client.BaseAddress = new Uri(settings.GetValueOrDefault("Ai.OllamaUrl", "http://localhost:11434"));
            client.Timeout = TimeSpan.FromSeconds(12);
            var prompt = $"تو دستیار مدیریت پروژه بانک سپه هستی. فقط بر اساس داده‌های زیر و کوتاه و فارسی پاسخ بده.\nداده‌ها:\n{facts}\nسؤال:\n{question}";
            using var response = await client.PostAsJsonAsync("/api/generate", new { model = settings.GetValueOrDefault("Ai.Model", "qwen2.5:3b"), prompt, stream = false }, cancellationToken);
            if (!response.IsSuccessStatusCode) return null;
            using var json = await JsonDocument.ParseAsync(await response.Content.ReadAsStreamAsync(cancellationToken), cancellationToken: cancellationToken);
            return json.RootElement.TryGetProperty("response", out var value) ? value.GetString() : null;
        }
        catch { return null; }
    }

    public record AiChatRequest(string Message);
    private sealed record RiskInsight(string Title, int Probability, int Severity, int Impact, string ResponsePlan, string ProjectName);
}
