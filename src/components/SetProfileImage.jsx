import { useState } from "react";

const SetProfileImage = ({ isOpen, onClose}) => {
  const [selectedImage, setSelectedImage] = useState(null);

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setSelectedImage(imageUrl);
    }
  };

  const handleSave = () => {
    if (selectedImage) {

      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div style={styles.modalOverlay}>
      <div style={styles.modalContainer}>
        <h2>Update Profile Picture</h2>
        
        {selectedImage ? (
          <img src={selectedImage} alt="Preview" style={styles.imagePreview} />
        ) : (
          <p>No image selected</p>
        )}

        <input type="file" accept="image/*" onChange={handleImageChange} style={styles.fileInput} />
        
        <div style={styles.buttonContainer}>
          <button onClick={handleSave} style={styles.saveButton} disabled={!selectedImage}>
            Save
          </button>
          <button onClick={onClose} style={styles.cancelButton}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modalContainer: {
    backgroundColor: "#1F1F1F",
    padding: "20px",
    borderRadius: "10px",
    textAlign: "center",
    color: "#fff",
    width: "320px",
  },
  imagePreview: {
    width: "100px",
    height: "100px",
    borderRadius: "50%",
    objectFit: "cover",
    margin: "10px auto",
    display: "block",
  },
  fileInput: {
    margin: "10px 0",
    color: "#fff",
  },
  buttonContainer: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "10px",
  },
  saveButton: {
    padding: "8px 12px",
    backgroundColor: "#007BFF",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  cancelButton: {
    padding: "8px 12px",
    backgroundColor: "#FF3B30",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
};

export default SetProfileImage;
