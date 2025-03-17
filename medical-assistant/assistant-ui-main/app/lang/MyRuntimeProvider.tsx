'use client'

import {
  AssistantCloud,
  AssistantRuntimeProvider,
  useCloudThreadListRuntime,
  useThreadListItemRuntime,
  WebSpeechSynthesisAdapter
} from '@assistant-ui/react'
import { useLangGraphRuntime } from '@assistant-ui/react-langgraph'
import {
  createAssistant,
  createThread,
  getThreadState,
  sendMessage
} from '@/lib/chatApi'
import { LangChainMessage } from '@assistant-ui/react-langgraph'
import { useRef } from 'react'

const useMyLangGraphRuntime = () => {
  const threadListItemRuntime = useThreadListItemRuntime()
  const assistantIdRef = useRef<string | undefined>(undefined)
  const runtime = useLangGraphRuntime({
    adapters: {
      speech: new WebSpeechSynthesisAdapter()
    },
    stream: async function* (messages) {
      const { content, id } = messages[0]
      console.log('content', content)
      console.log('id', id)
      if (!assistantIdRef.current) {
        const { assistant_id } = await createAssistant(
          (process.env.NEXT_PUBLIC_LANGGRAPH_GRAPH_ID as string) || 'react'
        )
        assistantIdRef.current = assistant_id
      }
      const { externalId } = await threadListItemRuntime.initialize()

      if (!externalId) throw new Error('Thread not foundy')

      const generator = await sendMessage({
        threadId: externalId,
        assistantId: assistantIdRef.current,
        message: content as string,
        model: 'gpt-4o-mini',
        userId: id || '',
        systemInstructions: ''
      })

      if (generator) {
        for await (const message of generator) {
          if (message.event !== 'messages/complete') {
            yield message
          }
        }
      }
    },
    onSwitchToThread: async (externalId) => {
      const state = await getThreadState(externalId)
      console.log('statet', state)
      const messa = {
        messages:
          (state.values as { messages?: LangChainMessage[] }).messages ?? [],
        interrupts: state.tasks[0]?.interrupts ?? []
      }
      console.log('messan', messa)
      return messa
    }
  })

  return runtime
}

const cloud = new AssistantCloud({
  baseUrl: process.env['NEXT_PUBLIC_ASSISTANT_BASE_URL']!,
  authToken: () =>
    fetch('/api/assistant-ui-token', { method: 'POST' })
      .then((r) => r.json())
      .then((r) => r.token)
})

export function MyRuntimeProvider({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  const runtime = useCloudThreadListRuntime({
    cloud,
    runtimeHook: useMyLangGraphRuntime,
    create: async () => {
      const { thread_id } = await createThread()
      return { externalId: thread_id }
    }
  })

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      {children}
    </AssistantRuntimeProvider>
  )
}
