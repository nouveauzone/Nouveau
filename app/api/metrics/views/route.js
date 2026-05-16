export async function POST(req) {
  try {
    return Response.json({
      success: true,
      message: "View counted successfully"
    });
  } catch (error) {
    return Response.json(
      {
        success: false,
        error: error.message
      },
      { status: 500 }
    );
  }
}
