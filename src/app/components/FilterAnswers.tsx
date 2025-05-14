"use client";

import { useRouter, useSearchParams } from "next/navigation";

const categories = ["all", "answered", "notAnswered"];

export default function FilterAnswers({ selected }: { selected: string }) {
    const router = useRouter();
    const params = useSearchParams();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const answered = e.target.value;
        const newParams = new URLSearchParams(params.toString());
        newParams.set("answered", answered);
        newParams.set("page", "1");
        router.push(`?${newParams.toString()}`);
    };

    return (
        <div className="mb-4">
            {categories.map((cat) => (
                <label key={cat} className="mr-4">
                    <input
                        type="radio"
                        name="answered"
                        value={cat}
                        checked={selected === cat}
                        onChange={handleChange}
                        className="mr-1"
                    />
                    {cat === "all"
                        ? "All"
                        : cat === "answered"
                        ? "Answered"
                        : "Not Answered"}
                </label>
            ))}
        </div>
    );
}
