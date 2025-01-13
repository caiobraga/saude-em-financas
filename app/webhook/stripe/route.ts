import { db } from '@/utils/db/db'
import { appointments_credits, usersTable } from '@/utils/db/schema'
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: Request) {
    console.log('Webhook received')
    try {
        const response = await request.json()
        console.log(response)
        // On subscribe, write to db
        if (response.type == 'payment_intent.succeeded') {
            console.log("customer: ", response.data.object.customer)
            console.log("object: ", response.data.object)
            const user_mail = response.data.object.charges.data[0].billing_details.email;
            const amount_recived = response.data.object.amount;
            const credit = await db.select().from(appointments_credits).where(eq(appointments_credits.user_email, user_mail));

            if (credit.length == 0) {
                if (amount_recived == process.env.STRIPE_CREDITS_PRODUCT_PRICE) {
                    await db.insert(appointments_credits).values({
                        id: uuidv4(),
                        user_email: user_mail,
                        credits: 1,
                        created_at: new Date(),
                        updated_at: new Date()
                    });
                } else {
                    await db.insert(appointments_credits).values({
                        id: uuidv4(),
                        user_email: user_mail,
                        credits: 5,
                        created_at: new Date(),
                        updated_at: new Date()
                    });
                }
            } else {
                if (amount_recived == process.env.STRIPE_CREDITS_PRODUCT_PRICE) {
                    await db.update(appointments_credits).set({ credits: credit[0].credits + 1 }).where(eq(appointments_credits.user_email, user_mail));
                } else {
                    await db.update(appointments_credits).set({ credits: credit[0].credits + 5 }).where(eq(appointments_credits.user_email, user_mail));
                }
            }
            return new Response('Success', { status: 200 })
        }

        console.log("customer: ", response.data.object.customer)
        console.log("object: ", response.data.object)
        await db.update(usersTable).set({ plan: response.data.object.id }).where(eq(usersTable.stripe_id, response.data.object.customer));
        // Process the webhook payload
    } catch (error: any) {
        return new Response(`Webhook error: ${error.message}`, {
            status: 400,
        })
    }
    return new Response('Success', { status: 200 })
}