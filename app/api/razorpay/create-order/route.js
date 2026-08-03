import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import jwt from "jsonwebtoken";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export async function POST(req) {
  try {

    console.log("POST API HIT");

    const authHeader = req.headers.get("authorization");

    console.log("AUTH:", authHeader);

    if (!authHeader) {
      return NextResponse.json(
        {
          success: false,
          message: "No auth header",
        },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Token missing",
        },
        { status: 401 }
      );
    }

    try {
      jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {

      console.log("JWT ERROR:", err);

      return NextResponse.json(
        {
          success: false,
          message: "Invalid token",
        },
        { status: 401 }
      );
    }

    const body = await req.json();

    console.log("BODY:", body);

    const options = {
      amount: Number(body.amount) * 100,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    console.log("ORDER CREATED:", order);

    return NextResponse.json({
      success: true,
      order,
    });

  } catch (error) {

    console.log("SERVER ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: error.message,
      },
      { status: 500 }
    );
  }
}