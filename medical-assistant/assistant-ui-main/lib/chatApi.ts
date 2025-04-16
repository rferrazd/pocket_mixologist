/* eslint-disable @typescript-eslint/no-explicit-any */
import { ThreadState, Client } from '@langchain/langgraph-sdk'

let clientInstance: Client | null = null

const createClient = (): Client => {
  if (!clientInstance) {
    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api'
    clientInstance = new Client({ apiUrl })
  }
  return clientInstance
}

export const createAssistant = async (graphId: string) => {
  const client = createClient()
  console.log('Assistant:', graphId)
  try {
    const assistant = client.assistants.create({ graphId })
    if (!assistant) {
      throw new Error('Failed to create assistant')
    }
    return assistant
  } catch (error) {
    console.error('Error creating assistant:', error)
    throw error
  }
}

export const createThread = async () => {
  const client = createClient()
  return client.threads.create()
}
export const getThreadState = async (
  threadId: string
): Promise<ThreadState<Record<string, any>>> => {
  const client = createClient()
  return client.threads.getState(threadId)
}

export const updateState = async (
  threadId: string,
  fields: {
    newState: Record<string, any>
    asNode?: string
  }
) => {
  const client = createClient()
  return client.threads.updateState(threadId, {
    values: fields.newState,
    asNode: fields.asNode
  })
}

export interface MessageParams {
  threadId: string
  assistantId: string
  message: string | null
  model: string
  userId: string
  systemInstructions: string
}

export const sendMessage = async (params: MessageParams) => {
  const client = createClient()
  console.log('Client:', client)
  console.log('Params:', params)

  let input: Record<string, any> | null = null
  if (params.message !== null) {
    input = {
      messages: [
        {
          role: 'human',
          content: params.message
        }
      ],
      userId: params.userId
    }
  }
  const config = {
    configurable: {
      model_name: params.model,
      system_instructions: params.systemInstructions
    }
  }

  // console.log('Params:', params)
  console.log('config:', config)
  console.log('input:', input)

  try {
    const response = await client.runs.stream(
      params.threadId,
      params.assistantId,
      {
        input,
        config,
        streamMode: 'values'
      }
    )
    console.log('response', response)
    return response
  } catch (error) {
    console.error('Error sending message:', error)
  }
}
