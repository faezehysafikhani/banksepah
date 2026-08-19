using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Sepah.Pmo.Api.Contracts;
using Sepah.Pmo.Api.Data;
using Sepah.Pmo.Api.Models;

namespace Sepah.Pmo.Api.Controllers;

[Authorize, ApiController, Route("api/projects")]
public class ProjectsController(AppDbContext db, UserManager<AppUser> users) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<object>> List()
    {
        var query = db.Projects.AsNoTracking();
        if (!User.IsInRole("Administrator"))
        {
            var userId = int.Parse(users.GetUserId(User)!);
            query = query.Where(project => project.UserAccess.Any(access => access.UserId == userId && access.CanView));
        }

        return Ok(await query.OrderBy(project => project.Id).Select(x => new
        {
            x.Id, x.Code, x.Name, x.Type, x.OwnerUnit, x.ManagerName, x.Status,
            x.StartDate, x.EndDate, x.Budget, x.Description
        }).ToListAsync());
    }

    [HttpGet("{id:int}/roles")]
    public async Task<ActionResult<List<ProjectRoleDto>>> Roles(int id)
    {
        if (!await HasAccessAsync(id, "view")) return Forbid();
        return Ok(await db.ProjectRoles.AsNoTracking().Where(x => x.ProjectId == id).OrderBy(x => x.Id)
            .Select(x => new ProjectRoleDto(x.Id, x.RoleType, x.FullName, x.Position, x.PersonnelNumber, x.Phone, x.Email, x.ServiceLocation)).ToListAsync());
    }

    [HttpPost("{id:int}/roles")]
    public async Task<ActionResult<ProjectRoleDto>> AddRole(int id, ProjectRoleDto request)
    {
        if (!await HasAccessAsync(id, "team")) return Forbid();
        if (!await db.Projects.AnyAsync(x => x.Id == id)) return NotFound();
        var row = new ProjectRole { ProjectId=id, RoleType=request.RoleType, FullName=request.FullName, Position=request.Position, PersonnelNumber=request.PersonnelNumber, Phone=request.Phone, Email=request.Email, ServiceLocation=request.ServiceLocation };
        db.ProjectRoles.Add(row);
        await db.SaveChangesAsync();
        return Ok(new ProjectRoleDto(row.Id, row.RoleType, row.FullName, row.Position, row.PersonnelNumber, row.Phone, row.Email, row.ServiceLocation));
    }

    [HttpDelete("{projectId:int}/roles/{id:int}")]
    public async Task<IActionResult> DeleteRole(int projectId, int id)
    {
        if (!await HasAccessAsync(projectId, "team")) return Forbid();
        var row = await db.ProjectRoles.SingleOrDefaultAsync(x => x.ProjectId == projectId && x.Id == id);
        if (row is null) return NotFound();
        db.Remove(row);
        await db.SaveChangesAsync();
        return NoContent();
    }

    [HttpGet("{id:int}/charter-approvals")]
    public async Task<ActionResult<List<ApprovalDto>>> Approvals(int id)
    {
        if (!await HasAccessAsync(id, "view")) return Forbid();
        return Ok(await db.CharterApprovals.AsNoTracking().Where(x => x.ProjectId == id).OrderBy(x => x.Order)
            .Select(x => new ApprovalDto(x.Id, x.Order, x.RoleTitle, x.ApproverName, x.Department, x.Status, x.DecisionDate, x.Comment)).ToListAsync());
    }

    [HttpPut("{projectId:int}/charter-approvals/{id:int}")]
    public async Task<ActionResult<ApprovalDto>> UpdateApproval(int projectId, int id, ApprovalDto request)
    {
        if (!await HasAccessAsync(projectId, "approve")) return Forbid();
        var row = await db.CharterApprovals.SingleOrDefaultAsync(x => x.ProjectId == projectId && x.Id == id);
        if (row is null) return NotFound();
        row.ApproverName=request.ApproverName; row.Department=request.Department; row.Status=request.Status; row.DecisionDate=request.DecisionDate; row.Comment=request.Comment;
        await db.SaveChangesAsync();
        return Ok(new ApprovalDto(row.Id, row.Order, row.RoleTitle, row.ApproverName, row.Department, row.Status, row.DecisionDate, row.Comment));
    }

    [HttpGet("{id:int}/wbs")]
    public async Task<ActionResult<List<ProjectWbsItemDto>>> Wbs(int id)
    {
        if (!await HasAccessAsync(id, "view")) return Forbid();
        return Ok(await db.ProjectWbsItems.AsNoTracking().Where(x => x.ProjectId == id).OrderBy(x => x.Code)
            .Select(x => new ProjectWbsItemDto(x.Id, x.Code, x.ParentCode, x.Name, x.Duration, x.StartDate, x.EndDate, x.Weight, x.Owner, x.Planned, x.Actual, x.Cost, x.PersonHours, x.Importance, x.Complexity, x.PrerequisiteCode, x.RelationType, x.LagDays, x.CollaboratingUnit, x.ParticipationPercent, x.Deliverable, x.Requirements, x.QualityControl)).ToListAsync());
    }

    [HttpPut("{id:int}/wbs")]
    public async Task<ActionResult<List<ProjectWbsItemDto>>> SaveWbs(int id, List<ProjectWbsItemDto> request)
    {
        if (!await HasAccessAsync(id, "wbs")) return Forbid();
        db.ProjectWbsItems.RemoveRange(db.ProjectWbsItems.Where(x => x.ProjectId == id));
        var rows = request.Select(x => new ProjectWbsItem { ProjectId=id, Code=x.Code, ParentCode=x.ParentCode, Name=x.Name, Duration=x.Duration, StartDate=x.StartDate, EndDate=x.EndDate, Weight=x.Weight, Owner=x.Owner, Planned=x.Planned, Actual=x.Actual, Cost=x.Cost, PersonHours=x.PersonHours, Importance=x.Importance, Complexity=x.Complexity, PrerequisiteCode=x.PrerequisiteCode, RelationType=x.RelationType, LagDays=x.LagDays, CollaboratingUnit=x.CollaboratingUnit, ParticipationPercent=x.ParticipationPercent, Deliverable=x.Deliverable, Requirements=x.Requirements, QualityControl=x.QualityControl }).ToList();
        db.ProjectWbsItems.AddRange(rows);
        await db.SaveChangesAsync();
        return Ok(rows.Select(x => new ProjectWbsItemDto(x.Id, x.Code, x.ParentCode, x.Name, x.Duration, x.StartDate, x.EndDate, x.Weight, x.Owner, x.Planned, x.Actual, x.Cost, x.PersonHours, x.Importance, x.Complexity, x.PrerequisiteCode, x.RelationType, x.LagDays, x.CollaboratingUnit, x.ParticipationPercent, x.Deliverable, x.Requirements, x.QualityControl)));
    }

    [HttpGet("{id:int}/risks")]
    public async Task<ActionResult<List<ProjectRiskDto>>> Risks(int id)
    {
        if (!await HasAccessAsync(id, "view")) return Forbid();
        return Ok(await db.ProjectRisks.AsNoTracking().Where(x => x.ProjectId == id).OrderByDescending(x => x.Probability * x.Severity * x.Impact)
            .Select(x => new ProjectRiskDto(x.Id, x.Title, x.Probability, x.Severity, x.Impact, x.Probability * x.Severity * x.Impact, x.ResponsePlan)).ToListAsync());
    }

    [HttpPut("{id:int}/risks")]
    public async Task<ActionResult<List<ProjectRiskDto>>> SaveRisks(int id, List<ProjectRiskDto> request)
    {
        if (!await HasAccessAsync(id, "edit")) return Forbid();
        db.ProjectRisks.RemoveRange(db.ProjectRisks.Where(x => x.ProjectId == id));
        var rows = request.Select(x => new ProjectRisk { ProjectId=id, Title=x.Title, Probability=x.Probability, Severity=x.Severity, Impact=x.Impact, ResponsePlan=x.ResponsePlan }).ToList();
        db.ProjectRisks.AddRange(rows); await db.SaveChangesAsync();
        return Ok(rows.Select(x => new ProjectRiskDto(x.Id, x.Title, x.Probability, x.Severity, x.Impact, x.Probability * x.Severity * x.Impact, x.ResponsePlan)));
    }

    [HttpGet("{id:int}/stakeholders")]
    public async Task<ActionResult<List<ProjectStakeholderDto>>> Stakeholders(int id)
    {
        if (!await HasAccessAsync(id, "view")) return Forbid();
        return Ok(await db.ProjectStakeholders.AsNoTracking().Where(x => x.ProjectId == id).OrderBy(x => x.Id)
            .Select(x => new ProjectStakeholderDto(x.Id, x.Name, x.RelationType, x.Expectations, x.Notes)).ToListAsync());
    }

    [HttpPut("{id:int}/stakeholders")]
    public async Task<ActionResult<List<ProjectStakeholderDto>>> SaveStakeholders(int id, List<ProjectStakeholderDto> request)
    {
        if (!await HasAccessAsync(id, "edit")) return Forbid();
        db.ProjectStakeholders.RemoveRange(db.ProjectStakeholders.Where(x => x.ProjectId == id));
        var rows = request.Select(x => new ProjectStakeholder { ProjectId=id, Name=x.Name, RelationType=x.RelationType, Expectations=x.Expectations, Notes=x.Notes }).ToList();
        db.ProjectStakeholders.AddRange(rows); await db.SaveChangesAsync();
        return Ok(rows.Select(x => new ProjectStakeholderDto(x.Id, x.Name, x.RelationType, x.Expectations, x.Notes)));
    }

    private async Task<bool> HasAccessAsync(int projectId, string permission)
    {
        if (User.IsInRole("Administrator")) return true;
        var userId = int.Parse(users.GetUserId(User)!);
        var access = await db.ProjectUserAccess.AsNoTracking().SingleOrDefaultAsync(x => x.ProjectId == projectId && x.UserId == userId && x.CanView);
        return access is not null && permission switch
        {
            "view" => true,
            "team" => access.CanManageTeam,
            "wbs" => access.CanManageWbs,
            "approve" => access.CanApprove,
            _ => access.CanEdit
        };
    }
}
