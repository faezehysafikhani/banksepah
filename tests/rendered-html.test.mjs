import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

test("ships the Sepah project-management experience", async () => {
  const [page, layout, css, hosting] = await Promise.all([
    readFile(new URL("app/page.tsx", root), "utf8"),
    readFile(new URL("app/layout.tsx", root), "utf8"),
    readFile(new URL("app/globals.css", root), "utf8"),
    readFile(new URL(".openai/hosting.json", root), "utf8"),
  ]);

  assert.match(page, /سامانه مدیریت/);
  assert.match(page, /\/api\/auth\/login/);
  assert.match(page, /داشبورد مدیریتی/);
  assert.match(layout, /lang="fa" dir="rtl"/);
  assert.match(layout, /سامانه مدیریت پروژه‌های بانک سپه/);
  assert.match(css, /IRANSans-Medium\.ttf/);
  assert.match(css, /backdrop-filter:\s*blur/);
  assert.match(hosting, /"d1": "DB"/);
  await access(new URL("public/images.jpg", root));
  await access(new URL("public/mob.banking.android.sepah_512x512.webp", root));
  await access(new URL("public/fonts/IRANSans-Medium.ttf", root));
  await assert.rejects(access(new URL("app/_sites-preview/SkeletonPreview.tsx", root)));
});
