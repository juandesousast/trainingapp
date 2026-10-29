import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json(
      { error: { message: "Exercise ID is required" } },
      { status: 400 }
    );
  }

  const apiKey = process.env.EXERCISE_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: { message: "EXERCISE_API_KEY not configured" } },
      { status: 500 }
    );
  }

  try {
    const res = await fetch(
      `https://api.exerciseapi.dev/v1/exercises/${encodeURIComponent(id)}`,
      {
        headers: {
          "X-API-Key": apiKey,
          Accept: "application/json",
        },
        next: { revalidate: 86400 }, // 24 horas de caché en servidor
      }
    );

    if (res.status === 429) {
      return NextResponse.json(
        { error: { code: "RATE_LIMIT", message: "Rate limit reached" } },
        { status: 429 }
      );
    }

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return NextResponse.json(
        { error: err.error || { message: "Exercise not found" } },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=43200",
      },
    });
  } catch (err: any) {
    console.error(`[api/exercises/${id}] Error:`, err);
    return NextResponse.json(
      { error: { message: err?.message || "Internal server error" } },
      { status: 500 }
    );
  }
}
