# سامانه مدیریت پروژه‌های بانک سپه

پرتال راست‌به‌چپ مدیریت پروژه‌های بانک سپه با رابط شیشه‌ای، Backend مستقل ASP.NET Core 8، SQL Server، داشبورد مدیریتی،
تقویم شمسی، سبد پروژه‌ها، WBS، اقدامات، تأییدات، مدیریت دانش، استراتژی،
گزارش‌ها و مدیریت کاربران و دسترسی‌ها.

## اجرا در VS Code

1. پوشه `F:\sepahbank` را در VS Code باز کنید.
2. ترمینال داخلی VS Code را باز کنید (`Ctrl + ``).
3. برای اولین اجرا دستور زیر را بزنید:

```powershell
npm install
```

4. سپس برنامه را اجرا کنید:

```powershell
npm run dev
```

5. آدرس `http://localhost:3000` را در مرورگر باز کنید. API روی `http://localhost:5088` و Swagger روی `http://localhost:5088/swagger` در دسترس است.

روش دوم: از منوی `Terminal > Run Task` گزینه `Sepah: Run Development Server` را انتخاب کنید.

## حساب مدیر اولیه

- نام کاربری: `admin`
- رمز عبور: `Admin@123`

دیتابیس SQL Server با نام `SepahPmoDb` در اولین اجرا به‌صورت خودکار ساخته و با پروژه‌ها، وظایف، رویداد، ارکان پروژه و گردش تأیید منشور مقداردهی می‌شود. Connection string در `backend/Sepah.Pmo.Api/appsettings.json` قرار دارد و پیش‌فرض آن Windows Authentication روی `Server=.` است.

خروجی Excel پروژه‌ها از مسیر `GET /api/reports/projects.xlsx` و خلاصه گزارش از `GET /api/reports/summary` ارائه می‌شود.

## کنترل نسخه تولید

```powershell
npm run build
npm run test:api
```

برای اجرای بررسی‌های کیفیت:

```powershell
npm run lint
npm test
```
