import { NextResponse } from "next/server";
import { createRequire } from "module";
import { verifyToken } from "../../_lib/session";

const require = createRequire(import.meta.url);
const { connectToDatabase } = require("../../../../backend/config/db");
const User = require("../../../../backend/models/User");

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    await connectToDatabase();

    const decoded = verifyToken(request);
    if (!decoded) {
      return NextResponse.json({ message: "Not authorized: missing bearer token" }, { status: 401 });
    }

    const userId = decoded?.id || decoded?.userId || decoded?._id;
    const user = await User.findById(userId).select("-password");

    if (!user) {
      return NextResponse.json({ message: "Not authorized: user not found" }, { status: 401 });
    }

    return NextResponse.json(user);
  } catch (error) {
    const status = String(error?.name || "") === "TokenExpiredError" ? 401 : 500;
    return NextResponse.json(
      { message: error?.message || "Authentication failed" },
      { status }
    );
  }
}