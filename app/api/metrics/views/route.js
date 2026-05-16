const viewCounts = globalThis.__nouveauMonthlyViewCounts || new Map();
globalThis.__nouveauMonthlyViewCounts = viewCounts;

const getMonthKey = (value) => {
  const raw = String(value || "").trim();
  if (/^\d{4}-\d{2}$/.test(raw)) return raw;

  const now = new Date();
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
};

export async function GET(req) {
  try {
    const url = new URL(req.url);
    const monthKey = getMonthKey(url.searchParams.get("month"));

    return Response.json({
      success: true,
      monthKey,
      views: viewCounts.get(monthKey) || 0,
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

export async function POST(req) {
  try {
    const payload = await req.json().catch(() => ({}));
    const url = new URL(req.url);
    const monthKey = getMonthKey(payload?.month || url.searchParams.get("month"));
    viewCounts.set(monthKey, (viewCounts.get(monthKey) || 0) + 1);

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
