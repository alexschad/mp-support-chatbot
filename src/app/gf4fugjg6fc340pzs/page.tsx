import clientPromise from "@/lib/mongodb";
import FilterAnswers from "@/app/components/FilterAnswers";

const PAGE_SIZE = 10;

type logEntry = {
    _id?: string;
    question: string;
    answer: string;
    answered: boolean;
    timestamp: Date;
};

async function fetchEntries(page: number, answered?: string) {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME);
    const collection = db.collection<logEntry>(
        process.env.MONGODB_ANSWER_COLLECTION_NAME || ""
    );

    const answeredFilter =
        answered === "answered"
            ? true
            : answered === "notAnswered"
            ? false
            : undefined;
    const query: Partial<logEntry> = {};
    if (answeredFilter !== undefined) {
        query.answered = answeredFilter;
    }

    const entries = await collection
        .find(query)
        .sort({ timestamp: -1 }) // Order by timestamp in descending order
        .skip((page - 1) * PAGE_SIZE)
        .limit(PAGE_SIZE)
        .toArray();

    const totalEntries = await collection.countDocuments(query);
    return { entries, totalEntries };
}

type PageProps = {
    page?: string;
    answered?: string;
};

export default async function Page({
    searchParams,
}: {
    searchParams: Promise<PageProps>;
}) {
    const { page: pageString, answered } = await searchParams;
    const page = parseInt(pageString || "1", 10);
    const { entries, totalEntries } = await fetchEntries(page, answered);
    const totalPages = Math.ceil(totalEntries / PAGE_SIZE);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center py-10 px-4">
            <div className="w-full max-w-2xl shadow-xl rounded-2xl flex flex-col overflow-hidden border border-gray-200">
                <div className="px-6 py-4 bg-indigo-600 text-white font-semibold text-lg">
                    Metropublisher Support Chat Logs
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    <FilterAnswers selected={answered || "all"} />
                    <h1 className="font-bold">{totalEntries} Questions</h1>
                    <ul className="space-y-4">
                        {entries.map((entry: logEntry) => (
                            <li
                                key={entry._id}
                                className="p-4 bg-gray-100 rounded-lg shadow-sm border border-gray-200"
                            >
                                <div className="mb-2">
                                    <strong className="text-indigo-600">
                                        Question:{" "}
                                    </strong>
                                    {entry.question}
                                </div>
                                <div className="mb-2">
                                    <strong className="text-indigo-600">
                                        Answer:{" "}
                                    </strong>
                                    {entry.answer}
                                </div>
                                <div className="mb-2">
                                    <strong className="text-indigo-600">
                                        Answered:{" "}
                                    </strong>
                                    {entry.answered ? (
                                        <span className="text-green-600">
                                            Yes
                                        </span>
                                    ) : (
                                        <span className="text-red-600">No</span>
                                    )}
                                </div>
                                <div>
                                    <strong className="text-indigo-600">
                                        Timestamp:{" "}
                                    </strong>
                                    {entry.timestamp.toLocaleString()}
                                </div>
                            </li>
                        ))}
                    </ul>
                    <div>
                        {Array.from({ length: totalPages }, (_, i) => (
                            <a
                                key={i}
                                href={`?page=${i + 1}${
                                    answered ? `&answered=${answered}` : ""
                                }`}
                                style={{
                                    margin: "0 5px",
                                    textDecoration:
                                        page === i + 1 ? "underline" : "none",
                                }}
                            >
                                {i + 1}
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
