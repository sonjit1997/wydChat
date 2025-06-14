
const LoadingSpinner = ({ size = 23, color = "rgb(31 111 76)" }) => {
  return (
    <div style={styles.wrapper}>
      <div
        style={{
          ...styles.spinner,
          width: size,
          height: size,
          borderColor: `${color} transparent ${color} transparent`,
        }}
      />
    </div>
  );
};

const styles = {
  wrapper: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  spinner: {
    border: "2px solid",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
};

// // Add keyframes manually (for pure CSS projects)
// const styleSheet = document.styleSheets[0];
// styleSheet.insertRule(`
// @keyframes spin {
//   0% { transform: rotate(0deg); }
//   100% { transform: rotate(360deg); }
// }
// `, styleSheet.cssRules.length);

export default LoadingSpinner;
