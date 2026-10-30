import { useEffect, useState } from "react";

export const useDelayedLoading = (
  isLoading: boolean,
  delay = 300,
) => {
  const [showLoader, setShowLoader] = useState(false);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    if (isLoading) {
      timeoutId = setTimeout(() => {
        setShowLoader(true);
      }, delay);
    } else {
      setShowLoader(false);
    }

    return () => clearTimeout(timeoutId);
  }, [isLoading, delay]);

  return showLoader;
}