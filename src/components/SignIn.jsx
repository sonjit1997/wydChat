import { signInUser } from "../firebase";

const SignIn = ({ onSignIn }) => {
  const handleSignIn = async () => {
    try {
      const user = await signInUser(); // Calls Google Sign-In
      onSignIn(user);
    } catch (error) {
      console.error("Error signing in:", error);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {/* <img
          src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg"
          alt="Google Logo"
          style={styles.logo}
        /> */}
        <h2 style={styles.title}>Sign in to Start WydChat</h2>
        <button onClick={handleSignIn} style={styles.button}>
          Sign in with Google
        </button>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    backgroundColor: "#1F1F1F",
  },
  card: {
    backgroundColor: "#2D2D2D",
    padding: "40px",
    borderRadius: "10px",
    boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
    textAlign: "center",
    width: "350px",
  },
  logo: {
    width: "50px",
    marginBottom: "15px",
  },
  title: {
    color: "#fff",
    fontSize: "20px",
    marginBottom: "20px",
  },
  button: {
    padding: "12px 20px",
    backgroundColor: "#DB4437", // Google Red
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "bold",
    transition: "background-color 0.3s",
  },
  buttonHover: {
    backgroundColor: "#C1351D",
  },
};

export default SignIn;
