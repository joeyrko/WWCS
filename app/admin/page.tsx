import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { getSession } from "@/lib/get-session";
import { getAllUsers, getAllOrders } from "@/lib/data/users";
import { AdminPinGate } from "@/components/admin/admin-pin-gate";
import { AdminTabs } from "@/components/admin/admin-tabs";
import type { AdminUserRow } from "@/components/admin/user-manager";
import { ADMIN_PIN_COOKIE } from "@/lib/admin-pin";
import {
  getFreeAccessUntil,
  isFreeAccessActive,
  isMaintenanceModeActive,
  isDesktopBlockActive,
  isGeoFenceDisabled,
} from "@/lib/data/settings";
import { getAllLiveEvents } from "@/lib/data/live-events";
import { getAllCatalogVideos } from "@/lib/data/catalog-videos";
import { getAllSponsors } from "@/lib/data/sponsors";
import { formatCurrency } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-md border border-wwc-grey-800 bg-wwc-grey-950 p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-wwc-grey-500">{label}</p>
      <p className="mt-1 font-display text-3xl text-white">{value}</p>
    </div>
  );
}

export default async function AdminPage() {
  const session = await getSession();
  if (!session?.user?.isAdmin) notFound();

  const cookieStore = await cookies();
  const pinVerified = cookieStore.get(ADMIN_PIN_COOKIE)?.value === "verified";
  if (!pinVerified) return <AdminPinGate />;

  const [
    users,
    orders,
    freeAccessUntil,
    freeAccessActive,
    maintenanceModeActive,
    desktopBlockActive,
    geoFenceDisabled,
    liveEvents,
    catalogVideos,
    sponsors,
  ] = await Promise.all([
    getAllUsers(),
    getAllOrders(),
    getFreeAccessUntil(),
    isFreeAccessActive(),
    isMaintenanceModeActive(),
    isDesktopBlockActive(),
    isGeoFenceDisabled(),
    getAllLiveEvents(),
    getAllCatalogVideos(),
    getAllSponsors(),
  ]);

  const revenueInCents = orders
    .filter((o) => o.status === "paid")
    .reduce((sum, o) => sum + o.amountInCents, 0);

  const orderCountByUser = new Map<string, number>();
  for (const order of orders) {
    orderCountByUser.set(order.userId, (orderCountByUser.get(order.userId) ?? 0) + 1);
  }

  // Strips password_hash/image before this ever reaches a client component
  // prop — Next.js serializes that prop into the page payload regardless of
  // what the component actually renders.
  const userRows: AdminUserRow[] = users.map((user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    plan: user.plan,
    purchasedEventCount: user.purchasedEventSlugs.length,
    orderCount: orderCountByUser.get(user.id) ?? 0,
    isAdmin: !!user.isAdmin,
  }));
  const userEmailsById = users.map((user) => ({ id: user.id, email: user.email }));

  return (
    <div className="mx-auto max-w-7xl px-4 pb-10 pt-24 sm:px-6 sm:pt-28 lg:px-8">
      <div className="mb-8">
        <span className="mb-3 inline-block rounded-sm border border-wwc-red/50 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-wwc-red">
          Admin
        </span>
        <h1 className="font-display text-4xl uppercase tracking-wide text-white sm:text-5xl">
          Quality Control
        </h1>
        <p className="mt-2 text-wwc-grey-400">
          Signed in as {session.user.email}. Manage accounts and review orders.
        </p>
      </div>

      <div className="mb-10 grid grid-cols-2 gap-4 sm:grid-cols-3">
        <StatCard label="Users" value={users.length} />
        <StatCard label="Orders" value={orders.length} />
        <StatCard label="Revenue" value={formatCurrency(revenueInCents)} />
      </div>

      <AdminTabs
        freeAccessUntil={freeAccessUntil ? freeAccessUntil.toISOString() : null}
        freeAccessActive={freeAccessActive}
        maintenanceModeActive={maintenanceModeActive}
        desktopBlockActive={desktopBlockActive}
        geoFenceDisabled={geoFenceDisabled}
        userRows={userRows}
        currentUserId={session.user.id}
        liveEvents={liveEvents}
        catalogVideos={catalogVideos}
        sponsors={sponsors}
        orders={orders}
        users={userEmailsById}
      />
    </div>
  );
}
