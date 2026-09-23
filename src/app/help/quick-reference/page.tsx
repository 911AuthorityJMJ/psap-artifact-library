import type { Metadata } from "next";
import {
    HelpHeader,
    DocCard,
    DocH2,
    DocTable,
    Checklist,
    GuideRefs,
    GuideRef,
    Screenshot,
} from "@/components/docs/DocPrimitives";

export const metadata: Metadata = {
    title: "Quick Reference — PSAP Artifact Library",
};

export default function QuickReferencePage() {
    return (
        <main className="min-h-screen p-8">
            <div className="max-w-3xl mx-auto">
                <HelpHeader
                    title="Quick Reference"
                    current="/help/quick-reference"
                />

                <DocCard>
                    <DocH2>The three results tabs</DocH2>
                    <DocTable
                        headers={["Tab", "Use it to"]}
                        rows={[
                            [
                                <strong key="a">Build Priority</strong>,
                                "Work through your list, in build order",
                            ],
                            [
                                <strong key="a">By Question</strong>,
                                "See why an artifact is on your list",
                            ],
                            [
                                <strong key="a">Reference</strong>,
                                "Check what you already have in place",
                            ],
                        ]}
                    />
                    <Screenshot
                        name="assessment-results-tabs"
                        alt="The three results tabs: Build Priority, By Question, and Reference."
                    />
                    <GuideRefs>
                        <GuideRef id="4.5">4.5</GuideRef> to <GuideRef id="4.7">4.7</GuideRef>.
                    </GuideRefs>

                    <DocH2>What you can do with an artifact</DocH2>
                    <DocTable
                        headers={["Action", "What it gives you"]}
                        rows={[
                            [
                                <strong key="a">Build Document</strong>,
                                "Fill in the recurring details on the site, then download the Word file. Word documents only",
                            ],
                            [
                                <strong key="a">Download Template</strong>,
                                "The blank file, to complete yourself",
                            ],
                            [
                                <strong key="a">Worked Example</strong>,
                                "A completed specimen for a center your size",
                            ],
                        ]}
                    />
                    <Screenshot
                        name="assessment-artifact-row-actions"
                        alt="One artifact on the Build Priority tab: Cybersecurity & Privacy Policy, marked Document and Gate, with its Download Template, Build Document, and Worked Example (Small) links."
                    />
                    <GuideRefs>
                        <GuideRef id="4.9" />.
                    </GuideRefs>

                    <DocH2>Markers</DocH2>
                    <DocTable
                        headers={["Marker", "Meaning"]}
                        rows={[
                            [
                                <strong key="a">Document</strong>,
                                "Word file. Build it on the site, or download the template",
                            ],
                            [
                                <strong key="a">Spreadsheet</strong>,
                                "Excel file. Download it and complete it in Excel",
                            ],
                            [
                                <strong key="a">Gate</strong>,
                                "Approve and adopt this before the work that depends on it",
                            ],
                            [<strong key="a">Gap</strong>, "Addresses one of your open gaps"],
                            [
                                <strong key="a">Also a gap</strong>,
                                "You already have this, and it answers an open gap too. Extend it rather than start over",
                            ],
                            [
                                <strong key="a">CJIS</strong>,
                                "Touches CJIS data. Stricter handling applies",
                            ],
                            [
                                <>
                                    <strong>Technical</strong>, <strong>Governance</strong>
                                </>,
                                "Your profile scales this above your baseline",
                            ],
                            [
                                <>
                                    <strong>Multi-agency</strong>, <strong>Co-located</strong>
                                </>,
                                "Applies because of your center's structure",
                            ],
                        ]}
                    />
                    <Screenshot
                        name="markers-on-artifact-rows"
                        alt="Six artifact rows showing every marker: Document, Spreadsheet, Gate, Gap, Also a gap, CJIS, the Technical and Governance markers with their levels, Multi-agency, and Co-located."
                    />
                    <GuideRefs>
                        <GuideRef id="4.8" />.
                    </GuideRefs>

                    <DocH2>Ratings</DocH2>
                    <ul className="list-disc pl-5 space-y-2 text-sm text-gray-700 leading-relaxed">
                        <li>
                            <strong>Gaps:</strong> No, In Progress, Planned, Unknown. These build
                            your list.
                        </li>
                        <li>
                            <strong>Covered:</strong> Yes, Not Applicable. These appear on the{" "}
                            <strong>Reference</strong> tab.
                        </li>
                    </ul>
                    <GuideRefs>
                        <GuideRef id="2.3" />.
                    </GuideRefs>

                    <DocH2>Before you publish a document</DocH2>
                    <Checklist
                        items={[
                            "Tables completed",
                            "Bracketed prompts answered or removed",
                            <>
                                <strong>How to use this template</strong> box deleted
                            </>,
                            <>
                                <strong>Drafter&apos;s note</strong> deleted
                            </>,
                            "Guidance notes between « and » deleted",
                            "Small, Medium, and Large guidance rows reduced to the one for your profile",
                            <>
                                Instruction lines under <strong>Profile Scaling Notes</strong> and{" "}
                                <strong>Source Authority</strong> deleted
                            </>,
                            "Version, dates, and named roles checked",
                            "Classification checked. You may raise it, never lower it",
                        ]}
                    />
                    <GuideRefs>
                        <GuideRef id="6.10" />, <GuideRef id="7.4" />.
                    </GuideRefs>

                    <DocH2>If something goes wrong</DocH2>
                    <DocTable
                        headers={["If you see", "Do this"]}
                        rows={[
                            [
                                <>
                                    Your session has expired, or <em>Unauthorized</em>
                                </>,
                                <>
                                    Close the panel and reopen the library from{" "}
                                    <strong>Tools</strong>
                                </>,
                            ],
                            [
                                <>
                                    A sheet was not found, or only{" "}
                                    <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">
                                        .xlsx
                                    </code>{" "}
                                    files are accepted
                                </>,
                                "Upload the matrix exactly as it was delivered",
                            ],
                            [
                                "Your saved matrix is missing when you return",
                                <>
                                    Reopen from <strong>Tools</strong> first. If it is still
                                    missing, upload it again
                                </>,
                            ],
                            ["Your matrix could not be saved", "Upload it again before you leave"],
                            [
                                "A colleague's library is empty",
                                "Saved data belongs to each login. They upload the matrix and enter the profile answers themselves",
                            ],
                            ["Could not reach the server", "Check your connection and try again"],
                            [
                                "Temporarily unavailable",
                                "Try again shortly. If it continues, contact 911 Authority",
                            ],
                        ]}
                    />
                    <GuideRefs>
                        <GuideRef id="1.3" />, <GuideRef id="2.7" />, <GuideRef id="6.7" />.
                    </GuideRefs>
                </DocCard>
            </div>
        </main>
    );
}
