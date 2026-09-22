import type { Metadata } from "next";
import {
    HelpHeader,
    DocCard,
    DocH2,
    GuideRefs,
    GuideRef,
    Screenshot,
} from "@/components/docs/DocPrimitives";

export const metadata: Metadata = {
    title: "Quick Start — PSAP Artifact Library",
};

export default function QuickStartPage() {
    return (
        <main className="min-h-screen p-8">
            <div className="max-w-3xl mx-auto">
                <HelpHeader
                    title="Quick Start"
                    subtitle="The Artifact Library turns your completed security assessment into a build list: the documents your center still needs, the order to build them in, and a head start on writing each one."
                    current="/help/quick-start"
                />

                <DocCard>
                    <DocH2>Get started</DocH2>
                    <ol className="list-decimal pl-5 space-y-2 text-sm text-gray-700 leading-relaxed">
                        <li>
                            <strong>Upload your assessment matrix.</strong> Use the{" "}
                            <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">.xlsx</code>{" "}
                            workbook from your deliverable package, exactly as you received it. It
                            stays saved to your login.
                            <Screenshot
                                name="setup-upload-panel"
                                alt="The Setup screen on first use, showing the dashed panel to click to upload the assessment matrix."
                            />
                        </li>
                        <li>
                            <strong>Complete your profile.</strong> Answer questions 1 to 7, then
                            press <strong>Continue to Assessment</strong>.
                            <Screenshot
                                name="setup-profile-answered-baseline"
                                alt="The top of the PSAP Profile panel with questions 1 to 3 answered and the resulting baseline profile, Small, shown beneath them."
                            />
                        </li>
                        <li>
                            <strong>Open Build Priority.</strong> Settle the artifacts marked{" "}
                            <strong>Gate</strong> first, then work through the rest.
                        </li>
                        <li>
                            <strong>Build each artifact.</strong> For a Word document, use{" "}
                            <strong>Build Document</strong> or <strong>Download Template</strong>.
                            For a spreadsheet, download it and complete it in Excel. If you have
                            never written one before, open the <strong>Worked Example</strong>{" "}
                            first.
                            <Screenshot
                                name="assessment-artifact-row-actions"
                                alt="One artifact on the Build Priority tab: Cybersecurity & Privacy Policy, marked Document and Gate, with its Download Template, Build Document, and Worked Example (Small) links."
                            />
                        </li>
                        <li>
                            <strong>Finish, then adopt.</strong> Complete the document in Word or
                            Excel, then approve and adopt it through your center&apos;s usual
                            process.
                        </li>
                    </ol>
                    <GuideRefs>
                        <GuideRef id="part-1">Parts 1</GuideRef> to{" "}
                        <GuideRef id="part-7">7</GuideRef>.
                    </GuideRefs>

                    <DocH2>Know this first</DocH2>
                    <ul className="list-disc pl-5 space-y-2 text-sm text-gray-700 leading-relaxed">
                        <li>
                            <strong>
                                Your matrix and profile are saved. The document builder is not.
                            </strong>{" "}
                            Start a document only when you can finish and download it in one
                            sitting.
                        </li>
                        <li>
                            <strong>What is saved belongs to your login, not your center.</strong> A
                            colleague who uses the library starts with nothing saved: they upload
                            the same matrix and enter the same profile answers themselves.
                        </li>
                        <li>
                            <strong>Every document needs finishing.</strong> The builder fills
                            repeated details such as your agency name and dates. You complete the
                            tables and any bracketed prompts, and delete the drafting guidance
                            before you publish.
                        </li>
                        <li>
                            <strong>Gates come first.</strong> A gate settles a decision other
                            documents depend on. Drafting past one usually means rewriting later.
                        </li>
                        <li>
                            <strong>
                                If something stops working, reopen the library from Tools.
                            </strong>{" "}
                            That starts a fresh session and fixes most problems.
                        </li>
                        <li>
                            <strong>The library does not track your progress.</strong> Keep your own
                            record of what is drafted, approved, and adopted.
                        </li>
                    </ul>
                    <GuideRefs>
                        <GuideRef id="1.3" />, <GuideRef id="4.3" />, <GuideRef id="6.1" />,{" "}
                        <GuideRef id="7.7" />.
                    </GuideRefs>
                </DocCard>
            </div>
        </main>
    );
}
