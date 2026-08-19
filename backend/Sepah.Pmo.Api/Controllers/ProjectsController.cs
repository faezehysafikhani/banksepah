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
