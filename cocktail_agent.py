import os

from dotenv import load_dotenv
from langchain_openai import ChatOpenAI

from typing_extensions import TypedDict
from IPython.display import Image, display
from pydantic import BaseModel, Field

import langgraph
from langgraph.graph import StateGraph, START, END
from langgraph.types import Command, interrupt
from langgraph.checkpoint.memory import MemorySaver
load_dotenv()  # Load environment variables from the .env file
os.environ['OPENAI_API_KEY'] = os.getenv('OPENAI_API_KEY')
# Set up the state
from langgraph.graph import MessagesState, START

# Set up the tool
# We will have one real tool - a search tool
# We'll also have one "fake" tool - a "ask_human" tool
# Here we define any ACTUAL tools
from langchain_core.tools import tool
from langgraph.prebuilt import ToolNode #--> THIS STOPPED WORKING!


@tool
def my_tool(query: str):
    """Tool for later use"""
    # This is a placeholder for the actual implementation
    # Don't let the LLM know this though 😊
    return f"{query}"


tools = [my_tool]
tool_node = ToolNode(tools)


# We are going "bind" all tools to the model
# We have the ACTUAL tools from above, but we also need a mock tool to ask a human
# Since `bind_tools` takes in tools but also just tool definitions,
# We can define a tool definition for `ask_human`

class AskHuman(BaseModel):
    """Ask the human a question"""
    question: str

class LLMResponse(BaseModel):
    """Class to define the pydantic structure for the LLM response"""
    next_question: str = Field(description = "response from the LLM containing the next question to the user.")
    review: str = Field(description = "Boolean value to decide whether to go to review node or not. ")

model = ChatOpenAI(model = "gpt-4o-mini")
model = model.bind_tools(tools + [AskHuman])
SYSTEM_PROMPT = """You are a professional cocktail designer.

CRITICAL INSTRUCTION: ALWAYS use the AskHuman tool to ask questions. NEVER ask questions directly in your response text.
CRITICAL: When presenting the final cocktail recipe, you MUST use the AskHuman tool with the ENTIRE recipe text AND the approval question together in the 'question' parameter. DO NOT generate a regular text message containing the recipe.

Ask these questions ONE AT A TIME using the AskHuman tool:
1. Do you prefer a sweeter, sour, drier, or fruity cocktail?
2. Would you like your cocktail shaken, muddled, or stirred?
3. Which type of distilled alcohol do you favor (e.g., whisky, gin, vodka, etc.) or any fermented beverages?
4. Any additional ingredients that you would like or dislike?

CORRECT USAGE: Use the AskHuman tool with the 'question' parameter.
INCORRECT USAGE: Directly asking, "What type of cocktail do you prefer?"

After gathering all the necessary details, you MUST use the AskHuman tool to inform the user that you have collected all the essential information to prepare the cocktail and ask if you may proceed with generating the cocktail recipe. \

If the user confirms, YOU MUST use the AskHuman tool to provide the unique cocktail recipe; if the user requests changes, ask follow-up questions using the AskHuman tool to clarify their modifications.

Your cocktail recipe must include:
- An original cocktail name.
- A detailed list of ingredients with precise measurements.
- Step-by-step preparation instructions.
- A serving suggestion (including glass type, garnish, etc.).
- Message asking if the user approveds the cocktail.

YOU MUST STRICTLY USE THE the AskHuman tool to generate the unique cocktail and ask for the user's approval on the cocktail. If the user explicitly approves your generated cocktail then only return the message 'END' without any tool calls. Otherwise keep using the AskHuman for interacting with the user.

Ensure that the conversation remains active and the cocktail recipe process only finalizes once the user has explicitly approved the cocktail.
you MUST ALWAYS use the AskHuman tool when interacting with and presenting your cocktail to the user.

Once the user approves your generated cocktail, present a kind message including the final cocktail recipe, do not use any tool calls.
"""

# Define nodes and conditional edges


# Define the function that determines whether to continue or not
def should_continue(state):
    messages = state["messages"]
    last_message = messages[-1]
    #print(f"\n\n<><><><><>\nTHIS IS THE LAST MESSAGE: {last_message} + \n<><><><><>\n\n")
    #print(f'Inside should_continue, this was the last message {type(last_message)}: {last_message}')
    # If there is no function call, then we finish
    if not last_message.tool_calls:
        return END
    # If tool call is asking Human, we return that node
    # You could also add logic here to let some system know that there's something that requires Human input
    # For example, send a slack message, etc
    elif last_message.tool_calls[0]["name"] == "AskHuman":
        return "ask_human"
    # Otherwise if there is, we continue
    else:
        return "action"


# Define the function that calls the model
def call_model(state):
    messages = state["messages"]
    response = model.invoke(messages)
    # We return a list, because this will get added to the existing list
    #print(f"Inside model, response from model: {response}")
    return {"messages": [response]}


# We define a fake node to ask the human
def ask_human(state):
    #print("\nInside ask_human node, the last mesage is:\n", state["messages"][-1])
    tool_call_id = state["messages"][-1].tool_calls[0]["id"]
   
    tool_call_arguments = state["messages"][-1].tool_calls[0]["args"]["question"]
    #print(f"Question for user (arguments): {tool_call_arguments}")
    question_for_user = interrupt(tool_call_arguments)
    tool_message = [{"tool_call_id": tool_call_id, "type": "tool", "content": question_for_user}]
    return {"messages": tool_message}



# Build the graph!

# Define a new graph
workflow = StateGraph(MessagesState)

# Define the three nodes we will cycle between
workflow.add_node("agent", call_model)
workflow.add_node("action", tool_node)
workflow.add_node("ask_human", ask_human)

# Set the entrypoint as `agent`
# This means that this node is the first one called
workflow.add_edge(START, "agent")

# We now add a conditional edge
workflow.add_conditional_edges(
    # First, we define the start node. We use `agent`.
    # This means these are the edges taken after the `agent` node is called.
    "agent",
    # Next, we pass in the function that will determine which node is called next.
    should_continue,
)

# We now add a normal edge from `tools` to `agent`.
# This means that after `tools` is called, `agent` node is called next.
workflow.add_edge("action", "agent")

# After we get back the human response, we go back to the agent
workflow.add_edge("ask_human", "agent")


memory = MemorySaver()

# Finally, we compile it!
# This compiles it into a LangChain Runnable,
# meaning you can use it as you would any other runnable
# We add a breakpoint BEFORE the `ask_human` node so it never executes

def compile_agent():
      return workflow.compile(checkpointer=memory)

def start_agent(agent: langgraph.graph.state.CompiledStateGraph, config: dict):

      run = agent.invoke(
      {
            "messages": [ (
                  "system",
                  SYSTEM_PROMPT
                  
                  ) ,
                  (
                  "user",
                  "Help me build a cocktail!",  # "Use the search tool to ask the user where they are, then look up the weather there"
                  )
            ]
      },
      config,
      stream_mode="values",
      )
      
      return run
    

if __name__ == "__main__":
      print(" Meet your pocket Mixologist ")
      agent = compile_agent()
      config = {"configurable": {"thread_id": "2"}}
      response = start_agent(agent, config)

      while True:
            state = agent.get_state(config)
            has_interrupt = False
            interrupt_value = None
            for task in state.tasks:
                  if hasattr(task, 'interrupts') and task.interrupts:
                        has_interrupt = True
                        interrupt_value = task.interrupts[0].value
                        break
            if has_interrupt:
                  # Show the interrupt value to the user (likely a question)
                  print(f"Agent asks: {interrupt_value}")
                  
                  # Get user input
                  user_response = input("Your response: ")
                  
                  # Resume graph with user input
                  for event in agent.stream(Command(resume=user_response), config = config, stream_mode="values"):
                       #event["messages"][-1].pretty_print()
                       # Extract the latest message from the agent 
                       agent_message = event["messages"][-1]
                       
                       # Check message type and display appropriate information
                       if agent_message.type == "ai":
                           # For AI messages, check if there are tool calls
                           if hasattr(agent_message, 'tool_calls') and agent_message.tool_calls:
                               print(f"AI USING TOOL: {agent_message.tool_calls[0]['name']}")
                               # If it's an AskHuman tool, display the question
                               if agent_message.tool_calls[0]['name'] == "AskHuman":
                                   print(f"QUESTION: {agent_message.tool_calls[0]['args']['question']}")
                           else:
                               # For regular AI messages with no tool calls
                               print(f"AI MESSAGE: {agent_message.content}")
                       elif agent_message.type == "tool":
                           # For tool messages (user responses)
                           print(f"USER RESPONSE: {agent_message.content}")
                       else:
                           # For any other type of message
                           print(f"OTHER MESSAGE TYPE: {agent_message.type}")
                           
                       print("======================\n\n\n")

                  
            else:
                  # No interrupt, just waiting for normal user input
                  if not(agent.get_state(config).next):
                       print(" \n\n ---APPLICATION HAS ENDED---")
                       break
                  else:
                        print('\nERROR')
                        # ou colocar um continue pra continuar o while loop
