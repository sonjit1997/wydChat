import { useEffect, useRef, useState } from "react";

const PassphraseModal = ({ isOpen, title, onSubmit, onClose }) => {
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const inputsRef = useRef([]);

  // Focus on the first input when modal opens
  useEffect(() => {
    if (isOpen && inputsRef.current[0]) {
      inputsRef.current[0].focus();
    }
  }, [isOpen]);

  const handleChange = (e, index) => {
    const value = e.target.value;
    // Allow only one digit (0-9)
    if (/^\d?$/.test(value)) {
      const newDigits = [...digits];
      newDigits[index] = value;
      setDigits(newDigits);
      // Automatically focus next input if a digit is entered
      if (value && index < 5) {
        inputsRef.current[index + 1].focus();
      }

      // If all 6 digits are entered, submit automatically
      if (index === 5 && newDigits.every((d) => d !== "")) {
        setTimeout(handleSubmit, 200); // Slight delay to allow last digit entry
      }
    }
  };

  const handleKeyDown = (e, index) => {
    // If Backspace and current field is empty, focus previous field
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputsRef.current[index - 1].focus();
    }
  };

  const handleSubmit = () => {
    onSubmit(digits.join(""));
    // Reset the inputs after successful submission (optional)
    setDigits(["", "", "", "", "", ""]);
  };

  if (!isOpen) return null;

  return (
    <div style={styles.modalOverlay}>
      <div style={styles.modalContent}>
        <h2 style={styles.title}>{title || "Enter Passphrase"}</h2>
        <div style={styles.otpInputs}>
          {digits.map((digit, index) => (
            <input
              key={index}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(e, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              ref={(el) => (inputsRef.current[index] = el)}
              style={styles.otpInput}
            />
          ))}
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
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
  },
  modalContent: {
    background: "#1F1F1F",
    padding: 20,
    borderRadius: 8,
    textAlign: "center",
    width: 250,
  },
  title: {
    color: "#fff",
    fontSize: 15,
  },
  otpInputs: {
    display: "flex",
    justifyContent: "space-between",
    margin: "20px 0",
  },
  otpInput: {
    width: 30,
    height: 30,
    fontSize: 18,
    textAlign: "center",
    boxShadow:
      "rgba(255, 255, 255, 0.1) 0px 1px 1px 0px inset, rgba(50, 50, 93, 0.25) 0px 50px 100px -20px, rgba(0, 0, 0, 0.3) 0px 30px 60px -30px",
    borderRadius: 4,
    backgroundColor: "#1F1F1F",
    color: "#fff",
  },
  modalButtons: {
    display: "flex",
    justifyContent: "space-around",
  },
};
export default PassphraseModal;
