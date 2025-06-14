import { useEffect, useState } from "react";

function useSmartReplies(message) {
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
console.log(message);

  useEffect(() => {
    if (!message) {
      setSuggestions([]);
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    fetch("/api/smart-reply-v2", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        if (data && Array.isArray(data.suggestions)) {
          setSuggestions(data.suggestions);
        } else {
          setError("Invalid response format from Gemini.");
        }
      })
      .catch((err) => {
        setError("Failed to fetch suggestions from Gemini.");
        console.error("Error fetching Gemini suggestions:", err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [message]);

  return { suggestions, isLoading, error };
}

export default useSmartReplies;
