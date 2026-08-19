using Microsoft.AspNetCore.Identity;

namespace Sepah.Pmo.Api.Models;

public class AppUser : IdentityUser<int>
{
    public string DisplayName { get; set; } = string.Empty;
    public string JobTitle { get; set; } = string.Empty;
    public string Department { get; set; } = string.Empty;
}

public class Project
{
    public int Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Type { get; set; } = "آبشاری";
    public string OwnerUnit { get; set; } = string.Empty;
    public string ManagerName { get; set; } = string.Empty;
    public string Status { get; set; } = "در حال انجام";
    public string StartDate { get; set; } = string.Empty;
    public string EndDate { get; set; } = string.Empty;
    public decimal Budget { get; set; }
    public string Description { get; set; } = string.Empty;
    public List<ProjectRole> Roles { get; set; } = [];
    public List<CharterApproval> CharterApprovals { get; set; } = [];
    public List<ProjectUserAccess> UserAccess { get; set; } = [];
}

public class ProjectUserAccess
{
    public int Id { get; set; }
    public int ProjectId { get; set; }
    public Project? Project { get; set; }
    public int UserId { get; set; }
    public AppUser? User { get; set; }
    public bool CanView { get; set; } = true;
    public bool CanEdit { get; set; }
    public bool CanManageTeam { get; set; }
    public bool CanManageWbs { get; set; }
    public bool CanApprove { get; set; }
}

public class ProjectRole
{
    public int Id { get; set; }
    public int ProjectId { get; set; }
    public Project? Project { get; set; }
    public string RoleType { get; set; } = "عضو تیم";
    public string FullName { get; set; } = string.Empty;
    public string Position { get; set; } = string.Empty;
    public string PersonnelNumber { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string ServiceLocation { get; set; } = string.Empty;
}

public class CharterApproval
{
    public int Id { get; set; }
    public int ProjectId { get; set; }
    public Project? Project { get; set; }
    public int Order { get; set; }
    public string RoleTitle { get; set; } = string.Empty;
    public string ApproverName { get; set; } = string.Empty;
    public string Department { get; set; } = string.Empty;
    public string Status { get; set; } = "در انتظار";
    public string? DecisionDate { get; set; }
    public string? Comment { get; set; }
}

public class WorkTask
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string ProjectName { get; set; } = string.Empty;
    public string Assignee { get; set; } = string.Empty;
    public string Status { get; set; } = "باز";
}

public class CalendarEvent
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string EventType { get; set; } = "جلسه";
    public string Organizer { get; set; } = string.Empty;
    public int PersianYear { get; set; }
    public int PersianMonth { get; set; }
    public int PersianDay { get; set; }
    public string StartTime { get; set; } = "09:00";
    public string EndTime { get; set; } = "10:30";
    public string Location { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Minutes { get; set; } = string.Empty;
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
    public List<EventParticipant> Participants { get; set; } = [];
    public List<EventAgenda> AgendaItems { get; set; } = [];
    public List<EventAction> Actions { get; set; } = [];
    public List<EventReminder> Reminders { get; set; } = [];
    public List<EventTaskLink> TaskLinks { get; set; } = [];
}

public class EventParticipant { public int Id { get; set; } public int CalendarEventId { get; set; } public CalendarEvent? CalendarEvent { get; set; } public string Name { get; set; } = string.Empty; public string Role { get; set; } = "الزامی"; }
public class EventAgenda { public int Id { get; set; } public int CalendarEventId { get; set; } public CalendarEvent? CalendarEvent { get; set; } public int Order { get; set; } public string Title { get; set; } = string.Empty; public int DurationMinutes { get; set; } = 20; }
public class EventAction { public int Id { get; set; } public int CalendarEventId { get; set; } public CalendarEvent? CalendarEvent { get; set; } public string Title { get; set; } = string.Empty; public string Assignee { get; set; } = string.Empty; public string DueDate { get; set; } = string.Empty; public string Status { get; set; } = "برنامه‌ریزی"; }
public class EventReminder { public int Id { get; set; } public int CalendarEventId { get; set; } public CalendarEvent? CalendarEvent { get; set; } public string Offset { get; set; } = string.Empty; public string Channel { get; set; } = "اعلان سامانه"; public bool Enabled { get; set; } }
public class EventTaskLink { public int Id { get; set; } public int CalendarEventId { get; set; } public CalendarEvent? CalendarEvent { get; set; } public int WorkTaskId { get; set; } public WorkTask? WorkTask { get; set; } }
