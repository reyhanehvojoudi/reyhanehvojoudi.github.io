# Updated website — start here

Your design, page sections, navigation, social links, research content and PDFs are retained. The only content edits are the instructions beside the former email enquiry buttons and the contact button label.

## What is ready

- Optimized WebP background, portrait and logo; separate smaller mobile background.
- Same English and Persian pages, with matching accessible enquiry dialogs.
- Every former email CTA now opens a form. Social, video, navigation and download links retain their original functions.
- Required: name, email, phone number, enquiry type and a short message. City/time zone is optional. Teaching, Vellum House and collaboration buttons preselect the relevant enquiry type and show a tailored prompt.
- No visitor Google login. Any valid email address can be entered.
- Google code saves leads in a private tracker, emails reyhaneh.vojoudi@gmail.com, and retries pending notifications hourly.

**The Google connection is not activated yet. Complete the setup below before publishing.** Until you add your deployment URL, forms show an honest “not activated yet” notice and offer Telegram; they do not claim to send anything.

## 1. Set up Google once (about 10 minutes)

1. Sign in to **reyhaneh.vojoudi@gmail.com** and open https://script.google.com/ . Choose **New project**. Name it `Reyhaneh Website Enquiries`.
2. Open the included `google-setup/Code.gs` in a text editor. Copy its entire contents into the project's `Code.gs`, replacing the starter code. Save.
3. Open **Project Settings** and enable **Show appsscript.json manifest file in editor**. Return to the editor. Replace `appsscript.json` with the contents of the included `google-setup/appsscript.json`. Save.
4. In the function selector, choose **setup**, then click **Run**. Review and authorize access for your own script. It needs to create/write the tracker, send notifications, and schedule email retries; it does not read your Gmail inbox. If Google's unverified-app notice appears, confirm this is the project you just created before continuing. If your account blocks authorization, stop and share the exact message.
5. The execution log prints **Your private lead tracker:** followed by a Google Sheets link. Open and bookmark it. The setup function creates this sheet automatically; do not make the sheet public.
6. Click **Deploy → New deployment → Select type → Web app**. Choose **Execute as: Me** and **Who has access: Anyone**. Do not select “Anyone with Google account.” Click **Deploy**, completing any requested owner authorization.
7. Copy the **Web app URL**, which starts with `https://script.google.com/macros/s/` and ends with `/exec`. Do not use the `/dev` testing URL.
8. Open `site/form-config.js` from this ZIP and paste that URL between the empty quotes. Save:

   ```js
   window.REY_FORM_ENDPOINT = 'https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec';
   ```

Only you authorize the Google account. Visitors fill out the website form anonymously. The endpoint URL is public by design; never paste passwords, Google tokens or private API keys into the website.

## 2. Upload the website to GitHub

1. Keep a backup of your current GitHub website.
2. Open the repository that currently publishes your website. In the same publishing folder containing `index.html`, choose **Add file → Upload files**.
3. Upload the **contents of the `site` folder** — not the enclosing `site` folder, not this ZIP, and not `google-setup` or `qa`. Keep the `assets` directory structure intact.
4. Commit the changes. Keep your existing `CNAME` file, GitHub Pages domain settings and DNS unchanged.
5. Wait for the GitHub Pages deployment to complete, then reload your website. A hard refresh can help if old files are cached.

The new pages use `site.css`. Old `styles.css`, `refined.css`, `bilingual.css` and the original JPG/PNG assets may remain in your repository without being downloaded by these pages; deleting them is optional. Do not delete the PDFs or `assets/fonts`.

## 3. Verify before sharing

1. Open your deployed website in a private/incognito window while signed out of Google.
2. Open **Online Teaching → Request an assessment & consultation**. Fill in a clearly marked test enquiry, including a phone number and your email address, then submit. Wait for confirmation.
3. Check that the new row appears in your private Google Sheet and that its **Email notification** column becomes **Sent**. Check your Gmail inbox, All Mail and Spam for `Website enquiry` if necessary.
4. Repeat on the Persian page and check the Vellum House and Contact buttons. Test once on your phone.
5. You can label test rows in Notes or delete those test rows after verification. Do not rename the `Leads` tab or reorder the columns used by the script.

If you see a login screen or a Google permission error, review deployment access: **Anyone**, executing as **Me**. Open the /exec URL directly; it should show a small JSON status with `ready: true` without sign-in. A Google Workspace administrator can restrict anonymous deployment. Network access to Google services also needs to work for visitors.

If the form cannot confirm delivery, it keeps the same submission ID and allows a retry without creating a duplicate row. It preserves the submitted fields unchanged during an uncertain retry. You can also use the Telegram contact shown with the error.

## Lead tracker

Columns: received time, lead ID, status, enquiry type, name, email, phone, city/time zone, message, language, source page, email notification state, last email attempt, follow-up date and notes.

Use Status (`New`, `Contacted`, `Consultation booked`, `Won`, `Closed`), Follow-up date and Notes for your workflow. Replying to a notification addresses the visitor's email.

Submissions are saved before email is attempted. When sending fails or the daily email quota is used up, the row stays **Pending** and an hourly task retries it. Google currently lists 100 email recipients per day for consumer Apps Script accounts, shared with other scripts in the same account; this can change. The sheet can still receive enquiries while email is pending, up to this script's protective limit of 300 new leads per UTC day. Check the Sheet regularly, especially during campaigns.

The endpoint includes field validation, a hidden spam trap, basic per-email throttling, spreadsheet formula protection and submission deduplication. These are lightweight protections, not a CAPTCHA or a guarantee against automated abuse. If spam grows, add stronger bot protection. Lead contact details remain in your private Google account. There is no automatic lead deletion; retain or delete records according to your own enquiry policy. A crash immediately after sending but before marking a row Sent can rarely result in a repeated notification; the lead row itself remains deduplicated.

## Updates later

After changing `Code.gs`, use **Deploy → Manage deployments → Edit → New version → Deploy** to update the existing endpoint. Run `setup` again only if needed; it reuses the existing tracker and retry trigger. Do not create a new spreadsheet or change deployment URL unnecessarily.

## Performance and verification

The original three main images were 4,280,487 bytes. Their desktop replacements total 393,182 bytes (90.8% smaller); the mobile versions total 161,250 bytes (96.2% smaller), excluding the 3,409-byte favicon. Images are resized for their display sizes and compressed, so they are visually similar rather than byte-identical. The hidden hero-image element was removed, three CSS files were combined in their original order, and Google Fonts are discovered directly with preconnect instead of through a chained CSS import. Fonts and the Persian font remain the same. No third-party form widget loads with the page.

Local checks passed for JavaScript syntax, every local asset/link, all eight CTA replacements across both languages, unchanged PDFs, and mocked backend submission/validation/email failure/retry/deduplication. `qa/test-backend.cjs` can be run with Node from this package folder. No real email was sent in these checks. Browser visual testing, live Core Web Vitals and the actual anonymous Google integration still need the deployment checks above; no live speed score is claimed.

Official references:
- https://developers.google.com/apps-script/guides/web
- https://developers.google.com/apps-script/guides/content
- https://developers.google.com/apps-script/reference/mail/mail-app
- https://developers.google.com/apps-script/guides/services/quotas
