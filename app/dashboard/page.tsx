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
import Dashboard from "./dashboard/dashboard";
import Classes from "./classes/classes";
import Forum from "./forum/forum";
import Posts from "./posts/posts";

export default async function Page() {
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
    const access_level = checkUserInDB[0].access_level as "user" | "admin";
    const userEmail = data.user.email ?? '';
    return (
        <main className="flex-1">
            <ClientDashboard userEmail={userEmail} plan={stripePlan} access_level={access_level}
                classes={<Classes userEmail={userEmail} plan={stripePlan} access_level={access_level} />}
                dashboard={<Dashboard userEmail={userEmail} plan={stripePlan} access_level={access_level} />}
                forum={<Forum userEmail={userEmail} plan={stripePlan} access_level={access_level} />}
                posts={<Posts userEmail={userEmail} plan={stripePlan} access_level={access_level} />}
            />
        </main>
    );
}
