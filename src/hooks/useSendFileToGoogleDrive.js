import { useState, useCallback } from "react";

const getFileCategory = (mimeType) => {
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("video/")) return "video";
  if (mimeType.startsWith("audio/")) return "audio";
  if (
    mimeType === "application/pdf" ||
    mimeType === "application/msword" ||
    mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    mimeType === "application/vnd.ms-excel" ||
    mimeType === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
    mimeType === "application/vnd.ms-powerpoint" ||
    mimeType === "application/vnd.openxmlformats-officedocument.presentationml.presentation"
  )
    return "document";
  return "unknown";
};

const useSendFile = () => {
  const [file, setFile] = useState(null);
  const [fileType, setFileType] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const updateFile = (newFile) => {
    if (!newFile) {
      setFile(null);
      setFileType(null);
      return;
    }

    setFile(newFile);
    setFileType(getFileCategory(newFile.type));
  };

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
      setFileType(null);

      return data.fileLink;
    } catch (err) {
      console.error("Error uploading file:", err);
      setError(err.message || "Failed to upload file. Please try again.");
      return null;
    } finally {
      setLoading(false);
    }
  }, [file]);

  return {
    file,
    setFile: updateFile,
    fileType,
    sendFile,
    loading,
    error,
  };
};

export default useSendFile;
