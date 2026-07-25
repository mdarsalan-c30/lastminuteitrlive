import { canAsync, getAdminSession } from "@/lib/admin/rbac";
import { PageHeader, SetupBanner } from "../../_components/ui";
import { AiKeyManager } from "./AiKeyManager";

export const dynamic = "force-dynamic";

export default async function AiSettingsPage() {
  const session = await getAdminSession();
  const allowed = session ? await canAsync(session.role, "manageAi") : false;

  return (
    <div>
      <PageHeader
        title="AI provider keys"
        subtitle="Manage encrypted fallback keys used when the primary advisor engine is unavailable"
      />
      {!allowed ? (
        <SetupBanner
          title="Read-only"
          body="Your role does not have permission to manage AI provider keys."
        />
      ) : (
        <AiKeyManager />
      )}
    </div>
  );
}
