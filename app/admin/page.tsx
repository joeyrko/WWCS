import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { getSession } from "@/lib/get-session";
import { getAllUsers, getAllOrders } from "@/lib/data/users";
import { getAllWrestlers } from "@/lib/data/wrestlers";
import { Badge } from "@/components/ui/badge";
import { AdminPinGate } from "@/components/admin/admin-pin-gate";
import { FreeAccessToggle } from "@/components/admin/free-access-toggle";
import { ADMIN_PIN_COOKIE } from "@/lib/admin-pin";
import { getFreeAccessUntil, isFreeAccessActive } from "@/lib/data/settings";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Order } from "@/types";

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

const ORDER_STATUS_VARIANT: Record<Order["status"], "subscribers" | "default" | "purchase"> = {
  paid: "subscribers",
  pending: "default",
  refunded: "purchase",
};

export default async function AdminPage() {
  const session = await getSession();
  if (!session?.user?.isAdmin) notFound();

  const cookieStore = await cookies();
  const pinVerified = cookieStore.get(ADMIN_PIN_COOKIE)?.value === "verified";
  if (!pinVerified) return <AdminPinGate />;

  const [users, orders, wrestlers, freeAccessUntil, freeAccessActive] = await Promise.all([
    getAllUsers(),
    getAllOrders(),
    getAllWrestlers(),
    getFreeAccessUntil(),
    isFreeAccessActive(),
  ]);

  const revenueInCents = orders
    .filter((o) => o.status === "paid")
    .reduce((sum, o) => sum + o.amountInCents, 0);

  const orderCountByUser = new Map<string, number>();
  for (const order of orders) {
    orderCountByUser.set(order.userId, (orderCountByUser.get(order.userId) ?? 0) + 1);
  }

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
          Signed in as {session.user.email}. Read-only overview of accounts, orders, and content.
        </p>
      </div>

      <div className="mb-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        <StatCard label="Users" value={users.length} />
        <StatCard label="Orders" value={orders.length} />
        <StatCard label="Revenue" value={formatCurrency(revenueInCents)} />
        <StatCard label="Roster" value={wrestlers.length} />
      </div>

      <div className="mb-10">
        <FreeAccessToggle
          freeAccessUntil={freeAccessUntil ? freeAccessUntil.toISOString() : null}
          active={freeAccessActive}
        />
      </div>

      <section className="mb-10">
        <h2 className="mb-4 font-display text-2xl uppercase tracking-wide text-white">Users</h2>
        <div className="overflow-x-auto rounded-md border border-wwc-grey-800">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-wwc-grey-900 text-xs uppercase tracking-wide text-wwc-grey-400">
              <tr>
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Email</th>
                <th className="px-4 py-3 font-semibold">Plan</th>
                <th className="px-4 py-3 font-semibold">Purchases</th>
                <th className="px-4 py-3 font-semibold">Orders</th>
                <th className="px-4 py-3 font-semibold">Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-wwc-grey-800 bg-wwc-grey-950">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-4 py-3 text-white">{user.name}</td>
                  <td className="px-4 py-3 text-wwc-grey-400">{user.email}</td>
                  <td className="px-4 py-3 uppercase text-wwc-grey-300">{user.plan ?? "No Plan"}</td>
                  <td className="px-4 py-3 text-wwc-grey-400">{user.purchasedEventSlugs.length}</td>
                  <td className="px-4 py-3 text-wwc-grey-400">{orderCountByUser.get(user.id) ?? 0}</td>
                  <td className="px-4 py-3">
                    {user.isAdmin && <Badge variant="subscribers">Admin</Badge>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="mb-4 font-display text-2xl uppercase tracking-wide text-white">
          Order History
        </h2>
        <div className="overflow-x-auto rounded-md border border-wwc-grey-800">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-wwc-grey-900 text-xs uppercase tracking-wide text-wwc-grey-400">
              <tr>
                <th className="px-4 py-3 font-semibold">Item</th>
                <th className="px-4 py-3 font-semibold">User</th>
                <th className="px-4 py-3 font-semibold">Type</th>
                <th className="px-4 py-3 font-semibold">Date</th>
                <th className="px-4 py-3 font-semibold">Amount</th>
                <th className="px-4 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-wwc-grey-800 bg-wwc-grey-950">
              {orders.map((order) => {
                const user = users.find((u) => u.id === order.userId);
                return (
                  <tr key={order.id}>
                    <td className="px-4 py-3 text-white">{order.label}</td>
                    <td className="px-4 py-3 text-wwc-grey-400">{user?.email ?? order.userId}</td>
                    <td className="px-4 py-3 uppercase text-wwc-grey-400">{order.type}</td>
                    <td className="px-4 py-3 text-wwc-grey-400">
                      {formatDate(order.createdAt, { month: "short", day: "numeric", year: "numeric" })}
                    </td>
                    <td className="px-4 py-3 text-wwc-grey-300">
                      {formatCurrency(order.amountInCents)}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={ORDER_STATUS_VARIANT[order.status]} className="capitalize">
                        {order.status}
                      </Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
