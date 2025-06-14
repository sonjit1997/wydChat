import React,{ useState, useEffect } from "react";
import AgoraRTC from "agora-rtc-sdk-ng";
import { v4 as uuidv4 } from "uuid";
// import { IoCallOutline } from "react-icons/io5";
import { SlCallEnd } from "react-icons/sl";
import { IoCallOutline } from "react-icons/io5";

const VoiceCall = ({ logedInUser, selectedUser, websocket }) => {
  const [inCall, setInCall] = useState(false);
  const [callState, setCallState] = useState(null); // null, "calling", "incoming"
  const [callChannel, setCallChannel] = useState(null); // Track the call channel
  const APP_ID = import.meta.env.PUBLIC_AGORA_APP_ID;
  const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

  const startCall = async () => {
    try {
      const newChannel = uuidv4();
      setCallChannel(newChannel);
      setCallState("calling"); // Show "Calling" popup on caller side
      websocket.emit("incomingCall", {
        sender: logedInUser.uid,
        senderName: logedInUser.displayName,
        receiver: selectedUser.uid,
        channel: newChannel, // Include channel for receiver
      });

      await client.join(APP_ID, newChannel, null, logedInUser.uid);
      const localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
      await client.publish(localAudioTrack);
    } catch (error) {
      console.error("Failed to start call:", error);
      setCallState(null);
      setCallChannel(null);
    }
  };

  const endCall = async () => {
    try {
      await client.leave();
      setInCall(false);
      setCallState(null);
      setCallChannel(null);
    } catch (error) {
      console.error("Failed to end call:", error);
    }
  };

  const cancelCall = () => {
    websocket.emit("callCanceled", {
      sender: logedInUser.uid,
      receiver: selectedUser.uid,
    });
    endCall(); // Leave Agora and reset state
  };

  const acceptCall = async () => {
    try {
      await client.join(APP_ID, callChannel, null, logedInUser.uid);
      const localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
      await client.publish(localAudioTrack);
      setInCall(true);
      setCallState(null); // Hide popup
      websocket.emit("callAccepted", {
        sender: logedInUser.uid,
        receiver: selectedUser.uid,
      });
    } catch (error) {
      console.error("Failed to join call:", error);
    }
  };

  const rejectCall = () => {
    websocket.emit("callRejected", {
      sender: logedInUser.uid,
      receiver: selectedUser.uid,
    });
    setCallState(null); // Hide popup
    setCallChannel(null);
  };

  useEffect(() => {
    websocket.on("incomingCall", ({ sender, senderName, channel }) => {
      if (logedInUser.uid === selectedUser.uid) return; // Prevent self-call
      if (logedInUser.uid !== selectedUser.uid) {
        setCallState("incoming");
        setCallChannel(channel);
      }
    });

    websocket.on("callAccepted", ({ sender, receiver }) => {
      if (logedInUser.uid === sender && selectedUser.uid === receiver) {
        setInCall(true);
        setCallState(null); // Hide "Calling" popup on caller side
      }
    });

    websocket.on("callRejected", ({ sender, receiver }) => {
      if (logedInUser.uid === sender && selectedUser.uid === receiver) {
        endCall(); // Reset caller state
        alert("Call rejected by receiver");
      }
    });

    websocket.on("callCanceled", ({ sender, receiver }) => {
      if (logedInUser.uid === receiver && selectedUser.uid === sender) {
        setCallState(null); // Hide "Incoming" popup on receiver side
        setCallChannel(null);
      }
    });

    websocket.on("callFailed", ({ receiver, reason }) => {
      if (logedInUser.uid === receiver) return;
      alert(`Call failed: ${reason}`);
      endCall();
    });

    client.on("user-published", async (user, mediaType) => {
      if (mediaType === "audio") {
        await client.subscribe(user, mediaType);
        user.audioTrack.play();
        console.log("Remote audio playing from user:", user.uid);
      }
    });

    return () => {
      websocket.off("incomingCall");
      websocket.off("callAccepted");
      websocket.off("callRejected");
      websocket.off("callCanceled");
      websocket.off("callFailed");
      client.off("user-published");
      if (inCall) client.leave();
    };
  }, [websocket, client, logedInUser.uid, selectedUser.uid]);

  return (
    <>
      {!inCall && !callState && (
        <IoCallOutline
          onClick={startCall}
          style={styles.callIcon}
          title="Call"
        />
      )}
      {inCall && (
        <SlCallEnd onClick={endCall} style={styles.callIcon} title="End call" />
      )}

      {/* Caller Popup: "Calling" */}
      {callState === "calling" && (
        <div style={styles.popupOverlay}>
          <div style={styles.popup}>
            <p style={styles.popupText}>
              Calling <strong>{selectedUser.username}</strong>...
            </p>
            <button onClick={cancelCall} style={styles.cancelButton}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Receiver Popup: "Incoming Call" */}
      {callState === "incoming" && (
        <div style={styles.popupOverlay}>
          <div style={styles.popup}>
            <p style={styles.popupText}>
              Incoming call from{" "}
              <strong>{logedInUser.displayName || selectedUser.uid}</strong>
            </p>
            <div style={styles.buttonContainer}>
              <button onClick={acceptCall} style={styles.acceptButton}>
                Accept
              </button>
              <button onClick={rejectCall} style={styles.rejectButton}>
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const styles = {
  callIcon: {
    height: "23px",
    width: "23px",
    cursor: "pointer",
  },
  popupOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  popup: {
    backgroundColor: "#1F1F1F",
    padding: "20px",
    borderRadius: "10px",
    textAlign: "center",
    color: "#fff",
    width: "300px",
  },
  popupText: {
    margin: "0 0 15px 0",
    fontSize: "16px",
  },
  buttonContainer: {
    display: "flex",
    justifyContent: "space-around",
  },
  acceptButton: {
    backgroundColor: "#4CAF50", // Green
    color: "#fff",
    border: "none",
    padding: "8px 16px",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "14px",
  },
  rejectButton: {
    backgroundColor: "#f44336", // Red
    color: "#fff",
    border: "none",
    padding: "8px 16px",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "14px",
  },
  cancelButton: {
    backgroundColor: "#f44336", // Red
    color: "#fff",
    border: "none",
    padding: "8px 16px",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "14px",
  },
};

export default VoiceCall;
