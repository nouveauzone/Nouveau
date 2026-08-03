export const dynamic = "force-dynamic";

export async function POST(req) {
  try {
    return Response.json({
      success: true,
      message: "Metrics working",
    });
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
