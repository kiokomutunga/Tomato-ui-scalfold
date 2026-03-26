import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { Document } from "mongodb";

export async function POST(req: NextRequest) {
  try {
    const { messages, diseaseContext, sessionId } = await req.json();

    const systemPrompt = diseaseContext
      ? `You are an expert tomato disease assistant helping farmers and agronomists.
         
         The user uploaded a tomato leaf image. The AI model detected:
         - Disease: ${diseaseContext.prediction}
         - Confidence: ${(diseaseContext.confidence * 100).toFixed(1)}%
         - Description: ${diseaseContext.disease_info?.description ?? "N/A"}
         - Symptoms: ${diseaseContext.disease_info?.symptoms ?? "N/A"}
         - Treatment: ${diseaseContext.disease_info?.treatment ?? "N/A"}
         - Prevention: ${diseaseContext.disease_info?.prevention ?? "N/A"}
         
         Your job:
         - Answer questions about this specific disease clearly and practically
         - Give actionable farming advice (what to spray, when, how much)
         - Explain symptoms in simple non-technical language
         - If asked something unrelated to tomato diseases, politely redirect
         - Keep responses concise but thorough — farmers are busy people`
      : `You are a helpful tomato disease expert assistant.
         No image has been analysed yet.
         Encourage the user to upload a tomato leaf image so you can give them a specific diagnosis.
         You can still answer general questions about tomato diseases while waiting.`;

    // Call Anthropic API
    const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY!,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1024,
        system: systemPrompt,
        messages: messages.map((m: { role: string; content: string }) => ({
          role: m.role,
          content: m.content,
        })),
      }),
    });

    // Log the raw error if Anthropic rejects
    if (!anthropicRes.ok) {
      const errorBody = await anthropicRes.text();
      console.error("Anthropic API error:", anthropicRes.status, errorBody);
      return NextResponse.json(
        { error: `Anthropic error: ${anthropicRes.status}` },
        { status: 500 }
      );
    }

    const data  = await anthropicRes.json();
    const reply = data.content?.[0]?.text;

    if (!reply) {
      console.error("No reply in Anthropic response:", JSON.stringify(data));
      return NextResponse.json({ error: "Empty response from AI" }, { status: 500 });
    }

    // Save chat to MongoDB
    const client = await clientPromise;
    const db     = client.db("tomato_disease");

    const updateDoc: Document = {
      $set:  { updatedAt: new Date(), diseaseContext },
      $push: {
        messages: {
          $each: [
            messages[messages.length - 1],
            { role: "assistant", content: reply },
          ],
        },
      },
      $setOnInsert: { sessionId, createdAt: new Date() },
    };

    await db.collection("chat_sessions").updateOne(
      { sessionId },
      updateDoc,
      { upsert: true }
    );

    return NextResponse.json({ reply });

  } catch (err) {
    console.error("Chat route error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}