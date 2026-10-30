import { useCallback, useEffect, useRef, useState } from "react"

export const useToast = () => {
    const [message, setMessage] = useState<string | null>(null);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const showToast = useCallback(
        (message: string, duration = 5000) => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }

            setMessage(message);

            timeoutRef.current = setTimeout(() => {
                setMessage(null);
                timeoutRef.current = null;
            }, duration);
        },
    [],
  );

    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    return {
        message,
        showToast,
    };
}