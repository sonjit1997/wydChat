import { useEffect, useRef, useState } from "react";
import { GrAttachment } from "react-icons/gr";
import { MdDelete } from "react-icons/md";
import { FaRegFileAlt } from "react-icons/fa";
const FileShare = ({ file, setFile, clearFileInput }) => {
  const fileInputRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    if (clearFileInput && fileInputRef.current) {
      fileInputRef.current.value = "";
      setPreviewUrl(null);
    }
  }, [clearFileInput]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      if (selectedFile.type.startsWith("image/")) {
        const url = URL.createObjectURL(selectedFile);
        setPreviewUrl(url);
      } else {
        setPreviewUrl(null);
      }
    }
  };

  const cancelFile = () => {
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  return (
    <>
      {file && (
        <div style={styles.preview}>
          {previewUrl ? (
            <img
              src={previewUrl}
              alt={file.name}
              style={{
                maxWidth: "100px",
                maxHeight: "100px",
                borderRadius: "4px",
              }}
            />
          ) : (
            <p style={styles.previewText}>
                 <FaRegFileAlt style={{ marginRight: "5px" }} />
              {file.name.slice(0, 50)}
              {file.name.length > 50 ? "..." : ""}
            </p>
          )}
          <button onClick={cancelFile} style={styles.cancelButton}>
           <MdDelete/>
          </button>
        </div>
      )}

      <label htmlFor="file-upload" style={styles.uploadButton}>
        <GrAttachment style={{ color: file ? "#fff" : "rgb(223, 223, 223)" }} />
        <input
          id="file-upload"
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          style={styles.fileInput}
        />
      </label>
    </>
  );
};

const styles = {
  uploadButton: {
    padding: "11px 6px",
    backgroundColor: "transparent",
    border: "none",
    fontSize: "20px",
    cursor: "pointer",
  },
  fileInput: {
    display: "none",
  },
  preview: {
    padding: "12px",
    backgroundColor: "#2A2A2A",
    width: "fit-content",
    display: "flex",
    margin: "11px",
    borderRadius: "4px",
    justifyContent: "space-between",
    alignItems: "center",
    borderLeft: "4px solid rgb(31 111 76)",
    position: "relative",
  },
  previewText: {
    margin: 0,
    fontSize: "12px",
    color: "#ccc",
  },
  cancelButton: {
    position: "absolute",
    top: "0px",
    left: "83.2%",
    background: "none",
    border: "none",
    color: "#fff",
    cursor: "pointer",
    fontSize: "12px",
  },
};

export default FileShare;
