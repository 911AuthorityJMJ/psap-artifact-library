/**
 * Shared page-level auth-gate screens. Used by the `/artifacts` page shell and
 * by the `/artifacts/help/*` layout, both of which call `getPageAuth()` and
 * branch on the same three states.
 */

/**
 * Shown when there is no valid session. The sign-in link points at the parent
 * ASP.NET site's launch endpoint, which mints a fresh `psap_session` JWT and
 * redirects back to `/artifacts`. It is a plain, root-relative `<a href>`:
 * `/ArtifactLibrary/Launch` belongs to the ASP.NET app, NOT this Next.js app,
 * so it must NOT receive the `/artifacts` basePath — `next/link`/`next/image`
 * would prefix it, a plain anchor does not.
 */
export function AuthRequired() {
    return (
        <main className="min-h-screen p-8">
            <div className="max-w-md mx-auto mt-20">
                <div
                    className="bg-white rounded-lg p-8 text-center"
                    style={{ border: "1px solid var(--ui-border)" }}>
                    <h1 className="text-2xl font-bold text-gray-900 mb-3">
                        Authentication required
                    </h1>
                    <p className="text-gray-500 text-sm mb-6">
                        Sign in through the 911 Authority site to use the PSAP Artifact Library.
                    </p>
                    <a
                        href="/ArtifactLibrary/Launch"
                        className="inline-block px-5 py-2.5 text-white text-sm font-medium rounded-lg transition-colors"
                        style={{ background: "var(--ui-link)" }}>
                        Sign in and open Artifact Library
                    </a>
                </div>
            </div>
        </main>
    );
}

/**
 * Shown when production signing configuration is unavailable (fail closed). We
 * do NOT prompt the user to sign in here — signing in cannot succeed — and we do
 * NOT expose configuration details or secret names to the browser.
 */
export function ServiceUnavailable() {
    return (
        <main className="min-h-screen p-8">
            <div className="max-w-md mx-auto mt-20">
                <div
                    className="bg-white rounded-lg p-8 text-center"
                    style={{ border: "1px solid var(--ui-border)" }}>
                    <h1 className="text-2xl font-bold text-gray-900 mb-3">
                        Artifact Library unavailable
                    </h1>
                    <p className="text-gray-500 text-sm">
                        The PSAP Artifact Library is temporarily unavailable. Please try again
                        later.
                    </p>
                </div>
            </div>
        </main>
    );
}
