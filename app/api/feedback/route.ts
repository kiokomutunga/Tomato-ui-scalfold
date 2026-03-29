import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function POST(req: NextRequest) {
  try {
    const { predictionId, correct } = await req.json();

    const client = await clientPromise;
    const db     = client.db("tomato_disease");

    await db.collection("predictions").updateOne(
      { _id: new ObjectId(predictionId) },
      { $set: { user_feedback: correct, feedback_at: new Date() } }
    );

    return NextResponse.json({ status: "saved" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to save feedback" }, { status: 500 });
  }
}