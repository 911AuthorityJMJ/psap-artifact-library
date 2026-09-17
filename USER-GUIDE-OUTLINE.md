# PSAP Artifact Library, User Guide: outline

Working outline for `USER-GUIDE.md`, at the project root. Not the guide itself. Review, cut, reorder, then we draft.

**Documents `origin/feature/artifact-persistence`, not `main`.** That branch is what is deployed on the production site behind a role gate for internal testing, so it is the behavior a reader will meet. It is two commits ahead of `main` and touches `src/app/HomeClient.tsx`, `src/components/ProfileSelector.tsx`, and a new `src/lib/asp-net.ts`. The guide describes the generally-available state, not the temporary internal-testing role gate. Confirmed: the Administrator / Manager restriction is for testing only, and at general availability the tool opens to anyone with an authenticated login to the site.

## Decisions this outline is built on

| Decision         | Setting                                                                                   |
| ---------------- | ----------------------------------------------------------------------------------------- |
| Home             | `USER-GUIDE.md` at the project root, one file, versioned with the code                    |
| Spine            | The PSAP walkthrough. Support, assessor, and admin material live as labeled appendices    |
| Sign-in          | Entry step only. How to get in the door, no ASP.NET internals                             |
| Artifact catalog | Summary tables only (tiers, domains, types, counts). Individual artifacts stay in the app |
| Upstream         | Where the Assessment Matrix comes from, and what the ratings mean                         |
| Downstream       | What to do with a file after it downloads                                                 |
| Screenshots      | `[SCREENSHOT: ...]` placeholders for now                                                  |
| Target branch    | `origin/feature/artifact-persistence`, the deployed state                                 |

## What the outline is grounded in

Read directly, this session: `src/app/page.tsx`, `src/app/layout.tsx`, `src/app/HomeClient.tsx`, `src/components/DocumentBuilder.tsx`, all three API routes, `src/lib/auth.ts`, `src/lib/rate-limit.ts`, `src/lib/templates.ts`, `src/lib/loop-limits.ts`, `next.config.ts`, `README.md`, `docs/LOOP-AND-TABLE-AUTHORING.md`, `docs/TABLE-LOOP-VERDICTS.md`, the text of `PSAP_Profile_Selector_OnePager.docx`, and the sheet structure of `Sample Assessment Matrix.xlsx`. On the target branch: the full `src/lib/asp-net.ts`, the full branch `ProfileSelector.tsx`, and the complete `HomeClient.tsx` diff.

Counts were computed from `src/data/*.json` and from the 200 template files with `node`, not recalled. Gate and dependency figures were checked against `Artifact_Development_Tracker.xlsx`.

---

# Part 1. Getting oriented

### 1.1 What this is, in one paragraph

The library turns a completed security assessment into a build list: which compliance documents your center is missing, what order to build them in, and a filled-in draft of each one. Written for a reader who has never heard the word "artifact" used this way.

### 1.2 What it is not

No sign-off workflow, no approval routing, no compliance score, no evidence repository. It produces drafts. Your center still owns review, approval, and adoption.

### 1.3 What comes back, and what does not

Still the most important early section, but the message has inverted since persistence landed. Two halves, and the reader has to hold both.

**Comes back.** Your assessment matrix and your nine profile answers are saved to your 911 Authority account. Close the panel, sign in tomorrow, open it again, and the app reloads your assessment and your profile for you. You do not re-upload. Saving is per user and automatic: uploading saves the file, and **Continue to Assessment** saves the profile.

**Does not come back.** A document you are part way through building. The Document Builder holds nothing: close it, or lose the session, and everything typed into it is gone. Finish a document and download it in one sitting.

The guide should say this as a rule of thumb: the app remembers what your center _is_, not what you were in the middle of writing.

### 1.4 What you need before you start

- A completed Assessment Matrix `.xlsx` from your 911 Authority posture assessment, the first time only
- An account on the 911 Authority site. Any authenticated login reaches the tool
- Word and Excel (or an equivalent that opens `.docx` and `.xlsx`)

"The first time only" is worth stating here rather than burying it: after the first upload the app already has your matrix.

### 1.5 How to open it

Sign in to the 911 Authority site, then **Tools -> PSAP Artifact Library**. It opens in a panel over the site. No separate password, no second sign-in. A pointer to Appendix B if the menu entry is not there.

`[SCREENSHOT: Tools menu with the PSAP Artifact Library entry]`

### 1.6 The three-screen tour

Setup, Assessment, Full Library, and how they relate. Assessment stays greyed out until an assessment is loaded, whether that is one you just uploaded or one restored from your account. Full Library works with no assessment at all.

`[SCREENSHOT: the top navigation, Assessment disabled]`

### 1.7 What you see when you open it

Two different first screens, and a reader needs to recognize which one they are on.

**Returning:** a brief "Loading your saved assessment" panel, then Setup showing a compact **Current assessment** bar with your filename and a **Replace Assessment Matrix** button, your center's details, and your profile answers already filled in.

**First time:** the dashed upload box, an empty profile, and nothing else.

`[SCREENSHOT: side by side, first-use upload box and returning Current assessment bar]`

---

# Part 2. The Assessment Matrix

### 2.1 Where your matrix comes from

It reaches you from 911 Authority as part of your deliverable package, once your assessment is complete. It is the workbook companion to your PSAP Security Practices Posture Assessment report, produced during the engagement and not by this app.

Say plainly what a center receives: access to the app, and its own completed matrix. There is nothing else to collect, no blank template to fill in first, and no copy of the matrix kept inside the app. Keep the file somewhere you can find it again, because every visit starts by uploading it.

### 2.2 What the app reads from it

Two sheets, and only two. The **PSAP Information** sheet supplies the center name, address, city and ZIP, director, phone, and email. The **Question Set** sheet supplies every rated question. The other sheets (scoring tables, charts) are ignored here.

Warning worth its own callout, and the simplest form of it is best: **upload the workbook as you received it.** The app reads contact details from fixed positions on the PSAP Information sheet, so inserting or deleting rows there pulls in the wrong values or blanks. There is no reason to edit the workbook; it arrives complete.

### 2.3 The six ratings, and what each one does

| Rating           | Treated as | Where it shows up                           |
| ---------------- | ---------- | ------------------------------------------- |
| `NO`             | Gap        | Assessment, Build Priority and By Question  |
| `IN PROGRESS`    | Gap        | Same. Started is not finished               |
| `PLANNED`        | Gap        | Same                                        |
| `UNKNOWN`        | Gap        | Same. If you do not know, assume it is open |
| `YES`            | Covered    | Reference tab only                          |
| `NOT APPLICABLE` | Covered    | Reference tab only                          |

Nothing else appears in a delivered workbook. Every question is rated before the matrix reaches you, and that column is validated during report production, so a blank or unrated cell is not a case the reader has to look for. No warning needed here.

For Appendix A only: the parser silently ignores any value outside these six, so a hand-edited workbook could quietly lose questions from every count. Support material, not user-facing advice.

### 2.4 What "198 questions" covers

13 domains, 51 categories, 198 questions, every one of which maps to at least one artifact. Domain list as a table.

### 2.5 Uploading it, the first time

Click the dashed panel, pick the `.xlsx`. Rules: `.xlsx` only, 250 KB maximum. The app checks the workbook before it keeps it, so a file it cannot read is never saved.

`[SCREENSHOT: upload panel, empty state]`

### 2.6 Replacing it later

Once an assessment is saved the dashed box is gone, replaced by a **Current assessment** bar naming your file, with a **Replace Assessment Matrix** button beside it. Use it after a reassessment, or after correcting the workbook in Excel.

The reassuring detail, and worth stating because it is not obvious: **a failed replacement changes nothing.** The new file is parsed first, and only a file that parses is saved. If it fails, your existing assessment stays exactly as it was, both on screen and in your account. Nobody loses a good matrix to a bad one.

`[SCREENSHOT: Current assessment bar with Replace button]`

### 2.7 When it fails

Message-by-message table (exact text, cause, what to do). There are now two distinct groups, and the guide should not blur them.

**Reading the workbook:** file too large, wrong file type, missing PSAP Information sheet, missing Question Set sheet, unreadable file, service unavailable.

**Saving it to your account:** a separate set with its own wording, including a "your work is kept" message on a server failure that tells you the copy on screen survived even though the save did not. Also the case worth its own line: the workbook parsed and displayed but did not save, so it will not be there tomorrow. A reader needs to know that combination exists and that the fix is simply to try the upload again.

---

# Part 3. Your PSAP profile

### 3.1 Why a profile exists

Your profile is not your dispatcher count. It is what your center can build and keep running. This section adapts `PSAP_Profile_Selector_OnePager.docx`, which already says this well and can be lifted almost whole.

Note for the draft: the one-pager's question wording differs from the shipped app in several places, and it carries a "Drafter's note" of its own. Reconcile against the app, since the app is what the reader is looking at.

### 3.2 Where to find it, and that you must complete it

It appears on the Setup screen once an assessment is loaded, below your center's details.

Two things the guide has to be blunt about. It is **not** calculated from your assessment; you answer the questions yourself. And **questions 1 through 7 are all required.** Every control starts on "Select…" with nothing chosen, and you cannot reach the Assessment screen until all seven are answered. Attempting it early outlines the missing controls in red and refuses to continue.

`[SCREENSHOT: PSAP Profile panel with two unanswered controls flagged]`

### 3.3 The three baseline questions

Who handles IT day to day, who owns cybersecurity tasks, what you can operate and keep running. Your baseline is the **lowest** of the three. Explain why the floor, not the average.

Until all three are answered the baseline banner says so rather than showing a value, which is a useful cue to describe: no baseline is assumed on your behalf.

### 3.4 The confirming and exception questions

FTE dispatchers, call-handling environment, governance in place today. Questions 5 and 6 can scale a domain **up** from the baseline. Nothing ever scales down.

Question 4 needs one honest sentence. It is required, and it changes nothing you will see. It records your size for the record; the profile is set by capability, not headcount. Better to say that outright than let a reader hunt for its effect.

### 3.5 The two flags

CJIS via IDACS, and structure (consolidated or multi-agency, co-located with another agency). Independent of size. Question 7 is required; the two structure checkboxes are not.

### 3.6 What the profile actually changes on screen

Honest and specific: it drives which worked example size you are offered, and it drives the scale badges (`↑ Technical`, `↑ Governance`, `Multi-agency`, `Co-located`, `CJIS`). It does not add or remove artifacts from your build list.

### 3.7 When your profile is saved, and what is stored

Saved by **Continue to Assessment**, which shows "Saving…" while it works. Not saved as you type, so leaving Setup by any other route loses unsaved changes.

What is stored is your nine answers, not the Small / Medium / Large result. The result is recalculated from your answers every time you open the app, so if the scoring rules are ever refined your profile follows automatically rather than freezing at an old verdict.

### 3.8 Changing it later

Return to Setup, change answers, press Continue again. Worth stating that a reassessment usually means revisiting this too, since capability is the thing most likely to have moved.

### 3.9 Worked example

The Wabash Valley Communications example from the one-pager, reused.

---

# Part 4. Reading your results

### 4.1 The Assessment screen header

What the summary line counts, and why the artifact number is smaller than the gap number: one artifact commonly closes several gaps.

### 4.2 Tiers and gates, and why order matters

The build order is the point. Six tiers, ordered so each one rests on the last.

Gates are what make the tier list a sequence rather than a grouping, and the concept appears nowhere in the app: no tooltip, no legend, no on-screen text. The guide has to teach it. Approved wording, from the artifact program:

> **Gate.** An artifact that must be reviewed, approved, and adopted before the work that follows it can be done correctly. A gate settles a decision the rest of the program inherits: what the agency owns, how data is classified, who may have access, how the network is laid out, how calls keep being answered when the CAD is down. Drafting past an open gate produces documents that have to be rewritten once the decision lands.

Three things make an artifact a gate: it settles a decision everything downstream inherits, it is the governance parent others must cite, or it is operationally load-bearing at go-live.

A gate is a **decision checkpoint, not a content link**. That distinction has to land, because the obvious reading (a gate is a document other documents are built from) is wrong and produces the wrong build order.

### 4.3 The two gate waves

Gates arrive in two waves, and the wave is better build guidance than tier order alone because it tells a center what to settle first. 10 first-wave gates, 4 second-wave. The guide presents the waves **alongside** tier order, not instead of it: tiers say what belongs together, waves say what has to be approved before the rest is worth drafting.

Nothing in the app shows the wave, so this is guide-only content. It also has to be written from the artifact program's own data rather than from anything the reader can see on screen, which means it needs to read as advice, not as a description of a screen.

One honest limit to state once: the app marks which artifacts are gates, but it does not show which artifact any document draws its content from. Within a tier, gate order is the only sequencing signal a reader gets.

### 4.4 Build Priority tab

The working list. Deduplicated, tier-ordered, gate artifacts first inside a tier. Each row: name, format badge, gate badge, scale badges, type, how many gaps it closes, and its actions.

`[SCREENSHOT: Build Priority, Tier 1 expanded]`

### 4.5 By Question tab

The audit trail. Same artifacts, grouped by domain and question, each with its rating. Rows expand to reveal actions. Use this to answer "why is this on my list."

`[SCREENSHOT: By Question, one domain]`

### 4.6 Reference tab

Questions you rated Yes or Not Applicable, and the artifacts behind them. Use it to check that what you believe is in place actually is. The **Also a gap** marker means an artifact you already have also answers an open question elsewhere, which usually means it needs extending rather than writing.

### 4.7 When there is nothing to show

Build Priority and By Question have no empty state. An assessment with zero gaps renders a blank area under the format key with no message. Reference does have copy for this case. Worth one line so a user does not think the app broke.

### 4.8 Badge glossary

One table, every badge in the app: `Document`, `Spreadsheet`, `Gate`, `Gap`, `Also a gap`, the six rating badges, and the five scale badges. This is the section people will actually come back to.

### 4.9 The three actions on a row

`↓ Download Template` (the blank master), `✦ Build Document` (Word artifacts only), `↓ Worked Example` (a filled specimen at your profile size). What each is for and when to reach for which.

---

# Part 5. Full Library

### 5.1 Browsing without an assessment

The library is open to anyone signed in, assessment or not. Useful for looking up one document.

One caveat, stated once: the scale badges here read from your saved profile. Complete your profile first and they are accurate. Browse before you have ever completed one and the app has nothing to read, so it shows the badges for a Small center.

### 5.2 Search and filter

Search matches artifact name and type. Not question text and not document contents, which is the expectation to set. Type filter lists all 16 types.

Artifact IDs are deliberately not part of this: they appear in no PSAP-facing document, so a reader never has one to search for. Nothing to explain.

### 5.3 What a library row offers

Same three actions, except the library offers **all three** worked example sizes rather than only your profile's.

### 5.4 Reading the library

163 artifacts. 100 are Word documents you can build in the app. 63 are Excel spreadsheets you download and fill in Excel. 16 are gate artifacts. Type breakdown as a table.

`[SCREENSHOT: Full Library with a type filter applied]`

---

# Part 6. Building a document

### 6.1 What Build Document does, and what it leaves you

**This has to be the first thing in Part 6, not a discovery at the end.** The name promises more than the tool delivers, and a reader who learns the limit only after downloading feels misled.

Build Document fills **discrete, named fields**: the agency name, a version, an effective date, an owner's role, a reviewer, a signing title. That is a real saving, because those values recur many times across a document and across the library.

It does not fill:

- **Tables.** Registers, matrices, findings lists, entitlement grids. You complete these in Word.
- **Bulleted and numbered lists.** Scope items, system lists, step sequences.
- **Most body text.** The substantive prose that makes the document yours rather than a template.
- **Bracketed prompts inside the prose**, such as "[Add Agency-specific systems.]" or an instruction to list your exclusions. These are genuine fill-ins that never appear as form fields.

So the honest framing, and the one the whole of Part 6 should carry: **the builder does the repetitive part; you write the substance.** A finished artifact is a Word document you completed, not a download you filed.

`[SCREENSHOT: side by side, a field the builder fills and a table it does not]`

### 6.2 Which artifacts can be built

Word only. Spreadsheets have no Build button by design; download and complete them in Excel. The format badge tells you before you click.

### 6.3 The builder window

Form on the left, live preview on the right. The preview is a readable rendering of the real template, not a Word preview: it shows where each answer lands. It is also the fastest way to see how much of the document is prose you will be writing.

`[SCREENSHOT: Document Builder, form and preview]`

### 6.4 Fields that fill themselves

Set expectations low and accurately. Exactly one field ever fills itself: **Agency Name**, in 93 of the 100 Word templates. It is marked "from your assessment." Version fields start at 1.0, which is a default, not a carry-over. Everything else you type. Director Email is wired for auto-fill but appears in no template, so it never surfaces.

### 6.5 Field types you will meet

Single-line text, multi-line text, date pickers, and suggestion lists. Important and easily missed: a suggestion list is a **suggestion**, not a restriction. You can type your own value over it.

_Outline note, not guide content:_ the builder also has a complete **+ Add row** interface for repeating table rows, and no template supports it. Zero of the 100 masters and zero of the 100 compiled forms contain a repeating-section marker. Cut from the guide, per decision 5.

### 6.6 Following your answers into the document

Clicking into a field highlights every place that value lands and scrolls the preview to the first. Genuinely useful, because a single answer often appears in five or six places, and it is how you tell two similarly labeled fields apart.

### 6.7 Limits and failures

Per-field length cap (5,000 characters, truncated silently) and the error messages the builder can show. **Decided: document as-is.** Unlike the upload screen, the builder surfaces raw server wording: a lapsed session shows the bare word `Unauthorized` with no instruction. The guide translates it for the reader and Appendix A carries the mapping.

Restate here, because this is where it costs the most: nothing in the builder is saved. A long document is a one-sitting job.

### 6.8 A template with nothing to fill

What the "no fillable fields" message means and what to do instead.

### 6.9 Downloading

The Download button generates and downloads the `.docx`, named like `A-002-CybersecurityPrivacyPolicy-COMPLETED.docx`. "COMPLETED" refers to the fields, not the document. It is the only copy; nothing is kept.

### 6.10 Finishing the document in Word

The second half of the job, and the section that decides whether a center ends up with a usable artifact or a filed template. Two kinds of work, both done in Word after download.

**Write what the builder could not.** The tables, lists, prose, and bracketed prompts from 6.1. This is the real work and the guide should not pretend otherwise.

**Delete what was written for the drafter.** I opened all 100 compiled templates. Every one carries content meant to come out before the document is published:

| What is in the file                  | In how many | What it says                                                                                            |
| ------------------------------------ | ----------- | ------------------------------------------------------------------------------------------------------- |
| A "How to use this template" box     | 100 of 100  | Labeled "delete this box before publishing"                                                             |
| A "Drafter's note" block             | 100 of 100  | Labeled "(internal, delete before publishing)". Internal working notes and unconfirmed cross-references |
| Guidance notes in `« »` marks        | 100 of 100  | Instructions to the drafter, meant to be deleted                                                        |
| Small / Medium / Large guidance rows | 98 of 100   | Keep the row for your profile, delete the other two                                                     |

This is by design. The templates are self-documenting, and the notes are the instructions for the human half of the work, which is exactly why they cannot be stripped automatically. Frame it as teaching, not as a defect. It still needs to be emphatic: a reader who files the output untouched puts internal drafting notes into a compliance record.

Ends with a printable checklist.

`[SCREENSHOT: a generated .docx open in Word, each element to remove marked]`

---

# Part 7. After the download

### 7.1 The app is not your document management system

It produced a draft. The draft is not adopted, approved, or evidence of anything until your center makes it so.

### 7.2 Reviewing what came out

Assumes 6.10 is done, so this is a review pass rather than a completion pass: auto-filled details, dates, named roles, and whether the prose you wrote actually describes your center. One line pointing back to the 6.10 checklist for anyone who skipped it.

### 7.3 Approving and adopting

Owner, approver, effective date, review cycle. Deliberately generic; this varies by center.

### 7.4 Classification, and what it obliges you to do

**Now in scope: the assessment report does not explain these, so the guide must.** Every artifact carries a minimum classification, one of Internal, Confidential, or Restricted, optionally with a `/ CJIS` overlay. Each one is a handling instruction, not a label.

Source material already exists and does not need inventing. The templates carry the rule in their own guidance notes ("Minimum for Policy artifacts. Your agency may raise this but not lower it. Append ' / CJIS' if CJIS-regulated data is in scope. Raise to Restricted if this policy embeds specific operational configuration or response logic."), and A-166 Document Handling Standard defines how each classification is stored, transmitted, and destroyed. The guide summarizes both and points at A-166 as the authority.

Covers: what each level means, the raise-never-lower rule, when the CJIS overlay applies, and what changes about storage, sharing, and disposal at each level.

### 7.5 Where to keep them

Naming, versioning, and access, applying the classification rules from 7.4.

### 7.6 Spreadsheet artifacts

The 63 Excel artifacts have no in-app path. Download, fill in Excel, store alongside the rest.

### 7.7 Coming back later

Your assessment and profile are waiting for you, so returning costs nothing: open it from Tools and pick up where the build list left off. This is the section that turns the app from a one-sitting tool into something a center works through over months.

What to do after a reassessment: use **Replace Assessment Matrix** with the new workbook, revisit the profile if your capability has moved, and watch the build list shrink. Keeping the old matrix somewhere is still worth advising, since the app stores one assessment per user and a replacement overwrites it.

Say plainly what the app does not do: it does not track which artifacts you have finished. The build list reflects your latest assessment, not your progress against it. Centers should keep their own record of what is drafted, approved, and adopted.

---

# Appendix A. Troubleshooting (support-facing)

Single consolidated table: what the user sees, exact message text, cause, first thing to try, when to escalate. Covers every user-visible failure across the page gate, upload, template load, and generation. Includes the two whole-page states (Authentication required, Artifact Library unavailable) and what each one means about the system rather than the user.

Plus: session expiry mid-work and what it costs, which is now only unsaved builder work rather than the whole session, and the fact that the browser Back button does not restore state.

Two additions the persistence work introduces:

- **Two different sessions can lapse.** The library's own features and the save-and-restore features authenticate separately, and they produce differently worded messages. A support person should recognize both and know the fix is the same: reopen from Tools.
- **Parsed but not saved.** An assessment can display correctly and still fail to save, in which case it will not be there next time. The message says the work on screen is kept, which is true for the current visit only. The remedy is to upload it again.

# Appendix B. For 911 Authority staff

Who can see the Tools entry, and what a user who cannot sees instead. What the two failure pages tell you to check. Session length, and the fact that two sessions can lapse independently. Explicitly not a runbook and not deployment documentation, both of which live elsewhere.

Note for whoever maintains this: while the tool is in internal testing the Tools entry is restricted to Administrator and Manager. That restriction lifts at general availability, so the appendix should not enshrine it.

# Appendix C. For assessors and consultants

How the assessment feeds the build plan. Using tier order and gate artifacts to sequence an engagement. Using the profile to set expectations about what a center can sustain. Using the Reference tab to test claimed coverage. How to hand a center off to the library without hand-holding.

# Appendix D. Reference tables

Domains (13). Tiers (6, with names and counts). Artifact types (16). Classifications (6). Ratings (6). Format split (100 Word, 63 Excel). Gate artifacts (16). All generated from `src/data/`, all easy to re-verify.

# Appendix E. Glossary

Artifact, gap, gate, tier, domain, category, profile, baseline, worked example, template, master, CJIS, IDACS, PSAP, ECC, NG911, ESInet.

---

## Open questions: all closed

| #   | Question                                                  | Answer                                                                                                                                                         |
| --- | --------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | What does "Gate" mean to a PSAP?                          | A decision checkpoint, not a content link. Glossary wording in 4.2, verified against the Tracker                                                               |
| 2   | Drafting-note boxes: strip or teach?                      | Teach. By design. Build Document does not address everything a template needs from a human. Section 6.7                                                        |
| 3   | Where does a PSAP get its matrix?                         | From 911 Authority, in the deliverable package after assessment. Section 2.1                                                                                   |
| 4   | Is `Sample Assessment Matrix.xlsx` usable as the example? | Yes                                                                                                                                                            |
| 5   | Growable tables                                           | Omitted. Section 6.5                                                                                                                                           |
| 6   | Raw `Unauthorized` in the builder                         | Document as-is; translate for the reader in Appendix A                                                                                                         |
| 7   | Classifications                                           | Explain them. The report does not. Now section 7.4                                                                                                             |
| 8   | Screenshots                                               | Premature. Outline stage only                                                                                                                                  |
| 9   | Gate waves                                                | Alongside tier order. Section 4.3                                                                                                                              |
| 10  | Tracker material reaching a PSAP                          | None. Readers get the app and their matrix. Mismatch table and `Depends On` cut                                                                                |
| 11  | Where the guide lives                                     | `USER-GUIDE.md` at the project root                                                                                                                            |
| 12  | Which code state does the guide describe?                 | `origin/feature/artifact-persistence`, deployed and role-gated for internal testing. Parts 1, 2, 3, 5 and 7 rebuilt against it                                 |
| 13  | Who can use it at go-live?                                | Anyone with an authenticated site login. The Administrator / Manager gate is testing-only and is not documented                                                |
| 14  | Unrated cells in the matrix                               | Cannot occur. You populate the workbook and validate the rating column during report production. User-facing warning removed; kept as a support note           |
| 15  | Searching by artifact ID                                  | Non-issue. IDs appear in no PSAP-facing document. Removed                                                                                                      |
| 16  | Scope of Build Document                                   | Fills discrete named fields only. Tables, lists, body text and inline bracketed prompts are the user's work in Word. Now stated in 6.1, not discovered at 6.10 |

## Things the guide cannot state until someone checks production

These came out of the sweep and are genuinely unanswerable from this repository. None blocks the outline; each blocks a specific sentence. Three items have come off: download from inside the modal is confirmed working, `X-Forwarded-For` is enabled on the production server, and rate limiting is closed as moot at the real audience size. The guide will describe limits generically rather than quoting a per-user number.

- **Session length.** "30 minutes" is asserted in `README.md` and `SECURITY.md`, but the lifetime is set on the ASP.NET side. This app only checks the token's own expiry. Confirm with the ASP.NET owner before printing a number.
- **Word and Excel versions.** No supported-version statement exists anywhere. The output is Office Open XML in Word 2013 compatibility mode. Whether Microsoft 365, Word Online, Google Docs, or LibreOffice are supported is a business decision nobody has recorded.
- **Browsers.** No browserslist, no polyfills, no stated matrix. The app relies on `fetch`, `Blob`, `<input type="date">`, and `<datalist>`, the last of which behaves inconsistently on mobile.
- **Are template downloads gated?** Templates and examples are static files under `public/` with no middleware in the repo. Anyone who knows a filename may be able to fetch a blank template without signing in. Probably harmless, but confirm before the guide or a support article describes the download links.
- **Direct navigation.** `README.md` calls Tools the normal entry point and "not" direct navigation, without saying direct navigation is unsupported. A bookmark with a live cookie would work. Decide what the guide tells people.

## Repository findings, not guide content

Two things surfaced while building this outline that belong to the code rather than the guide.

**Prose is stale on the target branch.** `origin/feature/artifact-persistence` changes three source files and no documentation. `CLAUDE.md` still lists upload persistence and saved assessments under "Not implemented" and still says uploads are processed in memory with no persistence; `README.md` still says the same. Both are false on the deployed branch. Flagging rather than fixing, since that is a code-side change and this task is documentation.

**The one-pager and the app disagree.** `PSAP_Profile_Selector_OnePager.docx` differs from the shipped profile wording in several places, describes question 4 as annotation-only when the app now requires it, and still carries its own internal "Drafter's note." If the one-pager is issued to PSAPs it needs reconciling against the app.

## Verification status of this outline

Every count and behavioral claim above was checked against the source, the template files, or the Tracker in this session, not taken from an agent. Branch behavior comes from reading `src/lib/asp-net.ts` and the branch `ProfileSelector.tsx` in full and the complete `HomeClient.tsx` diff. Nothing here was verified by running the app.

The parallel sweep that produced several early findings had 66 of 90 agents complete; 24 verification agents died on a session limit, leaving four surfaces mapped but unverified. I re-checked the four highest-impact claims from those surfaces by hand: zero loop markers in 200 files, the drafting boxes in 100 of 100, `{agencyName}` in 93 of 100, and `directorEmail` in none. All four held.
