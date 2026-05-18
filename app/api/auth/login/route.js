import { NextResponse } from "next/server";
import { createRequire } from "module";
import { setAuthCookies } from "../../_lib/session";

const require = createRequire(import.meta.url);
const { connectToDatabase } = require("../../../../backend/config/db");
const User = require("../../../../backend/models/User");
const jwt = require("jsonwebtoken");

export const dynamic = "force-dynamic";

const genToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });

export async function POST(request) {
  try {
    await connectToDatabase();

    const { email = "", password = "" } = await request.json();
    const normalizedEmail = String(email || "").trim().toLowerCase();

    if (!normalizedEmail || !String(password || "").trim()) {
      return NextResponse.json({ message: "Email and password required" }, { status: 400 });
    }

    const user = await User.findOne({ email: normalizedEmail }).select("+password");
    if (!user) {
      return NextResponse.json({ message: "Invalid email or password" }, { status: 401 });
    }

    const passwordMatches = await user.matchPassword(String(password || ""));
    if (!passwordMatches) {
      return NextResponse.json({ message: "Invalid email or password" }, { status: 401 });
    }

    user.lastLogin = new Date();
    user.loginCount = Number(user.loginCount || 0) + 1;
    await user.save();

    const token = genToken(user._id);
    const userPayload = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      addresses: user.addresses,
    };

    const response = NextResponse.json({ success: true, token, user: userPayload, ...userPayload });
    setAuthCookies(response, token);
    return response;
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error?.message || "Login failed" },
      { status: 500 }
    );
  }
}