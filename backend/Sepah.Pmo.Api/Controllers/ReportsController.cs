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
    public async Task<ActionResult<object>> Summary() => Ok(new
    {
        projects = await db.Projects.CountAsync(),
        activeProjects = await db.Projects.CountAsync(x => x.Status == "در حال انجام"),
        events = await db.CalendarEvents.CountAsync(),
        openTasks = await db.WorkTasks.CountAsync(x => x.Status != "تکمیل شده"),
        pendingCharterApprovals = await db.CharterApprovals.CountAsync(x => x.Status == "در انتظار"),
        byOwnerUnit = await db.Projects.GroupBy(x => x.OwnerUnit).Select(x => new { label = x.Key, value = x.Count() }).ToListAsync()
    });

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
