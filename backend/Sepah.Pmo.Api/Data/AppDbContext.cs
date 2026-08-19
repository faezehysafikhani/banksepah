using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Sepah.Pmo.Api.Models;

namespace Sepah.Pmo.Api.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : IdentityDbContext<AppUser, IdentityRole<int>, int>(options)
{
    public DbSet<Project> Projects => Set<Project>();
    public DbSet<ProjectRole> ProjectRoles => Set<ProjectRole>();
    public DbSet<CharterApproval> CharterApprovals => Set<CharterApproval>();
    public DbSet<WorkTask> WorkTasks => Set<WorkTask>();
    public DbSet<CalendarEvent> CalendarEvents => Set<CalendarEvent>();
    public DbSet<EventParticipant> EventParticipants => Set<EventParticipant>();
    public DbSet<EventAgenda> EventAgendaItems => Set<EventAgenda>();
    public DbSet<EventAction> EventActions => Set<EventAction>();
    public DbSet<EventReminder> EventReminders => Set<EventReminder>();
    public DbSet<EventTaskLink> EventTaskLinks => Set<EventTaskLink>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);
        builder.Entity<Project>().HasIndex(x => x.Code).IsUnique();
        builder.Entity<Project>().Property(x => x.Budget).HasPrecision(18, 0);
        builder.Entity<EventTaskLink>().HasIndex(x => new { x.CalendarEventId, x.WorkTaskId }).IsUnique();
        builder.Entity<EventTaskLink>().HasOne(x => x.WorkTask).WithMany().HasForeignKey(x => x.WorkTaskId).OnDelete(DeleteBehavior.Restrict);
    }
}
