import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/store";
import { canAsync, getAdminSession } from "@/lib/admin/rbac";
import { Card, EmptyState, PageHeader, Pill } from "../../_components/ui";
import { CustomerActions } from "./CustomerActions";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 50;

function istStartOfToday() {
  const offsetMs = 330 * 60 * 1000;
  const shifted = new Date(Date.now() + offsetMs);
  shifted.setUTCHours(0, 0, 0, 0);
  return new Date(shifted.getTime() - offsetMs);
}

function formatDate(value: Date) {
  return value.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await getAdminSession();
  if (!session || !(await canAsync(session.role, "manageCrm"))) {
    redirect("/admin");
  }

  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q.trim() : "";
  const status = typeof params.status === "string" ? params.status : "all";
  const requestedPage = Number(
    typeof params.page === "string" ? params.page : "1"
  );
  const page = Number.isFinite(requestedPage)
    ? Math.max(1, Math.floor(requestedPage))
    : 1;

  const where = {
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" as const } },
            { email: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {}),
    ...(status === "flagged"
      ? { flagReason: { not: null } }
      : status === "active" || status === "blocked"
        ? { status }
        : {}),
  };

  const now = new Date();
  const today = istStartOfToday();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [total, todayCount, sevenDayCount, thirtyDayCount, filteredTotal, users] =
    await Promise.all([
      prisma.b2CUser.count(),
      prisma.b2CUser.count({ where: { createdAt: { gte: today } } }),
      prisma.b2CUser.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
      prisma.b2CUser.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
      prisma.b2CUser.count({ where }),
      prisma.b2CUser.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
        select: {
          id: true,
          name: true,
          email: true,
          status: true,
          flagReason: true,
          createdBy: true,
          filingsRemaining: true,
          createdAt: true,
        },
      }),
    ]);

  const profileCounts = users.length
    ? await prisma.familyProfile.groupBy({
        by: ["userId"],
        where: { userId: { in: users.map((user) => user.id) } },
        _count: { _all: true },
      })
    : [];
  const profileCountMap = new Map(
    profileCounts.map((row) => [row.userId, row._count._all])
  );
  const pageCount = Math.max(1, Math.ceil(filteredTotal / PAGE_SIZE));

  const pageHref = (targetPage: number) => {
    const next = new URLSearchParams();
    if (q) next.set("q", q);
    if (status !== "all") next.set("status", status);
    next.set("page", String(targetPage));
    return `/admin/customers?${next.toString()}`;
  };

  return (
    <div>
      <PageHeader
        title="Customers"
        subtitle="Registered customer accounts — separate from anonymous visitors and admin team users"
      />

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          ["Total signups", total],
          ["Signed up today", todayCount],
          ["Last 7 days", sevenDayCount],
          ["Last 30 days", thirtyDayCount],
        ].map(([label, value]) => (
          <Card key={String(label)} className="p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {label}
            </p>
            <p className="mt-2 text-2xl font-semibold tabular-nums">
              {Number(value).toLocaleString("en-IN")}
            </p>
          </Card>
        ))}
      </div>

      <form className="mb-4 flex flex-col gap-2 rounded-xl border border-border bg-card p-3 sm:flex-row">
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Search name or email"
          className="min-h-10 flex-1 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary"
        />
        <select
          name="status"
          defaultValue={status}
          className="min-h-10 rounded-lg border border-border bg-background px-3 text-sm"
        >
          <option value="all">All customers</option>
          <option value="active">Active</option>
          <option value="blocked">Blocked</option>
          <option value="flagged">Flagged</option>
        </select>
        <button
          type="submit"
          className="min-h-10 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground"
        >
          Apply
        </button>
        {(q || status !== "all") && (
          <Link
            href="/admin/customers"
            className="inline-flex min-h-10 items-center justify-center rounded-lg border border-border px-4 text-sm font-medium"
          >
            Clear
          </Link>
        )}
      </form>

      <p className="mb-3 text-sm text-muted-foreground">
        Showing {users.length} of {filteredTotal.toLocaleString("en-IN")} customer
        {filteredTotal === 1 ? "" : "s"}
      </p>

      {users.length === 0 ? (
        <EmptyState message="No registered customers match these filters." />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full min-w-[980px] text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-left">
                {[
                  "Customer",
                  "Status",
                  "Signed up",
                  "Profiles",
                  "Credits",
                  "Source",
                  "Actions",
                ].map((heading) => (
                  <th
                    key={heading}
                    className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-border/60 align-top">
                  <td className="px-4 py-3">
                    <p className="font-medium text-foreground">{user.name}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {user.email}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col items-start gap-1">
                      <Pill tone={user.status === "blocked" ? "red" : "green"}>
                        {user.status}
                      </Pill>
                      {user.flagReason && (
                        <span
                          className="max-w-48 text-xs text-amber-700"
                          title={user.flagReason}
                        >
                          Flagged: {user.flagReason}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                    {formatDate(user.createdAt)}
                  </td>
                  <td className="px-4 py-3 tabular-nums">
                    {profileCountMap.get(user.id) ?? 0}
                  </td>
                  <td className="px-4 py-3 tabular-nums">
                    {user.filingsRemaining}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {user.createdBy ? `Admin: ${user.createdBy}` : "Self signup"}
                  </td>
                  <td className="px-4 py-3">
                    <CustomerActions
                      userId={user.id}
                      status={user.status}
                      flagged={Boolean(user.flagReason)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pageCount > 1 && (
        <div className="mt-4 flex items-center justify-between gap-3">
          <Link
            href={pageHref(Math.max(1, page - 1))}
            aria-disabled={page <= 1}
            className={`rounded-lg border border-border px-4 py-2 text-sm font-medium ${
              page <= 1 ? "pointer-events-none opacity-40" : "hover:bg-muted"
            }`}
          >
            Previous
          </Link>
          <span className="text-sm text-muted-foreground">
            Page {Math.min(page, pageCount)} of {pageCount}
          </span>
          <Link
            href={pageHref(Math.min(pageCount, page + 1))}
            aria-disabled={page >= pageCount}
            className={`rounded-lg border border-border px-4 py-2 text-sm font-medium ${
              page >= pageCount
                ? "pointer-events-none opacity-40"
                : "hover:bg-muted"
            }`}
          >
            Next
          </Link>
        </div>
      )}
    </div>
  );
}
