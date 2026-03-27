import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET(req: NextRequest) {
  try {
    const sessionId = req.nextUrl.searchParams.get("sessionId");

    const client = await clientPromise;
    const db     = client.db("tomato_disease");

    if (sessionId) {
      // Return one specific session
      const session = await db.collection("chat_sessions").findOne({ sessionId });
      return NextResponse.json(session ?? { messages: [] });
    }

    // Return list of all sessions (for sidebar)
    const sessions = await db
      .collection("chat_sessions")
      .find({}, { projection: { sessionId: 1, createdAt: 1, diseaseContext: 1 } })
      .sort({ createdAt: -1 })
      .limit(20)
      .toArray();

    return NextResponse.json(sessions);
  } catch (err) {
    console.error("History route error:", err);
    return NextResponse.json({ error: "Failed to load history" }, { status: 500 });
  }
}