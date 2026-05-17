import { NextResponse } from "next/server";
import { createRequire } from "module";
import Razorpay from "razorpay";
import { verifyToken } from "../../_lib/session";

const require = createRequire(import.meta.url);
const { connectToDatabase } = require("../../../../backend/config/db");
const User = require("../../../../backend/models/User");

export const dynamic = "force-dynamic";

const getRazorpayClient = () => {
  const keyId = String(process.env.RAZORPAY_KEY_ID || "").trim();
  const keySecret = String(process.env.RAZORPAY_KEY_SECRET || "").trim();

  if (!keyId || !keySecret) {
    throw new Error("Razorpay credentials are missing");
  }

  return new Razorpay({ key_id: keyId, key_secret: keySecret });
};

export async function POST(request) {
  try {
    await connectToDatabase();

    const authHeader = String(request.headers.get("authorization") || "").trim();
    console.log("AUTH HEADER:", authHeader || "<empty>");

    const decoded = verifyToken(request);
    if (!decoded) {
      return NextResponse.json({ message: "Not authorized: missing bearer token" }, { status: 401 });
    }

    const token = authHeader.toLowerCase().startsWith("bearer ") ? authHeader.slice(7).trim() : "";
    console.log("TOKEN:", token || "<empty>");

    const userId = decoded?.id || decoded?.userId || decoded?._id;
    const user = await User.findById(userId).select("-password");

    if (!user) {
      return NextResponse.json({ message: "Not authorized: user not found" }, { status: 401 });
    }

    const body = await request.json();
    const baseAmount = Number(body?.total ?? body?.amount);
    const amount = Math.round(baseAmount * 100);

    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json({ success: false, message: "Invalid amount" }, { status: 400 });
    }

    const client = getRazorpayClient();
    const order = await client.orders.create({
      amount,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
      notes: {
        userId: user._id.toString(),
        userEmail: user.email,
      },
    });

    console.log("ORDER CREATED:", order);

    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error("RAZORPAY ERROR:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to create Razorpay order" },
      { status: 500 }
    );
  }
}