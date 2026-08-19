using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Sepah.Pmo.Api.Contracts;
using Sepah.Pmo.Api.Data;
using Sepah.Pmo.Api.Models;

namespace Sepah.Pmo.Api.Controllers;

[Authorize(Roles = "Administrator"), ApiController, Route("api/users")]
public class UsersController(AppDbContext db, UserManager<AppUser> users) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<object>> List()
    {
        var result = new List<object>();
        foreach (var user in await users.Users.AsNoTracking().OrderBy(x => x.Id).ToListAsync())
        {
            var roles = await users.GetRolesAsync(user);
            result.Add(new { user.Id, Username=user.UserName ?? "", user.DisplayName, user.Email, user.JobTitle, user.Department, Role=roles.FirstOrDefault() ?? "User" });
        }
        return Ok(result);
    }

    [HttpGet("{userId:int}/project-access")]
    public async Task<ActionResult<List<ProjectAccessDto>>> ProjectAccess(int userId)
    {
        if (!await users.Users.AnyAsync(x => x.Id == userId)) return NotFound();
        return Ok(await db.Projects.AsNoTracking().OrderBy(x => x.Id).Select(project => new ProjectAccessDto(
            project.Id, project.Code, project.Name,
            project.UserAccess.Where(access => access.UserId == userId).Select(access => access.CanView).FirstOrDefault(),
            project.UserAccess.Where(access => access.UserId == userId).Select(access => access.CanEdit).FirstOrDefault(),
            project.UserAccess.Where(access => access.UserId == userId).Select(access => access.CanManageTeam).FirstOrDefault(),
            project.UserAccess.Where(access => access.UserId == userId).Select(access => access.CanManageWbs).FirstOrDefault(),
            project.UserAccess.Where(access => access.UserId == userId).Select(access => access.CanApprove).FirstOrDefault()
        )).ToListAsync());
    }

    [HttpPut("{userId:int}/project-access")]
    public async Task<IActionResult> UpdateProjectAccess(int userId, List<ProjectAccessDto> request)
    {
        if (!await users.Users.AnyAsync(x => x.Id == userId)) return NotFound();
        var validProjectIds = (await db.Projects.Select(x => x.Id).ToListAsync()).ToHashSet();
        if (request.Any(x => !validProjectIds.Contains(x.ProjectId))) return BadRequest(new { error="یک یا چند پروژه معتبر نیست." });

        var current = await db.ProjectUserAccess.Where(x => x.UserId == userId).ToListAsync();
        db.ProjectUserAccess.RemoveRange(current);
        db.ProjectUserAccess.AddRange(request.Where(x => x.CanView).Select(x => new ProjectUserAccess
        {
            UserId=userId, ProjectId=x.ProjectId, CanView=true, CanEdit=x.CanEdit,
            CanManageTeam=x.CanManageTeam, CanManageWbs=x.CanManageWbs, CanApprove=x.CanApprove
        }));
        await db.SaveChangesAsync();
        return NoContent();
    }
}
