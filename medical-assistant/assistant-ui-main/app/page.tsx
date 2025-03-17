'use client'
import { useChatRuntime } from '@assistant-ui/react-ai-sdk'
import {
  AssistantRuntimeProvider,
  CompositeAttachmentAdapter,
  SimpleImageAttachmentAdapter,
  SimpleTextAttachmentAdapter,
  WebSpeechSynthesisAdapter
} from '@assistant-ui/react'
import { Shadcn } from '@/components/assistant-ui/shadcn'

export default function Home() {
  const runtime = useChatRuntime({
    api: '/api/chat',
    adapters: {
      speech: new WebSpeechSynthesisAdapter(),
      attachments: new CompositeAttachmentAdapter([
        new SimpleImageAttachmentAdapter(),
        new SimpleTextAttachmentAdapter()
      ])
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
