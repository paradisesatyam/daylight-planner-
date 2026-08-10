# Daylight

Daylight is an installable, multi-user daily planner for web, phone, tablet, and desktop. Each account has private cloud-synced tasks, habits, events, journal entries, and expenses.

## What is included

- Email/password accounts with private per-user records in Supabase
- Responsive phone and desktop interface, dark mode, and installable PWA support
- Tasks with Today/This week/All filters, habits, calendar events, focus timer, journal, expense dashboard, and data export
- Browser reminders while the app or installed PWA is running

## Run locally

From this folder, run:

```powershell
python -m http.server 4173
```

Then open `http://localhost:4173`. Do not open `index.html` directly: service workers and the installable experience need a web server.

## Launch checklist

### 1. Configure Supabase

1. Create a project at [Supabase](https://supabase.com/).
2. In **SQL Editor**, run the entire [supabase-schema.sql](./supabase-schema.sql) file. It creates the private data table and Row Level Security rules.
3. Under **Project Settings → API**, copy the Project URL and the public **Publishable** key (or legacy `anon` key).
4. Put them in [supabase-config.js](./supabase-config.js). The publishable key is safe in a web app; never put a `service_role` key in this project.
5. Under **Authentication → Providers → Email**, choose whether new users must confirm their email. For a public launch, email confirmation is recommended.

### 2. Deploy with Netlify

This repository includes `netlify.toml`, so there is no build command.

1. Create a GitHub repository and upload all project files.
2. Sign in at [Netlify](https://www.netlify.com/) and select **Add new site → Import an existing project**.
3. Choose the GitHub repository. Netlify should detect the settings: publish directory `.` and no build command.
4. Click **Deploy site** and copy the HTTPS address Netlify provides, for example `https://your-daylight.netlify.app`.
5. Back in Supabase, open **Authentication → URL Configuration**. Set the **Site URL** to that exact HTTPS address and add the same address to **Redirect URLs**. Save.
6. Trigger a Netlify redeploy after any change to `supabase-config.js`.

### 3. Test before sharing

1. Open the deployed URL in an incognito/private window.
2. Create a test account, add a task, then sign out and sign back in. The task should remain.
3. Create a second account and verify it cannot see the first account’s data.
4. On Android Chrome use **Install app**; on iPhone Safari use **Share → Add to Home Screen**. Test the layout and notifications on each device you intend to support.

## Operating notes

Use **Export my data** from the sidebar as a personal backup. Reminders are device-local and dependable only while the site or installed PWA is running; delivery while an app is fully closed needs a separate notification service. The Supabase free tier and Netlify free tier are suitable for an initial release—review their current limits before a large public rollout.
