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
  const runtime = useLangGraphRuntime({
    threadId: threadIdRef.current,
    adapters: {
      speech: new WebSpeechSynthesisAdapter()
    },
    stream: async function* (message) {
      const { content, id } = message[0]
      if (!assistantIdRef.current) {
        const { assistant_id } = await createAssistant(
          (process.env.NEXT_PUBLIC_LANGGRAPH_GRAPH_ID as string) || 'react'
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
      if (generator) {
        for await (const message of generator) {
          if (message.event !== 'messages/complete') {
            yield message
          }
        }
      }
    },
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
