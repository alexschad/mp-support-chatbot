import { OpenAI } from "openai";
import clientPromise from "@/lib/mongodb"; // MongoDB connection helper

const EMBEDDING_MODEL = "text-embedding-3-small";
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface Document {
    doc_id: string;
    title: string;
    text: string;
    embedding: number[]; // Vector embedding is an array of numbers
}

export async function POST(req: Request) {
    const { query } = await req.json();
    const mongoClient = await clientPromise;
    const db = mongoClient.db(process.env.MONGODB_DB_NAME);
    const collection = db.collection(process.env.MONGODB_COLLECTION_NAME || "");

    // Get query embedding
    const embeddingResponse = await openai.embeddings.create({
        model: EMBEDDING_MODEL,
        input: [query],
    });
    const queryEmbedding = embeddingResponse.data[0].embedding;

    // Perform vector search using $vectorSearch
    const results = await collection
        .aggregate([
            {
                $vectorSearch: {
                    queryVector: queryEmbedding,
                    path: "embedding",
                    numCandidates: 100,
                    limit: 5,
                    index: "search_index",
                },
            },
        ])
        .toArray();

    const context = (results as Document[]).map((r) => r.text).join("\n\n");

    // Ask GPT-4 with context
    const chatResponse = await openai.chat.completions.create({
        model: "gpt-4",
        temperature: 0.2,
        messages: [
            {
                role: "system",
                content:
                    "You are a helpful support assistant. Only answer using the provided context. If the context doesn't include the information say:Sorry I did not find a matching answer.",
            },
            {
                role: "user",
                content: `Answer the question based only on the info below:\n\n${context}\n\nQuestion: ${query}`,
            },
        ],
    });

    return Response.json({ answer: chatResponse.choices[0].message.content });
}
