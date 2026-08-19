using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Sepah.Pmo.Api.Models;

namespace Sepah.Pmo.Api.Data;

public static class SeedData
{
    public static async Task InitializeAsync(IServiceProvider services)
    {
        using var scope = services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        await db.Database.EnsureCreatedAsync();
        await EnsureProjectAccessSchemaAsync(db);
        var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole<int>>>();
        foreach (var role in new[] { "Administrator", "ProjectManager", "User" })
            if (!await roleManager.RoleExistsAsync(role)) await roleManager.CreateAsync(new IdentityRole<int>(role));
        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<AppUser>>();
        var admin = await userManager.FindByNameAsync("admin");
        if (admin is null)
        {
            admin = new AppUser { UserName = "admin", DisplayName = "مدیر سامانه", JobTitle = "مدیر سیستم", Department = "دفتر مدیریت پروژه" };
            var created = await userManager.CreateAsync(admin, "Admin@123");
            if (!created.Succeeded) throw new InvalidOperationException(string.Join("؛ ", created.Errors.Select(x => x.Description)));
            await userManager.AddToRoleAsync(admin, "Administrator");
        }
        var ali = await EnsureUserAsync(userManager, "a.rezaei", "علی رضایی", "مدیر پروژه ارشد", "فناوری اطلاعات", "ProjectManager");
        var maryam = await EnsureUserAsync(userManager, "m.ahmadi", "مریم احمدی", "مدیر محصول", "بانکداری دیجیتال", "ProjectManager");
        var sara = await EnsureUserAsync(userManager, "s.mohammadi", "سارا محمدی", "کارشناس کنترل پروژه", "برنامه‌ریزی", "User");
        await EnsureUserAsync(userManager, "r.karimi", "رضا کریمی", "ناظر پروژه", "امور اجرایی", "User");
        await EnsureUserAsync(userManager, "n.hosseini", "نرگس حسینی", "رئیس اداره ریسک", "مدیریت ریسک", "User");

        if (!await db.Projects.AnyAsync())
        {

        var project = new Project { Code="PRJ-101", Name="توسعه سامانه مدیریت پروژه‌های بانک", Type="آبشاری", OwnerUnit="فناوری اطلاعات", ManagerName="مدیر سامانه", Status="در حال انجام", StartDate="۱۴۰۵/۰۱/۱۵", EndDate="۱۴۰۵/۱۲/۲۰", Budget=12500000000, Description="یکپارچه‌سازی برنامه‌ریزی، پایش و گزارش‌دهی پروژه‌های بانک" };
        db.Projects.AddRange(project,
            new Project { Code="PRJ-102", Name="نوسازی مرکز داده و زیرساخت سراسری", Type="آبشاری", OwnerUnit="ساختمان و املاک", ManagerName="علی رضایی", Status="در حال انجام", StartDate="۱۴۰۵/۰۲/۲۰", EndDate="۱۴۰۶/۰۳/۳۰", Budget=28000000000 },
            new Project { Code="PRJ-103", Name="بانکداری همراه نسل جدید", Type="چابک", OwnerUnit="فناوری اطلاعات", ManagerName="مریم احمدی", Status="برنامه‌ریزی", StartDate="۱۴۰۵/۰۵/۰۱", EndDate="۱۴۰۵/۱۲/۲۹", Budget=9400000000 });
        await db.SaveChangesAsync();
        db.ProjectRoles.AddRange(
            new ProjectRole { ProjectId=project.Id, RoleType="حامی طرح / مدیر برنامه", FullName="دکتر امیر حسینی", Position="معاون فناوری اطلاعات", PersonnelNumber="10021", Phone="021-66741001", Email="a.hosseini@banksepah.ir", ServiceLocation="ساختمان ستاد مرکزی" },
            new ProjectRole { ProjectId=project.Id, RoleType="مدیر پروژه", FullName="مدیر سامانه", Position="مدیر دفتر مدیریت پروژه", PersonnelNumber="10101", Phone="021-66741012", Email="pmo@banksepah.ir", ServiceLocation="ساختمان ستاد مرکزی" },
            new ProjectRole { ProjectId=project.Id, RoleType="ناظر پروژه", FullName="علی رضایی", Position="مدیر کنترل پروژه", PersonnelNumber="10218", Phone="021-66741018", Email="a.rezaei@banksepah.ir", ServiceLocation="معاونت برنامه‌ریزی" },
            new ProjectRole { ProjectId=project.Id, RoleType="عضو تیم", FullName="مریم احمدی", Position="کارشناس تحلیل کسب‌وکار", PersonnelNumber="10412", Phone="021-66741025", Email="m.ahmadi@banksepah.ir", ServiceLocation="فناوری اطلاعات" });
        db.CharterApprovals.AddRange(
            new CharterApproval { ProjectId=project.Id, Order=1, RoleTitle="حامی طرح / مدیر برنامه", ApproverName="دکتر امیر حسینی", Department="معاونت فناوری اطلاعات", Status="تأیید شده", DecisionDate="۱۴۰۵/۰۱/۱۲", Comment="منشور مورد تأیید است." },
            new CharterApproval { ProjectId=project.Id, Order=2, RoleTitle="مدیر پروژه", ApproverName="مدیر سامانه", Department="دفتر مدیریت پروژه", Status="تأیید شده", DecisionDate="۱۴۰۵/۰۱/۱۳" },
            new CharterApproval { ProjectId=project.Id, Order=3, RoleTitle="ناظر پروژه", ApproverName="علی رضایی", Department="کنترل پروژه", Status="در انتظار" },
            new CharterApproval { ProjectId=project.Id, Order=4, RoleTitle="معاون ذی‌ربط", ApproverName="معاون برنامه‌ریزی", Department="معاونت برنامه‌ریزی و راهبری", Status="در انتظار" });
        db.WorkTasks.AddRange(
            new WorkTask { Title="بررسی و تأیید منشور پروژه", ProjectName=project.Name, Assignee="مدیر سامانه", Status="در حال انجام" },
            new WorkTask { Title="به‌روزرسانی درصد پیشرفت فعالیت‌ها", ProjectName=project.Name, Assignee="علی رضایی", Status="باز" },
            new WorkTask { Title="بارگذاری صورت‌جلسه کمیته راهبری", ProjectName=project.Name, Assignee="مریم احمدی", Status="باز" },
            new WorkTask { Title="تکمیل ارکان و اعضای تیم پروژه", ProjectName=project.Name, Assignee="مدیر سامانه", Status="برنامه‌ریزی" });
        await db.SaveChangesAsync();
        var sample = new CalendarEvent { Title="جلسه پایش سبد پروژه‌ها", EventType="جلسه", Organizer="مدیر سامانه", PersianYear=1405, PersianMonth=5, PersianDay=28, StartTime="10:00", EndTime="11:30", Location="سالن جلسات مدیریت", Description="پایش وضعیت پروژه‌های اولویت‌دار" };
        sample.Participants.Add(new EventParticipant { Name="مدیر سامانه", Role="برگزارکننده" });
        sample.Participants.Add(new EventParticipant { Name="علی رضایی", Role="الزامی" });
        sample.AgendaItems.Add(new EventAgenda { Order=1, Title="مرور مصوبات جلسه قبل", DurationMinutes=20 });
        sample.AgendaItems.Add(new EventAgenda { Order=2, Title="بررسی پروژه‌های بحرانی", DurationMinutes=30 });
        sample.Reminders.Add(new EventReminder { Offset="یک روز قبل", Channel="اعلان سامانه", Enabled=true });
        db.CalendarEvents.Add(sample);
        await db.SaveChangesAsync();
        }

        if (!await db.ProjectUserAccess.AnyAsync())
        {
            var projects = await db.Projects.OrderBy(x => x.Id).ToListAsync();
            if (projects.Count > 0)
            {
                db.ProjectUserAccess.Add(new ProjectUserAccess { ProjectId=projects[0].Id, UserId=ali.Id, CanView=true, CanEdit=true, CanManageTeam=true, CanManageWbs=true, CanApprove=true });
                db.ProjectUserAccess.Add(new ProjectUserAccess { ProjectId=projects[0].Id, UserId=sara.Id, CanView=true });
            }
            if (projects.Count > 1)
                db.ProjectUserAccess.Add(new ProjectUserAccess { ProjectId=projects[1].Id, UserId=ali.Id, CanView=true, CanEdit=true, CanManageTeam=true, CanManageWbs=true });
            if (projects.Count > 2)
                db.ProjectUserAccess.Add(new ProjectUserAccess { ProjectId=projects[2].Id, UserId=maryam.Id, CanView=true, CanEdit=true, CanManageTeam=true, CanManageWbs=true, CanApprove=true });
            await db.SaveChangesAsync();
        }
    }

    private static async Task<AppUser> EnsureUserAsync(UserManager<AppUser> manager, string username, string displayName, string jobTitle, string department, string role)
    {
        var user = await manager.FindByNameAsync(username);
        if (user is null)
        {
            user = new AppUser { UserName=username, Email=$"{username}@sepah.ir", DisplayName=displayName, JobTitle=jobTitle, Department=department };
            var result = await manager.CreateAsync(user, "User@123");
            if (!result.Succeeded) throw new InvalidOperationException(string.Join("؛ ", result.Errors.Select(x => x.Description)));
        }
        if (!await manager.IsInRoleAsync(user, role)) await manager.AddToRoleAsync(user, role);
        return user;
    }

    private static Task EnsureProjectAccessSchemaAsync(AppDbContext db) => db.Database.ExecuteSqlRawAsync("""
        IF OBJECT_ID(N'[ProjectUserAccess]', N'U') IS NULL
        BEGIN
            CREATE TABLE [ProjectUserAccess] (
                [Id] int IDENTITY(1,1) NOT NULL CONSTRAINT [PK_ProjectUserAccess] PRIMARY KEY,
                [ProjectId] int NOT NULL,
                [UserId] int NOT NULL,
                [CanView] bit NOT NULL CONSTRAINT [DF_ProjectUserAccess_CanView] DEFAULT CAST(1 AS bit),
                [CanEdit] bit NOT NULL CONSTRAINT [DF_ProjectUserAccess_CanEdit] DEFAULT CAST(0 AS bit),
                [CanManageTeam] bit NOT NULL CONSTRAINT [DF_ProjectUserAccess_CanManageTeam] DEFAULT CAST(0 AS bit),
                [CanManageWbs] bit NOT NULL CONSTRAINT [DF_ProjectUserAccess_CanManageWbs] DEFAULT CAST(0 AS bit),
                [CanApprove] bit NOT NULL CONSTRAINT [DF_ProjectUserAccess_CanApprove] DEFAULT CAST(0 AS bit),
                CONSTRAINT [FK_ProjectUserAccess_Projects_ProjectId] FOREIGN KEY ([ProjectId]) REFERENCES [Projects] ([Id]) ON DELETE CASCADE,
                CONSTRAINT [FK_ProjectUserAccess_AspNetUsers_UserId] FOREIGN KEY ([UserId]) REFERENCES [AspNetUsers] ([Id]) ON DELETE CASCADE
            );
            CREATE UNIQUE INDEX [IX_ProjectUserAccess_ProjectId_UserId] ON [ProjectUserAccess] ([ProjectId], [UserId]);
            CREATE INDEX [IX_ProjectUserAccess_UserId] ON [ProjectUserAccess] ([UserId]);
        END
        """);
}
