import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ManageBillingButton } from "@/components/account/manage-billing-button";
import { getOrdersForUser } from "@/lib/data/users";
import { getPlanById } from "@/lib/data/plans";
import { formatCurrency, formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "My Account",
};

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user) redirect("/sign-in?callbackUrl=/account");

  const [plan, orders] = await Promise.all([
    getPlanById(session.user.plan),
    getOrdersForUser(session.user.id),
  ]);

  return (
    <>
      <PageHeader
        eyebrow="Account"
        title="My Account"
        description={`Signed in as ${session.user.email}`}
      />

      <section className="mx-auto max-w-4xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="rounded-md border border-wwc-grey-800 bg-wwc-grey-950 p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-wwc-grey-500">
                Current Plan
              </p>
              <p className="mt-1 font-display text-2xl uppercase tracking-wide text-white">
                {plan?.name ?? "Free"}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild variant="outline">
                <Link href="/pricing">Change Plan</Link>
              </Button>
              {plan && plan.id !== "free" && <ManageBillingButton />}
            </div>
          </div>
        </div>

        <div className="mt-10">
          <h2 className="mb-4 font-display text-2xl uppercase tracking-wide text-white">
            Order History
          </h2>

          {orders.length > 0 ? (
            <div className="overflow-x-auto rounded-md border border-wwc-grey-800">
              <table className="w-full min-w-[560px] text-left text-sm">
                <thead className="bg-wwc-grey-900 text-xs uppercase tracking-wide text-wwc-grey-400">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Item</th>
                    <th className="px-4 py-3 font-semibold">Type</th>
                    <th className="px-4 py-3 font-semibold">Date</th>
                    <th className="px-4 py-3 font-semibold">Amount</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-wwc-grey-800 bg-wwc-grey-950">
                  {orders.map((order) => (
                    <tr key={order.id}>
                      <td className="px-4 py-3 text-white">{order.label}</td>
                      <td className="px-4 py-3 uppercase text-wwc-grey-400">{order.type}</td>
                      <td className="px-4 py-3 text-wwc-grey-400">
                        {formatDate(order.createdAt, { month: "short", day: "numeric", year: "numeric" })}
                      </td>
                      <td className="px-4 py-3 text-wwc-grey-300">
                        {formatCurrency(order.amountInCents)}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={order.status === "paid" ? "subscribers" : "default"} className="capitalize">
                          {order.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-wwc-grey-500">
              No orders yet. Purchase a PPV or subscribe to see your history here.
            </p>
          )}
        </div>
      </section>
    </>
  );
}
