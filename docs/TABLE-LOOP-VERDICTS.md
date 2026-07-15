# Table-by-table loop verdicts (PSAP artifact masters)

> **Status (2026-07-15): reference / future whitelist — no action now.** Loop rollout is parked. After the full-library review, any growable tables will be applied surgically (pipeline-side) to a few high-value tables — the 🔁 loop / 🔀 split-mixed entries below are the candidate whitelist. This is not a current Cowork task.

> **Purpose.** For every multi-row table in the current 33 `[bracket]` masters, this says whether Cowork should make it a **growable loop**, leave it a **fixed table**, or (for vertical "Field | Value" blocks) keep it as **individual scalar cells**. It exists because the loop recipe in `LOOP-AND-TABLE-AUTHORING.md` — "delete all but one data row, wrap the survivor" — **deletes standardized content** if applied to a fixed table, and an empty loop renders **zero body rows** (the content vanishes from the finished document). So most tables must NOT be looped.

Generated from an automated pass over all 33 masters (124 loop-shaped tables), with an adversarial re-check on every loop verdict. Treat it as a strong first pass, not gospel — the **Why** line on each table explains the call, so you can overrule it where you know the intent better.

## Summary

| Verdict | Count | What Cowork does |
|---|---|---|
| 🔁 **loop** | 17 | Make growable: one row, `{#loop}…{/loop}`, `{fields}` inside (per the authoring guide). |
| 🔀 **split-mixed** | 2 | Keep the fixed/example rows fixed; loop **only** the growable portion. |
| 📑 **key-value (not a loop)** | 4 | Leave as-is — each row is a *different* field. Do **not** loop. |
| 🔒 **leave-fixed** | 101 | Do nothing. Fixed content; `[bracket]` cells still fill inline as scalars. |

---

## 🔁 Make these GROWABLE (loop) — 17 tables

These are genuine enumerable matrices: the PSAP has a variable number of them. Apply the loop recipe. **Where a table "ships example rows" (F-01/F-02, "e.g., …"), move the example into a `{field}` placeholder or delete it — do not leave it as literal text in the loop row, or it prints on every generated row.**

### A-008 — Risk Assessment Report
- **Table #3** · 3 rows · `ID | Finding | Service | Data | Life safety | Overall | Recommendation`  _(findings-matrix, high confidence, ships example rows)_
  - **Why:** Rows are enumerable findings (F-01, F-02, ...) of unknown count, with H/M/L rating dropdowns per axis and an explicit '[Add findings as needed.]' slot-only row — the textbook growable findings matrix. The user naturally adds one row per finding.
  - **If wrongly looped:** Per the recipe, the F-01 and F-02 worked-example rows and the '[Add findings as needed.]' prompt row would be collapsed to a single wrapped row; the illustrative example content is removed by design, which is the intended outcome here.

### A-023 — Board/Leadership Security Reporting Template
- **Table #3** · 3 rows · `Item | Risk / Finding ref | Decision needed | Recommended action | Owner (role)`  _(decision-items, high confidence, ships example rows)_
  - **Why:** Slot-only rows enumerating leadership decision items, with an explicit '[Add items needing a leadership decision]' row confirming the PSAP adds a variable/unknown number; rows 1-2 are illustrative worked examples (Risk acceptance request, Funding decision).
  - **If wrongly looped:** The recipe would delete the two worked example rows and the '[Add items...]' prompt row down to one wrapped template row — acceptable here since those rows are illustrative placeholders, not fixed standard content.
- **Table #4** · 3 rows · `Finding ref | Severity | Status | Due date | Owner (role)`  _(findings-matrix, high confidence, ships example rows)_
  - **Why:** Enumerable POA&M findings summary; slot-only example rows ([POA&M-###] with [High/Med/Low] and [Open/In progress] dropdowns) plus an explicit '[Add open findings, summary only...]' row indicate the row repeats per open finding.
  - **If wrongly looped:** The two [POA&M-###] placeholder example rows and the '[Add open findings...]' prompt row would collapse to one wrapped template row — acceptable since they are placeholders/examples, not standardized content.

### A-028 — Leadership Security Review Meeting Minutes
- **Table #3** · 3 rows · `Name | Role / Title | Present (Y/N)`  _(attendees, high confidence)_
  - **Why:** Rows are enumerable meeting attendees with a variable/unknown count; the three identical slot-only rows ([name] | [role/title] | [Y/N]) are the classic add/remove-row pattern the PSAP fills per attendee.
  - **If wrongly looped:** Under the recipe the three repeated slot-only rows collapse to one wrapped row; no fixed standard content is lost because the cells are all empty placeholders, and the user regrows rows per attendee.
- **Table #4** · 2 rows · `Action Item | Owner (Role) | Due Date | Status`  _(action-items, high confidence)_
  - **Why:** Rows are enumerable action items the PSAP has a variable number of; the two identical slot-only rows ([action] | [role] | [date] | [Open]) are meant to be added/removed per item.
  - **If wrongly looped:** The two repeated slot-only rows collapse to one wrapped row; only placeholder cells (including the default [Open] status) are affected, and no fixed standard content is destroyed.

### A-092 — System Security Plans
- **Table #4** · 2 rows · `Connected system / party | Direction & data exchanged | Protocol / port | Connection type (incl. P2P) | Approved by (role) / date`  _(connections, high confidence)_
  - **Why:** Rows are enumerable interconnection instances the PSAP has a variable/unknown number of, each with the same slot structure ([system or party] / direction / protocol / connection type / approver). Two identical slot-only template rows signal the user should + Add row per connection.
  - **If wrongly looped:** Looping deletes one of the two identical blank slot rows and wraps the remaining one; no fixed literal content is lost since both rows are just empty fill-slots.
- **Table #5** · 2 rows · `Control area | Implementation status | Notes`  _(config-baselines, high confidence)_
  - **Why:** Rows are enumerable control-area entries the PSAP lists a variable number of, each with the same slot structure ([control area] / [in place/partial/planned] / [notes]). The two identical slot-only rows indicate the user should + Add row per control.
  - **If wrongly looped:** Looping deletes one of the two identical blank slot rows and wraps the other; no fixed content is lost since both rows are empty fill-slots.
- **Table #6** · 2 rows · `Control | Approved baseline | Deviation? | Approved by (role) | Date`  _(config-baselines, high confidence)_
  - **Why:** Rows are enumerable configuration-baseline lines with a variable count, each following the same slot pattern ([control] / [approved baseline] / [Y/N] / [role] / [date]). Two identical slot-only rows point to per-control repetition.
  - **If wrongly looped:** Looping deletes one of the two identical blank slot rows and wraps the other; no fixed literal content is at risk since both rows are empty fill-slots.

### A-093 — Role-Based Access Control Documentation
- **Table #2** · 2 rows · `System in scope | Asset ID | RBAC record status`  _(systems-in-scope, high confidence)_
  - **Why:** Two identical slot-only rows ([System] | [ID from Master Asset Inventory] | [Current / Due]) enumerate the systems the PSAP has RBAC records for — a variable/unknown count the user would naturally add or remove rows for. No fixed prose; every cell is a fill slot or dropdown.
  - **If wrongly looped:** Collapsing the two blank [System]/[Asset ID]/[Current-Due] slot rows into one wrapped repeatable row loses no fixed content since all cells are fill slots or dropdowns.
- **Table #4** · 3 rows · `Role (as configured) | Mapped entitlement (Access Entitlement Matrix) | Permissions as configured | Enforcement mechanism`  _(entitlement-matrix, high confidence)_
  - **Why:** Three identical slot-only rows mapping role/group to entitlement, permissions, and enforcement — a classic role→entitlement mapping with a variable number of rows the user adds per configured role.
  - **If wrongly looped:** Collapsing the three identical [role]/[entitlement ref]/[permissions]/[enforcement] slot rows into one repeatable row loses no fixed content; every cell is a fill slot.
- **Table #6** · 2 rows · `Role | Approved baseline | Deviation? | Approved by (role) | Date`  _(config-baselines, high confidence)_
  - **Why:** Two identical slot-only rows ([role] | [baseline] | [Y / N] | [role] | [date]) capturing per-role approved baseline / deviation lines — enumerable config-baseline entries the user adds per role.
  - **If wrongly looped:** Collapsing the two [role]/[baseline]/[Y-N]/[approved-by]/[date] slot rows into one repeatable row loses no fixed prose; all cells are fill slots or dropdowns.

### A-117 — System Configuration Baselines
- **Table #3** · 5 rows · `System type | Setting | Approved value | Deviation from vendor default? | Notes`  _(config-baselines, medium confidence, ships example rows)_
  - **Why:** Config-baseline lines are inherently enumerable — a PSAP records many baseline settings across systems. Rows carry illustrative example slots ('[setting, e.g., password rules]', 'e.g., open/closed ports') and per-row numbered placeholders ([Approved Value2], [Y / N 2]), strong loop indicators. The literal system-type labels are example seeds, not mandatory boilerplate.
  - **If wrongly looped:** The recipe deletes rows 2–5 leaving one wrapped row, removing the seeded system-type labels (Servers, Network devices, Telephony/CAD, SBC consoles) and example settings like 'password rules', 'open/closed ports', and 'logging'; acceptable since these are illustrative and settings are meant to be enumerated.
- **Table #4** · 3 rows · `Zone / segment | Purpose | Allowed traffic / ACL summary | Change-control reference | Notes`  _(zones, high confidence)_
  - **Why:** All three rows are slot-only with repeated numbered placeholders ([Purpose], [Purpose2], [Purpose3]; [Zone], [Zone2]). Security zones/segments are explicitly enumerable — the PSAP defines a variable number of network zones. Repeated identical slot-only rows strongly indicate a loop.
  - **If wrongly looped:** The recipe deletes rows 2–3 leaving one slot row to repeat; only empty placeholders ([zone, e.g., dispatch VLAN], [Purpose], [Allowed Traffic / ACL Summary]) are lost, which is the intended behavior for a growable zone list — no standard content at risk.

### A-148 — Controlled Area / Zone Map
- **Table #3** · 4 rows · `Zone / Area | Access Level (who may enter / credential) | Critical Systems Housed | Owner (Role)`  _(zones, high confidence, ships example rows)_
  - **Why:** Each row is a distinct controlled area/security zone (public lobby, dispatch floor, server room, IDF/MDF closets) — enumerable instances a PSAP has a variable number of, with all cells being slot placeholders in a worked-example set the user would add/remove.
  - **If wrongly looped:** Looping per recipe would collapse the four illustrative zone rows into one placeholder row, but since all cells are bracketed example slots the loss is only the sample zone list, which is the intended behavior for a growable zone map.

### A-165 — Server Room / Equipment Area Hardening Assessment Record
- **Table #3** · 3 rows · `ID | Finding | Severity | Recommendation`  _(findings-matrix, high confidence, ships example rows)_
  - **Why:** Rows are enumerable findings (F-01, F-02, plus a blank '[Add findings as needed.]' prompt row) that the PSAP has a variable/unknown number of; the user naturally adds/removes rows. Example IDs and a blank slot row are strong loop indicators.
  - **If wrongly looped:** Deleting all but one row and wrapping removes the F-01/F-02 example findings and the '[Add findings as needed.]' prompt row, which is correct for an enumerable findings register (no fixed standard content lost).
- **Table #4** · 2 rows · `Finding ID | Owner (role) | Action | Due date | Status`  _(action-items, high confidence, ships example rows)_
  - **Why:** A remediation/action tracker keyed on finding ID with F-01/F-02 worked example rows; each row is a distinct enumerable action item with owner, due date, and status that the user adds per finding.
  - **If wrongly looped:** Deleting all but one row and wrapping removes the F-02 example remediation row and keeps a single wrapped F-01 row, which is appropriate for an enumerable action tracker (no fixed content at risk).
- **Table #5** · 2 rows · `Co-located equipment | Shared with | Risk | Compensating control`  _(co-location-risks, high confidence)_
  - **Why:** Two identical slot-only rows ([Equipment]/[Equipment2] etc.) enumerating co-located equipment instances and their compensating controls; the PSAP has a variable number of co-location situations and would add/remove rows. Repeated slot-only rows strongly indicate a loop.
  - **If wrongly looped:** Deleting the duplicate second slot row and wrapping the first leaves a single growable [Equipment] row; no fixed or standard content exists to lose.

## 🔀 SPLIT-MIXED — 2 tables

Part fixed, part growable. Keep the standard/example rows as fixed rows; wrap **only** the blank enumerable row(s) as a loop below them.

### A-007 — Cybersecurity Governance Charter
- **Table #2** · 5 rows · `Seat | Held by (role)`  _(role-definitions, medium confidence)_
  - **Why:** The first four rows are the standard fixed governance-body seats every PSAP charter defines (Executive sponsor/Chair, Cybersecurity & privacy lead, Operations representative, IT representative), each with a fill slot for who holds it. The final row, '[Add seats as needed] | [role]', is an explicit template row meant to be enumerated. Recommend keeping the four standard seats fixed and looping only the growable trailing portion, or moving the '[Add seats as needed]' row into guidance.
  - **If wrongly looped:** Looping the whole table (delete all but one data row, wrap it) would erase the four predefined standard seats — Executive sponsor/Chair, Cybersecurity & privacy lead, Operations representative, IT representative — leaving only a single row and vanishing entirely if the user adds no seats.

### A-093 — Role-Based Access Control Documentation
- **Table #5** · 3 rows · `Function A | Function B (kept separate) | How separation is enforced on this system`  _(separation-of-duties, high confidence, ships example rows)_
  - **Why:** Row 1 is a fully literal worked example (System administration / Audit-log review / 'Administrators are not members of the audit-reviewer group; audit logs are read-only to administrators.') followed by two blank slot-only rows meant to be enumerated. Keep the example fixed (or move to guidance) and loop only the blank rows.
  - **If wrongly looped:** The delete-all-but-one-row step would either remove the worked System-administration/Audit-log-review separation-of-duties example and its enforcement sentence, or (if that row is kept) discard the two blank enumeration rows; only the growable blank portion should be looped.

## 📑 KEY-VALUE — do NOT loop — 4 tables

These are vertical "Field | Value" blocks where **each row is a different field** (System name, Environment, Location…). Looping would fold many distinct fields into one repeating pair. Leave them as fixed rows; each `[slot]` fills as its own scalar.

### A-028 — Leadership Security Review Meeting Minutes
- **Table #2** · 3 rows · `Date | [date]`  _(meeting-metadata-kv, high confidence)_
  - **Why:** This is a 2-column vertical Field | Value table where each row is a distinct scalar meeting attribute (Date, Time, Location/medium, Meeting type & cadence), not enumerable instances. Each row is its own field, so it must stay as individual scalar cells rather than a repeating pair.
  - **If wrongly looped:** Looping would fold the four distinct meeting-header fields (Date, Time, Location/medium, Meeting type & cadence) into a single repeating Field/Value row, destroying the separate labeled attributes.

### A-092 — System Security Plans
- **Table #2** · 7 rows · `Field | Value`  _(system-profile-kv, high confidence)_
  - **Why:** A 2-column vertical Field/Value table where every row is a distinct scalar attribute of one system (System name, Environment, Location, Owner, Asset ID, Vendor/product, Connectivity). Looping would wrongly fold seven different fields into one repeating Field/Value pair; each should stay its own scalar cell.
  - **If wrongly looped:** Looping deletes all but one row, so the System name/Environment/Location/Owner/Asset ID/Vendor field labels and their slots are destroyed, leaving only Connectivity (or whichever single row is kept).
- **Table #3** · 6 rows · `Field | Value`  _(system-profile-kv, high confidence)_
  - **Why:** A 2-column vertical Field/Value table where each row is a different categorization attribute (Criticality tier, Confidentiality/Integrity/Availability impact, Data sensitivity, Categorization date). These are distinct scalar fields, not enumerable instances; looping would collapse all six into one repeating pair.
  - **If wrongly looped:** Looping deletes all but one row, erasing the Criticality tier, CIA-impact, Data sensitivity and Categorization date field labels and their dropdown slots, leaving a single orphaned Field/Value pair.

### A-093 — Role-Based Access Control Documentation
- **Table #3** · 7 rows · `Field | Value`  _(system-profile-kv, high confidence)_
  - **Why:** A vertical two-column Field/Value table where each row is a DIFFERENT scalar attribute of the system (System name, Environment, Location, Owner, Asset ID, Identity/directory source, RBAC enforcement mechanism). These are distinct fields, not enumerable instances.
  - **If wrongly looped:** Looping would fold the seven distinct fixed field labels into a single repeating Field/Value pair, deleting six of the seven labels (System name, Environment, Location, Owner, Asset ID, Identity source, RBAC enforcement mechanism) from the master.

## ⚠️ Borderline leave-fixed (optional split-mixed) — 2 tables

Classified **leave-fixed** (safe default), but these are fixed *rubrics the PSAP fills against* where an agency might reasonably want to **add its own rows**. Leave them fixed unless you deliberately want growability — in which case make them **split-mixed** (keep the standard rows, add one trailing loop row). Also worth a human look: **A-008 #2** (threat categories), **A-086 #3** (training audiences), **A-088 #3** (onboarding checklist) — all high-confidence fixed, but the same "standard rubric that could grow" shape.

### A-006 — IT Support Accountability Agreement
- **Table #2** · 5 rows · `Service area | Target | Measurement | Remedy on miss`  _(sla-matrix, medium confidence)_
  - **Why:** The first column holds five FIXED literal, standardized IT-support commitments (Acknowledge a critical incident, Restore a critical system, Apply emergency security patch, Notify Agency of suspected breach, Routine support response) — these are a fixed baseline set of service areas the PSAP fills targets against, not generic enumerable instances. Unlike a loop candidate (F-01-style slot-only rows), each row carries a meaningful fixed service-area label that must always appear. Only the Target/Measurement/Remedy cells are fill slots. Per the tie-break (unsure between loop and leave-fixed -> leave-fixed) and the vanish-when-empty risk, keep fixed.
- **Table #3** · 3 rows · `Role | Operational contact (by role)`  _(escalation-roles, medium confidence)_
  - **Why:** The Role column is a fixed standardized set of three escalation roles (Agency escalation, Provider escalation, After-hours / 24x7 contact) that must always appear; only the contact column is a fill slot. This is a fixed structure, not enumerable variable instances — the same 'fixed set of roles -> not enumerable' logic that applies to sign-off blocks. Looping would delete standard escalation roles.

## 🔒 LEAVE FIXED — 101 tables (grouped by kind)

No action. These hold standardized content (identical across PSAPs) or fixed sign-off structures. Their `[Director / Coordinator]`, `[IT support]` etc. cells already fill as normal scalar fields — the surrounding text stays put. **Do not loop any of these.**

- **Sign-off / signature blocks** (33): A-001 #5, A-002 #6, A-006 #4, A-007 #6, A-008 #6, A-010 #5, A-012 #6, A-014 #6, A-023 #7, A-024 #5, A-025 #2, A-028 #6, A-030 #5, A-032 #5, A-039 #5, A-050 #5, A-052 #5, A-057 #6, A-069 #5, A-074 #5, A-080 #2, A-086 #6, A-088 #6, A-089 #5, A-092 #9, A-093 #9, A-099 #8, A-102 #5, A-117 #7, A-148 #6, A-155 #5, A-165 #8, A-172 #5
- **PSAP-profile guidance (Small/Medium/Large)** (32): A-001 #3, A-002 #4, A-006 #5, A-007 #4, A-008 #4, A-010 #3, A-012 #4, A-014 #4, A-023 #5, A-024 #3, A-025 #3, A-030 #3, A-032 #3, A-039 #3, A-050 #3, A-052 #3, A-057 #4, A-069 #3, A-074 #3, A-080 #3, A-086 #4, A-088 #4, A-089 #3, A-092 #7, A-093 #7, A-099 #6, A-102 #3, A-117 #5, A-148 #4, A-155 #3, A-165 #6, A-172 #3
- **Role → responsibility definitions** (17): A-001 #2, A-002 #3, A-007 #3, A-010 #2, A-012 #3, A-014 #2, A-024 #2, A-030 #2, A-039 #2, A-050 #2, A-052 #2, A-057 #3, A-069 #2, A-086 #2, A-089 #2, A-102 #2, A-155 #2
- **Numbered procedure steps** (5): A-099 #2, A-099 #3, A-099 #4, A-099 #5, A-172 #2
- **Regulatory & authority citations** (2): A-002 #2, A-014 #3
- **Data-classification tiers** (2): A-012 #2, A-057 #2
- **SLA / service-level rubric** (1): A-006 #2
- **Escalation-role rubric** (1): A-006 #3
- **Threat-category taxonomy** (1): A-008 #2
- **Board KPI / metrics rubric** (1): A-023 #2
- **Risk-methodology rules** (1): A-032 #2
- **Approved/prohibited guidance** (1): A-074 #2
- **Training-requirement matrix** (1): A-086 #3
- **Onboarding checklist** (1): A-088 #3
- **System-type taxonomy** (1): A-117 #2
- **Hardening checklist** (1): A-165 #2

---

_Full reasoning for every leave-fixed table is available on request; only the actionable and borderline verdicts are expanded above to keep this usable as a checklist._