import { getPageAuth } from "@/lib/auth";
import { AuthRequired, ServiceUnavailable } from "@/components/AuthGateScreens";

export const dynamic = "force-dynamic";

/**
 * Auth gate for the Help routes (Quick Start / Quick Reference / Full Guide),
 * mirroring the main page shell's gate (`src/app/page.tsx`): same three states,
 * same screens. Help content isn't sensitive, but it stays behind the same
 * `psap_session` check as everything else under `/artifacts` for consistency
 * with the app's fail-closed posture.
 */
export default async function HelpLayout({ children }: { children: React.ReactNode }) {
    const auth = await getPageAuth();

    if (auth.status === "unavailable") {
        return <ServiceUnavailable />;
    }
    if (auth.status === "unauthenticated") {
        return <AuthRequired />;
    }
    return <>{children}</>;
}
