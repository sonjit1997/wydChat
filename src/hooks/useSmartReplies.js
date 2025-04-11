import OpenAI from 'openai';


const openai = new OpenAI({
    apiKey: 'YOUR_API_KEY',
    dangerouslyAllowBrowser: true // Required for browser use (bypasses safety checks)
});



const useSmartReplies= async (message) => {
    const prompt = `Based on this message: '${message}', suggest 3 short reply options (each under 10 words).`;
    try {
        const completion = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
                { role: 'system', content: 'You are a concise, helpful assistant.' },
                { role: 'user', content: prompt }
            ],
            max_tokens: 50,
            temperature: 0.5
        });
        const replies = completion.choices[0].message.content.split('\n');
        return replies;
    } catch (error) {
        console.error('Error fetching smart replies:', error);
        return ['Oops, something went wrong!'];
    }
}

export default useSmartReplies;




// const [smartReply,setSmartReply]=useState(null);
// useEffect(() => {
//   if (groupedMessages.length) {
//     const lastMessage = groupedMessages[groupedMessages.length - 1];
//     const recivedMessage = lastMessage.senderId !== logedInUser.uid;

//     if(recivedMessage){
//       const smartReplyData=useSmartReplies(recivedMessage)
//       console.log(smartReplyData);

//       setSmartReply(smartReplyData);
//     }
//   }
// }, [groupedMessages, logedInUser]);