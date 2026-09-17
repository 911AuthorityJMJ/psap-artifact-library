# PSAP Artifact Library: User Guide

The PSAP Artifact Library turns your completed security assessment into a working plan: which documents your center is missing, what order to build them in, and a head start on writing each one.

This guide covers everything a PSAP needs to use it. You do not need a security background to follow it.

If you are just getting started, the **Quick Start** covers the same path in five steps.

---

# Part 1. Getting oriented

## 1.1 What the Artifact Library is

Your security assessment identified gaps. Most of those gaps close the same way: your center needs a written policy, a documented procedure, a register, or a record that does not exist yet. Collectively those documents are called **artifacts**, and there are 163 of them in the library.

The Artifact Library connects the two. You give it your completed assessment matrix, and it tells you:

- **Which artifacts your center actually needs**, based on the questions you did not answer "Yes" to. You will not be handed all 163.
- **What order to build them in**, because some documents settle decisions the rest depend on. Writing them out of order means rewriting them.
- **A starting draft of each one**, either filled in through the site or downloaded as a template you complete yourself.

It is a planning tool and a drafting tool. The work of deciding what your center will actually do stays with your center.

## 1.2 What it is not

Being clear about the boundaries will save you time later.

It is **not a compliance score**. Your assessment report has your scoring. The library is about closing the gaps, not measuring them.

It is **not an approval system**. There is no sign-off, no routing, no review workflow. When a document is ready, your center adopts it through whatever process you already use.

It is **not a document repository**. Finished artifacts live wherever your center keeps its records. The library does not store them and cannot serve as your evidence file.

It does **not track your progress**. It shows what your latest assessment says you need. It does not know which ones you have finished. Keep your own record of what is drafted, approved, and adopted.

## 1.3 What the library remembers, and what it does not

The short version: **the library remembers what your center is. It does not remember what you were in the middle of writing.**

**Remembered, tied to your login.** Your assessment matrix and your PSAP profile answers are saved to your account. Upload your matrix once and it is there the next time you sign in, along with your profile and your build list. You never re-upload unless you want to replace it.

**Remembered for you, not for your center.** What the library saves belongs to your own login. Each person at your center who uses the library has their own saved matrix and their own profile, and a colleague opening it for the first time starts with nothing, even if you set everything up last week. If you hand this work to someone else, they upload the same matrix and answer the profile themselves.

**Not remembered.** A document you are part way through building. The document builder holds nothing between visits. If you close it, or your session ends while you are in it, everything you typed there is gone.

The practical rule: **start a document only when you have time to finish and download it.** Some are short. Some are not.

## 1.4 What you need before you start

- **Your completed assessment matrix**, the `.xlsx` workbook from your 911 Authority posture assessment. You need this the first time only.
- **Word and Excel**, or another program that opens `.docx` and `.xlsx` files.

## 1.5 Signing in, and your session

You reached this guide from the **Help** menu inside the library, so you are already signed in. Your 911 Authority site login carries through: no second sign-in, no separate password.

For the record, the library opens in a panel over the site, from **Tools**, then **PSAP Artifact Library**.

**A note on time.** Your session lasts a limited time and does not renew while you work. If you have been idle a while and something stops working, close the panel and reopen it from **Tools**. That gives you a fresh session. It is the fix for almost every "it stopped responding" moment in this guide.

## 1.6 The three screens

Everything in the library lives under three tabs across the top.

| Tab              | What it is for                                                                                               |
| ---------------- | ------------------------------------------------------------------------------------------------------------ |
| **Setup**        | Your assessment matrix and your PSAP profile. Where you start, and where you come back to change either one. |
| **Assessment**   | Your results. Which artifacts your center needs, in what order, and why each one is on the list.             |
| **Full Library** | All 163 artifacts, searchable. Available whether or not you have an assessment loaded.                       |

**Assessment** stays greyed out until an assessment is loaded, whether you just uploaded it or the library restored it for you. **Full Library** is always available, so you can look up a single document any time without going through Setup.

A fourth item, **Help**, holds this guide alongside the quick start and the quick reference. It is where you are now.

`[SCREENSHOT: the three tabs, Assessment greyed out]`

## 1.7 What you will see when you open it

You will land on one of two versions of the Setup screen. Which one tells you where you are.

**The first time**, you get a large dashed panel inviting you to upload your assessment matrix, and nothing else. Nothing is set up yet. Go to Part 2.

**Every time after**, the library briefly shows _Loading your saved assessment_, then Setup appears already populated: a compact bar naming your saved matrix with a **Replace Assessment Matrix** button beside it, your center's contact details, and your profile answers as you left them. Your build list is ready under the **Assessment** tab.

`[SCREENSHOT: first-use upload panel and returning Current assessment bar, side by side]`

If you expected the second and got the first, your session may have ended. Close the panel, reopen it from **Tools**, and check again before uploading anything.

---

# Part 2. Your assessment matrix

## 2.1 Where the matrix comes from

The assessment matrix is the `.xlsx` workbook that accompanies your PSAP Security Practices Posture Assessment report. It arrives from 911 Authority as part of your deliverable package once your assessment is complete.

You do not create it, and there is no blank version to fill in. It reaches you already rated, one row per assessment item, and the library reads it as delivered.

Your deliverable package contains six files. The matrix is the only one the library uses.

## 2.2 What the library reads from it

The workbook has several sheets. The library reads two.

**PSAP Information** supplies your center's details: the PSAP name, address, city and ZIP, and the director's name, phone, and email. These appear on the Setup screen and carry into documents you build.

**Question Set** supplies every assessment item: its ID, the domain and category it sits under, and its rating.

The scoring tables and charts are for your report. The library ignores them.

> **Upload the workbook as you received it.** The library reads your contact details from fixed positions on the PSAP Information sheet, so inserting or deleting rows there will pull in the wrong values or leave them blank. There is no reason to edit the workbook before uploading, and good reason not to.

## 2.3 The ratings, and what each one means here

Your assessment used six ratings. The library sorts them into two groups.

| Rating             | The library treats it as | Where it appears  |
| ------------------ | ------------------------ | ----------------- |
| **No**             | A gap                    | Your build list   |
| **In Progress**    | A gap                    | Your build list   |
| **Planned**        | A gap                    | Your build list   |
| **Unknown**        | A gap                    | Your build list   |
| **Yes**            | Covered                  | The Reference tab |
| **Not Applicable** | Covered                  | The Reference tab |

Two of these surprise people, so they are worth stating plainly.

**In Progress counts as a gap.** Work that has started is not work that is finished, and an artifact that is half written is not one you can produce for an auditor. The library still shows the rating on each item, so you can tell a job nearly done from one not started.

**Unknown counts as a gap.** If nobody could confirm a control is in place, the safe assumption is that it is not. If it turns out you do have the document, you have lost nothing but the time it takes to confirm it.

**Yes and Not Applicable are not gaps**, but the artifacts behind them are still worth seeing. That is what the Reference tab is for, covered in Part 4.

## 2.4 What the 198 questions cover

The assessment asks 198 questions, grouped into 51 categories across 13 domains. Every question maps to at least one artifact, which is how the library knows what to put on your list.

The 13 domains, in the order you will see them:

1. Governance, Risk & Strategy
2. Identity, Authentication & Access Management
3. Data Security & Lifecycle Management
4. Network & Communications Governance
5. Endpoint Security & Configuration Management
6. Cryptography, Encryption & Key Management Governance
7. Logging, Monitoring & Event Detection
8. Response, Recovery, & Forensic Readiness
9. Business Continuity & Environmental Resilience
10. Physical & Environmental Security Management
11. Third-Party Security & Supply Chain Management
12. Assessment, Testing, & Remediation Management
13. Training, Awareness & Behavioral Governance

You will see these names again as headings on the **By Question** tab.

## 2.5 Uploading it, the first time

On the Setup screen, click anywhere in the dashed panel and choose your matrix.

The library accepts `.xlsx` files up to 250 KB. A matrix runs well under that, so the limit is unlikely to trouble you.

`[SCREENSHOT: the Setup screen with the upload panel]`

Uploading takes a moment. The library reads the workbook first and only saves it if it can read it, so a file it rejects is never stored. When it succeeds, three things appear: your center's details, the **PSAP Profile** questions, and a **Continue to Assessment** button.

Your matrix is now saved to your own login. You will not upload it again unless you choose to. Anyone else at your center who uses the library uploads their own copy.

Go to Part 3 to complete your profile.

## 2.6 Replacing it later

Once a matrix is saved, the dashed panel is replaced by a compact bar showing the file you have stored, with a **Replace Assessment Matrix** button beside it.

`[SCREENSHOT: the Current assessment bar with the Replace button]`

Use it when your center is reassessed, or if you were sent a corrected workbook. The new file takes the place of the old one. Each person stores one matrix, so replacing yours does not change anyone else's: after a reassessment, everyone at your center who uses the library replaces their own, or they go on working from the old results.

**A failed replacement costs you nothing.** The library reads the new workbook before it keeps it. If the new file cannot be read, you get an explanation and your existing assessment stays exactly as it was, both on screen and in your account. You cannot lose a good matrix by trying a bad one.

## 2.7 If something goes wrong

Most problems here fall into three groups: the file, the session, or the connection.

| What you see                    | What it means                                                    | What to do                                                                                       |
| ------------------------------- | ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| The file is too large           | The workbook is over 250 KB                                      | Confirm you are uploading the matrix you were sent, not a workbook you have added to             |
| Only `.xlsx` files are accepted | The file is not an Excel workbook, or is an older `.xls`         | Upload the `.xlsx` you were sent                                                                 |
| A sheet was not found           | The workbook is missing **PSAP Information** or **Question Set** | You are uploading the wrong workbook, or the sheets have been renamed. Use the file as delivered |
| The file could not be read      | The workbook is damaged                                          | Request a fresh copy                                                                             |
| Your session has expired        | You have been signed in a while                                  | Close the panel and reopen it from **Tools**                                                     |
| Temporarily unavailable         | A problem on the server, not with your file                      | Try again shortly. If it persists, contact 911 Authority                                         |
| Could not reach the server      | A network problem between you and the site                       | Check your connection and try again                                                              |
| Too many requests               | An unusual number of uploads in a short time                     | Wait a minute and try again                                                                      |

One case deserves its own note. If your matrix appears on screen correctly but you see a message that it **could not be saved**, the message will tell you your work is kept. That is true for the visit you are in, and not beyond it: the assessment is displayed but not stored, so it will not be waiting for you next time. Upload it again before you finish, or repeat the upload on your next visit.

---

# Part 3. Your PSAP profile

## 3.1 Why the library asks

Two centers with the same gaps are not always in the same position to close them. A five-seat center with no dedicated IT and a five-seat center backed by a strong county IT department will produce very different documents, and asking both for the same thing helps neither.

So before it shows you results, the library asks nine questions about what your center can build and keep running. That is your **profile**.

The principle behind it is worth understanding, because it is not the obvious one:

> **Your profile is not your size. It is your capability.** Headcount is a clue, not the answer.

A control you cannot maintain is not a control. So the profile is set by what your center can actually sustain, and it is set by your **weakest** answer rather than your average. Where you are stronger in a particular area, the library scales that area up. It never scales anything down. Under-protection hides in averages, which is exactly why the library does not use one.

## 3.2 Finding it, and finishing it

The profile appears on the **Setup** screen once an assessment is loaded, below your center's details, under the heading **PSAP Profile**.

`[SCREENSHOT: the PSAP Profile panel, freshly loaded with nothing selected]`

Two things to know before you start.

**You answer it yourself.** The library does not work your profile out from your assessment. Your assessment says what is missing; the profile says what you are able to build. They are different questions and the second one needs you.

**Questions 1 through 7 are all required.** Every dropdown starts empty, showing _Select…_, and nothing is chosen on your behalf. You cannot move on to your results until all seven are answered. If you try, the library outlines the unanswered questions in red and tells you what is missing.

Question 8 is a pair of checkboxes and is optional. Leave both unticked if neither applies.

## 3.3 Questions 1 to 3: your baseline

These three set your profile. Answer them honestly rather than aspirationally.

**1. Who handles IT day to day?**

| Answer                             | Reads as |
| ---------------------------------- | -------- |
| Vendor-managed, or no dedicated IT | Small    |
| Shared county or city IT           | Medium   |
| IT staff dedicated to the PSAP     | Large    |

**2. Who owns cybersecurity tasks?**

| Answer                   | Reads as |
| ------------------------ | -------- |
| No one formally assigned | Small    |
| Part-time or shared duty | Medium   |
| A named, dedicated role  | Large    |

**3. What can you operate and keep running?**

| Answer                                          | Reads as |
| ----------------------------------------------- | -------- |
| Manual: checklists, spreadsheets                | Small    |
| Some tooling: endpoint protection, logging, MFA | Medium   |
| Centralized: SIEM, MDM, monitoring              | Large    |

**Your baseline is the lowest of the three.** Two Larges and a Small make a Small profile, not a Medium one. The reasoning is the same as before: the thing you cannot sustain is the thing that will fail, and building to a level you cannot maintain produces documents that go stale and controls that quietly stop working.

Once all three are answered, the panel shows your baseline. Until then it tells you it is waiting on questions 1 to 3, so you are never given a profile you did not choose.

## 3.4 Questions 4 to 6: confirming and scaling up

**4. Full-time-equivalent dispatchers?** Choose 1 to 5, 6 to 25, or 25 and above.

This one is required, and it changes nothing you will see. It records your size alongside your capability. Answer it and move on; your profile is decided by questions 1 to 3.

**5. Call-handling environment?**

| Answer                                       | Reads as |
| -------------------------------------------- | -------- |
| Single CAD and ESInet, single carrier        | Small    |
| Some redundancy, mixed cloud and on-premises | Medium   |
| Full NG911, multiple integrations            | Large    |

**6. Governance in place today?**

| Answer                              | Reads as |
| ----------------------------------- | -------- |
| Few or no written policies          | Small    |
| Some, inconsistently maintained     | Medium   |
| A maintained set with review cycles | Large    |

Questions 5 and 6 can raise a specific area above your baseline, and only upward. A center running Small overall but with a genuinely more complex call-handling environment builds its technical artifacts at the higher level without pretending to be Medium everywhere else. If either answer sits below your baseline, nothing changes: you still start at the baseline, and the shortfall is a gap to close rather than a reason to aim lower.

## 3.5 Questions 7 and 8: the two flags

These are independent of size. A Small center and a Large center can both carry them.

**7. Do you access CJIS data through IDACS?** Required. If yes, artifacts that touch that data are marked, and their handling requirements change. Part 7 covers what that means in practice.

**8. Structure.** Tick either, both, or neither.

- **Consolidated or multi-agency.** Raises the profile on inter-agency agreements and the documents that govern shared responsibility.
- **Co-located with another agency.** Raises the profile on physical security and shared-space artifacts.

## 3.6 What your profile changes

Your profile affects two things, and it is worth being precise about both so you are not looking for effects that are not there.

**Which worked example you are offered.** Most artifacts ship with a filled-in example at Small, Medium, and Large. On your results screens you are offered the one matching your profile, so the example you see is scaled to a center like yours. The Full Library offers all three if you want to compare.

**The markers on each artifact.** Where your profile has scaled something up, or where a flag applies, the artifact carries a small badge saying so: a technical or governance marker with its level, a multi-agency or co-located marker, or a CJIS marker. These appear on the **Build Priority** tab and in the **Full Library**.

Your profile does **not** change which artifacts are on your list. That comes from your assessment. The profile changes how you should build them, not whether you need them.

## 3.7 Saving it

Your profile is saved when you press **Continue to Assessment**. The button shows that it is saving, then takes you to your results.

It is not saved as you type. If you leave the Setup screen another way, unsaved changes are lost.

Your profile is yours alone, like your matrix. If several people at your center use the library, agree the answers between you and have each person enter the same ones. Otherwise two colleagues looking at the same artifact will see different markers and be offered different worked examples.

What the library stores is your nine answers, not the Small, Medium, or Large verdict. Your profile is recalculated from your answers every time you open the library, so the result always reflects the current guidance rather than a conclusion frozen at the moment you first answered.

## 3.8 Changing it later

Return to **Setup** at any time, change any answer, and press **Continue to Assessment** again to save.

Worth doing after a reassessment. Capability is the thing most likely to have moved: a new hire, a security coordinator appointed, monitoring tooling brought in. If your center has grown into a higher baseline, the library should know.

## 3.9 A worked example

**Wabash Valley Communications** is a fictional consolidated center serving two counties. Fourteen dispatchers across two shifts. IT is handled by a shared three-person county team. A supervisor covers security duties part-time alongside her other work. Call handling runs dual CAD and ESInet redundancy across a mix of cloud and on-premises systems. Policies exist and are maintained, though informally. The center accesses CJIS data through IDACS.

| Question                 | Their answer                 | Reads as |
| ------------------------ | ---------------------------- | -------- |
| 1. IT support            | Shared county IT             | Medium   |
| 2. Security ownership    | Part-time coordinator        | Medium   |
| 3. What they can sustain | Some tooling, maintained     | Medium   |
| 4. Dispatchers           | 14                           | 6 to 25  |
| 5. Call handling         | Dual redundancy, mixed cloud | Medium   |
| 6. Governance            | Maintained but informal      | Medium   |
| 7. CJIS via IDACS        | Yes                          | Flag     |
| 8. Structure             | Consolidated, multi-agency   | Flag     |

**Result: a Medium baseline**, set by questions 1 to 3, which all read Medium. Questions 5 and 6 also read Medium, so nothing scales above the baseline. Two flags fire. The consolidated flag raises the profile on their inter-agency agreements. The CJIS flag marks every artifact that touches IDACS data.

Now change one thing. Suppose the same center had pushed ahead to full NG911 with several integrations while its staffing stayed where it is. Question 5 would read Large while the baseline stayed Medium, and their network, encryption, logging, and configuration artifacts would be marked to build at the higher level. Everything else would stay Medium.

That gap is the whole point of scaling by area. It is common, it is not a failing, and the library is built to handle it rather than force you to pick one label for the entire center.

---

# Part 4. Reading your results

## 4.1 What the Assessment screen tells you

The **Assessment** tab opens on a summary line: how many questions were rated as gaps, how many artifacts address them, and how many artifacts exist in the library altogether.

The first two numbers will not match, and that is the point. A single well-written policy can answer several assessment questions at once, so the artifact count is almost always the smaller of the two. **That difference is the first piece of good news the library gives you.** A list of ninety gaps becomes a list of perhaps forty documents.

Below the summary are three tabs: **Build Priority**, **By Question**, and **Reference**. They show the same findings arranged for three different jobs.

`[SCREENSHOT: the Assessment screen with the summary line and three tabs]`

## 4.2 Tiers, and why the order matters

Your artifacts are grouped into six tiers. The tiers are a sequence, not categories: each one rests on the work of the one before it.

| Tier | Name                                      | What it settles                                                  |
| ---- | ----------------------------------------- | ---------------------------------------------------------------- |
| 1    | Governance, Risk & Strategy               | Who is responsible, what you own, what your risks are            |
| 2    | Data, Access & Physical Foundation        | Who may reach what, and how your data and premises are protected |
| 3    | Operational Planning & Technical Baseline | How you will operate, respond, and keep answering calls          |
| 4    | Technical Implementation                  | How the controls are actually configured                         |
| 5    | Advanced Monitoring & Response            | How you detect, investigate, and recover                         |
| 6    | Continuous Validation                     | How you confirm all of it still works                            |

The order is not arbitrary. You cannot write a meaningful backup policy before you know which systems matter, and you cannot rank which systems matter before you have an inventory. Working out of sequence usually means writing a document twice.

## 4.3 Gates

Some artifacts carry a **Gate** marker. These deserve more attention than the badge suggests.

> **A gate is an artifact that must be reviewed, approved, and adopted before the work that follows it can be done correctly.** A gate settles a decision the rest of your program inherits: what your agency owns, how your data is classified, who may have access, how your network is laid out, how calls keep being answered when the CAD is down.

Drafting past an open gate produces documents you will have to rewrite once the decision lands. Sixteen of the 163 artifacts are gates, and they sort to the top of their tier for that reason.

A gate is a **decision checkpoint, not a source document others quote**: a point where your program should pause, get something approved, and only then carry on.

## 4.4 The gate waves

Fourteen of the sixteen gates fall into two waves. Use them alongside the tier order: the tiers tell you what belongs together, the waves tell you what has to be settled before the rest is worth drafting.

**First wave.** Settle these before serious drafting begins.

- Cybersecurity & Privacy Policy
- Master Asset Inventory
- Asset Criticality Ranking Matrix
- Data Classification Policy
- Risk Register
- Incident Response Plan
- Backup Call-Handling / Dispatch Continuity Procedure
- Continuity of Operations Plan
- Access Control Policy
- Document Handling Standard

**Second wave.** Settle these before the technical documentation that depends on them.

- Network Architecture Diagram
- Encryption Policy
- Logging Policy
- Change Management Policy

Two more artifacts are gates without sitting in either wave, because they gate adoption rather than drafting: the **IT Support Accountability Agreement** and the **Acceptable Use Policy**. Nothing is waiting on them to be written, but your program is not genuinely in place until both are signed.

Notice that the waves cut across the tiers. The Document Handling Standard sits in Tier 4 and is a first-wave gate; the Logging Policy sits in Tier 1 and is second wave. That is deliberate, and it is why both views are worth having.

## 4.5 Build Priority: your working list

This is the tab to work from. It takes every artifact your gaps point to, removes the duplicates, and puts them in build order: by tier, with gates first inside each tier.

Each row shows the artifact name, whether it is a Word document or a spreadsheet, any markers that apply, its type, and how many of your gaps it closes.

That last number is worth watching. An artifact closing six gaps earns its place ahead of one closing a single gap, all else being equal.

`[SCREENSHOT: the Build Priority tab, Tier 1 expanded]`

## 4.6 By Question: why something is on your list

The same artifacts, arranged by assessment question instead of by build order, grouped under the 13 domains with each question's rating beside it.

Use this tab when you want to answer "why is this on my list?" or when you are working through a single domain with a particular person. Click an artifact name to reveal what you can do with it.

This is also the view to bring to a conversation with leadership, because it connects each document back to the assessment finding that calls for it.

`[SCREENSHOT: the By Question tab, one domain expanded]`

## 4.7 Reference: what you already have

Questions you rated **Yes** or **Not Applicable**, and the artifacts behind them.

These are not gaps. The tab exists for two reasons. It lets you confirm that what you believe is in place genuinely is, which is worth doing before an assessor asks. And it flags overlap: where an artifact you already hold also answers an open gap elsewhere, it is marked **Also a gap**.

That marker usually means you do not need to write a new document. You need to extend the one you already have.

## 4.8 What the markers mean

| Marker                       | Where it appears             | What it tells you                                                                  |
| ---------------------------- | ---------------------------- | ---------------------------------------------------------------------------------- |
| **Document**                 | Everywhere                   | A Word file. You can fill it in on the site, or download the blank template        |
| **Spreadsheet**              | Everywhere                   | An Excel file. Download it and complete it in Excel                                |
| **Gate**                     | Everywhere                   | A decision checkpoint. Approve and adopt this before the work that follows it      |
| **Gap**                      | Full Library                 | This artifact addresses one of your open gaps                                      |
| **Also a gap**               | Reference tab                | You have this already, and it also answers an open gap. Extend rather than rewrite |
| **CJIS**                     | Build Priority, Full Library | This artifact touches CJIS data. Stricter handling applies                         |
| **Technical**, with a level  | Build Priority, Full Library | Your call-handling environment scales this artifact above your baseline            |
| **Governance**, with a level | Build Priority, Full Library | Your governance maturity scales this artifact above your baseline                  |
| **Multi-agency**             | Build Priority, Full Library | Applies because you are consolidated or multi-agency                               |
| **Co-located**               | Build Priority, Full Library | Applies because you share space with another agency                                |

On the **By Question** and **Reference** tabs, each question also carries its rating, so you can see at a glance which gaps are untouched and which are already moving.

## 4.9 What you can do with an artifact

Every artifact offers up to three actions. On **Build Priority** they are on the row; on **By Question** and **Reference**, click the artifact name to reveal them.

**Download Template.** The blank document, with its guidance notes intact. Use it when you would rather work in Word from the start, or when you want to read the whole thing before filling anything in.

**Build Document.** Fill the template in on the site, with a live preview, then download the result. Word documents only; spreadsheets do not offer it. Part 6 covers this in full.

**Worked Example.** A completed specimen for a center like yours, at your profile size. The single most useful thing here if you have never written the document before: it shows you the level of detail expected, in a form you can read in five minutes.

Not every artifact offers all three, and the markers on the row tell you which to expect before you click.

---

# Part 5. The Full Library

## 5.1 What it is for

**Full Library** shows all 163 artifacts, whether or not you have an assessment loaded. Your build list is the shorter, prioritised view; this is everything.

Three good reasons to come here:

- **To look one document up.** You have been asked for a visitor log or a change request form and you want it now, without going through your results.
- **To see what is coming.** Your build list covers your current gaps. The library shows what a complete program looks like.
- **To compare worked examples.** Your results offer the example matching your profile. The library offers all three sizes, which is the easiest way to see how much the expected detail changes between a Small and a Large center.

If you have an assessment loaded, artifacts that address one of your gaps carry a **Gap** marker here, so you can tell your priorities from the rest at a glance.

`[SCREENSHOT: the Full Library with a type filter applied]`

## 5.2 Searching and filtering

A search box and a type filter sit above the list.

**Search** matches artifact names and types. It does not search assessment questions, and it does not search inside the documents. Searching "backup" finds artifacts with backup in the name, not every document that mentions backups.

**Filter by type** narrows the list to one of the 16 artifact types. Combine it with a search to work through a category methodically.

The count above the list tells you how many artifacts match what you have entered.

## 5.3 What each row offers

The same three actions described in section 4.9: **Download Template**, **Build Document** for Word artifacts, and **Worked Example**.

One difference from your results screens. Here you are offered the worked example at **all three sizes**, Small, Medium, and Large, rather than only the one matching your profile.

One thing to know if you arrive here before completing your profile: the scaling markers read from your saved profile, so until you have one the library shows the markers for a Small center. Complete your profile in Setup and they will reflect your own.

## 5.4 What is in the library

163 artifacts across 16 types. The type tells you the format, with no exceptions:

**Five types are spreadsheets**, completed in Excel:

| Type                 | Count |
| -------------------- | ----- |
| Log / Record         | 30    |
| Inventory / Register | 20    |
| Reference Matrix     | 6     |
| Schedule             | 6     |
| Financial Ledger     | 1     |

**Eleven types are Word documents**, which you can fill in on the site:

| Type                  | Count |
| --------------------- | ----- |
| Policy                | 27    |
| Procedure             | 20    |
| Configuration Record  | 14    |
| Report / Assessment   | 8     |
| Agreement / Form      | 7     |
| Checklist             | 6     |
| Standard              | 6     |
| Plan                  | 5     |
| Architecture / Design | 4     |
| Meeting Minutes       | 2     |
| Training Material     | 1     |

That comes to 63 spreadsheets and 100 Word documents. The split is a useful thing to know when you plan the work: the spreadsheets are registers and logs your center fills in and keeps current, while the Word documents are the policies, procedures, and plans that need drafting and approval.

Every artifact in the library has a template, and every one has worked examples at all three profile sizes. You will never find an artifact on your list with nothing behind it.

---

# Part 6. Building a document

## 6.1 What Build Document does, and what it leaves you

Read this before you use the builder for the first time. The name promises a finished document, and what you get is a strong draft.

Here is the honest division of labour on a typical artifact.

**The template already contains the document.** The policy language, the procedure steps, the section structure, the regulatory references: those are written. You are not starting from an empty page, and most of what you read in the finished file is text you will keep as it stands.

**The builder fills the recurring details.** Around twenty per document: your agency name, a version, an effective date, a review date, an owner's role, a reviewer, a signing title. These appear over and over throughout a document, and typing them once instead of twenty times is the saving the builder exists to provide.

**You supply what only your center knows.** Entries in the registers and matrices, a small number of bracketed prompts inside the prose such as _[Add Agency-specific systems.]_, and anything specific to how your center actually operates. Most documents have only one or two of these prompts; a few have a dozen.

**You remove the drafting guidance.** Every template carries notes written to help whoever fills it in, and those come out before you publish. Section 6.10 covers exactly what to look for.

So the shape of the job is this:

> **The builder handles the repetition. The template handles the language. You handle the specifics, then clean up.**

The one thing the builder will not do is fill in a table for you. If an artifact is a register, a matrix, or a log, expect to complete it in Word after downloading.

`[SCREENSHOT: the builder form beside the preview, showing a filled field and an empty table]`

## 6.2 Which artifacts can be built

Word documents only, which is 100 of the 163 artifacts.

The 63 spreadsheets have no **Build Document** action, by design: a register is filled in Excel, where you can sort it, filter it, and keep adding to it. Download the template and work in Excel.

The marker on every row tells you which you are looking at before you click.

## 6.3 The builder window

**Build Document** opens a window with the form on the left and a live preview on the right.

The preview is a readable rendering of the actual template. As you type, your answers appear in place. Fields you have not filled show their name in brackets, so you can see at a glance how much is still outstanding.

It is also the fastest way to size up a document before committing to it. Scroll the preview and you will see how long it is, how many tables it has, and how much of it is already written.

On a narrow screen the preview is hidden and only the form is shown. Use a laptop or desktop for this part if you can.

## 6.4 Fields that fill themselves

One field fills itself: your **agency name**, taken from your assessment matrix. It is marked _from your assessment_ so you know where it came from. It appears in 93 of the 100 Word templates.

Version fields start at **1.0**. That is a sensible default for a document your center is adopting for the first time, not a value carried from anywhere. Change it if you are revising something you already have.

Everything else you enter yourself.

## 6.5 The kinds of field you will meet

**Single-line text** for names, titles, and short values.

**Multi-line text** for anything longer.

**Dates**, with a date picker.

**Suggestion lists**, where a dropdown offers common answers. These are **suggestions, not restrictions**. Pick one if it fits, or type your own value over it. If your center uses different terminology, use your own.

Where a document uses the same kind of value in several places, the fields are numbered to tell them apart, for example a second and third effective date. If you are unsure which is which, click into the field and watch the preview: it will show you exactly where that value lands.

## 6.6 Seeing where your answers go

Click into any field and the preview highlights every place that value appears, then scrolls to the first one.

This is more useful than it sounds. A single answer often lands in five or six places across a document, and this is how you confirm that an owner's role or a review date is going where you expect. It is also the quickest way to understand a document you did not write.

## 6.7 Limits, and things that can interrupt you

**Nothing in the builder is saved.** This is the one real trap in the library. Close the window, lose your connection, or let your session lapse, and everything you have typed is gone. There is no draft and no recovery.

So: **start a document when you have time to finish and download it.** If you are interrupted and have to leave, download what you have. A partly complete document you can reopen in Word beats an empty one you have to start again.

If your session ends while you are in the builder, you may see a short technical message such as _Unauthorized_. It means your session expired, nothing more. Close the panel, reopen the library from **Tools**, and start the document again.

Individual fields hold up to 5,000 characters, which is far more than any of them need. If you find yourself pasting several pages into one field, it probably belongs in an appendix rather than in that slot.

## 6.8 If a template has nothing to fill

A few templates offer no fillable fields. The builder will tell you so and point you to the download instead.

Nothing is wrong. That artifact is simply one you complete entirely in Word.

## 6.9 Downloading

Press **Download**. The library generates the document and your browser saves it, named after the artifact with **COMPLETED** on the end.

Two things about that name. **COMPLETED** refers to the fields, not the document: the file still needs the work in 6.10. And this is your only copy, because the library does not keep one. Save it somewhere your center will find it again.

## 6.10 Finishing the document in Word

Open the file. Two jobs remain, and both matter.

**First, add what only you can.** Complete the registers and matrices, answer any bracketed prompts left in the prose, and add anything specific to your center. This is the substance the template cannot supply.

**Second, remove the drafting guidance.** Every template carries material written for whoever fills it in, and none of it belongs in a published document:

| What to look for                               | What it is                                                                                |
| ---------------------------------------------- | ----------------------------------------------------------------------------------------- |
| A box headed **How to use this template**      | Instructions for filling the document in. It tells you to delete it                       |
| A block headed **Drafter's note**              | Internal notes for whoever prepares the artifact. Marked internal, and it must not remain |
| Notes between `«` and `»` marks                | Guidance on what to write in that spot. Typically eight or so per document                |
| Rows offering Small, Medium, and Large options | Guidance tables. Keep the row matching your profile, delete the other two                 |

**Checklist before you publish**

- [ ] Every register, matrix, and table completed or marked as deliberately empty
- [ ] Every bracketed prompt answered or removed
- [ ] The **How to use this template** box deleted
- [ ] The **Drafter's note** block deleted
- [ ] Every `« »` guidance note deleted
- [ ] Small / Medium / Large guidance rows reduced to your own
- [ ] Version, dates, and named roles checked
- [ ] The classification line correct for your center, see Part 7

This last step is not optional housekeeping. A document filed with its drafter's notes intact puts internal working material into your compliance record, where an auditor will read it.

`[SCREENSHOT: a generated document open in Word, with each element to remove marked]`

---

# Part 7. After the download

## 7.1 What you have, and what you do not

You have a draft. A good one, but a draft.

A document becomes an artifact when your center has reviewed it, approved it, adopted it, and knows where it lives. Until then it is a file in your downloads folder, and it will not satisfy an assessor, an auditor, or a grant condition.

The library has no part in that step. It cannot approve anything, does not know what you have adopted, and keeps no copy. Everything from here is your center's process.

## 7.2 Reviewing it

Assuming you have finished the work in section 6.10, this is a review pass rather than a completion pass.

Read it as though you had received it from someone else, and check four things.

**Is it true?** The template describes a center doing the right thing. Your document has to describe your center. If a paragraph says the Agency reviews something quarterly and you do not, either commit to quarterly or change the document. A policy nobody follows is worse than no policy, because it documents a failure.

**Are the roles real?** Documents name roles rather than people, deliberately, so they survive staff turnover. Check that each named role exists at your center and that whoever holds it knows they own it.

**Are the dates right?** An effective date you can defend, and a review date you will actually meet.

**Is anything left over?** Bracketed prompts, guidance notes, or Small and Large guidance rows that should have gone. One more look costs a minute.

## 7.3 Approving and adopting

Every artifact has a place for approval at the foot of the document, because approval is what makes it binding.

How your center does that is yours to decide. What matters is that the answers exist:

- **Who owns it**, as a role
- **Who approved it**, and when it takes effect
- **When it will be reviewed**, and who does that
- **Who has been told about it**, where the document changes how people work

That last one is easy to skip. An acceptable use policy nobody has read does not change behaviour, and several artifacts in the library exist precisely to record that staff were told and acknowledged it.

## 7.4 Classification, and what it requires of you

Every artifact carries a classification: **Internal**, **Restricted**, or **Confidential**, some with **/ CJIS** appended. This is a handling instruction, not a label.

Your center's own **Data Classification Policy** is the authority, and it is itself an artifact in the library. It is also a first-wave gate, which is not a coincidence: how you classify data determines the controls on everything downstream. Until you have adopted it, treat the classification shown on each artifact as your floor.

The three tiers, as the library's Data Classification Policy defines them:

| Tier             | Typical PSAP content                                                                     | Minimum protection                                                                     |
| ---------------- | ---------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| **Internal**     | Operational documents not meant for public release                                       | Access limited to agency personnel. Not posted publicly                                |
| **Restricted**   | Network and system detail, incident response and continuity plans, access rosters        | Need-to-know access. Encrypted in transit. Handled per your Document Handling Standard |
| **Confidential** | Staff and incident-subject personal information, signed acknowledgments, vetting records | Strict need-to-know. Encrypted at rest and in transit. Controlled storage and disposal |

Three rules govern how you apply these.

**The classification shown is a minimum. You may raise it, never lower it.** If your version of a policy embeds specific operational detail or response logic, it belongs at a higher tier than the template's floor.

**Unlabeled is treated as Restricted.** The safe default is the strict one.

**CJIS is an overlay, not a fourth tier.** Where CJIS-regulated data is in scope, `/ CJIS` is appended to the existing classification and CJIS-specific handling applies on top, governed by your CJIS Data Handling Addendum. Your profile answer to question 7 is what causes these artifacts to be marked for you.

For reference, across the library: 86 artifacts are Restricted, 53 are Internal, and 24 are Confidential. 35 carry the CJIS overlay. Restricted is the most common tier by some distance, so treat careful handling as the norm rather than the exception.

## 7.5 Where to keep them

The library does not store your finished documents, so your center needs somewhere that it does.

Wherever that is, it has to satisfy the classifications above. A shared drive that everyone in the building can read is not a home for Confidential artifacts, and several of these documents describe how your network is laid out and who holds privileged access. That is exactly the material an attacker would want.

Practical minimums:

- **One known location**, so nobody is hunting for the current version
- **Access controlled by need to know**, matching the classification on each document
- **Version and date visible**, which the templates already provide at the top of each file
- **A review reminder**, because a policy that expires quietly is a gap you will meet again at your next assessment

## 7.6 The spreadsheets are different

The 63 spreadsheet artifacts work on a different rhythm from the Word documents.

A policy is drafted, approved, and then reviewed periodically. A register is never finished. Your asset inventory, visitor log, risk register, and access review records are living documents, and their value is entirely in being current. An inventory eighteen months out of date is worse than none, because it is trusted and wrong.

So when you plan the work, treat them as two different jobs. The Word documents need drafting time and an approval decision. The spreadsheets need an owner and a routine.

## 7.7 Coming back

Your assessment and your profile are saved, so returning costs you nothing. Open the library from **Tools** and your build list is where you left it.

This matters more than it sounds. No center closes 163 gaps in a sitting, or a month. The library is built to be worked through over time, a few artifacts at a stretch, and to be waiting for you when you come back.

**After a reassessment**, use **Replace Assessment Matrix** on the Setup screen with your new workbook, then revisit your profile if your center's capability has moved. Your build list rebuilds against the new results, and it should be shorter. Anyone else at your center who uses the library does the same with their own login.

**One thing to track yourself.** The library does not know what you have finished. Your build list reflects your most recent assessment, not your progress against it, so an artifact you adopted last month still appears until your next assessment says otherwise. Keep a record of what is drafted, approved, and adopted, and keep one for the whole center rather than one per person, since nobody's library knows what a colleague has finished. A single spreadsheet with the artifact name, its owner, its status, and its adoption date is enough, and it will save you at your next assessment.
