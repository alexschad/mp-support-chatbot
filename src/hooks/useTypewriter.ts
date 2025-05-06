import { useState, useEffect } from "react";

const useTypewriter = (text: string, speed = 50) => {
    const [displayText, setDisplayText] = useState("");
    useEffect(() => {
        let index = 0;
        setDisplayText("");

        if (!text) return;

        const interval = setInterval(() => {
            const nextIndex = index + 1;

            if (nextIndex >= text.length) {
                clearInterval(interval);
            }

            setDisplayText(text.slice(0, nextIndex));
            index = nextIndex;
        }, speed);

        return () => clearInterval(interval);
    }, [text, speed]);

    return displayText;
};

export default useTypewriter;
