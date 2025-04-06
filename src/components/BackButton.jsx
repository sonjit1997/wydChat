import { navigate } from "astro/virtual-modules/transitions-router.js";
import { useEffect, useState } from "react";

const BackButton = () => {
  const [showBackButton, setShowBackButton] = useState(false);
 
  useEffect(() => {
    const handleMouseMove = (e) => {
      const thresholdX = window.innerWidth - 100;
      const middleY = window.innerHeight / 2;

      if (
        e.clientX >= thresholdX &&
        e.clientY >= middleY - 50 &&
        e.clientY <= middleY + 50
      ) {
        setShowBackButton(true);
      } else {
        setShowBackButton(false);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  const onClick = () => {
    navigate("/");
  };
  return (
    <button
      onClick={onClick}
      style={{
        ...styles.backButton,
        right: showBackButton ? "-14px" : "-30px",
        opacity: showBackButton ? 1 : 0.5,
      }}
    >
      ←
    </button>
  );
};

const styles = {
  backButton: {
    position: "fixed",
    top: "50%",
    transform: "translateY(-50%)",
    padding: "11px",
    backgroundColor: "#1F1F1F",
    color: "#fff",
    border: "none",
    borderRadius: "50%",
    cursor: "pointer",
    zIndex: 999,
    transition: "all 0.3s ease",
  },
};

export default BackButton;
