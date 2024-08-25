import { defineConfig } from "drizzle-kit";
export default defineConfig({
  schema: "./database/schemas",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.POSTGRES_URL as string,
  },
  verbose: true,
  strict: true,
});
