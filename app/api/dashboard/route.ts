import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET() {
  try {
    const client = await clientPromise;
    const db     = client.db("tomato_disease");

    const [totalScans, diseaseCounts, recentScans, feedbackStats] = await Promise.all([
      // Total scans
      db.collection("prediction").countDocuments(),

      // Count per disease
      db.collection("prediction").aggregate([
        { $group: { _id: "$prediction", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]).toArray(),

      // Last 5 scans
      db.collection("prediction")
        .find({})
        .sort({ timestamp: -1 })
        .limit(5)
        .toArray(),

      // Feedback breakdown
      db.collection("prediction").aggregate([
        { $match: { user_feedback: { $exists: true } } },
        { $group: { _id: "$user_feedback", count: { $sum: 1 } } },
      ]).toArray(),
    ]);

    const correct   = feedbackStats.find((f) => f._id === true)?.count  ?? 0;
    const incorrect = feedbackStats.find((f) => f._id === false)?.count ?? 0;

    return NextResponse.json({
      totalScans,
      diseaseCounts,
      recentScans,
      feedbackAccuracy: correct + incorrect > 0
        ? Math.round((correct / (correct + incorrect)) * 100)
        : null,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to load dashboard" }, { status: 500 });
  }
}