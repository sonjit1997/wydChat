import { useEffect, useRef, useState } from "react";
import { MdOutlineKeyboardVoice } from "react-icons/md";

const RecordingPopup = () => (
  <div style={styles.popup}>
    <svg width="40" height="40" viewBox="0 0 24 24" style={{ fill: "#fff" }}>
      <circle cx="12" cy="12" r="4">
        <animate
          attributeName="r"
          values="4;8;4"
          dur="1s"
          repeatCount="indefinite"
        />
        <animate
          attributeName="opacity"
          values="1;0.5;1"
          dur="1s"
          repeatCount="indefinite"
        />
      </circle>
    </svg>
    <span style={{ color: "#fff", fontSize: "12px", marginTop: "4px" }}>
      Recording...
    </span>
  </div>
);

const VoiceRecorder = ({ setFile, file }) => {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const startRecording = () => {
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        mediaRecorderRef.current = new MediaRecorder(stream);
        mediaRecorderRef.current.ondataavailable = (event) => {
          audioChunksRef.current.push(event.data);
        };
        mediaRecorderRef.current.onstop = async () => {
          const audioBlob = new Blob(audioChunksRef.current, {
            type: "audio/wav",
          });
          setFile(audioBlob);
          audioChunksRef.current = [];
        };

        mediaRecorderRef.current.start();
        setIsRecording(true);
      })
      .catch((error) => {
        console.error("Error starting audio recording:", error);
      });
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleMouseDown = () => {
    startRecording();
  };

  const handleMouseUp = () => {
    stopRecording();
  };

  useEffect(() => {
    return () => {
      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state === "recording"
      ) {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  return (
    <div>
      <div style={{ position: "relative" }}>
        <button
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          style={styles.voiceButton}
        >
          <MdOutlineKeyboardVoice style={{ color: "rgb(223, 223, 223)" }} />
        </button>

        {isRecording && <RecordingPopup />}
      </div>

      {/* {file && !isRecording && (
        <div>
          <audio controls src={file} />
          <p>Voice!</p>
        </div>
      )} */}
    </div>
  );
};

const styles = {
  voiceButton: {
    padding: "10px 5px",
    backgroundColor: "transparent",
    border: "none",
    fontSize: "25px",
    cursor: "pointer",
  },
  popup: {
    position: "absolute",
    top: "-70px",
    left: "50%",
    transform: "translateX(-50%)",
    backgroundColor: "#333",
    padding: "8px 12px",
    borderRadius: "8px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    boxShadow: "0 2px 10px rgba(0,0,0,0.3)",
    zIndex: 10,
  },
};

export default VoiceRecorder;
