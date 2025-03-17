This is the [assistant-ui](https://github.com/Yonom/assistant-ui) starter project.

## Getting Started

First, add your OpenAI API key to `.env.local` file:

```
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

Then, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

#### Langgraph page
Open [http://localhost:3000/langgraph](http://localhost:3000/langgraph) with your browser to interact with the agent.

## Langgraph Agent Selection
`NEXT_PUBLIC_LANGGRAPH_GRAPH_ID` it has the name of the agent, that should match with the ones in `langgraph.json` of the backend.

I have left defaul as `(process.env.NEXT_PUBLIC_LANGGRAPH_GRAPH_ID as string) || 'react'`, but you should change.

As a todo, in langgraph page we should make a dropdown to select agents available in the backend.

## Langgraph Studio Server Locally - Typescript

The agents are [`imed-intellidoctor`](https://github.com/intellidoctor/imed-intellidoctor) project.

https://github.com/langchain-ai/langgraph-studio

https://langchain-ai.github.io/langgraph/tutorials/langgraph-platform/local-server/

```
npx @langchain/langgraph-cli dev
```

- 🚀 API: http://localhost:2024
- 🎨 Studio UI: https://smith.langchain.com/studio?baseUrl=http://localhost:2024


## Langgraph Studio Server Locally - Python

The agents are [`langgraph-agents-python`](https://github.com/intellidoctor/langgraph-agents-python) project.

This guide assumes you have a LangGraph app correctly set up with a proper configuration file and a corresponding compiled graph, and that you have a proper LangChain API key.

Testing locally ensures that there are no errors or conflicts with Python dependencies and confirms that the configuration file is specified correctly.

### Setup

Install the LangGraph CLI package:

```
pip install -U "langgraph-cli[inmem]"
```

Ensure you have an API key, which you can create from the LangSmith UI (Settings > API Keys). This is required to authenticate that you have LangGraph Cloud access. After you have saved the key to a safe place, place the following line in your .env file:

```
LANGSMITH_API_KEY = *********
```

Start the API server¶
Once you have installed the CLI, you can run the following command to start the API server for local testing:

```
langgraph dev
```

This will start up the LangGraph API server locally. If this runs successfully, you should see something like:

```
Ready!

API: http://localhost:2024

Docs: http://localhost:2024/docs

LangGraph Studio Web UI: https://smith.langchain.com/studio/?baseUrl=http://127.0.0.1:2024
```

### _In-Memory Mode_

The `langgraph dev` command starts LangGraph Server in an `in-memory mode`. This mode is suitable for development and testing purposes. For production use, you should deploy LangGraph Server with access to a persistent storage backend.

If you want to test your application with a persistent storage backend, you can use the `langgraph up` command instead of `langgraph dev`. You will need to have docker installed on your machine to use this command.


## Notes on Langgraph Runtime

```typescript
if (generator) {
  for await (const message of generator) {
    if (message.event !== 'messages/complete') {
      yield message
    }
  }
}
```

The Langgraph parsed stream contains a duplicate `human` message, that duplicates the rendering in the page. Therefore it needs to filter it out.
