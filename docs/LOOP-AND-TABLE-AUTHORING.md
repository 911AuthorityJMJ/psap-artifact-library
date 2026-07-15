# Authoring Growable Tables (Loops) in PSAP Artifact Masters

> **Status (2026-07-15): PARKED — not a current Cowork task.** Decision: loop-authoring will *not* be pushed to Cowork. Only ~19 of 124 tables benefit, and hand-authoring loop syntax is error-prone. If growable tables are pursued, they'll be applied **pipeline-side** to a small whitelist of high-value tables after the full-library review — see `TABLE-LOOP-VERDICTS.md`. Keep this as the **implementer/reference spec**, not an instruction set to hand Cowork.

**Audience:** whoever authors the `[bracket]` master templates (Cowork).
**Goal:** make a table's rows *growable* — so in the site's Build Document tool a user can **+ Add row** / **Remove** rows, and the finished `.docx` repeats the row once per entry.

By default a table is **fixed**: whatever rows you draw are the rows you get. To make a table grow, you wrap **one** data row as a **loop**. That's the whole idea.

---

## The one rule

> Keep a **single** data row. Put `{#loopName}` at the **start of its first cell** and `{/loopName}` at the **end of its last cell**. Put a `{fieldName}` in each cell that holds a value.

docxtemplater then repeats that entire table row once per item the user adds.

---

## Before you loop anything: which tables to loop (and the boilerplate trap)

**Most multi-row tables in these documents must NOT become loops.** Looping is only for tables whose rows are *enumerable instances* — things the agency has a variable, unknown number of. Applying the recipe to any other table **destroys content**, for two reasons:

1. **The recipe deletes rows.** "Keep a single data row" means you delete the rest. If those rows held standardized content — profile guidance, role definitions, a regulatory citation, a fixed sign-off — that content is **gone from the master**.
2. **An empty loop renders nothing.** A loop over zero entries produces **zero body rows** — just the header. So if you loop a table of standard content and the user adds no rows, that content **vanishes from the finished document**. For a genuine list (findings, attendees) that's correct; for reference content it's silent data loss.

### The test

> **Loop it only if the agency would naturally + Add row / Remove row** because the count varies from agency to agency (or year to year). If every agency sees the *same* rows, it is not a loop.

### The four kinds of table

| Kind | Looks like | Do this |
| --- | --- | --- |
| **Enumerable matrix** | Findings (F-01, F-02…), systems in scope, attendees, action items, connections, security zones, role→entitlement rows. Usually repeated blank `[slot]` rows or example rows + an "[Add … as needed]" prompt. | **Loop it.** |
| **Fixed reference / guidance** | "PSAP Profile \| Minimum-viable implementation" (Small/Medium/Large), "Role \| Responsibility" definitions, regulatory citations, classification tiers, numbered procedure steps, do/don't guidance. Mostly literal prose; a `[Director / Coordinator]`-type slot inside a fixed row is just a fill-in, not a repeat. | **Leave fixed.** The `[bracket]` cells still fill in automatically as normal fields. |
| **Sign-off block** | "Role \| Name \| Signature \| Date" with a fixed set of signatories (owner + reviewer). | **Leave fixed.** It's a fixed structure, not a variable list. |
| **Key-value ("Field \| Value")** | A two-column vertical table where each row is a *different* attribute — System name, Environment, Location, Owner… | **Leave fixed. Never loop it** — each row is its own scalar field. Looping folds many different fields into one repeating pair. |

**When in doubt, leave it fixed.** A fixed table that could have been a loop is a mild inconvenience; a looped table that should have been fixed is lost compliance content.

### Preserving example rows in a table you *do* loop

Genuine matrices often ship a worked example (`F-01 | [finding] | [High/Med/Low]`). That example is illustrative boilerplate, and the "keep one row" step deletes it. Don't just leave example words as literal text in the loop row — **literal text in a loop row prints on every generated row.** Instead, either:

- move the example into the field's guidance (a `« … »` note near the table, or a curated placeholder we add on our side — just ask), or
- keep the example as `{field}` tags with the example wording, understanding the user overwrites it per row.

### The mixed case (fixed rows + a growable section)

Some tables are part standard, part growable — e.g. four predefined governance seats followed by an "[Add seats as needed]" row, or one worked example above blank rows. **Keep the fixed rows as ordinary fixed rows and wrap only the trailing blank row as a loop.** A loop is just one row among the fixed rows in the same table; docxtemplater handles that fine.

### You don't have to decide table-by-table from scratch

**`TABLE-LOOP-VERDICTS.md`** (in this folder) already classifies every table in the current 33 masters as loop / split-mixed / key-value / leave-fixed, with the reasoning. Use it as your checklist; overrule it where you know the intent better.

---

## Two placeholder syntaxes — don't mix them up

| Syntax | Use it for | Example |
| --- | --- | --- |
| **`[Square brackets]`** | Normal fields **outside** tables/loops (the existing convention). The build pipeline converts these to fields automatically. | `[Agency Name]`, `[Effective Date]` |
| **`{curly braces}`** | **Loop markers and every field inside a loop row.** | `{#systems}`, `{systemName}`, `{/systems}` |

**Inside a loop, always use `{curly}` — never `[brackets]`.** Square-bracket text inside a loop gets rewritten by the converter and can collide with other fields; curly names are yours, stay local to the loop, and are left exactly as you type them.

---

## Step by step (in Word)

Say you have a **Systems in Scope** table:

**Before** (fixed — 3 blank rows the user can't change):

| System | Asset ID | Environment | Owner |
| --- | --- | --- | --- |
| `[System Name]` | `[Asset ID]` | `[production / test / DR]` | `[Owner role]` |
| `[System Name]` | `[Asset ID]` | `[production / test / DR]` | `[Owner role]` |
| `[System Name]` | `[Asset ID]` | `[production / test / DR]` | `[Owner role]` |

**After** (growable — one row, wrapped as a loop):

| System | Asset ID | Environment | Owner |
| --- | --- | --- | --- |
| `{#systems}{systemName}` | `{assetId}` | `{environment}` | `{ownerRole}{/systems}` |

To get there:

1. **Delete the extra blank rows.** Keep the header row and **one** data row.
2. In the **first cell** of the data row, type `{#systems}` right before its content.
3. In the **last cell** of the data row, type `{/systems}` right after its content.
4. In every cell, replace the bracketed placeholder with a `{fieldName}` in curly braces (e.g. `{systemName}`).
5. Leave the **header row** exactly as it is.

That's it. Save the master and hand it back for the next sync.

---

## Naming

- **Loop name:** short, plural, camelCase — `systems`, `findings`, `attendees`. Must be **unique within the document**.
- **Field name:** camelCase, describes the column — `systemName`, `reviewDate`, `roleGroup`.
- The builder builds each label by splitting the camelCase name into Title Case: `{systemName}` → **"System Name"**, `{reviewDate}` → **"Review Date"**. So **name fields the way you want them to read.**
- Caveat: an all-caps acronym loses its caps — `{assetId}` becomes **"Asset Id"**, not "Asset ID". If a label must read a specific way, just tell us and we'll add a curated label.
- No registry work is needed for a loop to *function*. Curated labels, dropdowns, and date pickers can be layered on afterward on our side.

---

## Rules & gotchas (read these)

- **Open and close go in the same row** — `{#name}` in the first cell, `{/name}` in the last cell of that one row. Not in the header, not in separate rows.
- **One template row only.** Delete duplicates; the loop generates as many as the user needs.
- **Put at least one `{field}` between the markers.** An empty `{#rows}{/rows}` with no field inside is treated as a normal (non-repeating) placeholder, not a growable table.
- **`{curly}` inside loops, `[brackets]` everywhere else.** Never `[brackets]` inside a loop row. (Curly tags are preserved as-you-type **inside a loop**; don't use curly braces outside loops.)
- **No nested loops** (a loop inside another loop) for now.
- **Type each tag cleanly, in one go.** If Word applies formatting/auto-correct in the *middle* of a tag (e.g. bolds `{`, or splits it across edits), docxtemplater may not recognize it. If a tag ever fails, delete it and retype it in one stroke with no mid-tag formatting. A safe trick: type the tag first, then apply any formatting to the whole tag.
- **Curly braces mean docxtemplater** — don't use `{ }` for anything that isn't a real field/loop marker.

---

## Non-table (paragraph) loops

The same works for a repeating **paragraph/list** (e.g. "add another statement"): put `{#items}` at the start of the paragraph and `{/items}` at the end, with `{text}` inside. It repeats the whole paragraph per item.

---

## What happens after you hand back a master

1. You drop the revised master into the site's `public/templates/forms/`.
2. `npm run sync-templates` compiles it (your `{curly}` loop markers pass through untouched).
3. The **Build Document** tool automatically shows that table as a **"+ Add row"** section — one input per `{field}`, labeled from the field name — and the downloaded `.docx` repeats the row per entry.
4. A **template linter** checks the compiled forms. `npm run build` runs it in **strict** mode, so a malformed loop — e.g. a `{#systems}` with no matching `{/systems}` — **fails the build**. (A plain `npm run sync-templates` reports issues without blocking; run `npm run lint:templates:strict` any time to check.) And a malformed loop errors the moment anyone opens that form's builder, so it never silently ships a broken document.

No code change is needed for a table to become growable — just the master edit above.

---

## Per-table checklist

- [ ] **Confirmed this table is a genuine enumerable matrix** — not fixed reference/guidance, a sign-off block, or a key-value table (see the verdict table above and `TABLE-LOOP-VERDICTS.md`).
- [ ] Extra data rows deleted — one template row remains.
- [ ] `{#loopName}` at the start of the first cell.
- [ ] `{/loopName}` at the end of the last cell (same row).
- [ ] Every value cell holds a `{fieldName}` (curly, camelCase, descriptive).
- [ ] Header row unchanged.
- [ ] Loop name unique in this document; no `[brackets]` inside the loop; no nested loops.
- [ ] Each tag typed cleanly (no mid-tag formatting).

---

### Reference: the one that already ships this way

`A-093 Role-Based Access Control Documentation` — its "As-Built Role Enforcement" table is authored as the `accessEntitlements` loop and shows the **+ Add row** behavior in the builder. Use it as a working model.
