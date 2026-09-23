import type { Metadata } from "next";
import Link from "next/link";
import {
    HelpHeader,
    DocCard,
    DocPart,
    DocSection,
    DocTable,
    Callout,
    Screenshot,
    Checklist,
} from "@/components/docs/DocPrimitives";

export const metadata: Metadata = {
    title: "Full Guide — PSAP Artifact Library",
};

const PARTS = [
    { number: 1, title: "Getting oriented" },
    { number: 2, title: "Your assessment matrix" },
    { number: 3, title: "Your PSAP profile" },
    { number: 4, title: "Reading your results" },
    { number: 5, title: "The Full Library" },
    { number: 6, title: "Building a document" },
    { number: 7, title: "After the download" },
] as const;

const prose = "text-sm text-gray-700 leading-relaxed";

export default function GuidePage() {
    return (
        <main className="min-h-screen p-8">
            <div className="max-w-3xl mx-auto">
                <HelpHeader
                    title="User Guide"
                    current="/help/guide"
                />

                <DocCard>
                    <p className={prose}>
                        The PSAP Artifact Library turns your completed security assessment into a
                        working plan: which documents your center is missing, what order to build
                        them in, and a head start on writing each one.
                    </p>
                    <p className={`${prose} mt-3`}>
                        This guide covers everything a PSAP needs to use it. You do not need a
                        security background to follow it.
                    </p>
                    <p className={`${prose} mt-3`}>
                        If you are just getting started, the <strong>Quick Start</strong> covers the
                        same path in five steps.
                    </p>

                    <nav
                        className="mt-6 rounded-lg p-4"
                        style={{
                            border: "1px solid var(--ui-border)",
                            background: "var(--ui-bg)",
                        }}>
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
                            Contents
                        </p>
                        <ol className="list-decimal pl-5 space-y-1 text-sm">
                            {PARTS.map((p) => (
                                <li key={p.number}>
                                    <Link
                                        href={`#part-${p.number}`}
                                        className="hover:underline"
                                        style={{ color: "var(--ui-link)" }}>
                                        {p.title}
                                    </Link>
                                </li>
                            ))}
                        </ol>
                    </nav>

                    {/* ---------------------------------------------------------------- Part 1 */}
                    <DocPart
                        number={1}
                        title="Getting oriented"
                    />

                    <DocSection
                        id="1.1"
                        title="What the Artifact Library is">
                        <p>
                            Your security assessment identified gaps. Most of those gaps close the
                            same way: your center needs a written policy, a documented procedure, a
                            register, or a record that does not exist yet. Collectively those
                            documents are called <strong>artifacts</strong>, and there are 163 of
                            them in the library.
                        </p>
                        <p>
                            The Artifact Library connects the two. You give it your completed
                            assessment matrix, and it tells you:
                        </p>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>
                                <strong>Which artifacts your center actually needs</strong>, based
                                on the questions you did not answer &quot;Yes&quot; to. You will not
                                be handed all 163.
                            </li>
                            <li>
                                <strong>What order to build them in</strong>, because some documents
                                settle decisions the rest depend on. Writing them out of order means
                                rewriting them.
                            </li>
                            <li>
                                <strong>A starting draft of each one</strong>, either filled in
                                through the site or downloaded as a template you complete yourself.
                            </li>
                        </ul>
                        <p>
                            It is a planning tool and a drafting tool. The work of deciding what
                            your center will actually do stays with your center.
                        </p>
                    </DocSection>

                    <DocSection
                        id="1.2"
                        title="What it is not">
                        <p>Being clear about the boundaries will save you time later.</p>
                        <p>
                            It is <strong>not a compliance score</strong>. Your assessment report
                            has your scoring. The library is about closing the gaps, not measuring
                            them.
                        </p>
                        <p>
                            It is <strong>not an approval system</strong>. There is no sign-off, no
                            routing, no review workflow. When a document is ready, your center
                            adopts it through whatever process you already use.
                        </p>
                        <p>
                            It is <strong>not a document repository</strong>. Finished artifacts
                            live wherever your center keeps its records. The library does not store
                            them and cannot serve as your evidence file.
                        </p>
                        <p>
                            It does <strong>not track your progress</strong>. It shows what your
                            latest assessment says you need. It does not know which ones you have
                            finished. Keep your own record of what is drafted, approved, and
                            adopted.
                        </p>
                    </DocSection>

                    <DocSection
                        id="1.3"
                        title="What the library remembers, and what it does not">
                        <p>
                            The short version:{" "}
                            <strong>
                                the library remembers what your center is. It does not remember what
                                you were in the middle of writing.
                            </strong>
                        </p>
                        <p>
                            <strong>Remembered, tied to your login.</strong> Your assessment matrix
                            and your PSAP profile answers are saved to your account. Upload your
                            matrix once and it is there the next time you sign in, along with your
                            profile and your build list. You never re-upload unless you want to
                            replace it.
                        </p>
                        <p>
                            <strong>Remembered for you, not for your center.</strong> What the
                            library saves belongs to your own login. Each person at your center who
                            uses the library has their own saved matrix and their own profile, and a
                            colleague opening it for the first time starts with nothing, even if you
                            set everything up last week. If you hand this work to someone else, they
                            upload the same matrix and answer the profile themselves.
                        </p>
                        <p>
                            <strong>Not remembered.</strong> A document you are part way through
                            building. The document builder holds nothing between visits. If you
                            close it, or your session ends while you are in it, everything you typed
                            there is gone.
                        </p>
                        <p>
                            The practical rule:{" "}
                            <strong>
                                start a document only when you have time to finish and download it.
                            </strong>{" "}
                            Some are short. Some are not.
                        </p>
                    </DocSection>

                    <DocSection
                        id="1.4"
                        title="What you need before you start">
                        <ul className="list-disc pl-5 space-y-2">
                            <li>
                                <strong>Your completed assessment matrix</strong>, the{" "}
                                <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">
                                    .xlsx
                                </code>{" "}
                                workbook from your 911 Authority posture assessment. You need this
                                the first time only.
                            </li>
                            <li>
                                <strong>Word and Excel</strong>, or another program that opens{" "}
                                <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">
                                    .docx
                                </code>{" "}
                                and{" "}
                                <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">
                                    .xlsx
                                </code>{" "}
                                files.
                            </li>
                        </ul>
                    </DocSection>

                    <DocSection
                        id="1.5"
                        title="Signing in, and your session">
                        <p>
                            You reached this guide from the <strong>Help</strong> menu inside the
                            library, so you are already signed in. Your 911 Authority site login
                            carries through: no second sign-in, no separate password.
                        </p>
                        <Screenshot
                            name="help-menu-open"
                            alt="The library's Setup screen with the Help menu open at the right of the tab row, listing Quick Start, Quick Reference, and Full Guide."
                        />
                        <p>
                            For the record, the library opens in a panel over the site, from{" "}
                            <strong>Tools</strong>, then <strong>PSAP Artifact Library</strong>.
                        </p>
                        <p>
                            <strong>A note on time.</strong> Your session lasts a limited time and
                            does not renew while you work. If you have been idle a while and
                            something stops working, close the panel and reopen it from{" "}
                            <strong>Tools</strong>. That gives you a fresh session. It is the fix
                            for almost every &quot;it stopped responding&quot; moment in this guide.
                        </p>
                    </DocSection>

                    <DocSection
                        id="1.6"
                        title="The three screens">
                        <p>Everything in the library lives under three tabs across the top.</p>
                        <DocTable
                            headers={["Tab", "What it is for"]}
                            rows={[
                                [
                                    <strong key="a">Setup</strong>,
                                    "Your assessment matrix and your PSAP profile. Where you start, and where you come back to change either one.",
                                ],
                                [
                                    <strong key="a">Assessment</strong>,
                                    "Your results. Which artifacts your center needs, in what order, and why each one is on the list.",
                                ],
                                [
                                    <strong key="a">Full Library</strong>,
                                    "All 163 artifacts, searchable. Available whether or not you have an assessment loaded.",
                                ],
                            ]}
                        />
                        <p>
                            <strong>Assessment</strong> stays greyed out until an assessment is
                            loaded, whether you just uploaded it or the library restored it for you.{" "}
                            <strong>Full Library</strong> is always available, so you can look up a
                            single document any time without going through Setup.
                        </p>
                        <p>
                            A fourth item, <strong>Help</strong>, holds this guide alongside the
                            quick start and the quick reference. It is where you are now.
                        </p>
                        <Screenshot
                            name="nav-tabs-assessment-disabled"
                            alt="The tab row at the top of the library: Setup, Assessment greyed out, Full Library, and the Help menu."
                        />
                    </DocSection>

                    <DocSection
                        id="1.7"
                        title="What you will see when you open it">
                        <p>
                            You will land on one of two versions of the Setup screen. Which one
                            tells you where you are.
                        </p>
                        <p>
                            <strong>The first time</strong>, you get a large dashed panel inviting
                            you to upload your assessment matrix, and nothing else. Nothing is set
                            up yet. Go to Part 2.
                        </p>
                        <p>
                            <strong>Every time after</strong>, the library briefly shows{" "}
                            <em>Loading your saved assessment</em>, then Setup appears already
                            populated: a compact bar naming your saved matrix with a{" "}
                            <strong>Replace Assessment Matrix</strong> button beside it, your
                            center&apos;s contact details, and your profile answers as you left
                            them. Your build list is ready under the <strong>Assessment</strong>{" "}
                            tab.
                        </p>
                        <Screenshot
                            name="setup-first-use-vs-returning"
                            alt="Two versions of the Setup screen. Top: first use, with a dashed panel for uploading the assessment matrix. Bottom: a later visit, with the Current assessment bar, a Replace Assessment Matrix button, and the center's contact details."
                        />
                        <p>
                            If you expected the second and got the first, your session may have
                            ended. Close the panel, reopen it from <strong>Tools</strong>, and check
                            again before uploading anything.
                        </p>
                    </DocSection>

                    {/* ---------------------------------------------------------------- Part 2 */}
                    <DocPart
                        number={2}
                        title="Your assessment matrix"
                    />

                    <DocSection
                        id="2.1"
                        title="Where the matrix comes from">
                        <p>
                            The assessment matrix is the{" "}
                            <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">.xlsx</code>{" "}
                            workbook that accompanies your PSAP Security Practices Posture
                            Assessment report. It arrives from 911 Authority as part of your
                            deliverable package once your assessment is complete.
                        </p>
                        <p>
                            You do not create it, and there is no blank version to fill in. It
                            reaches you already rated, one row per assessment item, and the library
                            reads it as delivered.
                        </p>
                        <p>
                            Your deliverable package contains six files. The matrix is the only one
                            the library uses.
                        </p>
                    </DocSection>

                    <DocSection
                        id="2.2"
                        title="What the library reads from it">
                        <p>The workbook has several sheets. The library reads two.</p>
                        <p>
                            <strong>PSAP Information</strong> supplies your center&apos;s details:
                            the PSAP name, address, city and ZIP, and the director&apos;s name,
                            phone, and email. These appear on the Setup screen and carry into
                            documents you build.
                        </p>
                        <p>
                            <strong>Question Set</strong> supplies every assessment item: its ID,
                            the domain and category it sits under, and its rating.
                        </p>
                        <p>
                            The scoring tables and charts are for your report. The library ignores
                            them.
                        </p>
                        <Screenshot
                            name="excel-psap-information-sheet"
                            alt="A sample assessment matrix open in Excel on the PSAP Information sheet: the PSAP name, address, city and ZIP, and the director's name, phone, and email in the first rows. The sheet tabs along the bottom are General Information, PSAP Information, Question Set, Full Score Table, Domain-Level Score Table, Bar Chart, and Radar Chart."
                            enlarge
                        />
                        <Callout>
                            Upload the workbook as you received it. The library reads your contact
                            details from fixed positions on the PSAP Information sheet, so inserting
                            or deleting rows there will pull in the wrong values or leave them
                            blank. There is no reason to edit the workbook before uploading, and
                            good reason not to.
                        </Callout>
                    </DocSection>

                    <DocSection
                        id="2.3"
                        title="The ratings, and what each one means here">
                        <p>
                            Your assessment used six ratings. The library sorts them into two
                            groups.
                        </p>
                        <DocTable
                            headers={["Rating", "The library treats it as", "Where it appears"]}
                            rows={[
                                [<strong key="a">No</strong>, "A gap", "Your build list"],
                                [<strong key="a">In Progress</strong>, "A gap", "Your build list"],
                                [<strong key="a">Planned</strong>, "A gap", "Your build list"],
                                [<strong key="a">Unknown</strong>, "A gap", "Your build list"],
                                [<strong key="a">Yes</strong>, "Covered", "The Reference tab"],
                                [
                                    <strong key="a">Not Applicable</strong>,
                                    "Covered",
                                    "The Reference tab",
                                ],
                            ]}
                        />
                        <p>Two of these surprise people, so they are worth stating plainly.</p>
                        <p>
                            <strong>In Progress counts as a gap.</strong> Work that has started is
                            not work that is finished, and an artifact that is half written is not
                            one you can produce for an auditor. The library still shows the rating
                            on each item, so you can tell a job nearly done from one not started.
                        </p>
                        <p>
                            <strong>Unknown counts as a gap.</strong> If nobody could confirm a
                            control is in place, the safe assumption is that it is not. If it turns
                            out you do have the document, you have lost nothing but the time it
                            takes to confirm it.
                        </p>
                        <p>
                            <strong>Yes and Not Applicable are not gaps</strong>, but the artifacts
                            behind them are still worth seeing. That is what the Reference tab is
                            for, covered in Part 4.
                        </p>
                    </DocSection>

                    <DocSection
                        id="2.4"
                        title="What the 198 questions cover">
                        <p>
                            The assessment asks 198 questions, grouped into 51 categories across 13
                            domains. Every question maps to at least one artifact, which is how the
                            library knows what to put on your list.
                        </p>
                        <p>The 13 domains, in the order you will see them:</p>
                        <ol className="list-decimal pl-5 space-y-1">
                            <li>Governance, Risk &amp; Strategy</li>
                            <li>Identity, Authentication &amp; Access Management</li>
                            <li>Data Security &amp; Lifecycle Management</li>
                            <li>Network &amp; Communications Governance</li>
                            <li>Endpoint Security &amp; Configuration Management</li>
                            <li>Cryptography, Encryption &amp; Key Management Governance</li>
                            <li>Logging, Monitoring &amp; Event Detection</li>
                            <li>Response, Recovery, &amp; Forensic Readiness</li>
                            <li>Business Continuity &amp; Environmental Resilience</li>
                            <li>Physical &amp; Environmental Security Management</li>
                            <li>Third-Party Security &amp; Supply Chain Management</li>
                            <li>Assessment, Testing, &amp; Remediation Management</li>
                            <li>Training, Awareness &amp; Behavioral Governance</li>
                        </ol>
                        <p>
                            You will see these names again as headings on the{" "}
                            <strong>By Question</strong> tab.
                        </p>
                    </DocSection>

                    <DocSection
                        id="2.5"
                        title="Uploading it, the first time">
                        <p>
                            On the Setup screen, click anywhere in the dashed panel and choose your
                            matrix.
                        </p>
                        <p>
                            The library accepts{" "}
                            <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">.xlsx</code>{" "}
                            files up to 250 KB. A matrix runs well under that, so the limit is
                            unlikely to trouble you.
                        </p>
                        <Screenshot
                            name="setup-upload-panel"
                            alt="The Setup screen on first use, showing the dashed panel to click to upload the assessment matrix."
                        />
                        <p>
                            Uploading takes a moment. The library reads the workbook first and only
                            saves it if it can read it, so a file it rejects is never stored. When
                            it succeeds, three things appear: your center&apos;s details, the{" "}
                            <strong>PSAP Profile</strong> questions, and a{" "}
                            <strong>Continue to Assessment</strong> button.
                        </p>
                        <p>
                            Your matrix is now saved to your own login. You will not upload it again
                            unless you choose to. Anyone else at your center who uses the library
                            uploads their own copy.
                        </p>
                        <p>Go to Part 3 to complete your profile.</p>
                    </DocSection>

                    <DocSection
                        id="2.6"
                        title="Replacing it later">
                        <p>
                            Once a matrix is saved, the dashed panel is replaced by a compact bar
                            showing the file you have stored, with a{" "}
                            <strong>Replace Assessment Matrix</strong> button beside it.
                        </p>
                        <Screenshot
                            name="setup-current-assessment-bar"
                            alt="The Current assessment bar, showing the saved file name and the Replace Assessment Matrix button."
                        />
                        <p>
                            Use it when your center is reassessed, or if you were sent a corrected
                            workbook. The new file takes the place of the old one. Each person
                            stores one matrix, so replacing yours does not change anyone
                            else&apos;s: after a reassessment, everyone at your center who uses the
                            library replaces their own, or they go on working from the old results.
                        </p>
                        <p>
                            <strong>A failed replacement costs you nothing.</strong> The library
                            reads the new workbook before it keeps it. If the new file cannot be
                            read, you get an explanation and your existing assessment stays exactly
                            as it was, both on screen and in your account. You cannot lose a good
                            matrix by trying a bad one.
                        </p>
                    </DocSection>

                    <DocSection
                        id="2.7"
                        title="If something goes wrong">
                        <p>
                            Most problems here fall into three groups: the file, the session, or the
                            connection.
                        </p>
                        <DocTable
                            headers={["What you see", "What it means", "What to do"]}
                            rows={[
                                [
                                    "The file is too large",
                                    "The workbook is over 250 KB",
                                    "Confirm you are uploading the matrix you were sent, not a workbook you have added to",
                                ],
                                [
                                    <>
                                        Only{" "}
                                        <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">
                                            .xlsx
                                        </code>{" "}
                                        files are accepted
                                    </>,
                                    <>
                                        The file is not an Excel workbook, or is an older{" "}
                                        <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">
                                            .xls
                                        </code>
                                    </>,
                                    <>
                                        Upload the{" "}
                                        <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">
                                            .xlsx
                                        </code>{" "}
                                        you were sent
                                    </>,
                                ],
                                [
                                    "A sheet was not found",
                                    "The workbook is missing PSAP Information or Question Set",
                                    "You are uploading the wrong workbook, or the sheets have been renamed. Use the file as delivered",
                                ],
                                [
                                    "The file could not be read",
                                    "The workbook is damaged",
                                    "Request a fresh copy",
                                ],
                                [
                                    "Your session has expired",
                                    "You have been signed in a while",
                                    <>
                                        Close the panel and reopen it from <strong>Tools</strong>
                                    </>,
                                ],
                                [
                                    "Temporarily unavailable",
                                    "A problem on the server, not with your file",
                                    "Try again shortly. If it persists, contact 911 Authority",
                                ],
                                [
                                    "Could not reach the server",
                                    "A network problem between you and the site",
                                    "Check your connection and try again",
                                ],
                                [
                                    "Too many requests",
                                    "An unusual number of uploads in a short time",
                                    "Wait a minute and try again",
                                ],
                            ]}
                        />
                        <p>
                            One case deserves its own note. If your matrix appears on screen
                            correctly but you see a message that it{" "}
                            <strong>could not be saved</strong>, the message will tell you your work
                            is kept. That is true for the visit you are in, and not beyond it: the
                            assessment is displayed but not stored, so it will not be waiting for
                            you next time. Upload it again before you finish, or repeat the upload
                            on your next visit.
                        </p>
                    </DocSection>

                    {/* ---------------------------------------------------------------- Part 3 */}
                    <DocPart
                        number={3}
                        title="Your PSAP profile"
                    />

                    <DocSection
                        id="3.1"
                        title="Why the library asks">
                        <p>
                            Two centers with the same gaps are not always in the same position to
                            close them. A five-seat center with no dedicated IT and a five-seat
                            center backed by a strong county IT department will produce very
                            different documents, and asking both for the same thing helps neither.
                        </p>
                        <p>
                            So before it shows you results, the library asks nine questions about
                            what your center can build and keep running. That is your{" "}
                            <strong>profile</strong>.
                        </p>
                        <p>
                            The principle behind it is worth understanding, because it is not the
                            obvious one:
                        </p>
                        <Callout>
                            Your profile is not your size. It is your capability. Headcount is a
                            clue, not the answer.
                        </Callout>
                        <p>
                            A control you cannot maintain is not a control. So the profile is set by
                            what your center can actually sustain, and it is set by your{" "}
                            <strong>weakest</strong> answer rather than your average. Where you are
                            stronger in a particular area, the library scales that area up. It never
                            scales anything down. Under-protection hides in averages, which is
                            exactly why the library does not use one.
                        </p>
                    </DocSection>

                    <DocSection
                        id="3.2"
                        title="Finding it, and finishing it">
                        <p>
                            The profile appears on the <strong>Setup</strong> screen once an
                            assessment is loaded, below your center&apos;s details, under the
                            heading <strong>PSAP Profile</strong>.
                        </p>
                        <Screenshot
                            name="setup-profile-panel-empty"
                            alt="The PSAP Profile panel as first loaded: questions 1 to 8 with nothing selected."
                        />
                        <p>Two things to know before you start.</p>
                        <p>
                            <strong>You answer it yourself.</strong> The library does not work your
                            profile out from your assessment. Your assessment says what is missing;
                            the profile says what you are able to build. They are different
                            questions and the second one needs you.
                        </p>
                        <p>
                            <strong>Questions 1 through 7 are all required.</strong> Every dropdown
                            starts empty, showing <em>Select…</em>, and nothing is chosen on your
                            behalf. You cannot move on to your results until all seven are answered.
                            If you try, the library outlines the unanswered questions in red and
                            tells you what is missing.
                        </p>
                        <Screenshot
                            name="setup-profile-validation"
                            alt="The PSAP Profile panel after pressing Continue to Assessment with the questions unanswered: the seven required dropdowns are outlined in red, and a message below tells you to answer all required questions (1 to 7) before continuing."
                        />
                        <p>
                            Question 8 is a pair of checkboxes and is optional. Leave both unticked
                            if neither applies.
                        </p>
                    </DocSection>

                    <DocSection
                        id="3.3"
                        title="Questions 1 to 3: your baseline">
                        <p>
                            These three set your profile. Answer them honestly rather than
                            aspirationally.
                        </p>
                        <p>
                            <strong>1. Who handles IT day to day?</strong>
                        </p>
                        <DocTable
                            headers={["Answer", "Reads as"]}
                            rows={[
                                ["Vendor-managed, or no dedicated IT", "Small"],
                                ["Shared county or city IT", "Medium"],
                                ["IT staff dedicated to the PSAP", "Large"],
                            ]}
                        />
                        <p>
                            <strong>2. Who owns cybersecurity tasks?</strong>
                        </p>
                        <DocTable
                            headers={["Answer", "Reads as"]}
                            rows={[
                                ["No one formally assigned", "Small"],
                                ["Part-time or shared duty", "Medium"],
                                ["A named, dedicated role", "Large"],
                            ]}
                        />
                        <p>
                            <strong>3. What can you operate and keep running?</strong>
                        </p>
                        <DocTable
                            headers={["Answer", "Reads as"]}
                            rows={[
                                ["Manual: checklists, spreadsheets", "Small"],
                                ["Some tooling: endpoint protection, logging, MFA", "Medium"],
                                ["Centralized: SIEM, MDM, monitoring", "Large"],
                            ]}
                        />
                        <p>
                            <strong>Your baseline is the lowest of the three.</strong> Two Larges
                            and a Small make a Small profile, not a Medium one. The reasoning is the
                            same as before: the thing you cannot sustain is the thing that will
                            fail, and building to a level you cannot maintain produces documents
                            that go stale and controls that quietly stop working.
                        </p>
                        <p>
                            Once all three are answered, the panel shows your baseline. Until then
                            it tells you it is waiting on questions 1 to 3, so you are never given a
                            profile you did not choose.
                        </p>
                        <Screenshot
                            name="setup-profile-answered-baseline"
                            alt="Questions 1 to 3 of the PSAP Profile answered (vendor-managed or no dedicated IT, no one formally assigned, manual checklists and spreadsheets), with the Baseline Profile box below reading Small."
                        />
                    </DocSection>

                    <DocSection
                        id="3.4"
                        title="Questions 4 to 6: confirming and scaling up">
                        <p>
                            <strong>4. Full-time-equivalent dispatchers?</strong> Choose 1 to 5, 6
                            to 25, or 25 and above.
                        </p>
                        <p>
                            This one is required, and it changes nothing you will see. It records
                            your size alongside your capability. Answer it and move on; your profile
                            is decided by questions 1 to 3.
                        </p>
                        <p>
                            <strong>5. Call-handling environment?</strong>
                        </p>
                        <DocTable
                            headers={["Answer", "Reads as"]}
                            rows={[
                                ["Single CAD and ESInet, single carrier", "Small"],
                                ["Some redundancy, mixed cloud and on-premises", "Medium"],
                                ["Full NG911, multiple integrations", "Large"],
                            ]}
                        />
                        <p>
                            <strong>6. Governance in place today?</strong>
                        </p>
                        <DocTable
                            headers={["Answer", "Reads as"]}
                            rows={[
                                ["Few or no written policies", "Small"],
                                ["Some, inconsistently maintained", "Medium"],
                                ["A maintained set with review cycles", "Large"],
                            ]}
                        />
                        <p>
                            Questions 5 and 6 can raise a specific area above your baseline, and
                            only upward. A center running Small overall but with a genuinely more
                            complex call-handling environment builds its technical artifacts at the
                            higher level without pretending to be Medium everywhere else. If either
                            answer sits below your baseline, nothing changes: you still start at the
                            baseline, and the shortfall is a gap to close rather than a reason to
                            aim lower.
                        </p>
                    </DocSection>

                    <DocSection
                        id="3.5"
                        title="Questions 7 and 8: the two flags">
                        <p>
                            These are independent of size. A Small center and a Large center can
                            both carry them.
                        </p>
                        <p>
                            <strong>7. Do you access CJIS data through IDACS?</strong> Required. If
                            yes, artifacts that touch that data are marked, and their handling
                            requirements change. Part 7 covers what that means in practice.
                        </p>
                        <p>
                            <strong>8. Structure.</strong> Tick either, both, or neither.
                        </p>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>
                                <strong>Consolidated or multi-agency.</strong> Raises the profile on
                                inter-agency agreements and the documents that govern shared
                                responsibility.
                            </li>
                            <li>
                                <strong>Co-located with another agency.</strong> Raises the profile
                                on physical security and shared-space artifacts.
                            </li>
                        </ul>
                    </DocSection>

                    <DocSection
                        id="3.6"
                        title="What your profile changes">
                        <p>
                            Your profile affects two things, and it is worth being precise about
                            both so you are not looking for effects that are not there.
                        </p>
                        <p>
                            <strong>Which worked example you are offered.</strong> Most artifacts
                            ship with a filled-in example at Small, Medium, and Large. On your
                            results screens you are offered the one matching your profile, so the
                            example you see is scaled to a center like yours. The Full Library
                            offers all three if you want to compare.
                        </p>
                        <p>
                            <strong>The markers on each artifact.</strong> Where your profile has
                            scaled something up, or where a flag applies, the artifact carries a
                            small badge saying so: a technical or governance marker with its level,
                            a multi-agency or co-located marker, or a CJIS marker. These appear on
                            the <strong>Build Priority</strong> tab and in the{" "}
                            <strong>Full Library</strong>.
                        </p>
                        <p>
                            Your profile does <strong>not</strong> change which artifacts are on
                            your list. That comes from your assessment. The profile changes how you
                            should build them, not whether you need them.
                        </p>
                        <Screenshot
                            name="setup-profile-answered"
                            alt="The PSAP Profile panel filled in: a Small baseline from questions 1 to 3, questions 5 and 6 answered Large, CJIS access set to Yes, and both structure boxes ticked."
                        />
                    </DocSection>

                    <DocSection
                        id="3.7"
                        title="Saving it">
                        <p>
                            Your profile is saved when you press{" "}
                            <strong>Continue to Assessment</strong>. The button shows that it is
                            saving, then takes you to your results.
                        </p>
                        <p>
                            It is not saved as you type. If you leave the Setup screen another way,
                            unsaved changes are lost.
                        </p>
                        <p>
                            Your profile is yours alone, like your matrix. If several people at your
                            center use the library, agree the answers between you and have each
                            person enter the same ones. Otherwise two colleagues looking at the same
                            artifact will see different markers and be offered different worked
                            examples.
                        </p>
                        <p>
                            What the library stores is your nine answers, not the Small, Medium, or
                            Large verdict. Your profile is recalculated from your answers every time
                            you open the library, so the result always reflects the current guidance
                            rather than a conclusion frozen at the moment you first answered.
                        </p>
                    </DocSection>

                    <DocSection
                        id="3.8"
                        title="Changing it later">
                        <p>
                            Return to <strong>Setup</strong> at any time, change any answer, and
                            press <strong>Continue to Assessment</strong> again to save.
                        </p>
                        <p>
                            Worth doing after a reassessment. Capability is the thing most likely to
                            have moved: a new hire, a security coordinator appointed, monitoring
                            tooling brought in. If your center has grown into a higher baseline, the
                            library should know.
                        </p>
                    </DocSection>

                    <DocSection
                        id="3.9"
                        title="A worked example">
                        <p>
                            <strong>Wabash Valley Communications</strong> is a fictional
                            consolidated center serving two counties. Fourteen dispatchers across
                            two shifts. IT is handled by a shared three-person county team. A
                            supervisor covers security duties part-time alongside her other work.
                            Call handling runs dual CAD and ESInet redundancy across a mix of cloud
                            and on-premises systems. Policies exist and are maintained, though
                            informally. The center accesses CJIS data through IDACS.
                        </p>
                        <DocTable
                            headers={["Question", "Their answer", "Reads as"]}
                            rows={[
                                ["1. IT support", "Shared county IT", "Medium"],
                                ["2. Security ownership", "Part-time coordinator", "Medium"],
                                ["3. What they can sustain", "Some tooling, maintained", "Medium"],
                                ["4. Dispatchers", "14", "6 to 25"],
                                ["5. Call handling", "Dual redundancy, mixed cloud", "Medium"],
                                ["6. Governance", "Maintained but informal", "Medium"],
                                ["7. CJIS via IDACS", "Yes", "Flag"],
                                ["8. Structure", "Consolidated, multi-agency", "Flag"],
                            ]}
                        />
                        <p>
                            <strong>Result: a Medium baseline</strong>, set by questions 1 to 3,
                            which all read Medium. Questions 5 and 6 also read Medium, so nothing
                            scales above the baseline. Two flags fire. The consolidated flag raises
                            the profile on their inter-agency agreements. The CJIS flag marks every
                            artifact that touches IDACS data.
                        </p>
                        <p>
                            Now change one thing. Suppose the same center had pushed ahead to full
                            NG911 with several integrations while its staffing stayed where it is.
                            Question 5 would read Large while the baseline stayed Medium, and their
                            network, encryption, logging, and configuration artifacts would be
                            marked to build at the higher level. Everything else would stay Medium.
                        </p>
                        <p>
                            That gap is the whole point of scaling by area. It is common, it is not
                            a failing, and the library is built to handle it rather than force you
                            to pick one label for the entire center.
                        </p>
                    </DocSection>

                    {/* ---------------------------------------------------------------- Part 4 */}
                    <DocPart
                        number={4}
                        title="Reading your results"
                    />

                    <DocSection
                        id="4.1"
                        title="What the Assessment screen tells you">
                        <p>
                            The <strong>Assessment</strong> tab opens on a summary line: how many
                            questions were rated as gaps, how many artifacts address them, and how
                            many artifacts exist in the library altogether.
                        </p>
                        <p>
                            The first two numbers measure different things, so do not expect them to
                            match. Questions are what your assessment found; artifacts are the
                            documents that answer them. One policy can answer several questions, and
                            one question can call for several documents, so the counts can differ in
                            either direction. The artifact count is the one to plan around: each
                            document is listed once, however many gaps it closes, and the total can
                            never exceed the library&apos;s 163.
                        </p>
                        <p>
                            Below the summary are three tabs: <strong>Build Priority</strong>,{" "}
                            <strong>By Question</strong>, and <strong>Reference</strong>. They show
                            the same findings arranged for three different jobs.
                        </p>
                        <Screenshot
                            name="assessment-summary-and-tabs"
                            alt="The top of the Assessment screen: the summary line of gap questions and artifacts, and the Build Priority, By Question, and Reference tabs."
                        />
                    </DocSection>

                    <DocSection
                        id="4.2"
                        title="Tiers, and why the order matters">
                        <p>
                            Your artifacts are grouped into six tiers. The tiers are a sequence, not
                            categories: each one rests on the work of the one before it.
                        </p>
                        <DocTable
                            headers={["Tier", "Name", "What it settles"]}
                            rows={[
                                [
                                    "1",
                                    "Governance, Risk & Strategy",
                                    "Who is responsible, what you own, what your risks are",
                                ],
                                [
                                    "2",
                                    "Data, Access & Physical Foundation",
                                    "Who may reach what, and how your data and premises are protected",
                                ],
                                [
                                    "3",
                                    "Operational Planning & Technical Baseline",
                                    "How you will operate, respond, and keep answering calls",
                                ],
                                [
                                    "4",
                                    "Technical Implementation",
                                    "How the controls are actually configured",
                                ],
                                [
                                    "5",
                                    "Advanced Monitoring & Response",
                                    "How you detect, investigate, and recover",
                                ],
                                [
                                    "6",
                                    "Continuous Validation",
                                    "How you confirm all of it still works",
                                ],
                            ]}
                        />
                        <p>
                            The order is not arbitrary. You cannot write a meaningful backup policy
                            before you know which systems matter, and you cannot rank which systems
                            matter before you have an inventory. Working out of sequence usually
                            means writing a document twice.
                        </p>
                    </DocSection>

                    <DocSection
                        id="4.3"
                        title="Gates">
                        <p>
                            Some artifacts carry a <strong>Gate</strong> marker. These deserve more
                            attention than the badge suggests.
                        </p>
                        <Callout>
                            A gate is an artifact that must be reviewed, approved, and adopted
                            before the work that follows it can be done correctly. A gate settles a
                            decision the rest of your program inherits: what your agency owns, how
                            your data is classified, who may have access, how your network is laid
                            out, how calls keep being answered when the CAD is down.
                        </Callout>
                        <p>
                            Drafting past an open gate produces documents you will have to rewrite
                            once the decision lands. Sixteen of the 163 artifacts are gates, and
                            each one carries the <strong>Gate</strong> marker wherever it appears.
                        </p>
                        <Screenshot
                            name="assessment-artifact-row-actions"
                            alt="One artifact on the Build Priority tab, Cybersecurity & Privacy Policy, carrying the Document marker and the Gate marker."
                        />
                        <p>
                            A gate is a{" "}
                            <strong>decision checkpoint, not a source document others quote</strong>
                            : a point where your program should pause, get something approved, and
                            only then carry on.
                        </p>
                    </DocSection>

                    <DocSection
                        id="4.4"
                        title="The gate waves">
                        <p>
                            Fourteen of the sixteen gates fall into two waves. Use them alongside
                            the tier order: the tiers tell you what belongs together, the waves tell
                            you what has to be settled before the rest is worth drafting.
                        </p>
                        <p>
                            <strong>First wave.</strong> Settle these before serious drafting
                            begins.
                        </p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>Cybersecurity & Privacy Policy</li>
                            <li>Master Asset Inventory</li>
                            <li>Asset Criticality Ranking Matrix</li>
                            <li>Data Classification Policy</li>
                            <li>Risk Register</li>
                            <li>Incident Response Plan</li>
                            <li>Backup Call-Handling / Dispatch Continuity Procedure</li>
                            <li>Continuity of Operations Plan</li>
                            <li>Access Control Policy</li>
                            <li>Document Handling Standard</li>
                        </ul>
                        <p>
                            <strong>Second wave.</strong> Settle these before the technical
                            documentation that depends on them.
                        </p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>Network Architecture Diagram</li>
                            <li>Encryption Policy</li>
                            <li>Logging Policy</li>
                            <li>Change Management Policy</li>
                        </ul>
                        <p>
                            Two more artifacts are gates without sitting in either wave, because
                            they gate adoption rather than drafting: the{" "}
                            <strong>IT Support Accountability Agreement</strong> and the{" "}
                            <strong>Acceptable Use Policy</strong>. Nothing is waiting on them to be
                            written, but your program is not genuinely in place until both are
                            signed.
                        </p>
                        <p>
                            Notice that the waves cut across the tiers. The Document Handling
                            Standard sits in Tier 4 and is a first-wave gate; the Logging Policy
                            sits in Tier 1 and is second wave. That is deliberate, and it is why
                            both views are worth having.
                        </p>
                    </DocSection>

                    <DocSection
                        id="4.5"
                        title="Build Priority: your working list">
                        <p>
                            This is the tab to work from. It takes every artifact your gaps point
                            to, removes the duplicates, and puts them in build order: by tier, then
                            by the tier&apos;s own sequence of assessment categories. Among
                            artifacts for the same category, gates come first.
                        </p>
                        <p>
                            Each row shows the artifact name, whether it is a Word document or a
                            spreadsheet, any markers that apply, its type, and how many of your gaps
                            it closes.
                        </p>
                        <p>
                            That last number is worth watching, though the list is not ordered by
                            it. An artifact closing six gaps is worth building ahead of one closing
                            a single gap, all else being equal.
                        </p>
                        <Screenshot
                            name="assessment-build-priority-tier1"
                            alt="The Build Priority tab, showing the start of Tier 1: each artifact with its format marker, any Gate marker, its type and gap count, and its Download Template, Build Document, and Worked Example links."
                        />
                    </DocSection>

                    <DocSection
                        id="4.6"
                        title="By Question: why something is on your list">
                        <p>
                            The same artifacts, arranged by assessment question instead of by build
                            order, grouped under the 13 domains with each question&apos;s rating
                            beside it.
                        </p>
                        <p>
                            Use this tab when you want to answer &quot;why is this on my list?&quot;
                            or when you are working through a single domain with a particular
                            person. Click an artifact name to reveal what you can do with it.
                        </p>
                        <p>
                            This is also the view to bring to a conversation with leadership,
                            because it connects each document back to the assessment finding that
                            calls for it.
                        </p>
                        <Screenshot
                            name="assessment-by-question-domain"
                            alt="The By Question tab, showing the first domain, Governance, Risk & Strategy. The first question, rated Planned, has its three artifacts opened to show Download Template, Build Document, and Example links; the next two questions, rated No, list their artifacts unopened."
                        />
                    </DocSection>

                    <DocSection
                        id="4.7"
                        title="Reference: what you already have">
                        <p>
                            Questions you rated <strong>Yes</strong> or{" "}
                            <strong>Not Applicable</strong>, and the artifacts behind them.
                        </p>
                        <p>
                            These are not gaps. The tab exists for two reasons. It lets you confirm
                            that what you believe is in place genuinely is, which is worth doing
                            before an assessor asks. And it flags overlap: where an artifact you
                            already hold also answers an open gap elsewhere, it is marked{" "}
                            <strong>Also a gap</strong>.
                        </p>
                        <p>
                            That marker usually means you do not need to write a new document. You
                            need to extend the one you already have.
                        </p>
                        <Screenshot
                            name="assessment-reference-tab"
                            alt="The Reference tab: a summary saying 49 questions were rated Yes or Not Applicable and 60 of 80 referenced artifacts also address an open gap, then each Yes question with its artifacts and the Also a gap marker."
                        />
                    </DocSection>

                    <DocSection
                        id="4.8"
                        title="What the markers mean">
                        <DocTable
                            headers={["Marker", "Where it appears", "What it tells you"]}
                            rows={[
                                [
                                    <strong key="a">Document</strong>,
                                    "Everywhere",
                                    "A Word file. You can fill it in on the site, or download the blank template",
                                ],
                                [
                                    <strong key="a">Spreadsheet</strong>,
                                    "Everywhere",
                                    "An Excel file. Download it and complete it in Excel",
                                ],
                                [
                                    <strong key="a">Gate</strong>,
                                    "Everywhere",
                                    "A decision checkpoint. Approve and adopt this before the work that follows it",
                                ],
                                [
                                    <strong key="a">Gap</strong>,
                                    "Full Library",
                                    "This artifact addresses one of your open gaps",
                                ],
                                [
                                    <strong key="a">Also a gap</strong>,
                                    "Reference tab",
                                    "You have this already, and it also answers an open gap. Extend rather than rewrite",
                                ],
                                [
                                    <strong key="a">CJIS</strong>,
                                    "Build Priority, Full Library",
                                    "This artifact touches CJIS data. Stricter handling applies",
                                ],
                                [
                                    <>
                                        <strong>Technical</strong>, with a level
                                    </>,
                                    "Build Priority, Full Library",
                                    "Your call-handling environment scales this artifact above your baseline",
                                ],
                                [
                                    <>
                                        <strong>Governance</strong>, with a level
                                    </>,
                                    "Build Priority, Full Library",
                                    "Your governance maturity scales this artifact above your baseline",
                                ],
                                [
                                    <strong key="a">Multi-agency</strong>,
                                    "Build Priority, Full Library",
                                    "Applies because you are consolidated or multi-agency",
                                ],
                                [
                                    <strong key="a">Co-located</strong>,
                                    "Build Priority, Full Library",
                                    "Applies because you share space with another agency",
                                ],
                            ]}
                        />
                        <Screenshot
                            name="markers-on-artifact-rows"
                            alt="Six artifact rows showing every marker: Document, Spreadsheet, Gate, Gap, Also a gap, CJIS, the Technical and Governance markers with their levels, Multi-agency, and Co-located."
                        />
                        <p>
                            On the <strong>By Question</strong> and <strong>Reference</strong> tabs,
                            each question also carries its rating, so you can see at a glance which
                            gaps are untouched and which are already moving.
                        </p>
                    </DocSection>

                    <DocSection
                        id="4.9"
                        title="What you can do with an artifact">
                        <p>
                            Every artifact offers up to three actions. On{" "}
                            <strong>Build Priority</strong> they are on the row; on{" "}
                            <strong>By Question</strong> and <strong>Reference</strong>, click the
                            artifact name to reveal them.
                        </p>
                        <Screenshot
                            name="assessment-artifact-row-actions"
                            alt="One artifact on the Build Priority tab, Cybersecurity & Privacy Policy, with its three actions on the row: Download Template, Build Document, and Worked Example (Small)."
                        />
                        <p>
                            <strong>Download Template.</strong> The blank document, with its
                            guidance notes intact. Use it when you would rather work in Word from
                            the start, or when you want to read the whole thing before filling
                            anything in.
                        </p>
                        <p>
                            <strong>Build Document.</strong> Fill the template in on the site, with
                            a live preview, then download the result. Word documents only;
                            spreadsheets do not offer it. Part 6 covers this in full.
                        </p>
                        <p>
                            <strong>Worked Example.</strong> A completed specimen for a center like
                            yours, at your profile size. The single most useful thing here if you
                            have never written the document before: it shows you the level of detail
                            expected, in a form you can read in five minutes.
                        </p>
                        <p>
                            Not every artifact offers all three, and the markers on the row tell you
                            which to expect before you click.
                        </p>
                    </DocSection>

                    {/* ---------------------------------------------------------------- Part 5 */}
                    <DocPart
                        number={5}
                        title="The Full Library"
                    />

                    <DocSection
                        id="5.1"
                        title="What it is for">
                        <p>
                            <strong>Full Library</strong> shows all 163 artifacts, whether or not
                            you have an assessment loaded. Your build list is the shorter,
                            prioritised view; this is everything.
                        </p>
                        <p>Three good reasons to come here:</p>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>
                                <strong>To look one document up.</strong> You have been asked for a
                                visitor log or a change request form and you want it now, without
                                going through your results.
                            </li>
                            <li>
                                <strong>To see what is coming.</strong> Your build list covers your
                                current gaps. The library shows what a complete program looks like.
                            </li>
                            <li>
                                <strong>To compare worked examples.</strong> Your results offer the
                                example matching your profile. The library offers all three sizes,
                                which is the easiest way to see how much the expected detail changes
                                between a Small and a Large center.
                            </li>
                        </ul>
                        <p>
                            If you have an assessment loaded, artifacts that address one of your
                            gaps carry a <strong>Gap</strong> marker here, so you can tell your
                            priorities from the rest at a glance.
                        </p>
                        <Screenshot
                            name="library-type-filter"
                            alt="The Full Library with the type filter set to Checklist, showing 6 of 163 artifacts."
                        />
                    </DocSection>

                    <DocSection
                        id="5.2"
                        title="Searching and filtering">
                        <p>A search box and a type filter sit above the list.</p>
                        <p>
                            <strong>Search</strong> matches artifact names and types. It does not
                            search assessment questions, and it does not search inside the
                            documents. Searching &quot;backup&quot; finds artifacts with backup in
                            the name, not every document that mentions backups.
                        </p>
                        <p>
                            <strong>Filter by type</strong> narrows the list to one of the 16
                            artifact types. Combine it with a search to work through a category
                            methodically.
                        </p>
                        <p>
                            The count above the list tells you how many artifacts match what you
                            have entered.
                        </p>
                    </DocSection>

                    <DocSection
                        id="5.3"
                        title="What each row offers">
                        <p>
                            The same three actions described in section 4.9:{" "}
                            <strong>Download Template</strong>, <strong>Build Document</strong> for
                            Word artifacts, and <strong>Worked Example</strong>.
                        </p>
                        <p>
                            One difference from your results screens. Here you are offered the
                            worked example at <strong>all three sizes</strong>, Small, Medium, and
                            Large, rather than only the one matching your profile.
                        </p>
                        <p>
                            One thing to know if you arrive here before completing your profile: the
                            scaling markers read from your saved profile, so until you have one the
                            library shows the markers for a Small center. Complete your profile in
                            Setup and they will reflect your own.
                        </p>
                    </DocSection>

                    <DocSection
                        id="5.4"
                        title="What is in the library">
                        <p>
                            163 artifacts across 16 types. The type tells you the format, with no
                            exceptions:
                        </p>
                        <p>
                            <strong>Five types are spreadsheets</strong>, completed in Excel:
                        </p>
                        <DocTable
                            headers={["Type", "Count"]}
                            rows={[
                                ["Log / Record", "30"],
                                ["Inventory / Register", "20"],
                                ["Reference Matrix", "6"],
                                ["Schedule", "6"],
                                ["Financial Ledger", "1"],
                            ]}
                        />
                        <p>
                            <strong>Eleven types are Word documents</strong>, which you can fill in
                            on the site:
                        </p>
                        <DocTable
                            headers={["Type", "Count"]}
                            rows={[
                                ["Policy", "27"],
                                ["Procedure", "20"],
                                ["Configuration Record", "14"],
                                ["Report / Assessment", "8"],
                                ["Agreement / Form", "7"],
                                ["Checklist", "6"],
                                ["Standard", "6"],
                                ["Plan", "5"],
                                ["Architecture / Design", "4"],
                                ["Meeting Minutes", "2"],
                                ["Training Material", "1"],
                            ]}
                        />
                        <p>
                            That comes to 63 spreadsheets and 100 Word documents. The split is a
                            useful thing to know when you plan the work: the spreadsheets are
                            registers and logs your center fills in and keeps current, while the
                            Word documents are the policies, procedures, and plans that need
                            drafting and approval.
                        </p>
                        <p>
                            Every artifact in the library has a template, and every one has worked
                            examples at all three profile sizes. You will never find an artifact on
                            your list with nothing behind it.
                        </p>
                    </DocSection>

                    {/* ---------------------------------------------------------------- Part 6 */}
                    <DocPart
                        number={6}
                        title="Building a document"
                    />

                    <DocSection
                        id="6.1"
                        title="What Build Document does, and what it leaves you">
                        <p>
                            Read this before you use the builder for the first time. The name
                            promises a finished document, and what you get is a strong draft.
                        </p>
                        <p>Here is the honest division of labour on a typical artifact.</p>
                        <p>
                            <strong>The template already contains the document.</strong> The policy
                            language, the procedure steps, the section structure, the regulatory
                            references: those are written. You are not starting from an empty page,
                            and most of what you read in the finished file is text you will keep as
                            it stands.
                        </p>
                        <p>
                            <strong>The builder fills the recurring details.</strong> Around twenty
                            per document: your agency name, a version, an effective date, a review
                            date, an owner&apos;s role, a reviewer, a signing title. These appear
                            over and over throughout a document, and typing them once instead of
                            twenty times is the saving the builder exists to provide.
                        </p>
                        <p>
                            <strong>You supply what only your center knows.</strong> Entries in the
                            tables that call for them, a small number of bracketed prompts inside
                            the prose such as <em>[Add Agency-specific systems.]</em>, and anything
                            specific to how your center actually operates. Most documents have only
                            one or two of these prompts; a few have a dozen.
                        </p>
                        <p>
                            <strong>You remove the drafting guidance.</strong> Every template
                            carries notes written to help whoever fills it in, and those come out
                            before you publish. Section 6.10 covers exactly what to look for.
                        </p>
                        <p>So the shape of the job is this:</p>
                        <Callout>
                            The builder handles the repetition. The template handles the language.
                            You handle the specifics, then clean up.
                        </Callout>
                        <p>
                            The builder fills single values wherever they appear, including inside a
                            table cell. What it will not do is add rows to a table, or fill a cell
                            that has no field of its own, such as the Y / N / NA column on a
                            checklist. Expect to add rows and complete those cells in Word after
                            downloading.
                        </p>
                        <Screenshot
                            name="builder-form-and-preview"
                            alt="The Build Document window: form fields on the left and a live preview of the document on the right, with the first Evidence cell of the table highlighted."
                            enlarge
                        />
                    </DocSection>

                    <DocSection
                        id="6.2"
                        title="Which artifacts can be built">
                        <p>Word documents only, which is 100 of the 163 artifacts.</p>
                        <p>
                            The 63 spreadsheets have no <strong>Build Document</strong> action, by
                            design: a register is filled in Excel, where you can sort it, filter it,
                            and keep adding to it. Download the template and work in Excel.
                        </p>
                        <p>
                            The marker on every row tells you which you are looking at before you
                            click.
                        </p>
                        <Screenshot
                            name="assessment-spreadsheet-and-document-rows"
                            alt="Two artifact rows on the Build Priority tab. Data Retention Schedule, marked Spreadsheet, offers Download Template and Worked Example (Small) but no Build Document. Data Labeling Procedures, marked Document, offers Build Document as well."
                        />
                    </DocSection>

                    <DocSection
                        id="6.3"
                        title="The builder window">
                        <p>
                            <strong>Build Document</strong> opens a window with the form on the left
                            and a live preview on the right.
                        </p>
                        <p>
                            The preview is a readable rendering of the actual template. As you type,
                            your answers appear in place. Fields you have not filled show their name
                            in brackets, so you can see at a glance how much is still outstanding.
                        </p>
                        <p>
                            It is also the fastest way to size up a document before committing to
                            it. Scroll the preview and you will see how long it is, how many tables
                            it has, and how much of it is already written.
                        </p>
                        <p>
                            On a narrow screen the preview is hidden and only the form is shown. Use
                            a laptop or desktop for this part if you can.
                        </p>
                    </DocSection>

                    <DocSection
                        id="6.4"
                        title="Fields that fill themselves">
                        <p>
                            One field fills itself: your <strong>agency name</strong>, taken from
                            your assessment matrix. It is marked <em>from your assessment</em> so
                            you know where it came from. It appears in 93 of the 100 Word templates.
                        </p>
                        <p>
                            Version fields start at <strong>1.0</strong>. That is a sensible default
                            for a document your center is adopting for the first time, not a value
                            carried from anywhere. Change it if you are revising something you
                            already have.
                        </p>
                        <Screenshot
                            name="builder-agency-name-and-highlights"
                            alt="The top of the Build Document window for the Account Provisioning & Deprovisioning Checklist. Agency Name is filled in and tagged from your assessment, Signing Official & Title is empty, and Version is set to 1.0. In the preview beside it, the agency name and the version are highlighted in green, and the fields still empty show their names in brackets."
                            enlarge
                        />
                        <p>Everything else you enter yourself.</p>
                    </DocSection>

                    <DocSection
                        id="6.5"
                        title="The kinds of field you will meet">
                        <p>
                            <strong>Single-line text</strong> for names, titles, and short values.
                        </p>
                        <p>
                            <strong>Multi-line text</strong> for anything longer.
                        </p>
                        <p>
                            <strong>Dates</strong>, with a date picker.
                        </p>
                        <p>
                            <strong>Suggestion lists</strong>, where a dropdown offers common
                            answers. These are <strong>suggestions, not restrictions</strong>. Pick
                            one if it fits, or type your own value over it. If your center uses
                            different terminology, use your own.
                        </p>
                        <Screenshot
                            name="builder-suggestion-list"
                            alt="The IT Support Model field open as a suggestion list, offering County IT, Vendor, and In-house. In the preview beside it, the IT Support Model placeholder is highlighted in the Roles & Responsibilities table."
                            enlarge
                        />
                        <p>
                            Where a document uses the same kind of value in several places, the
                            fields are numbered to tell them apart, for example a second and third
                            effective date. If you are unsure which is which, click into the field
                            and watch the preview: it will show you exactly where that value lands.
                        </p>
                    </DocSection>

                    <DocSection
                        id="6.6"
                        title="Seeing where your answers go">
                        <p>
                            Click into any field and the preview highlights every place that value
                            appears, then scrolls to the first one.
                        </p>
                        <p>
                            This is more useful than it sounds. A single answer often lands in five
                            or six places across a document, and this is how you confirm that an
                            owner&apos;s role or a review date is going where you expect. It is also
                            the quickest way to understand a document you did not write.
                        </p>
                        <Screenshot
                            name="builder-field-highlight-plain"
                            alt="The All Personnel (scope) field, clicked into and outlined in blue. In the preview beside it, the All Personnel (scope) placeholder is outlined in matching blue in the Roles & Responsibilities table."
                            enlarge
                        />
                    </DocSection>

                    <DocSection
                        id="6.7"
                        title="Limits, and things that can interrupt you">
                        <p>
                            <strong>Nothing in the builder is saved.</strong> This is the one real
                            trap in the library. Close the window, lose your connection, or let your
                            session lapse, and everything you have typed is gone. There is no draft
                            and no recovery.
                        </p>
                        <p>
                            So:{" "}
                            <strong>
                                start a document when you have time to finish and download it.
                            </strong>{" "}
                            If you are interrupted and have to leave, download what you have. A
                            partly complete document you can reopen in Word beats an empty one you
                            have to start again.
                        </p>
                        <p>
                            If your session ends while you are in the builder, you may see a short
                            technical message such as <em>Unauthorized</em>. It means your session
                            expired, nothing more. Close the panel, reopen the library from{" "}
                            <strong>Tools</strong>, and start the document again.
                        </p>
                        <p>
                            Individual fields hold up to 5,000 characters, which is far more than
                            any of them need. If you find yourself pasting several pages into one
                            field, it probably belongs in an appendix rather than in that slot.
                        </p>
                    </DocSection>

                    <DocSection
                        id="6.8"
                        title="If a template has nothing to fill">
                        <p>
                            Every Word template has fields for the builder to fill. If you ever open
                            one that has none, the builder says so and points you to the download
                            instead. Nothing is wrong; that artifact is simply one you complete
                            entirely in Word.
                        </p>
                    </DocSection>

                    <DocSection
                        id="6.9"
                        title="Downloading">
                        <p>
                            Press <strong>Download</strong>. The library generates the document and
                            your browser saves it, named after the artifact with{" "}
                            <strong>COMPLETED</strong> on the end.
                        </p>
                        <p>
                            Two things about that name. <strong>COMPLETED</strong> refers to the
                            fields, not the document: the file still needs the work in 6.10. And
                            this is your only copy, because the library does not keep one. Save it
                            somewhere your center will find it again.
                        </p>
                    </DocSection>

                    <DocSection
                        id="6.10"
                        title="Finishing the document in Word">
                        <p>Open the file. Two jobs remain, and both matter.</p>
                        <p>
                            <strong>First, add what only you can.</strong> Complete any tables that
                            call for entries, answer any bracketed prompts left in the prose, and
                            add anything specific to your center. This is the substance the template
                            cannot supply.
                        </p>
                        <p>
                            <strong>Second, remove the drafting guidance.</strong> Every template
                            carries material written for whoever fills it in, and none of it belongs
                            in a published document:
                        </p>
                        <DocTable
                            headers={["What to look for", "What it is"]}
                            rows={[
                                [
                                    <>
                                        A box headed <strong>How to use this template</strong>
                                    </>,
                                    "Instructions for filling the document in. It tells you to delete it",
                                ],
                                [
                                    <>
                                        A block headed <strong>Drafter&apos;s note</strong>
                                    </>,
                                    "Internal notes for whoever prepares the artifact. Marked internal, and it must not remain",
                                ],
                                [
                                    "Notes between « and » marks",
                                    "Guidance on what to write in that spot. Typically eight or so per document",
                                ],
                                [
                                    "Rows offering Small, Medium, and Large options",
                                    "Guidance tables. Keep the row matching your profile, delete the other two",
                                ],
                                [
                                    <>
                                        An italic line above the{" "}
                                        <strong>Profile Scaling Notes</strong> table
                                    </>,
                                    "Instructions for writing the profile rows. It is not part of the document, so delete it",
                                ],
                                [
                                    <>
                                        An italic line at the top of the{" "}
                                        <strong>Source Authority</strong> box
                                    </>,
                                    "Instructions for listing your authorities. Delete the line and keep the list beneath it",
                                ],
                            ]}
                        />
                        <p>
                            <strong>Checklist before you publish</strong>
                        </p>
                        <Checklist
                            items={[
                                "Every table completed or marked as deliberately empty",
                                "Every bracketed prompt answered or removed",
                                <>
                                    The <strong>How to use this template</strong> box deleted
                                </>,
                                <>
                                    The <strong>Drafter&apos;s note</strong> block deleted
                                </>,
                                "Every « » guidance note deleted",
                                "Small / Medium / Large guidance rows reduced to your own",
                                <>
                                    The italic instruction lines under{" "}
                                    <strong>Profile Scaling Notes</strong> and{" "}
                                    <strong>Source Authority</strong> deleted
                                </>,
                                "Version, dates, and named roles checked",
                                "The classification line correct for your center, see Part 7",
                            ]}
                        />
                        <p>
                            This last step is not optional housekeeping. A document filed with its
                            drafter&apos;s notes intact puts internal working material into your
                            compliance record, where an auditor will read it.
                        </p>
                        <Screenshot
                            name="word-cleanup-annotated"
                            alt="Excerpts of a downloaded Word template with the material to remove outlined and labeled: « » guidance notes, the How to use this template box, italic instruction lines, the Small, Medium, and Large rows, and the Drafter's note."
                        />
                    </DocSection>

                    {/* ---------------------------------------------------------------- Part 7 */}
                    <DocPart
                        number={7}
                        title="After the download"
                    />

                    <DocSection
                        id="7.1"
                        title="What you have, and what you do not">
                        <p>You have a draft. A good one, but a draft.</p>
                        <p>
                            A document becomes an artifact when your center has reviewed it,
                            approved it, adopted it, and knows where it lives. Until then it is a
                            file in your downloads folder, and it will not satisfy an assessor, an
                            auditor, or a grant condition.
                        </p>
                        <p>
                            The library has no part in that step. It cannot approve anything, does
                            not know what you have adopted, and keeps no copy. Everything from here
                            is your center&apos;s process.
                        </p>
                    </DocSection>

                    <DocSection
                        id="7.2"
                        title="Reviewing it">
                        <p>
                            Assuming you have finished the work in section 6.10, this is a review
                            pass rather than a completion pass.
                        </p>
                        <p>
                            Read it as though you had received it from someone else, and check four
                            things.
                        </p>
                        <p>
                            <strong>Is it true?</strong> The template describes a center doing the
                            right thing. Your document has to describe your center. If a paragraph
                            says the Agency reviews something quarterly and you do not, either
                            commit to quarterly or change the document. A policy nobody follows is
                            worse than no policy, because it documents a failure.
                        </p>
                        <p>
                            <strong>Are the roles real?</strong> Documents name roles rather than
                            people, deliberately, so they survive staff turnover. Check that each
                            named role exists at your center and that whoever holds it knows they
                            own it.
                        </p>
                        <p>
                            <strong>Are the dates right?</strong> An effective date you can defend,
                            and a review date you will actually meet.
                        </p>
                        <p>
                            <strong>Is anything left over?</strong> Bracketed prompts, guidance
                            notes, or Small and Large guidance rows that should have gone. One more
                            look costs a minute.
                        </p>
                    </DocSection>

                    <DocSection
                        id="7.3"
                        title="Approving and adopting">
                        <p>
                            Every artifact has a place for approval at the foot of the document,
                            because approval is what makes it binding.
                        </p>
                        <Screenshot
                            name="word-sign-off-and-revision-history"
                            alt="The foot of a downloaded Word template before it is filled in: a Sign-off table with Role, Name, Signature, and Date columns and rows for who completed it and who reviewed it, above a Revision History table with Version, Date, Author, and Summary of Change columns."
                        />
                        <p>
                            How your center does that is yours to decide. What matters is that the
                            answers exist:
                        </p>
                        <ul className="list-disc pl-5 space-y-1.5">
                            <li>
                                <strong>Who owns it</strong>, as a role
                            </li>
                            <li>
                                <strong>Who approved it</strong>, and when it takes effect
                            </li>
                            <li>
                                <strong>When it will be reviewed</strong>, and who does that
                            </li>
                            <li>
                                <strong>Who has been told about it</strong>, where the document
                                changes how people work
                            </li>
                        </ul>
                        <p>
                            That last one is easy to skip. An acceptable use policy nobody has read
                            does not change behaviour, and several artifacts in the library exist
                            precisely to record that staff were told and acknowledged it.
                        </p>
                    </DocSection>

                    <DocSection
                        id="7.4"
                        title="Classification, and what it requires of you">
                        <p>
                            Every artifact carries a classification: <strong>Internal</strong>,{" "}
                            <strong>Restricted</strong>, or <strong>Confidential</strong>, some with{" "}
                            <strong>/ CJIS</strong> appended. This is a handling instruction, not a
                            label.
                        </p>
                        <p>
                            Your center&apos;s own <strong>Data Classification Policy</strong> is
                            the authority, and it is itself an artifact in the library. It is also a
                            first-wave gate, which is not a coincidence: how you classify data
                            determines the controls on everything downstream. Until you have adopted
                            it, treat the classification shown on each artifact as your floor.
                        </p>
                        <p>
                            The three tiers, as the library&apos;s Data Classification Policy
                            defines them:
                        </p>
                        <DocTable
                            headers={["Tier", "Typical PSAP content", "Minimum protection"]}
                            rows={[
                                [
                                    <strong key="a">Internal</strong>,
                                    "Operational documents not meant for public release",
                                    "Access limited to agency personnel. Not posted publicly",
                                ],
                                [
                                    <strong key="a">Restricted</strong>,
                                    "Network and system detail, incident response and continuity plans, access rosters",
                                    "Need-to-know access. Encrypted in transit. Handled per your Document Handling Standard",
                                ],
                                [
                                    <strong key="a">Confidential</strong>,
                                    "Staff and incident-subject personal information, signed acknowledgments, vetting records",
                                    "Strict need-to-know. Encrypted at rest and in transit. Controlled storage and disposal",
                                ],
                            ]}
                        />
                        <p>Three rules govern how you apply these.</p>
                        <p>
                            <strong>
                                The classification shown is a minimum. You may raise it, never lower
                                it.
                            </strong>{" "}
                            If your version of a policy embeds specific operational detail or
                            response logic, it belongs at a higher tier than the template&apos;s
                            floor.
                        </p>
                        <p>
                            <strong>Unlabeled is treated as Restricted.</strong> The safe default is
                            the strict one.
                        </p>
                        <p>
                            <strong>CJIS is an overlay, not a fourth tier.</strong> Where
                            CJIS-regulated data is in scope, <strong>/ CJIS</strong> is appended to
                            the existing classification and CJIS-specific handling applies on top,
                            governed by your CJIS Data Handling Addendum. Your profile answer to
                            question 7 is what causes these artifacts to be marked for you.
                        </p>
                        <p>
                            For reference, across the library: 86 artifacts are Restricted, 53 are
                            Internal, and 24 are Confidential. 35 carry the CJIS overlay. Restricted
                            is the most common tier by some distance, so treat careful handling as
                            the norm rather than the exception.
                        </p>
                    </DocSection>

                    <DocSection
                        id="7.5"
                        title="Where to keep them">
                        <p>
                            The library does not store your finished documents, so your center needs
                            somewhere that it does.
                        </p>
                        <p>
                            Wherever that is, it has to satisfy the classifications above. A shared
                            drive that everyone in the building can read is not a home for
                            Confidential artifacts, and several of these documents describe how your
                            network is laid out and who holds privileged access. That is exactly the
                            material an attacker would want.
                        </p>
                        <p>Practical minimums:</p>
                        <ul className="list-disc pl-5 space-y-1.5">
                            <li>
                                <strong>One known location</strong>, so nobody is hunting for the
                                current version
                            </li>
                            <li>
                                <strong>Access controlled by need to know</strong>, matching the
                                classification on each document
                            </li>
                            <li>
                                <strong>Version and date visible</strong>, which the templates
                                already provide at the top of each file
                            </li>
                            <li>
                                <strong>A review reminder</strong>, because a policy that expires
                                quietly is a gap you will meet again at your next assessment
                            </li>
                        </ul>
                    </DocSection>

                    <DocSection
                        id="7.6"
                        title="The spreadsheets are different">
                        <p>
                            The 63 spreadsheet artifacts work on a different rhythm from the Word
                            documents.
                        </p>
                        <p>
                            A policy is drafted, approved, and then reviewed periodically. A
                            register is never finished. Your asset inventory, visitor log, risk
                            register, and access review records are living documents, and their
                            value is entirely in being current. An inventory eighteen months out of
                            date is worse than none, because it is trusted and wrong.
                        </p>
                        <p>
                            So when you plan the work, treat them as two different jobs. The Word
                            documents need drafting time and an approval decision. The spreadsheets
                            need an owner and a routine.
                        </p>
                    </DocSection>

                    <DocSection
                        id="7.7"
                        title="Coming back">
                        <p>
                            Your assessment and your profile are saved, so returning costs you
                            nothing. Open the library from <strong>Tools</strong> and your build
                            list is where you left it.
                        </p>
                        <p>
                            This matters more than it sounds. No center closes 163 gaps in a
                            sitting, or a month. The library is built to be worked through over
                            time, a few artifacts at a stretch, and to be waiting for you when you
                            come back.
                        </p>
                        <p>
                            <strong>After a reassessment</strong>, use{" "}
                            <strong>Replace Assessment Matrix</strong> on the Setup screen with your
                            new workbook, then revisit your profile if your center&apos;s capability
                            has moved. Your build list rebuilds against the new results, and it
                            should be shorter. Anyone else at your center who uses the library does
                            the same with their own login.
                        </p>
                        <p>
                            <strong>One thing to track yourself.</strong> The library does not know
                            what you have finished. Your build list reflects your most recent
                            assessment, not your progress against it, so an artifact you adopted
                            last month still appears until your next assessment says otherwise. Keep
                            a record of what is drafted, approved, and adopted, and keep one for the
                            whole center rather than one per person, since nobody&apos;s library
                            knows what a colleague has finished. A single spreadsheet with the
                            artifact name, its owner, its status, and its adoption date is enough,
                            and it will save you at your next assessment.
                        </p>
                    </DocSection>
                </DocCard>
            </div>
        </main>
    );
}
