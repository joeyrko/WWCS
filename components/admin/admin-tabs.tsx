"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { FreeAccessToggle } from "@/components/admin/free-access-toggle";
import { MaintenanceModeToggle } from "@/components/admin/maintenance-mode-toggle";
import { DesktopBlockToggle } from "@/components/admin/desktop-block-toggle";
import { GeoFenceToggle } from "@/components/admin/geo-fence-toggle";
import { UserManager, type AdminUserRow } from "@/components/admin/user-manager";
import { LiveEventsManager } from "@/components/admin/live-events-manager";
import { CatalogVideosManager } from "@/components/admin/catalog-videos-manager";
import { SponsorsManager } from "@/components/admin/sponsors-manager";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { LiveEventRow } from "@/lib/data/live-events";
import type { CatalogVideoRow } from "@/lib/data/catalog-videos";
import type { Sponsor, Order } from "@/types";

const ORDER_STATUS_VARIANT: Record<Order["status"], "subscribers" | "default" | "purchase"> = {
  paid: "subscribers",
  pending: "default",
  refunded: "purchase",
};

export function AdminTabs({
  freeAccessUntil,
  freeAccessActive,
  maintenanceModeActive,
  desktopBlockActive,
  geoFenceDisabled,
  userRows,
  currentUserId,
  liveEvents,
  catalogVideos,
  sponsors,
  orders,
  users,
}: {
  freeAccessUntil: string | null;
  freeAccessActive: boolean;
  maintenanceModeActive: boolean;
  desktopBlockActive: boolean;
  geoFenceDisabled: boolean;
  userRows: AdminUserRow[];
  currentUserId: string;
  liveEvents: LiveEventRow[];
  catalogVideos: CatalogVideoRow[];
  sponsors: Sponsor[];
  orders: Order[];
  users: { id: string; email: string }[];
}) {
  return (
    <Tabs defaultValue="content">
      <div className="flex justify-center">
        <TabsList className="flex-wrap">
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="controls">Site Controls</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="content">
        <div className="flex flex-col gap-10">
          <section>
            <LiveEventsManager events={liveEvents} />
          </section>
          <section>
            <CatalogVideosManager videos={catalogVideos} />
          </section>
          <section>
            <SponsorsManager sponsors={sponsors} />
          </section>
        </div>
      </TabsContent>

      <TabsContent value="controls">
        <div className="flex flex-col gap-6">
          <MaintenanceModeToggle active={maintenanceModeActive} />
          <DesktopBlockToggle active={desktopBlockActive} />
          <GeoFenceToggle disabled={geoFenceDisabled} />
          <FreeAccessToggle freeAccessUntil={freeAccessUntil} active={freeAccessActive} />
        </div>
      </TabsContent>

      <TabsContent value="users">
        <UserManager users={userRows} currentUserId={currentUserId} />
      </TabsContent>

      <TabsContent value="orders">
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
              {orders.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-wwc-grey-500">
                    No orders yet.
                  </td>
                </tr>
              )}
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
      </TabsContent>
    </Tabs>
  );
}
