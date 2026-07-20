import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/lib/auth";

export const runtime = "nodejs";

const handler = toNextJsHandler(auth);

export const POST = async (request: Request) => {
  try { console.log('[auth sign-in/social route] POST', request.url); } catch (e) {}
  if (handler.POST) return handler.POST(request);
  return new Response(null, { status: 405 });
};
