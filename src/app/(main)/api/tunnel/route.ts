import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const url = `https://glitchtip.app.niklas.services/api/1/security/?glitchtip_key=ba4454af2d3d446ea8597abd8ce29c17&sentry_client=sentry.javascript.nextjs%2F9.2.0`;

  try {
    // Get request body as text
    const body = await request.text();

    await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=UTF-8",
        Accept: "*/*",
      },
      body,
    });

    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error("GlitchTip tunnel error:", error);
    return NextResponse.json(
      {
        status: "error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
