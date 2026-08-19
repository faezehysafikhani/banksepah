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
        await EnsureWorkbookModulesSchemaAsync(db);
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

        var workbookProject = await db.Projects.OrderBy(x => x.Id).FirstAsync();
        if (!await db.ProjectWbsItems.AnyAsync(x => x.ProjectId == workbookProject.Id))
        {
            db.ProjectWbsItems.AddRange(
                new ProjectWbsItem { ProjectId=workbookProject.Id, Code="1", Name="بروزرسانی نظام مدیریت پروژه در بانک", Duration=45, StartDate="۱۴۰۵/۰۱/۱۵", EndDate="۱۴۰۵/۰۳/۰۱", Weight=20, Owner="مدیر سامانه", Planned=100, Actual=100, Cost=850000000, PersonHours=720, Importance="زیاد", Complexity="زیاد", PrerequisiteCode="-", RelationType="FS", CollaboratingUnit="اداره کل سازمان و روش‌ها", ParticipationPercent=50, Deliverable="نظام‌نامه مدیریت پروژه بازنگری‌شده", Requirements="انطباق با PMBOK و ISO 10006", QualityControl="بازبینی مستندات توسط ناظر کیفی" },
                new ProjectWbsItem { ProjectId=workbookProject.Id, Code="1.1", ParentCode="1", Name="اخذ بازخورد از نمایندگان برنامه‌ریزی", Duration=18, StartDate="۱۴۰۵/۰۱/۱۵", EndDate="۱۴۰۵/۰۲/۰۲", Weight=8, Owner="علی رضایی", Planned=100, Actual=100, Cost=230000000, PersonHours=240, Importance="زیاد", Complexity="متوسط", PrerequisiteCode="-", RelationType="FS", CollaboratingUnit="مناطق و شعب", ParticipationPercent=30, Deliverable="صورت‌خلاصه نظرات کاربران", Requirements="پوشش واحدهای صف و ستاد", QualityControl="کنترل کامل بودن پاسخ‌ها" },
                new ProjectWbsItem { ProjectId=workbookProject.Id, Code="1.2", ParentCode="1", Name="عارضه‌یابی و تحلیل شکاف سامانه EPM", Duration=27, StartDate="۱۴۰۵/۰۲/۰۳", EndDate="۱۴۰۵/۰۳/۰۱", Weight=12, Owner="مریم احمدی", Planned=100, Actual=100, Cost=620000000, PersonHours=480, Importance="زیاد", Complexity="زیاد", PrerequisiteCode="1.1", RelationType="FS", CollaboratingUnit="فناوری اطلاعات", ParticipationPercent=70, Deliverable="گزارش تحلیل شکاف و RFP", Requirements="انطباق با نظام مدیریت پروژه بانک", QualityControl="تأیید کمیته فنی و PMO" },
                new ProjectWbsItem { ProjectId=workbookProject.Id, Code="2", Name="بروزرسانی و استقرار سامانه مدیریت پروژه", Duration=145, StartDate="۱۴۰۵/۰۳/۰۲", EndDate="۱۴۰۵/۰۷/۲۷", Weight=50, Owner="مدیر سامانه", Planned=82, Actual=68, Cost=3200000000, PersonHours=3600, Importance="زیاد", Complexity="زیاد", PrerequisiteCode="1", RelationType="FS", CollaboratingUnit="معاونت فناوری اطلاعات", ParticipationPercent=80, Deliverable="نسخه عملیاتی سامانه PMO", Requirements="امنیت، یکپارچگی و دسترس‌پذیری", QualityControl="آزمون پذیرش و صورتجلسه استقرار" });
        }
        if (!await db.ProjectRisks.AnyAsync(x => x.ProjectId == workbookProject.Id))
        {
            db.ProjectRisks.AddRange(
                new ProjectRisk { ProjectId=workbookProject.Id, Title="خارج از سرویس بودن سامانه EPM", Probability=2, Severity=2, Impact=2, ResponsePlan="بروزرسانی سامانه و استقرار مانیتورینگ سرویس" },
                new ProjectRisk { ProjectId=workbookProject.Id, Title="تأخیر در ثبت اطلاعات پیشرفت پروژه توسط ارکان پروژه", Probability=2, Severity=2, Impact=2, ResponsePlan="اطلاع‌رسانی و یادآوری خودکار مطابق WBS مصوب" },
                new ProjectRisk { ProjectId=workbookProject.Id, Title="ضعف در هماهنگی ارکان پروژه برای اجرای WBS", Probability=2, Severity=2, Impact=2, ResponsePlan="ساماندهی تیم‌ها و برگزاری جلسه پایش هفتگی" },
                new ProjectRisk { ProjectId=workbookProject.Id, Title="ضعف در شناسایی و ثبت دانش حین اجرای پروژه", Probability=3, Severity=3, Impact=2, ResponsePlan="کنترل ثبت درس‌آموخته‌ها در سامانه PMO" },
                new ProjectRisk { ProjectId=workbookProject.Id, Title="عدم تطابق دستاوردها با فرم اختتامیه پروژه", Probability=3, Severity=3, Impact=3, ResponsePlan="کنترل دستاوردها براساس KPI در زمان خاتمه" },
                new ProjectRisk { ProjectId=workbookProject.Id, Title="ضعف توانمندی ارکان مدیریت پروژه", Probability=3, Severity=4, Impact=3, ResponsePlan="برنامه توانمندسازی و ارزیابی دوره‌ای ارکان پروژه" });
        }
        if (!await db.ProjectStakeholders.AnyAsync(x => x.ProjectId == workbookProject.Id))
        {
            db.ProjectStakeholders.AddRange(
                new ProjectStakeholder { ProjectId=workbookProject.Id, Name="مدیرعامل", RelationType="درون سازمانی", Expectations="مدیریت و کنترل پروژه‌ها مطابق آیین‌نامه مصوب بانک", Notes="گزارش مدیریتی ماهانه" },
                new ProjectStakeholder { ProjectId=workbookProject.Id, Name="معاونت برنامه‌ریزی و هدایت راهبردی", RelationType="درون سازمانی", Expectations="استانداردسازی فرایند مدیریت پروژه در بانک", Notes="مالک نظام مدیریت پروژه" },
                new ProjectStakeholder { ProjectId=workbookProject.Id, Name="هیأت مدیره بانک", RelationType="درون سازمانی", Expectations="پروژه‌محور شدن فعالیت‌های کلیدی بانک", Notes="دریافت گزارش فصلی" },
                new ProjectStakeholder { ProjectId=workbookProject.Id, Name="هیأت عامل بانک", RelationType="درون سازمانی", Expectations="گزارش پیشرفت پروژه‌های واحدهای ستادی", Notes="پایش مصوبات" },
                new ProjectStakeholder { ProjectId=workbookProject.Id, Name="مدیران مناطق", RelationType="درون سازمانی", Expectations="گزارش پیشرفت مناطق و اعلام بازخورد ثبت درصد پیشرفت", Notes="جلسه هماهنگی ماهانه" },
                new ProjectStakeholder { ProjectId=workbookProject.Id, Name="رؤسای شعب", RelationType="درون سازمانی", Expectations="اعلام بازخورد درباره ثبت و تأیید پیشرفت پروژه", Notes="ارتباط از طریق مدیر منطقه" },
                new ProjectStakeholder { ProjectId=workbookProject.Id, Name="مدیران پروژه‌ها", RelationType="درون سازمانی", Expectations="تأیید مستندات، رفع موانع و هماهنگی پروژه‌های بین‌واحدی", Notes="کاربر کلیدی سامانه" },
                new ProjectStakeholder { ProjectId=workbookProject.Id, Name="وزارت امور اقتصادی و دارایی", RelationType="برون سازمانی", Expectations="گزارش پیشرفت براساس شاخص‌های ابلاغی وزارت اقتصاد", Notes="ارسال گزارش در مواعد رسمی" });
        }
        await db.SaveChangesAsync();

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

    private static Task EnsureWorkbookModulesSchemaAsync(AppDbContext db) => db.Database.ExecuteSqlRawAsync("""
        IF OBJECT_ID(N'[ProjectWbsItems]', N'U') IS NULL
        BEGIN
            CREATE TABLE [ProjectWbsItems] (
                [Id] int IDENTITY(1,1) NOT NULL CONSTRAINT [PK_ProjectWbsItems] PRIMARY KEY,
                [ProjectId] int NOT NULL, [Code] nvarchar(32) NOT NULL, [ParentCode] nvarchar(32) NOT NULL,
                [Name] nvarchar(500) NOT NULL, [Duration] int NOT NULL, [StartDate] nvarchar(20) NOT NULL, [EndDate] nvarchar(20) NOT NULL,
                [Weight] decimal(5,2) NOT NULL, [Owner] nvarchar(200) NOT NULL, [Planned] int NOT NULL, [Actual] int NOT NULL,
                [Cost] decimal(18,0) NOT NULL, [PersonHours] int NOT NULL, [Importance] nvarchar(30) NOT NULL, [Complexity] nvarchar(30) NOT NULL,
                [PrerequisiteCode] nvarchar(32) NOT NULL, [RelationType] nvarchar(10) NOT NULL, [LagDays] int NOT NULL,
                [CollaboratingUnit] nvarchar(250) NOT NULL, [ParticipationPercent] decimal(5,2) NOT NULL,
                [Deliverable] nvarchar(1000) NOT NULL, [Requirements] nvarchar(1000) NOT NULL, [QualityControl] nvarchar(1000) NOT NULL,
                CONSTRAINT [FK_ProjectWbsItems_Projects_ProjectId] FOREIGN KEY ([ProjectId]) REFERENCES [Projects] ([Id]) ON DELETE CASCADE
            );
            CREATE INDEX [IX_ProjectWbsItems_ProjectId] ON [ProjectWbsItems] ([ProjectId]);
        END
        IF OBJECT_ID(N'[ProjectRisks]', N'U') IS NULL
        BEGIN
            CREATE TABLE [ProjectRisks] ([Id] int IDENTITY(1,1) NOT NULL CONSTRAINT [PK_ProjectRisks] PRIMARY KEY, [ProjectId] int NOT NULL, [Title] nvarchar(1000) NOT NULL, [Probability] int NOT NULL, [Severity] int NOT NULL, [Impact] int NOT NULL, [ResponsePlan] nvarchar(2000) NOT NULL, CONSTRAINT [FK_ProjectRisks_Projects_ProjectId] FOREIGN KEY ([ProjectId]) REFERENCES [Projects] ([Id]) ON DELETE CASCADE);
            CREATE INDEX [IX_ProjectRisks_ProjectId] ON [ProjectRisks] ([ProjectId]);
        END
        IF OBJECT_ID(N'[ProjectStakeholders]', N'U') IS NULL
        BEGIN
            CREATE TABLE [ProjectStakeholders] ([Id] int IDENTITY(1,1) NOT NULL CONSTRAINT [PK_ProjectStakeholders] PRIMARY KEY, [ProjectId] int NOT NULL, [Name] nvarchar(300) NOT NULL, [RelationType] nvarchar(50) NOT NULL, [Expectations] nvarchar(2000) NOT NULL, [Notes] nvarchar(1000) NOT NULL, CONSTRAINT [FK_ProjectStakeholders_Projects_ProjectId] FOREIGN KEY ([ProjectId]) REFERENCES [Projects] ([Id]) ON DELETE CASCADE);
            CREATE INDEX [IX_ProjectStakeholders_ProjectId] ON [ProjectStakeholders] ([ProjectId]);
        END
        """);
}
