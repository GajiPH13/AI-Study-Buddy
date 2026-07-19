import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export type ApiErrorCode =
  | "AUTH_REQUIRED"
  | "VALIDATION_ERROR"
  | "NOT_FOUND"
  | "CONFLICT"
  | "RATE_LIMITED"
  | "AI_RATE_LIMITED"
  | "MODERATION_BLOCKED"
  | "MODEL_NOT_FOUND"
  | "SERVICE_UNAVAILABLE"
  | "INTERNAL_ERROR";

export function dataResponse<T>(data: T, init?: ResponseInit) {
  return NextResponse.json({ data }, init);
}

export function errorResponse(code: ApiErrorCode, message: string, status: number) {
  return NextResponse.json({ error: { code, message } }, { status });
}

export async function getRequestSession(request: Request) {
  return auth.api.getSession({ headers: request.headers });
}
