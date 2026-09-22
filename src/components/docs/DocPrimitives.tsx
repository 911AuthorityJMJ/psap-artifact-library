import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { assetUrl } from "@/lib/base-path";

const DOCS = [
    { href: "/help/quick-start", label: "Quick Start" },
    { href: "/help/quick-reference", label: "Quick Reference" },
    { href: "/help/guide", label: "Full Guide" },
] as const;

type DocHref = (typeof DOCS)[number]["href"];

/** Page header shared by all three Help routes: a link back to the app, the
 *  page title, and a tab row for jumping between the three docs. */
export function HelpHeader({
    title,
    subtitle,
    current,
}: {
    title: string;
    subtitle?: string;
    current: DocHref;
}) {
    return (
        <div className="mb-8">
            <Link
                href="/"
                className="text-sm font-medium inline-block mb-4 hover:underline"
                style={{ color: "var(--ui-link)" }}>
                ← Back to Artifact Library
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">{title}</h1>
            {subtitle && <p className="text-gray-500 text-sm">{subtitle}</p>}
            <nav className="flex gap-1 border-b mt-5" style={{ borderColor: "var(--ui-border)" }}>
                {DOCS.map((d) => (
                    <Link
                        key={d.href}
                        href={d.href}
                        className="px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors"
                        style={
                            current === d.href
                                ? {
                                      borderBottomColor: "var(--ui-link)",
                                      color: "var(--ui-link)",
                                      borderBottomWidth: 2,
                                  }
                                : { borderBottomColor: "transparent", color: "#6B7280" }
                        }>
                        {d.label}
                    </Link>
                ))}
            </nav>
        </div>
    );
}

/** White bordered card wrapping a Help page's body, matching the
 *  `bg-white rounded-lg border` treatment HomeClient uses for Assessment / Full
 *  Library, so doc content reads as separated from the page background. */
export function DocCard({ children }: { children: ReactNode }) {
    return (
        <div className="bg-white rounded-lg p-6" style={{ border: "1px solid var(--ui-border)" }}>
            {children}
        </div>
    );
}

/** A "Part N. Title" heading in the Full Guide, with an anchor for the top-of-page TOC. */
export function DocPart({ number, title }: { number: number; title: string }) {
    return (
        <h2
            id={`part-${number}`}
            className="text-xl font-bold text-gray-900 mt-10 mb-4 pt-6 border-t first:mt-0 first:pt-0 first:border-0 scroll-mt-6"
            style={{ borderColor: "var(--ui-border)" }}>
            Part {number}. {title}
        </h2>
    );
}

/** A numbered subsection ("1.3 What the library remembers...") with its own
 *  anchor, so "Full guide: 1.3" references elsewhere can link straight to it. */
export function DocSection({
    id,
    title,
    children,
}: {
    id: string;
    title: string;
    children: ReactNode;
}) {
    return (
        <section id={id} className="mb-6 scroll-mt-6">
            <h3 className="text-base font-semibold text-gray-900 mb-2">
                {id} {title}
            </h3>
            <div className="space-y-3 text-sm text-gray-700 leading-relaxed">{children}</div>
        </section>
    );
}

/** An unnumbered "##" heading, used on the Quick Start / Quick Reference pages. */
export function DocH2({ children }: { children: ReactNode }) {
    return (
        <h2 className="text-base font-semibold text-gray-900 mt-6 mb-2 first:mt-0">{children}</h2>
    );
}

export function DocTable({ headers, rows }: { headers: string[]; rows: ReactNode[][] }) {
    return (
        <div
            className="overflow-x-auto my-4 rounded-lg"
            style={{ border: "1px solid var(--ui-border)" }}>
            <table className="w-full text-sm border-collapse">
                <thead>
                    <tr className="bg-gray-50">
                        {headers.map((h, i) => (
                            <th
                                key={i}
                                className="text-left font-semibold text-gray-700 px-3 py-2 border-b"
                                style={{ borderColor: "var(--ui-border)" }}>
                                {h}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row, ri) => (
                        <tr
                            key={ri}
                            className="border-b last:border-0"
                            style={{ borderColor: "var(--ui-border)" }}>
                            {row.map((cell, ci) => (
                                <td key={ci} className="px-3 py-2 align-top text-gray-700">
                                    {cell}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

/** A pull-quote callout, for the guide's four bolded blockquotes. */
export function Callout({ children }: { children: ReactNode }) {
    return (
        <blockquote
            className="my-4 pl-4 py-1 text-sm font-medium text-gray-800"
            style={{ borderLeft: "3px solid var(--ui-link)" }}>
            {children}
        </blockquote>
    );
}

// Pixel sizes of the 2x PNGs in public/help/screenshots; update an entry when a file is replaced with a different size.
const SCREENSHOTS = {
    "assessment-artifact-row-actions": [1584, 216],
    "assessment-build-priority-tier1": [1584, 1206],
    "assessment-by-question-domain": [1584, 1095],
    "assessment-reference-tab": [1584, 1153],
    "assessment-results-tabs": [1584, 108],
    "assessment-spreadsheet-and-document-rows": [1584, 436],
    "assessment-summary-and-tabs": [1584, 587],
    "builder-agency-name-and-highlights": [2304, 662],
    "builder-field-highlight-plain": [2303, 335],
    "builder-form-and-preview": [2304, 1660],
    "builder-suggestion-list": [2303, 480],
    "excel-psap-information-sheet": [2000, 1615],
    "help-menu-open": [1584, 622],
    "library-type-filter": [1584, 1080],
    "markers-on-artifact-rows": [1156, 328],
    "nav-tabs-assessment-disabled": [1584, 279],
    "setup-current-assessment-bar": [1584, 204],
    "setup-first-use-vs-returning": [1584, 1576],
    "setup-profile-answered": [1584, 1501],
    "setup-profile-answered-baseline": [1584, 729],
    "setup-profile-panel-empty": [1584, 1510],
    "setup-profile-validation": [1584, 1777],
    "setup-upload-panel": [1584, 623],
    "word-cleanup-annotated": [1440, 2187],
    "word-sign-off-and-revision-history": [1024, 356],
} as const;

export type ScreenshotName = keyof typeof SCREENSHOTS;

// unoptimized keeps the 2x PNGs pixel-exact; assetUrl adds the basePath that next/image leaves off a string src.
// maxWidth holds an image narrower than the column to its natural size (half its pixel width, plus the border) so it is not stretched.
export function Screenshot({
    name,
    alt,
    enlarge = false,
}: {
    name: ScreenshotName;
    alt: string;
    enlarge?: boolean;
}) {
    const [width, height] = SCREENSHOTS[name];
    const src = assetUrl(`/help/screenshots/${name}.png`);
    const image = (
        <Image
            src={src}
            alt={alt}
            width={width}
            height={height}
            unoptimized
            className="block w-full h-auto"
        />
    );
    return (
        <figure
            className="my-4 mx-auto rounded-lg overflow-hidden"
            style={{ border: "1px solid var(--ui-border)", maxWidth: width / 2 + 2 }}>
            {enlarge ? (
                <a href={src} target="_blank" rel="noopener noreferrer" className="block cursor-zoom-in">
                    {image}
                </a>
            ) : (
                image
            )}
            {enlarge && (
                <figcaption
                    className="px-3 py-1.5 text-xs text-gray-500 border-t"
                    style={{ borderColor: "var(--ui-border)" }}>
                    Click the image to open it full size.
                </figcaption>
            )}
        </figure>
    );
}

export function Checklist({ items }: { items: ReactNode[] }) {
    return (
        <ul className="my-4 space-y-1.5">
            {items.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                    <span
                        className="mt-0.5 shrink-0 w-3.5 h-3.5 rounded-sm border"
                        style={{ borderColor: "var(--ui-border)" }}
                        aria-hidden="true"
                    />
                    <span>{item}</span>
                </li>
            ))}
        </ul>
    );
}

/** A "Full guide: 1.3, 4.3" style cross-reference line, linking each id to its
 *  anchor on the Full Guide page. */
export function GuideRefs({ children }: { children: ReactNode }) {
    return <p className="text-xs text-gray-400 mt-1">Full guide: {children}</p>;
}

export function GuideRef({ id, children }: { id: string; children?: ReactNode }) {
    return (
        <Link
            href={`/help/guide#${id}`}
            className="hover:underline"
            style={{ color: "var(--ui-link)" }}>
            {children ?? id}
        </Link>
    );
}
