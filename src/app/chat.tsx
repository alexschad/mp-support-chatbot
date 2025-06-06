"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import useTypewriter from "@/hooks/useTypewriter";
import { Translation } from "@/lib/translations";

const startingMessages =
    "Hello, do you have questions about Metro Publisher? I'm an AI bot that can help you find answers. Just type your question below and I'll do my best to assist you.";

function TypingIndicator() {
    return (
        <div className="flex gap-1 px-4 py-2 bg-gray-200 text-gray-900 rounded-lg max-w-xs rounded-bl-none">
            <span className="w-2 h-2 bg-gray-600 rounded-full animate-bounce [animation-delay:-0.3s]" />
            <span className="w-2 h-2 bg-gray-600 rounded-full animate-bounce [animation-delay:-0.15s]" />
            <span className="w-2 h-2 bg-gray-600 rounded-full animate-bounce" />
        </div>
    );
}

function FallBackMessage({
    translation,
}: {
    translation: Translation;
    content: string;
}) {
    return (
        <span>
            {translation?.no_answer ||
                "Sorry, I could not find a matching answer."}
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
            <div className="p-2 bg-gray-200 text-gray-900 rounded-lg max-w-xs rounded-bl-none whitespace-pre-wrap break-words overflow-hidden w-full whitespace-normal">
                {displayText}
            </div>
        </div>
    );
};

export default function Chat({ translation }: { translation: Translation }) {
    const [messages, setMessages] = useState<
        { role: string; content: string; answered: boolean }[]
    >([
        {
            role: "assistant",
            content: translation?.greeting || startingMessages,
            answered: true,
        },
    ]);
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
        <div className="h-full flex flex-col items-center px-4 pt-6 bg-transparent">
            <div className="h-full w-full max-w-2xl shadow-xl rounded-2xl flex flex-col overflow-hidden border border-gray-200">
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
                    {translation?.title || "Support Chatbot"}
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-background">
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
                                className={`p-2 rounded-lg max-w-xs ${
                                    msg.role === "user"
                                        ? "bg-bot-chat-bg text-bot-chat-text rounded-br-none"
                                        : "bg-user-chat-bg text-user-chat-text rounded-bl-none"
                                }`}
                            >
                                {!msg.answered && msg.role === "assistant" ? (
                                    <FallBackMessage
                                        translation={translation}
                                        content={msg.content}
                                    />
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

                <div className="p-4 border-t flex gap-2 bg-background">
                    <input
                        type="text"
                        className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                        placeholder={
                            translation?.type_message || "Type your message..."
                        }
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                        disabled={isLoading}
                    />
                    <button
                        onClick={sendMessage}
                        className={`px-4 py-2 rounded-lg text-white transition ${
                            isLoading
                                ? "bg-mpub-blue cursor-not-allowed"
                                : "bg-mpub-blue hover:bg-mpub-blue"
                        }`}
                        disabled={isLoading}
                    >
                        {isLoading
                            ? translation?.sending || "Sending..."
                            : translation?.send || "Send"}
                    </button>
                </div>
            </div>
        </div>
    );
}
