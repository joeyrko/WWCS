import { redirect } from "next/navigation";
import { getSession } from "@/lib/get-session";

// The site's entry point is auth, not plan selection: signed-out visitors
// land on Sign In first, then choose a plan at /pricing after they have an
// account. Signed-in visitors skip straight into the app.
export default async function RootPage() {
  const session = await getSession();
  redirect(session?.user ? "/events" : "/sign-in");
}
