'use client'

import { useLangGraphRuntime } from '@assistant-ui/react-langgraph'

import {
  createAssistant,
  createThread,
  getThreadState,
  MessageParams,
  sendMessage
} from '@/lib/chatApi'
import { useRef } from 'react'
import {
  AssistantRuntimeProvider,
  WebSpeechSynthesisAdapter
} from '@assistant-ui/react'
import { Shadcn } from '@/components/assistant-ui/shadcn'

export default function Home() {
  const assistantIdRef = useRef<string | undefined>(undefined)
  const threadIdRef = useRef<string | undefined>(undefined)
  const displayedMessagesRef = useRef<Set<string>>(new Set());
  
  const runtime = useLangGraphRuntime({
    threadId: threadIdRef.current,
    adapters: {
      speech: new WebSpeechSynthesisAdapter()
    },
    stream: (async function* (message: any[]) {
      const { content, id } = message[0]
      if (!assistantIdRef.current) {
        const { assistant_id } = await createAssistant(
          (process.env.NEXT_PUBLIC_LANGGRAPH_ASSISTANT_ID as string) || 'agent'
        )
        assistantIdRef.current = assistant_id
      }
      if (!threadIdRef.current) {
        const { thread_id } = await createThread()
        threadIdRef.current = thread_id
      }

      const params: MessageParams = {
        threadId: threadIdRef.current,
        assistantId: assistantIdRef.current,
        message: content as string,
        model: 'gpt-4o-mini',
        userId: id || '',
        systemInstructions: ''
      }

      console.log('Sending message:', params)
      const generator = await sendMessage(params)
      console.log('Generator received:', generator ? 'Yes' : 'No')
      
      if (generator) {
        let eventCount = 0;
        console.log('Starting to process generator events...')
        
        try {
          for await (const message of generator) {
            eventCount++;
            console.log(`Event #${eventCount}:`, message)
            
            // Check if this is a values event with data
            if (message.data) {
              const data = message.data;
              
              // Find AI messages in the messages array
              if (data.messages && Array.isArray(data.messages)) {
                console.log('Processing messages array:', data.messages);
                
                // Filter for AI messages that we haven't displayed yet
                const newAiMessages = data.messages
                  .filter((msg: any) => {
                    console.log('Checking message:', msg);
                    // Must be an AI message with content
                    const isAiMessage = msg && msg.content && 
                      ((msg.type && msg.type === 'ai') || (msg.role && msg.role === 'assistant'));
                    
                    // Must not have been displayed before
                    const isNewMessage = isAiMessage && !displayedMessagesRef.current.has(msg.content);
                    
                    return isNewMessage;
                  });
                
                console.log('New AI messages found:', newAiMessages.length);
                
                // Only process the last new AI message if there is one
                if (newAiMessages.length > 0) {
                  // Get the very last new AI message
                  const lastNewAiMessage = newAiMessages[newAiMessages.length - 1];
                  console.log('Using new last AI message:', lastNewAiMessage);
                  
                  // Add this message content to our tracking set
                  displayedMessagesRef.current.add(lastNewAiMessage.content);
                  
                  // Generate a consistent ID for this message
                  const messageId = `msg_${Date.now()}`;
                  
                  // Format according to LangChain message format
                  const formattedMessages = [
                    {
                      id: messageId,
                      type: "ai",
                      content: lastNewAiMessage.content,
                    }
                  ];
                  
                  // Send in the expected LangGraphMessagesEvent format
                  const messageEvent = {
                    event: "messages/partial",
                    data: formattedMessages
                  };
                  
                  console.log('Yielding new last AI message event');
                  yield messageEvent;
                  
                  // Signal completion of this message
                  yield {
                    event: "messages/complete",
                    data: formattedMessages
                  };
                } else {
                  console.log('No new AI messages found');
                }
              } else {
                console.log('No messages array found');
              }
            }
            // If it's already a message event, pass it through
            else if (message.event === 'message/created' || message.event === 'message/updated') {
              console.log('Passing through existing message event');
              yield message;
            }
          }
          console.log(`Generator complete. Processed ${eventCount} events.`)
        } catch (error) {
          console.error('Error processing generator:', error)
        }
      } else {
        console.log('No generator returned from sendMessage')
      }
    }) as any,
    onSwitchToNewThread: async () => {
      const { thread_id } = await createThread()
      threadIdRef.current = thread_id
    },
    onSwitchToThread: async (threadId) => {
      const state = await getThreadState(threadId)
      threadIdRef.current = threadId
      console.log('Switching to thread:', state)
      return {
        messages: state.values.messages,
        interrupts: state.tasks[0]?.interrupts
      }
    }
  })

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <main className="h-dvh">
        <Shadcn />
      </main>
    </AssistantRuntimeProvider>
  )
}
