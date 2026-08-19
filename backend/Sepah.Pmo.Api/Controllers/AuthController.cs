using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Sepah.Pmo.Api.Contracts;
using Sepah.Pmo.Api.Models;

namespace Sepah.Pmo.Api.Controllers;

[ApiController, Route("api/auth")]
public class AuthController(UserManager<AppUser> users, SignInManager<AppUser> signIn) : ControllerBase
{
    [AllowAnonymous, HttpPost("login")]
    public async Task<ActionResult<object>> Login(LoginRequest request)
    {
        var user = await users.FindByNameAsync(request.Username.Trim());
        if (user is null || !(await signIn.CheckPasswordSignInAsync(user, request.Password, true)).Succeeded)
            return Unauthorized(new { error = "نام کاربری یا رمز عبور نادرست است." });
        await signIn.SignInAsync(user, true);
        return Ok(new { user = await ToResponse(user) });
    }

    [Authorize, HttpGet("me")]
    public async Task<ActionResult<object>> Me()
    {
        var user = await users.GetUserAsync(User);
        return user is null ? Unauthorized() : Ok(new { user = await ToResponse(user) });
    }

    [Authorize, HttpPost("logout")]
    public async Task<IActionResult> Logout() { await signIn.SignOutAsync(); return NoContent(); }

    private async Task<UserResponse> ToResponse(AppUser user)
    {
        var roles = await users.GetRolesAsync(user);
        return new(user.Id, user.UserName ?? "", user.DisplayName, roles.FirstOrDefault() ?? "User", user.JobTitle, user.Department);
    }
}
