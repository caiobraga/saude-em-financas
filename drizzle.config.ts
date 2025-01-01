import { defineConfig } from "drizzle-kit";
import { config } from 'dotenv';

process.env.NODE_ENV !== 'production' ? config({ path: '.env' }) : config({ path: '.env' })// or .env.local
config({ path: '.env' })
export default defineConfig({
    schema: "./utils/db/schema.ts",
    out: "./utils/db/migrations",
    dialect: "postgresql",
    dbCredentials: {
        url: process.env.DATABASE_URL!,
    },
});