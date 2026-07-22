import { NextResponse } from "next/server";
import { clearAuthCookies } from "../../_lib/session";

export const dynamic = "force-dynamic";

export async function POST() {
  const response = NextResponse.json({ success: true, message: "Logged out" });
  clearAuthCookies(response);
  return response;
}