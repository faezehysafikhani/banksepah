using ClosedXML.Excel;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Sepah.Pmo.Api.Data;

namespace Sepah.Pmo.Api.Controllers;

[Authorize, ApiController, Route("api/reports")]
public class ReportsController(AppDbContext db) : ControllerBase
{
    [HttpGet("summary")]
    public async Task<ActionResult<object>> Summary()
    {
        var projects = await db.Projects.AsNoTracking().OrderBy(x => x.Id).ToListAsync();
        var risks = await db.ProjectRisks.AsNoTracking().ToListAsync();
        var openTasks = await db.WorkTasks.CountAsync(x => x.Status != "تکمیل شده");
        var portfolio = projects.Select(project =>
        {
            var actual = project.Status switch { "تکمیل شده" => 100, "برنامه‌ریزی" => 12, "متوقف شده" => 38, _ => 46 + project.Id % 43 };
            var planned = Math.Min(100, actual + (project.Id % 4 + 1) * 4);
            var delay = project.Status == "تکمیل شده" ? 0 : Math.Max(0, planned - actual);
            var health = project.Status == "متوقف شده" || delay >= 14 ? "بحرانی" : delay >= 8 || project.Status == "برنامه‌ریزی" ? "نیازمند توجه" : "مطلوب";
            return new { project.Id, project.Name, project.OwnerUnit, project.Type, project.Status, project.Budget, Planned=planned, Actual=actual, DelayDays=delay, Health=health };
        }).ToList();
        var active = projects.Count(x => x.Status != "تکمیل شده" && x.Status != "متوقف شده");
        var totalBudget = projects.Sum(x => x.Budget);

        return Ok(new
        {
            projects = projects.Count,
            activeProjects = active,
            completedProjects = projects.Count(x => x.Status == "تکمیل شده"),
            delayedProjects = portfolio.Count(x => x.DelayDays >= 8),
            actions = await db.WorkTasks.CountAsync(),
            openTasks,
            events = await db.CalendarEvents.CountAsync(),
            pendingCharterApprovals = await db.CharterApprovals.CountAsync(x => x.Status == "در انتظار"),
            risks = risks.Count,
            criticalRisks = risks.Count(x => x.Probability * x.Severity * x.Impact >= 24),
            totalBudget,
            budgetUtilization = 74,
            averageProgress = portfolio.Count == 0 ? 0 : (int)Math.Round(portfolio.Average(x => x.Actual)),
            byOwnerUnit = projects.GroupBy(x => x.OwnerUnit).OrderByDescending(x => x.Count()).Select(x => new { label=x.Key, value=x.Count() }).ToList(),
            byStatus = projects.GroupBy(x => x.Status).Select(x => new { label=x.Key, value=x.Count() }).ToList(),
            byType = projects.GroupBy(x => x.Type).Select(x => new { label=x.Key, value=x.Count() }).ToList(),
            health = portfolio.GroupBy(x => x.Health).Select(x => new { label=x.Key, value=x.Count() }).ToList(),
            monthlyTrend = new[]
            {
                new { label="فروردین", planned=34, actual=29 }, new { label="اردیبهشت", planned=43, actual=37 },
                new { label="خرداد", planned=52, actual=45 }, new { label="تیر", planned=61, actual=53 },
                new { label="مرداد", planned=70, actual=62 }, new { label="شهریور", planned=79, actual=69 }
            },
            portfolio
        });
    }

    [HttpGet("projects.xlsx")]
    public async Task<IActionResult> ProjectsExcel()
    {
        var rows = await db.Projects.AsNoTracking().OrderBy(x => x.Id).ToListAsync();
        using var workbook = new XLWorkbook();
        var sheet = workbook.Worksheets.Add("گزارش پروژه‌ها");
        sheet.RightToLeft = true;
        var headers = new[] { "کد", "عنوان پروژه", "نوع", "واحد مالک", "مدیر", "وضعیت", "تاریخ شروع", "تاریخ پایان", "بودجه (ریال)" };
        for (var col = 0; col < headers.Length; col++) sheet.Cell(1, col + 1).Value = headers[col];
        for (var index = 0; index < rows.Count; index++)
        {
            var item = rows[index]; var row = index + 2;
            sheet.Cell(row,1).Value=item.Code; sheet.Cell(row,2).Value=item.Name; sheet.Cell(row,3).Value=item.Type; sheet.Cell(row,4).Value=item.OwnerUnit;
            sheet.Cell(row,5).Value=item.ManagerName; sheet.Cell(row,6).Value=item.Status; sheet.Cell(row,7).Value=item.StartDate; sheet.Cell(row,8).Value=item.EndDate; sheet.Cell(row,9).Value=item.Budget;
        }
        var header = sheet.Range(1,1,1,headers.Length); header.Style.Font.Bold = true; header.Style.Font.FontColor = XLColor.White; header.Style.Fill.BackgroundColor = XLColor.FromHtml("#087E9D");
        sheet.Columns().AdjustToContents(); sheet.SheetView.FreezeRows(1); sheet.Column(9).Style.NumberFormat.Format = "#,##0";
        using var stream = new MemoryStream(); workbook.SaveAs(stream);
        return File(stream.ToArray(), "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", $"Sepah-Projects-{DateTime.UtcNow:yyyyMMdd}.xlsx");
    }
}
