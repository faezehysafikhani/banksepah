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
        await EnsureTenantSchemaAsync(db);
        await EnsurePlatformSchemaAsync(db);
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
        var reza = await EnsureUserAsync(userManager, "r.karimi", "رضا کریمی", "ناظر پروژه", "امور اجرایی", "User");
        var narges = await EnsureUserAsync(userManager, "n.hosseini", "نرگس حسینی", "رئیس اداره ریسک", "مدیریت ریسک", "User");

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

        await EnsurePortfolioSampleDataAsync(db);
        await EnsureTenantSeedAsync(db, admin, ali, maryam, sara, reza, narges);
        await EnsurePlatformSeedAsync(db, admin, ali, maryam);

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

    private static async Task EnsureTenantSeedAsync(AppDbContext db, AppUser admin, AppUser ali, AppUser maryam, AppUser sara, AppUser reza, AppUser narges)
    {
        var primary = await db.Tenants.SingleAsync(x => x.Code == "SEPAH");
        var digital = await db.Tenants.SingleOrDefaultAsync(x => x.Code == "SEPAH-DIGITAL");
        if (digital is null)
        {
            digital = new Tenant { Code="SEPAH-DIGITAL", Name="شرکت توسعه فناوری سپه", IsActive=true };
            db.Tenants.Add(digital);
            await db.SaveChangesAsync();
        }

        var memberships = new[]
        {
            new TenantMembership { TenantId=primary.Id, UserId=admin.Id, Role="مالک سامانه" },
            new TenantMembership { TenantId=primary.Id, UserId=ali.Id, Role="مدیر سازمان" },
            new TenantMembership { TenantId=primary.Id, UserId=sara.Id, Role="کاربر" },
            new TenantMembership { TenantId=primary.Id, UserId=reza.Id, Role="مشاهده‌گر" },
            new TenantMembership { TenantId=primary.Id, UserId=narges.Id, Role="کاربر" },
            new TenantMembership { TenantId=digital.Id, UserId=admin.Id, Role="مالک سامانه" },
            new TenantMembership { TenantId=digital.Id, UserId=maryam.Id, Role="مدیر سازمان" }
        };
        var existing = (await db.TenantMemberships.Select(x => new { x.TenantId, x.UserId }).ToListAsync()).Select(x => (x.TenantId,x.UserId)).ToHashSet();
        db.TenantMemberships.AddRange(memberships.Where(x => !existing.Contains((x.TenantId,x.UserId))));
        var digitalCodes = new[] { "PRJ-118", "PRJ-119", "PRJ-120" };
        var digitalProjects = await db.Projects.Where(x => digitalCodes.Contains(x.Code)).ToListAsync();
        foreach (var project in digitalProjects) project.TenantId = digital.Id;
        var maryamAccess = await db.ProjectUserAccess.Where(x => x.UserId == maryam.Id).Select(x => x.ProjectId).ToListAsync();
        db.ProjectUserAccess.AddRange(digitalProjects.Where(x => !maryamAccess.Contains(x.Id)).Select(x => new ProjectUserAccess
        {
            ProjectId=x.Id, UserId=maryam.Id, CanView=true, CanEdit=true, CanManageTeam=true, CanManageWbs=true, CanApprove=true
        }));
        await db.SaveChangesAsync();
    }

    private static async Task EnsurePortfolioSampleDataAsync(AppDbContext db)
    {
        var samples = new[]
        {
            new Project { Code="PRJ-104", Name="هوشمندسازی تجربه مشتریان", Type="چابک", OwnerUnit="توسعه کسب‌وکار", ManagerName="سارا محمدی", Status="در حال انجام", StartDate="۱۴۰۵/۰۱/۲۰", EndDate="۱۴۰۵/۱۰/۳۰", Budget=7600000000, Description="بازطراحی سفر مشتری و استقرار خدمات شخصی‌سازی‌شده در کانال‌های بانک" },
            new Project { Code="PRJ-105", Name="ارتقای زیرساخت شعب منتخب", Type="آبشاری", OwnerUnit="ساختمان و املاک", ManagerName="علی رضایی", Status="در حال انجام", StartDate="۱۴۰۵/۰۲/۰۱", EndDate="۱۴۰۶/۰۲/۱۵", Budget=18600000000, Description="نوسازی زیرساخت فنی، امنیتی و خدماتی شعب اولویت‌دار" },
            new Project { Code="PRJ-106", Name="سامانه یکپارچه مدیریت اعتبارات", Type="آبشاری", OwnerUnit="اعتبارات", ManagerName="مدیر سامانه", Status="در حال انجام", StartDate="۱۴۰۴/۱۱/۱۰", EndDate="۱۴۰۵/۱۱/۲۹", Budget=14200000000, Description="یکپارچه‌سازی فرایند ارزیابی، تصویب و پایش تسهیلات" },
            new Project { Code="PRJ-107", Name="باشگاه مشتریان بانک سپه", Type="چابک", OwnerUnit="بازاریابی", ManagerName="مریم احمدی", Status="برنامه‌ریزی", StartDate="۱۴۰۵/۰۶/۰۱", EndDate="۱۴۰۶/۰۱/۳۱", Budget=5800000000, Description="طراحی باشگاه وفاداری و موتور پیشنهاد هوشمند خدمات" },
            new Project { Code="PRJ-108", Name="مهاجرت سرویس‌ها به ابر خصوصی", Type="چابک", OwnerUnit="فناوری اطلاعات", ManagerName="رضا کریمی", Status="در حال انجام", StartDate="۱۴۰۵/۰۱/۱۰", EndDate="۱۴۰۵/۰۹/۳۰", Budget=11800000000, Description="انتقال تدریجی سرویس‌های منتخب به زیرساخت ابری امن بانک" },
            new Project { Code="PRJ-109", Name="مرکز عملیات امنیت نسل جدید", Type="آبشاری", OwnerUnit="امنیت اطلاعات", ManagerName="نرگس حسینی", Status="در حال انجام", StartDate="۱۴۰۴/۱۲/۰۱", EndDate="۱۴۰۵/۰۸/۳۰", Budget=22400000000, Description="توسعه SOC و پایش برخط رخدادهای امنیتی" },
            new Project { Code="PRJ-110", Name="بهینه‌سازی فرایندهای خزانه‌داری", Type="آبشاری", OwnerUnit="خزانه‌داری", ManagerName="علی رضایی", Status="تکمیل شده", StartDate="۱۴۰۴/۰۳/۱۵", EndDate="۱۴۰۵/۰۳/۲۰", Budget=4600000000, Description="کاهش زمان چرخه و افزایش کنترل‌های مالی خزانه‌داری" },
            new Project { Code="PRJ-111", Name="سامانه آموزش و توسعه شایستگی", Type="چابک", OwnerUnit="سرمایه انسانی", ManagerName="سارا محمدی", Status="در حال انجام", StartDate="۱۴۰۵/۰۳/۰۱", EndDate="۱۴۰۵/۱۲/۱۵", Budget=3900000000, Description="مدیریت مسیر یادگیری و شایستگی نقش‌های کلیدی بانک" },
            new Project { Code="PRJ-112", Name="تحول مدیریت اسناد و بایگانی", Type="آبشاری", OwnerUnit="پشتیبانی", ManagerName="مدیر سامانه", Status="متوقف شده", StartDate="۱۴۰۴/۱۰/۲۰", EndDate="۱۴۰۵/۰۹/۲۰", Budget=6700000000, Description="دیجیتال‌سازی اسناد و استقرار گردش مکاتبات امن" },
            new Project { Code="PRJ-113", Name="راه‌اندازی مرکز تماس هوشمند", Type="چابک", OwnerUnit="توسعه کسب‌وکار", ManagerName="مریم احمدی", Status="در حال انجام", StartDate="۱۴۰۵/۰۲/۱۵", EndDate="۱۴۰۵/۱۱/۱۵", Budget=8200000000, Description="پاسخگویی همه‌کاناله و تحلیل هوشمند درخواست مشتریان" },
            new Project { Code="PRJ-114", Name="نوسازی شبکه ارتباطی مناطق", Type="آبشاری", OwnerUnit="فناوری اطلاعات", ManagerName="رضا کریمی", Status="در حال انجام", StartDate="۱۴۰۴/۱۲/۱۵", EndDate="۱۴۰۶/۰۱/۳۰", Budget=31500000000, Description="افزایش ظرفیت، پایداری و امنیت شبکه مناطق و شعب" },
            new Project { Code="PRJ-115", Name="مدیریت هوشمند نقدینگی شعب", Type="چابک", OwnerUnit="امور شعب", ManagerName="علی رضایی", Status="برنامه‌ریزی", StartDate="۱۴۰۵/۰۷/۰۱", EndDate="۱۴۰۶/۰۳/۳۱", Budget=5100000000, Description="پیش‌بینی نیاز نقدینگی و بهینه‌سازی توزیع وجوه شعب" },
            new Project { Code="PRJ-116", Name="یکپارچه‌سازی پایانه‌های پرداخت", Type="آبشاری", OwnerUnit="بانکداری دیجیتال", ManagerName="مریم احمدی", Status="در حال انجام", StartDate="۱۴۰۵/۰۱/۰۵", EndDate="۱۴۰۵/۱۰/۱۰", Budget=9700000000, Description="استانداردسازی مدیریت پایانه‌ها و پایش کیفیت تراکنش" },
            new Project { Code="PRJ-117", Name="نظام جامع مدیریت تداوم کسب‌وکار", Type="آبشاری", OwnerUnit="مدیریت ریسک", ManagerName="نرگس حسینی", Status="در حال انجام", StartDate="۱۴۰۵/۰۲/۱۰", EndDate="۱۴۰۶/۰۲/۲۹", Budget=7300000000, Description="تدوین و آزمون برنامه‌های تداوم خدمات حیاتی بانک" },
            new Project { Code="PRJ-118", Name="داشبورد سودآوری محصولات", Type="چابک", OwnerUnit="معاونت برنامه‌ریزی", ManagerName="سارا محمدی", Status="تکمیل شده", StartDate="۱۴۰۴/۰۵/۰۱", EndDate="۱۴۰۵/۰۲/۳۱", Budget=3200000000, Description="تحلیل سودآوری محصول، مشتری و کانال برای تصمیم‌گیری مدیریتی" },
            new Project { Code="PRJ-119", Name="بازطراحی مدل ارزیابی پیمانکاران", Type="آبشاری", OwnerUnit="امور اجرایی", ManagerName="علی رضایی", Status="متوقف شده", StartDate="۱۴۰۵/۰۱/۲۵", EndDate="۱۴۰۵/۰۸/۱۵", Budget=2100000000, Description="ایجاد مدل امتیازدهی و کنترل عملکرد پیمانکاران پروژه‌ای" },
            new Project { Code="PRJ-120", Name="پلتفرم بانکداری باز", Type="چابک", OwnerUnit="بانکداری دیجیتال", ManagerName="مدیر سامانه", Status="برنامه‌ریزی", StartDate="۱۴۰۵/۰۸/۰۱", EndDate="۱۴۰۶/۰۶/۳۱", Budget=16800000000, Description="ارائه APIهای بانکی امن و مدیریت اکوسیستم شرکای تجاری" }
        };

        var existingCodes = (await db.Projects.Select(x => x.Code).ToListAsync()).ToHashSet();
        db.Projects.AddRange(samples.Where(x => !existingCodes.Contains(x.Code)));
        await db.SaveChangesAsync();

        var projects = await db.Projects.OrderBy(x => x.Id).ToListAsync();
        var wbsProjectIds = await db.ProjectWbsItems.Select(x => x.ProjectId).Distinct().ToListAsync();
        var riskProjectIds = await db.ProjectRisks.Select(x => x.ProjectId).Distinct().ToListAsync();
        var stakeholderProjectIds = await db.ProjectStakeholders.Select(x => x.ProjectId).Distinct().ToListAsync();
        var taskProjectNames = await db.WorkTasks.Select(x => x.ProjectName).Distinct().ToListAsync();
        var wbsSet = wbsProjectIds.ToHashSet();
        var riskSet = riskProjectIds.ToHashSet();
        var stakeholderSet = stakeholderProjectIds.ToHashSet();
        var taskSet = taskProjectNames.ToHashSet();

        foreach (var project in projects)
        {
            var progress = project.Status switch { "تکمیل شده" => 100, "برنامه‌ریزی" => 12, "متوقف شده" => 38, _ => 46 + project.Id % 43 };
            var planned = Math.Min(100, progress + (project.Id % 4 + 1) * 4);
            if (!wbsSet.Contains(project.Id))
            {
                db.ProjectWbsItems.AddRange(
                    new ProjectWbsItem { ProjectId=project.Id, Code="1", Name="تحلیل و طراحی راهکار", Duration=35, StartDate=project.StartDate, EndDate="۱۴۰۵/۰۳/۳۱", Weight=25, Owner=project.ManagerName, Planned=100, Actual=Math.Min(100, progress+25), Cost=project.Budget*.18m, PersonHours=640, Importance="زیاد", Complexity="متوسط", PrerequisiteCode="-", RelationType="FS", CollaboratingUnit=project.OwnerUnit, ParticipationPercent=70, Deliverable="سند راهکار و برنامه اجرایی مصوب", Requirements="تأیید نیازمندی‌های کسب‌وکار", QualityControl="بازبینی PMO و واحد مالک" },
                    new ProjectWbsItem { ProjectId=project.Id, Code="2", Name="پیاده‌سازی و کنترل کیفیت", Duration=120, StartDate="۱۴۰۵/۰۴/۰۱", EndDate="۱۴۰۵/۰۸/۳۰", Weight=50, Owner=project.ManagerName, Planned=planned, Actual=progress, Cost=project.Budget*.58m, PersonHours=2600, Importance="زیاد", Complexity="زیاد", PrerequisiteCode="1", RelationType="FS", CollaboratingUnit="فناوری اطلاعات", ParticipationPercent=55, Deliverable="نسخه قابل بهره‌برداری", Requirements="کنترل امنیت و کارایی", QualityControl="آزمون یکپارچگی و پذیرش کاربر" },
                    new ProjectWbsItem { ProjectId=project.Id, Code="3", Name="استقرار، آموزش و تحویل", Duration=45, StartDate="۱۴۰۵/۰۹/۰۱", EndDate=project.EndDate, Weight=25, Owner=project.ManagerName, Planned=Math.Max(0, planned-35), Actual=Math.Max(0, progress-40), Cost=project.Budget*.16m, PersonHours=780, Importance="متوسط", Complexity="متوسط", PrerequisiteCode="2", RelationType="FS", CollaboratingUnit="پشتیبانی", ParticipationPercent=40, Deliverable="صورتجلسه تحویل و بسته آموزشی", Requirements="تکمیل آزمون پذیرش", QualityControl="پایش پس از استقرار" });
            }
            if (!riskSet.Contains(project.Id))
            {
                db.ProjectRisks.AddRange(
                    new ProjectRisk { ProjectId=project.Id, Title="تأخیر در تأمین منابع تخصصی پروژه", Probability=2 + project.Id%3, Severity=3, Impact=2 + project.Id%2, ResponsePlan="تثبیت برنامه تخصیص منابع و تعریف نیروی جایگزین" },
                    new ProjectRisk { ProjectId=project.Id, Title="تغییر الزامات کلیدی در زمان اجرا", Probability=2, Severity=2 + project.Id%3, Impact=3, ResponsePlan="فعال‌سازی کمیته کنترل تغییر و تحلیل اثر پیش از تصویب" },
                    new ProjectRisk { ProjectId=project.Id, Title="عدم آمادگی بهره‌برداران برای تحویل", Probability=1 + project.Id%3, Severity=2, Impact=2, ResponsePlan="اجرای پایلوت، آموزش کاربران کلیدی و سنجش آمادگی" });
            }
            if (!stakeholderSet.Contains(project.Id))
            {
                db.ProjectStakeholders.AddRange(
                    new ProjectStakeholder { ProjectId=project.Id, Name="حامی پروژه", RelationType="درون سازمانی", Expectations="تحقق اهداف راهبردی، کنترل انحراف و دریافت گزارش تصمیم‌ساز", Notes="گزارش ماهانه کمیته راهبری" },
                    new ProjectStakeholder { ProjectId=project.Id, Name=project.OwnerUnit, RelationType="درون سازمانی", Expectations="تحویل کامل محدوده و آمادگی بهره‌برداری", Notes="جلسه پایش دوهفته‌ای با مدیر پروژه" },
                    new ProjectStakeholder { ProjectId=project.Id, Name="پیمانکار و تأمین‌کنندگان", RelationType="برون سازمانی", Expectations="شفافیت الزامات، پرداخت به‌موقع و مدیریت تغییرات", Notes="کنترل قرارداد و صورت‌وضعیت ماهانه" });
            }
            if (!taskSet.Contains(project.Name))
            {
                db.WorkTasks.AddRange(
                    new WorkTask { Title="به‌روزرسانی گزارش پیشرفت ماهانه", ProjectName=project.Name, Assignee=project.ManagerName, Status=project.Status == "تکمیل شده" ? "تکمیل شده" : "در حال انجام" },
                    new WorkTask { Title="بازبینی ریسک‌ها و اقدامات پاسخ", ProjectName=project.Name, Assignee="کارشناس کنترل پروژه", Status=project.Status == "تکمیل شده" ? "تکمیل شده" : "باز" });
            }
        }
        await db.SaveChangesAsync();
    }

    private static async Task EnsurePlatformSeedAsync(AppDbContext db, AppUser admin, AppUser ali, AppUser maryam)
    {
        foreach (var tenant in await db.Tenants.ToListAsync())
        {
            var defaults = new Dictionary<string,string>
            {
                ["General.OrganizationName"] = tenant.Name,
                ["General.TimeZone"] = "Asia/Tehran",
                ["General.PersianCalendar"] = "true",
                ["Ai.Enabled"] = "true",
                ["Ai.Provider"] = "SepahInsight",
                ["Ai.OllamaUrl"] = "http://localhost:11434",
                ["Ai.Model"] = "qwen2.5:3b",
                ["Ai.IncludeProjectData"] = "true",
                ["Sms.Enabled"] = "false",
                ["Sms.Provider"] = "کاوه‌نگار",
                ["Sms.SenderNumber"] = "",
                ["Sms.DailyLimit"] = "500",
                ["Sms.Events"] = "approval,dueDate,criticalRisk",
                ["Theme.Name"] = "ocean",
                ["Theme.Density"] = "comfortable",
                ["Theme.GlassIntensity"] = "82",
                ["Theme.Motion"] = "true"
            };
            var existingKeys = await db.SystemSettings.Where(x => x.TenantId == tenant.Id).Select(x => x.Key).ToListAsync();
            db.SystemSettings.AddRange(defaults.Where(x => !existingKeys.Contains(x.Key)).Select(x => new SystemSetting { TenantId=tenant.Id, Key=x.Key, Value=x.Value }));
        }
        await db.SaveChangesAsync();

        if (!await db.AppNotifications.AnyAsync())
        {
            var primary = await db.Tenants.SingleAsync(x => x.Code == "SEPAH");
            var digital = await db.Tenants.SingleAsync(x => x.Code == "SEPAH-DIGITAL");
            db.AppNotifications.AddRange(
                new AppNotification { TenantId=primary.Id, UserId=admin.Id, Title="سه منشور در انتظار تأیید", Message="منشور پروژه‌های اولویت‌دار برای تصمیم مدیریتی آماده است.", Category="تأییدات", Priority="مهم", CreatedAtUtc=DateTime.UtcNow.AddMinutes(-18) },
                new AppNotification { TenantId=primary.Id, UserId=admin.Id, Title="ریسک بحرانی جدید", Message="ریسک تأخیر تأمین زیرساخت در سبد پروژه‌ها نیازمند پاسخ است.", Category="ریسک", Priority="بحرانی", CreatedAtUtc=DateTime.UtcNow.AddHours(-2) },
                new AppNotification { TenantId=primary.Id, UserId=admin.Id, Title="گزارش هفتگی آماده شد", Message="گزارش عملکرد سبد و انحراف برنامه قابل دریافت است.", Category="گزارش", IsRead=true, CreatedAtUtc=DateTime.UtcNow.AddDays(-1) },
                new AppNotification { TenantId=primary.Id, UserId=ali.Id, Title="وظیفه جدید به شما ارجاع شد", Message="به‌روزرسانی برنامه زمان‌بندی پروژه مرکز داده.", Category="وظیفه", Priority="مهم", CreatedAtUtc=DateTime.UtcNow.AddMinutes(-42) },
                new AppNotification { TenantId=digital.Id, UserId=admin.Id, Title="Sprint Review آماده برگزاری است", Message="گزارش سه پروژه شرکت توسعه فناوری سپه به‌روزرسانی شد.", Category="پروژه", CreatedAtUtc=DateTime.UtcNow.AddHours(-1) },
                new AppNotification { TenantId=digital.Id, UserId=maryam.Id, Title="دو اقدام موعد امروز دارند", Message="اقدامات پروژه‌های بانکداری دیجیتال نیازمند پیگیری است.", Category="اقدام", Priority="مهم", CreatedAtUtc=DateTime.UtcNow.AddHours(-3) });
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

    private static Task EnsureTenantSchemaAsync(AppDbContext db) => db.Database.ExecuteSqlRawAsync("""
        IF OBJECT_ID(N'[Tenants]', N'U') IS NULL
        BEGIN
            CREATE TABLE [Tenants] (
                [Id] int IDENTITY(1,1) NOT NULL CONSTRAINT [PK_Tenants] PRIMARY KEY,
                [Code] nvarchar(450) NOT NULL, [Name] nvarchar(300) NOT NULL,
                [IsActive] bit NOT NULL CONSTRAINT [DF_Tenants_IsActive] DEFAULT CAST(1 AS bit)
            );
            CREATE UNIQUE INDEX [IX_Tenants_Code] ON [Tenants] ([Code]);
            INSERT INTO [Tenants] ([Code],[Name],[IsActive]) VALUES (N'SEPAH',N'بانک سپه',1);
        END
        IF COL_LENGTH(N'Projects', N'TenantId') IS NULL
        BEGIN
            ALTER TABLE [Projects] ADD [TenantId] int NOT NULL CONSTRAINT [DF_Projects_TenantId] DEFAULT 1;
            ALTER TABLE [Projects] ADD CONSTRAINT [FK_Projects_Tenants_TenantId] FOREIGN KEY ([TenantId]) REFERENCES [Tenants] ([Id]);
            CREATE INDEX [IX_Projects_TenantId] ON [Projects] ([TenantId]);
        END
        IF EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_Projects_Code' AND object_id = OBJECT_ID(N'[Projects]'))
            DROP INDEX [IX_Projects_Code] ON [Projects];
        IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_Projects_TenantId_Code' AND object_id = OBJECT_ID(N'[Projects]'))
            CREATE UNIQUE INDEX [IX_Projects_TenantId_Code] ON [Projects] ([TenantId],[Code]);
        IF OBJECT_ID(N'[TenantMemberships]', N'U') IS NULL
        BEGIN
            CREATE TABLE [TenantMemberships] (
                [Id] int IDENTITY(1,1) NOT NULL CONSTRAINT [PK_TenantMemberships] PRIMARY KEY,
                [TenantId] int NOT NULL, [UserId] int NOT NULL, [Role] nvarchar(80) NOT NULL,
                CONSTRAINT [FK_TenantMemberships_Tenants_TenantId] FOREIGN KEY ([TenantId]) REFERENCES [Tenants] ([Id]) ON DELETE CASCADE,
                CONSTRAINT [FK_TenantMemberships_AspNetUsers_UserId] FOREIGN KEY ([UserId]) REFERENCES [AspNetUsers] ([Id]) ON DELETE CASCADE
            );
            CREATE UNIQUE INDEX [IX_TenantMemberships_TenantId_UserId] ON [TenantMemberships] ([TenantId],[UserId]);
            CREATE INDEX [IX_TenantMemberships_UserId] ON [TenantMemberships] ([UserId]);
        END
        """);

    private static Task EnsurePlatformSchemaAsync(AppDbContext db) => db.Database.ExecuteSqlRawAsync("""
        IF OBJECT_ID(N'[SystemSettings]', N'U') IS NULL
        BEGIN
            CREATE TABLE [SystemSettings] (
                [Id] int IDENTITY(1,1) NOT NULL CONSTRAINT [PK_SystemSettings] PRIMARY KEY,
                [TenantId] int NOT NULL, [Key] nvarchar(220) NOT NULL, [Value] nvarchar(max) NOT NULL,
                [UpdatedAtUtc] datetime2 NOT NULL,
                CONSTRAINT [FK_SystemSettings_Tenants_TenantId] FOREIGN KEY ([TenantId]) REFERENCES [Tenants] ([Id]) ON DELETE CASCADE
            );
            CREATE UNIQUE INDEX [IX_SystemSettings_TenantId_Key] ON [SystemSettings] ([TenantId],[Key]);
        END
        IF OBJECT_ID(N'[AppNotifications]', N'U') IS NULL
        BEGIN
            CREATE TABLE [AppNotifications] (
                [Id] int IDENTITY(1,1) NOT NULL CONSTRAINT [PK_AppNotifications] PRIMARY KEY,
                [TenantId] int NOT NULL, [UserId] int NOT NULL, [Title] nvarchar(300) NOT NULL,
                [Message] nvarchar(1200) NOT NULL, [Category] nvarchar(80) NOT NULL, [Priority] nvarchar(40) NOT NULL,
                [IsRead] bit NOT NULL, [CreatedAtUtc] datetime2 NOT NULL,
                CONSTRAINT [FK_AppNotifications_Tenants_TenantId] FOREIGN KEY ([TenantId]) REFERENCES [Tenants] ([Id]) ON DELETE CASCADE,
                CONSTRAINT [FK_AppNotifications_AspNetUsers_UserId] FOREIGN KEY ([UserId]) REFERENCES [AspNetUsers] ([Id]) ON DELETE CASCADE
            );
            CREATE INDEX [IX_AppNotifications_TenantId_UserId_IsRead] ON [AppNotifications] ([TenantId],[UserId],[IsRead]);
            CREATE INDEX [IX_AppNotifications_UserId] ON [AppNotifications] ([UserId]);
        END
        """);

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
