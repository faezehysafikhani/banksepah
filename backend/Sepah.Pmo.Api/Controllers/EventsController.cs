using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Sepah.Pmo.Api.Contracts;
using Sepah.Pmo.Api.Data;
using Sepah.Pmo.Api.Models;

namespace Sepah.Pmo.Api.Controllers;

[Authorize, ApiController, Route("api/events")]
public class EventsController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<List<EventResponse>>> List([FromQuery] int? year, [FromQuery] int? month)
    {
        var query = FullQuery().AsNoTracking();
        if (year.HasValue) query = query.Where(x => x.PersianYear == year);
        if (month.HasValue) query = query.Where(x => x.PersianMonth == month);
        return Ok((await query.OrderBy(x => x.PersianDay).ThenBy(x => x.StartTime).ToListAsync()).Select(Map).ToList());
    }

    [HttpGet("references")]
    public async Task<ActionResult<object>> References()
    {
        var users = await db.Users.AsNoTracking().Select(x => new { x.Id, name = x.DisplayName, jobTitle = x.JobTitle }).ToListAsync();
        var members = await db.ProjectRoles.AsNoTracking().Where(x => x.FullName != "").Select(x => new { x.Id, name = x.FullName, jobTitle = x.Position }).ToListAsync();
        return Ok(new
        {
            people = users.Concat(members).GroupBy(x => x.name).Select(x => x.First()).ToList(),
            tasks = await db.WorkTasks.AsNoTracking().Select(x => new { x.Id, x.Title, x.ProjectName, x.Assignee, x.Status }).ToListAsync()
        });
    }

    [HttpPost]
    public async Task<ActionResult<EventResponse>> Create(EventRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Title)) return BadRequest(new { error = "عنوان رویداد الزامی است." });
        var entity = Build(request);
        db.CalendarEvents.Add(entity);
        await db.SaveChangesAsync();
        var saved = await FullQuery().AsNoTracking().SingleAsync(x => x.Id == entity.Id);
        return CreatedAtAction(nameof(Get), new { id = entity.Id }, Map(saved));
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<EventResponse>> Get(int id)
    {
        var entity = await FullQuery().AsNoTracking().SingleOrDefaultAsync(x => x.Id == id);
        return entity is null ? NotFound() : Ok(Map(entity));
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<EventResponse>> Update(int id, EventRequest request)
    {
        var entity = await FullQuery().SingleOrDefaultAsync(x => x.Id == id);
        if (entity is null) return NotFound();
        db.EventParticipants.RemoveRange(entity.Participants);
        db.EventAgendaItems.RemoveRange(entity.AgendaItems);
        db.EventActions.RemoveRange(entity.Actions);
        db.EventReminders.RemoveRange(entity.Reminders);
        db.EventTaskLinks.RemoveRange(entity.TaskLinks);
        Apply(entity, request);
        await db.SaveChangesAsync();
        var saved = await FullQuery().AsNoTracking().SingleAsync(x => x.Id == id);
        return Ok(Map(saved));
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var entity = await db.CalendarEvents.FindAsync(id);
        if (entity is null) return NotFound();
        db.CalendarEvents.Remove(entity);
        await db.SaveChangesAsync();
        return NoContent();
    }

    private IQueryable<CalendarEvent> FullQuery() => db.CalendarEvents
        .Include(x => x.Participants).Include(x => x.AgendaItems).Include(x => x.Actions)
        .Include(x => x.Reminders).Include(x => x.TaskLinks).ThenInclude(x => x.WorkTask);

    private static CalendarEvent Build(EventRequest request) { var entity = new CalendarEvent(); Apply(entity, request); return entity; }
    private static void Apply(CalendarEvent entity, EventRequest r)
    {
        entity.Title=r.Title.Trim(); entity.EventType=r.EventType; entity.Organizer=r.Organizer; entity.PersianYear=r.PersianYear; entity.PersianMonth=r.PersianMonth; entity.PersianDay=r.PersianDay;
        entity.StartTime=r.StartTime; entity.EndTime=r.EndTime; entity.Location=r.Location; entity.Description=r.Description; entity.Minutes=r.Minutes;
        entity.Participants = r.Participants.Select(x => new EventParticipant { Name=x.Name, Role=x.Role }).ToList();
        entity.AgendaItems = r.AgendaItems.Select((x, i) => new EventAgenda { Order=x.Order > 0 ? x.Order : i + 1, Title=x.Title, DurationMinutes=x.DurationMinutes }).ToList();
        entity.Actions = r.Actions.Where(x => !string.IsNullOrWhiteSpace(x.Title)).Select(x => new EventAction { Title=x.Title, Assignee=x.Assignee, DueDate=x.DueDate, Status=x.Status }).ToList();
        entity.Reminders = r.Reminders.Select(x => new EventReminder { Offset=x.Offset, Channel=x.Channel, Enabled=x.Enabled }).ToList();
        entity.TaskLinks = r.TaskIds.Distinct().Select(x => new EventTaskLink { WorkTaskId=x }).ToList();
    }
    private static EventResponse Map(CalendarEvent x) => new(x.Id,x.Title,x.EventType,x.Organizer,x.PersianYear,x.PersianMonth,x.PersianDay,x.StartTime,x.EndTime,x.Location,x.Description,x.Minutes,
        x.Participants.Select(p=>new ParticipantDto(p.Id,p.Name,p.Role)).ToList(), x.AgendaItems.OrderBy(a=>a.Order).Select(a=>new AgendaDto(a.Id,a.Order,a.Title,a.DurationMinutes)).ToList(),
        x.Actions.Select(a=>new ActionDto(a.Id,a.Title,a.Assignee,a.DueDate,a.Status)).ToList(), x.Reminders.Select(r=>new ReminderDto(r.Id,r.Offset,r.Channel,r.Enabled)).ToList(),
        x.TaskLinks.Where(t=>t.WorkTask is not null).Select(t=>new TaskLinkDto(t.Id,t.WorkTaskId,t.WorkTask!.Title,t.WorkTask.ProjectName)).ToList());
}
