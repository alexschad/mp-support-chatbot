import { ReactNode } from "react";

// lib/translations.ts
type Locale = "en" | "de";
export type Translation = {
    title: string;
    greeting: string;
    type_message: string;
    send: string;
    sending: string;
    no_answer: ReactNode;
} | null;

const translations: Record<Locale, Translation> = {
    en: {
        title: "Support Chatbot",
        greeting:
            "Hello, do you have questions about Metro Publisher? I'm an AI bot that can help you find answers. Just type your question below and I'll do my best to assist you.",
        type_message: "Type your question...",
        send: "Send",
        sending: "Sending...",
        no_answer: (
            <span>
                Sorry, I couldn&apos;t find relevant information related to your
                question as it was worded. You could try again by rephrasing
                your question or just get help directly from our team through
                our{" "}
                <a
                    href="https://support.metropublisher.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 underline hover:text-indigo-800"
                >
                    support site
                </a>
                .
            </span>
        ),
    },
    de: {
        title: "Support Chatbot",
        greeting:
            "Hallo, haben Sie Fragen zu Metro Publisher? Ich bin ein KI-Bot und kann Ihnen helfen, Antworten zu finden. Geben Sie einfach Ihre Frage unten ein, und ich werde mein Bestes tun, um Ihnen zu helfen.",
        type_message: "Geben Sie Ihre Frage ein...",
        send: "Senden",
        sending: "Sende...",
        no_answer: (
            <span>
                Leider konnte ich zu Ihrer Frage keine relevanten Informationen
                finden. Sie können es erneut versuchen, indem Sie Ihre Frage
                umformulieren, oder sich direkt über unsere{" "}
                <a
                    href="https://support.metropublisher.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-mpub-lt-blue underline hover:text-indigo-800"
                >
                    Support-Website
                </a>{" "}
                an unser Team wenden.
            </span>
        ),
    },
};

export function getTranslation(locale: string) {
    if (locale in translations) {
        return translations[locale as Locale];
    }
    return translations.en;
}
