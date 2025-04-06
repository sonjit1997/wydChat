
const InputBox = ({ sendMessage, text, setText,handleTyping }) => {
  return (
    <div style={styles.inputContainer}>

    
    <form onSubmit={sendMessage} style={styles.form}>
      <input
        type="text"
        value={text}
        onChange={(e) => { 
          setText(e.target.value); 
          handleTyping();
        }} 
        placeholder="Type a message..."
        style={styles.input}
      />
      <button type="submit" style={styles.button} >
        ➤
      </button>
    </form>
    </div>
  );
};

const styles = {
  inputContainer:{
    padding:'0px 62px 20px 60px'

  },
  form: {
    display: "flex",
    backgroundColor: "rgb(28 28 28)",
    borderRadius: "10px",
    border: "1px solid rgb(85 85 85)",
  },
  input: {
    flex: 1,
    padding: "8px 11px",
    outline: "none",
    border:'none',
    backgroundColor:'transparent',
    color: "#fff",
  },
  button: {
    padding: "11px 14px",
    backgroundColor:'transparent',
    color: "#fff",
    border: "none",
    cursor: "pointer",
    margin: "0px 11px",
    fontSize: "23px",
  },
};

export default InputBox;
