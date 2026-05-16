import { createRequire } from "module";

const require = createRequire(import.meta.url);
const { connectToDatabase } = require("../../../backend/config/db");
const Product = require("../../../backend/models/Product");

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await connectToDatabase();

    const products = await Product.find({}).sort({ createdAt: -1 });

    return Response.json(products);
  } catch (error) {
    return Response.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}