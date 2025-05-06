"use client";

import { useState, useRef, useEffect, JSX } from "react";
import useTypewriter from "@/hooks/useTypewriter";

function TypingIndicator() {
    return (
        <div className="flex gap-1 px-4 py-2 bg-gray-200 text-gray-900 rounded-lg max-w-xs rounded-bl-none">
            <span className="w-2 h-2 bg-gray-600 rounded-full animate-bounce [animation-delay:-0.3s]" />
            <span className="w-2 h-2 bg-gray-600 rounded-full animate-bounce [animation-delay:-0.15s]" />
            <span className="w-2 h-2 bg-gray-600 rounded-full animate-bounce" />
        </div>
    );
}

function FallBackMessag() {
    return (
        <span>
            I&apos;m sorry, I couldn&apos;t find relevant information in the
            documentation. You can try rephrasing your question or{" "}
            <a
                href="https://support.metropublisher.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 underline hover:text-indigo-800"
            >
                contact our support team
            </a>{" "}
            for further assistance.
        </span>
    );
}

const Typewriter = ({
    text,
    speed,
    chatEndRef,
}: {
    text: string;
    speed: number;
    chatEndRef: React.RefObject<HTMLDivElement> | null;
}) => {
    const displayText = useTypewriter(text, speed);

    // Scroll to bottom when new text appears
    useEffect(() => {
        if (chatEndRef && chatEndRef.current) {
            chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    }, [displayText, chatEndRef]);

    return (
        <div className="flex justify-start">
            <div className="px-4 py-2 bg-gray-200 text-gray-900 rounded-lg max-w-xs rounded-bl-none whitespace-pre-wrap">
                {displayText}
            </div>
        </div>
    );
};

export default function ChatPage() {
    const [messages, setMessages] = useState<
        { role: string; content: string | JSX.Element }[]
    >([]);
    const [isLoading, setIsLoading] = useState(false);
    const [input, setInput] = useState("");
    const chatEndRef = useRef<HTMLDivElement>(null);

    const sendMessage = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage = { role: "user", content: input };
        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);

        try {
            const res = await fetch("/api/ask", {
                method: "POST",
                body: JSON.stringify({ query: input }),
                headers: { "Content-Type": "application/json" },
            });

            const data = await res.json();
            const assistantMessage = {
                role: "assistant",
                content: data.answer,
            };
            setMessages((prev) => [...prev, assistantMessage]);
        } catch (error) {
            console.error("Error fetching assistant response:", error);
            setMessages((prev) => [
                ...prev,
                { role: "assistant", content: "Sorry, something went wrong." },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isLoading]);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center py-10 px-4">
            <div className="w-full max-w-2xl bg-white shadow-xl rounded-2xl flex flex-col overflow-hidden border border-gray-200">
                <div className="px-6 py-4 bg-indigo-600 text-white font-semibold text-lg">
                    Metropublisher Support Chat
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[60vh]">
                    {messages.map((msg, idx) => (
                        <div
                            key={idx}
                            className={`flex ${
                                msg.role === "user"
                                    ? "justify-end"
                                    : "justify-start"
                            }`}
                        >
                            <div
                                className={`px-4 py-2 rounded-lg max-w-xs ${
                                    msg.role === "user"
                                        ? "bg-indigo-500 text-white rounded-br-none"
                                        : "bg-gray-200 text-gray-900 rounded-bl-none"
                                }`}
                            >
                                {msg.content ===
                                "Sorry I did not find a matching answer." ? (
                                    <FallBackMessag />
                                ) : msg.role === "assistant" ? (
                                    <Typewriter
                                        text={msg.content as string}
                                        speed={20}
                                        chatEndRef={
                                            chatEndRef as React.RefObject<HTMLDivElement>
                                        }
                                    />
                                ) : (
                                    msg.content
                                )}
                            </div>
                        </div>
                    ))}

                    {isLoading && (
                        <div className="flex justify-start">
                            <TypingIndicator />
                        </div>
                    )}

                    <div ref={chatEndRef} />
                </div>

                <div className="p-4 border-t flex gap-2 bg-white">
                    <input
                        type="text"
                        className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        placeholder="Type your message..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                        disabled={isLoading}
                    />
                    <button
                        onClick={sendMessage}
                        className={`px-4 py-2 rounded-lg text-white transition ${
                            isLoading
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-indigo-600 hover:bg-indigo-700"
                        }`}
                        disabled={isLoading}
                    >
                        {isLoading ? "Sending..." : "Send"}
                    </button>
                </div>
            </div>
        </div>
    );
}
