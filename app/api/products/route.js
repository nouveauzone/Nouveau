import { createRequire } from "module";

const require = createRequire(import.meta.url);
const { connectToDatabase } = require("../../../backend/config/db");
const Product = require("../../../backend/models/Product");

export const dynamic = "force-dynamic";

export async function GET() {
  await connectToDatabase();
  const products = await Product.find({}).sort({ createdAt: -1 }).lean();

  return Response.json(products);
}