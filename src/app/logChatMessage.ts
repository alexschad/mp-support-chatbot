import clientPromise from "@/lib/mongodb";

export async function logChatMessage({
    question,
    answer,
    answered,
}: {
    question: string;
    answer: string;
    answered: boolean;
}) {
    const mongoClient = await clientPromise;
    const db = mongoClient.db(process.env.MONGODB_DB_NAME);
    const collection = db.collection(
        process.env.MONGODB_ANSWER_COLLECTION_NAME || ""
    );

    await collection.insertOne({
        question,
        answer,
        answered,
        timestamp: new Date(),
    });
}
