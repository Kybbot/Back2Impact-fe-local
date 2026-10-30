import { useCallback, useEffect, useState } from "react";

export function useCountdown(duration: number) {
  const [endTime, setEndTime] = useState(() => Date.now() + duration * 1000);
  const [secondsLeft, setSecondsLeft] = useState(duration);

  useEffect(() => {
    const interval = setInterval(() => {
      const left = Math.max(
        0,
        Math.ceil((endTime - Date.now()) / 1000)
      );

      setSecondsLeft(left);
    }, 1000);

    return () => clearInterval(interval);
  }, [endTime]);

  const restart = useCallback(() => {
    setEndTime(Date.now() + duration * 1000);
    setSecondsLeft(duration);
  }, [duration]);

  return {
    secondsLeft,
    isFinished: secondsLeft === 0,
    restart,
  };
}