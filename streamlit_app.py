import streamlit as st
import time
from cocktail_agent import compile_agent, start_agent
from langgraph.types import Command

# Set page configuration
st.set_page_config(
    page_title="Pocket Mixologist",
    page_icon="🍹",
    layout="centered",
    initial_sidebar_state="collapsed"
)

# Custom CSS for styling
st.markdown("""
<style>
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Poppins:wght@300;400;500;600&display=swap');
    
    html, body, [class*="css"] {
        font-family: 'Poppins', sans-serif;
    }
    
    h1, h2, h3 {
        font-family: 'Playfair Display', serif;
    }
    
    .stApp {
        background-image: linear-gradient(to bottom, rgba(30, 30, 30, 0.97), rgba(30, 30, 30, 0.97)), url('https://images.unsplash.com/photo-1574054707356-0089a56aa259?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80');
        background-size: cover;
        background-attachment: fixed;
    }
    
    .user-message {
        background-color: rgba(139, 0, 0, 0.1);
        border-left: 3px solid #8B0000;
        border-radius: 5px;
        padding: 15px;
        margin-bottom: 15px;
    }
    
    .bot-message {
        background-color: rgba(50, 50, 50, 0.6);
        border-left: 3px solid #8B0000;
        border-radius: 5px;
        padding: 15px;
        margin-bottom: 15px;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    }
    
    .recipe {
        background-color: rgba(40, 40, 40, 0.8);
        border: 2px solid #8B0000;
        border-radius: 8px;
        padding: 20px;
        margin: 15px 0;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
    }
    
    .header {
        text-align: center;
        color: #8B0000;
        margin-bottom: 20px;
        font-size: 3rem;
        font-weight: 700;
        text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
    }
    
    .subheader {
        color: #c0c0c0;
        text-align: center;
        font-weight: 300;
        font-style: italic;
        margin-bottom: 25px;
    }
    
    /* Style the chat bubbles */
    .stChatMessage {
        background-color: rgba(45, 45, 45, 0.7) !important;
        border-radius: 10px !important;
        padding: 10px !important;
        margin-bottom: 15px !important;
        backdrop-filter: blur(10px);
    }
    
    /* Style buttons */
    .stButton button {
        background-color: #8B0000 !important;
        color: white !important;
        border: none !important;
        border-radius: 30px !important;
        padding: 10px 25px !important;
        font-weight: 600 !important;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2) !important;
        transition: all 0.3s ease !important;
    }
    
    .stButton button:hover {
        background-color: #6B0000 !important;
        box-shadow: 0 6px 12px rgba(0, 0, 0, 0.3) !important;
        transform: translateY(-2px) !important;
    }
    
    /* Style the chat input area */
    .stChatInputContainer {
        border-radius: 30px !important;
        border: 1px solid #8B0000 !important;
        padding: 2px !important;
        background-color: rgba(45, 45, 45, 0.7) !important;
    }
    
    /* Style scrollbar */
    ::-webkit-scrollbar {
        width: 8px;
    }
    
    ::-webkit-scrollbar-track {
        background: rgba(30, 30, 30, 0.9);
    }
    
    ::-webkit-scrollbar-thumb {
        background: #8B0000;
        border-radius: 10px;
    }
    
    .input-prompt {
        font-size: 1.5rem;
        font-weight: 600;
        color: #8B0000;
        margin-bottom: 20px;
    }
    
    .finished-message {
        font-size: 1.5rem;
        font-weight: 600;
        color: #8B0000;
        margin-bottom: 20px;
    }
</style>
""", unsafe_allow_html=True)

# Title and description
st.markdown("<h1 class='header'>🍹 Pocket Mixologist</h1>", unsafe_allow_html=True)
st.markdown("<p class='subheader'>Your personal AI bartender crafting exclusive cocktail recipes tailored just for you.</p>", unsafe_allow_html=True)

# Initialize session state
if "agent" not in st.session_state:
    st.session_state.agent = compile_agent()
    st.session_state.config = {"configurable": {"thread_id": str(int(time.time()))}}
    st.session_state.messages = []
    st.session_state.finished = False
    st.session_state.conversation_started = False
    st.session_state.last_ai_message_id = None  # To track the last AI message

def clear_chat_session_state():
    """Function to clear chat messages"""
    st.session_state.messages = []
    st.session_state.finished = False
    st.session_state.conversation_started = False
    st.session_state.config = {"configurable": {"thread_id": str(int(time.time()))}}
    st.session_state.last_ai_message_id = None

# Initialize the application parameters
agent = st.session_state.agent
config = st.session_state.config

# Show message history
for message in st.session_state.messages:
    avatar = "🙋" if message["role"] == "user" else "🍹"
    with st.chat_message(message["role"], avatar=avatar):
        st.markdown(message["content"])

# Add a start button to begin conversation when user is ready
if not st.session_state.conversation_started:
    col1, col2, col3 = st.columns([1, 2, 1])
    with col2:
        if st.button("Start Creating a Cocktail"):
            st.session_state.conversation_started = True
            with st.spinner("Preparing your mixology session... 🍹"):
                # Initialize the agent
                start_agent(agent, config)
                
                # Check for a node interrupt to get the initial question
                state = agent.get_state(config)
                interrupt_value = None
                for task in state.tasks:
                    if hasattr(task, 'interrupts') and task.interrupts:
                        interrupt_value = task.interrupts[0].value
                        break
                
                if interrupt_value and interrupt_value != "None":
                    st.session_state.messages.append({"role": "assistant", "content": interrupt_value})
                    # Store this message to prevent duplicates
                    st.session_state.last_ai_message_id = interrupt_value
                
                # Force a rerun to display the welcome message
                st.rerun()

# Only show input when conversation has started
if st.session_state.conversation_started and not st.session_state.finished:
    user_input = st.chat_input("Type here...")
    
    if user_input:
        st.session_state.messages.append({"role": "user", "content": user_input})
        with st.chat_message("user", avatar="🙋"):
            st.markdown(user_input)

        with st.spinner("Crafting your perfect blend... 🍹"):
            response_placeholder = st.empty()
            latest_ai_message = None

            # Process user response
            for event in agent.stream(Command(resume=user_input), config=config, stream_mode="values"):
                agent_message = event["messages"][-1]
                
                # Skip tool messages which might be user's own input coming back
                if agent_message.type != "tool":
                    # Properly handle different message types
                    if agent_message.type == "ai":
                        if hasattr(agent_message, 'tool_calls') and agent_message.tool_calls:
                            if agent_message.tool_calls[0]['name'] == "AskHuman":
                                agent_response = agent_message.tool_calls[0]['args']['question']
                            else:
                                agent_response = f"Using tool: {agent_message.tool_calls[0]['name']}"
                        else:
                            agent_response = agent_message.content
                    else:
                        agent_response = agent_message.content if hasattr(agent_message, 'content') else str(agent_message)

                    # Save the latest AI message for display
                    if agent_response and agent_response != "None":
                        latest_ai_message = agent_response
            
            # Only display the LATEST message and only if it's not a duplicate
            if latest_ai_message and latest_ai_message != st.session_state.last_ai_message_id:
                with response_placeholder.chat_message("assistant", avatar="🍹"):
                    st.markdown(latest_ai_message)
                st.session_state.messages.append({"role": "assistant", "content": latest_ai_message})
                st.session_state.last_ai_message_id = latest_ai_message
            
            # Check if conversation is finished
            if not agent.get_state(config).next:
                st.session_state.finished = True

# Add a reset button to start over
if st.session_state.finished:
    col1, col2, col3 = st.columns([1, 2, 1])
    with col2:
        if st.button("Create Another Cocktail"):
            clear_chat_session_state()
            st.rerun()



