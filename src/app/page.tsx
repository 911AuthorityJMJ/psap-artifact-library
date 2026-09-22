import HomeClient from "./HomeClient";
import { getPageAuth } from "@/lib/auth";
import { AuthRequired, ServiceUnavailable } from "@/components/AuthGateScreens";

export const dynamic = "force-dynamic";

/**
 * Server-side authentication gate for the Artifact Library page shell.
 *
 * The interactive upload UI lives in the client component `HomeClient`. This
 * Server Component validates the `psap_session` cookie *before* rendering it, so
 * an unauthenticated visitor reaching `/artifacts` directly never sees the
 * upload interface — they get a sign-in prompt (or, if production signing config
 * is missing, a service-unavailable page). The protected API routes keep their
 * own `requireAuth()` checks; this is defence in depth for the page shell.
 */
export default async function Page() {
    const auth = await getPageAuth();

    if (auth.status === "unavailable") {
        return <ServiceUnavailable />;
    }
    if (auth.status === "unauthenticated") {
        return <AuthRequired />;
    }
    return <HomeClient />;
}
