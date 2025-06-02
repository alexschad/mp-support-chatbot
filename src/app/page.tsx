"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
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

function FallBackMessage({ content }: { content: string }) {
    if (content === "Sorry I did not find a matching answer.") {
        return (
            <span>
                Sorry, I couldn&apos;t find relevant information related to your
                question as it was worded. You could try again by rephrasing
                your question or just get help directly from our team
                (https://support.metropublisher.com/hc/en-us/requests/new)
                through our{" "}
                <a
                    href="https://support.metropublisher.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-mpub-blue underline hover:text-indigo-800"
                >
                    support site
                </a>
                .
            </span>
        );
    } else {
        return (
            <span>
                Leider konnte ich zu Ihrer Frage keine relevanten Informationen
                finden. Sie können es erneut versuchen, indem Sie Ihre Frage
                umformulieren, oder sich direkt über unsere{" "}
                <a
                    href="https://support.metropublisher.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-mpub-blue underline hover:text-indigo-800"
                >
                    Support-Website
                </a>{" "}
                an unser Team wenden.
            </span>
        );
    }
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
            <div className="px-4 py-2 bg-gray-200 text-gray-900 rounded-lg max-w-xs rounded-bl-none whitespace-pre-wrap break-words overflow-hidden w-full whitespace-normal">
                {displayText}
            </div>
        </div>
    );
};

export default function ChatPage() {
    const [messages, setMessages] = useState<
        { role: string; content: string; answered: boolean }[]
    >([]);
    const [isLoading, setIsLoading] = useState(false);
    const [input, setInput] = useState("");
    const chatEndRef = useRef<HTMLDivElement>(null);

    const sendMessage = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage = { role: "user", content: input, answered: false };
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
                answered: data.answered,
            };
            setMessages((prev) => [...prev, assistantMessage]);
        } catch (error) {
            console.error("Error fetching assistant response:", error);
            setMessages((prev) => [
                ...prev,
                {
                    role: "assistant",
                    content: "Sorry, something went wrong.",
                    answered: false,
                },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isLoading]);

    return (
        <div className="min-h-screen flex flex-col items-center py-10 px-4">
            <div className="w-full max-w-2xl shadow-xl rounded-2xl flex flex-col overflow-hidden border border-gray-200">
                <div className="px-6 py-4 bg-mpub-blue text-white font-semibold text-lg">
                    <span
                        style={{
                            display: "inline-block",
                            verticalAlign: "middle",
                            marginRight: "10px",
                        }}
                    >
                        <Image
                            src="/images/logo.svg"
                            alt="Metropublisher"
                            width={40}
                            height={40}
                        />
                    </span>
                    Support Chatbot
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
                                        ? "bg-blue-400 text-white rounded-br-none"
                                        : "bg-gray-200 text-gray-900 rounded-bl-none"
                                }`}
                            >
                                {!msg.answered && msg.role === "assistant" ? (
                                    <FallBackMessage content={msg.content} />
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

                <div className="p-4 border-t flex gap-2">
                    <input
                        type="text"
                        className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
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
                                : "bg-mpub-blue hover:bg-mpub-blue"
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
