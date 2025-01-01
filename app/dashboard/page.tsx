import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import ClientDashboard from "./clientDashboard";
import { db } from "@/utils/db/db";
import { usersTable } from "@/utils/db/schema";
import { eq } from "drizzle-orm";
import { getStripePlan } from "@/utils/stripe/api";
import { DEFAULT_SERIF_FONT } from "next/dist/shared/lib/constants";
import { PgDateStringBuilder } from "drizzle-orm/pg-core";
import { logout } from '@/app/auth/actions'

export default async function Dashboard() {
    const supabase = createClient();

    // Fetch the user
    const { data, error } = await supabase.auth.getUser();

    if (error || !data?.user) {
        redirect("/login");
    }

    const {
        data: { user },
    } = await supabase.auth.getUser()

    // check user plan in db
    const checkUserInDB = await db.select().from(usersTable).where(eq(usersTable.email, user!.email!))
    if (!checkUserInDB[0]) {
        return logout();
    }

    if (checkUserInDB[0].plan === "none") {
        console.log("User has no plan selected")
        return redirect('/subscribe')
    }

    const stripePlan = await getStripePlan(user!.email!)


    return (
        <main className="flex-1">
            <ClientDashboard userEmail={data.user.email ?? ''} plan={stripePlan} />
        </main>
    );
}
