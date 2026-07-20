import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/lib/auth";

export const runtime = "nodejs";

const handler = toNextJsHandler(auth);

export const GET = async (request: Request) => {
	// Log request url for debugging route matching
	try { console.log('[auth route] GET', request.url); } catch (e) {}
	if (handler.GET) return handler.GET(request);
	return new Response(null, { status: 405 });
};

export const POST = async (request: Request) => {
	try { console.log('[auth route] POST', request.url); } catch (e) {}
	if (handler.POST) return handler.POST(request);
	return new Response(null, { status: 405 });
};
