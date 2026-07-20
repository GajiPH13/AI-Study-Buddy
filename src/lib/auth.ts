import { betterAuth } from "better-auth/minimal";
import { mongodbAdapter } from "@better-auth/mongo-adapter";
import { getDb, getMongoClient } from "@/lib/db";
import { getAuthEnv } from "@/lib/env";

const env = getAuthEnv();

export const auth = betterAuth({
  appName: "AI Study Buddy",
  baseURL: env.BETTER_AUTH_URL.endsWith("/api/auth")
    ? env.BETTER_AUTH_URL
    : new URL("/api/auth", env.BETTER_AUTH_URL).toString(),
  secret: env.BETTER_AUTH_SECRET,
  database: mongodbAdapter(getDb(), { client: getMongoClient() }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    requireEmailVerification: false,
    minPasswordLength: 8,
    maxPasswordLength: 128,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  advanced: {
    useSecureCookies: env.BETTER_AUTH_URL.startsWith("https://"),
  },
});
