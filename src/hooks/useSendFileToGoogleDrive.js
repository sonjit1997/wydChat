import { useState, useCallback } from "react";

const useSendFile = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const sendFile = useCallback(async () => {
    if (!file) return null;

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload-file", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Upload failed");
      }

      setFile(null);

      return data.fileLink;
    } catch (err) {
      console.error("Error uploading file:", err);
      setError(err.message || "Failed to upload file. Please try again.");
      return null;
    } finally {
      setLoading(false);
    }
  }, [file]);

  return { file, setFile, sendFile, loading, error };
};

export default useSendFile;
