namespace Sepah.Pmo.Api.Contracts;

public record LoginRequest(string Username, string Password);
public record UserResponse(int Id, string Username, string DisplayName, string Role, string JobTitle, string Department);
public record ParticipantDto(int Id, string Name, string Role);
public record AgendaDto(int Id, int Order, string Title, int DurationMinutes);
public record ActionDto(int Id, string Title, string Assignee, string DueDate, string Status);
public record ReminderDto(int Id, string Offset, string Channel, bool Enabled);
public record TaskLinkDto(int Id, int WorkTaskId, string Title, string ProjectName);
public record EventRequest(string Title, string EventType, string Organizer, int PersianYear, int PersianMonth, int PersianDay, string StartTime, string EndTime, string Location, string Description, string Minutes, List<ParticipantDto> Participants, List<AgendaDto> AgendaItems, List<ActionDto> Actions, List<ReminderDto> Reminders, List<int> TaskIds);
public record EventResponse(int Id, string Title, string EventType, string Organizer, int PersianYear, int PersianMonth, int PersianDay, string StartTime, string EndTime, string Location, string Description, string Minutes, List<ParticipantDto> Participants, List<AgendaDto> AgendaItems, List<ActionDto> Actions, List<ReminderDto> Reminders, List<TaskLinkDto> TaskLinks);
public record ProjectRoleDto(int Id, string RoleType, string FullName, string Position, string PersonnelNumber, string Phone, string Email, string ServiceLocation);
public record ApprovalDto(int Id, int Order, string RoleTitle, string ApproverName, string Department, string Status, string? DecisionDate, string? Comment);
