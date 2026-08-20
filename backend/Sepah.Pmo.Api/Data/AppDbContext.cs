using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Sepah.Pmo.Api.Models;

namespace Sepah.Pmo.Api.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : IdentityDbContext<AppUser, IdentityRole<int>, int>(options)
{
    public DbSet<Tenant> Tenants => Set<Tenant>();
    public DbSet<TenantMembership> TenantMemberships => Set<TenantMembership>();
    public DbSet<Project> Projects => Set<Project>();
    public DbSet<ProjectRole> ProjectRoles => Set<ProjectRole>();
    public DbSet<ProjectUserAccess> ProjectUserAccess => Set<ProjectUserAccess>();
    public DbSet<CharterApproval> CharterApprovals => Set<CharterApproval>();
    public DbSet<ProjectWbsItem> ProjectWbsItems => Set<ProjectWbsItem>();
    public DbSet<ProjectRisk> ProjectRisks => Set<ProjectRisk>();
    public DbSet<ProjectStakeholder> ProjectStakeholders => Set<ProjectStakeholder>();
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
        builder.Entity<Project>().HasIndex(x => new { x.TenantId, x.Code }).IsUnique();
        builder.Entity<Project>().HasOne(x => x.Tenant).WithMany(x => x.Projects).HasForeignKey(x => x.TenantId).OnDelete(DeleteBehavior.Restrict);
        builder.Entity<Tenant>().HasIndex(x => x.Code).IsUnique();
        builder.Entity<TenantMembership>().HasIndex(x => new { x.TenantId, x.UserId }).IsUnique();
        builder.Entity<TenantMembership>().HasOne(x => x.Tenant).WithMany(x => x.Memberships).HasForeignKey(x => x.TenantId).OnDelete(DeleteBehavior.Cascade);
        builder.Entity<TenantMembership>().HasOne(x => x.User).WithMany().HasForeignKey(x => x.UserId).OnDelete(DeleteBehavior.Cascade);
        builder.Entity<Project>().Property(x => x.Budget).HasPrecision(18, 0);
        builder.Entity<ProjectWbsItem>().Property(x => x.Weight).HasPrecision(5, 2);
        builder.Entity<ProjectWbsItem>().Property(x => x.Cost).HasPrecision(18, 0);
        builder.Entity<ProjectWbsItem>().Property(x => x.ParticipationPercent).HasPrecision(5, 2);
        builder.Entity<ProjectUserAccess>().HasIndex(x => new { x.ProjectId, x.UserId }).IsUnique();
        builder.Entity<ProjectUserAccess>().HasOne(x => x.User).WithMany().HasForeignKey(x => x.UserId).OnDelete(DeleteBehavior.Cascade);
        builder.Entity<EventTaskLink>().HasIndex(x => new { x.CalendarEventId, x.WorkTaskId }).IsUnique();
        builder.Entity<EventTaskLink>().HasOne(x => x.WorkTask).WithMany().HasForeignKey(x => x.WorkTaskId).OnDelete(DeleteBehavior.Restrict);
    }
}
