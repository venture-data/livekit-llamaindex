# livekit-llamaindex

## 1. `chat_engine.py`

### What it does

- Uses **LlamaIndex’s** `as_chat_engine` to create a streamlined chat interface.
- Has minimal, integrated code: it sets up the index, constructs the chat engine, and hands the entire conversation flow over to LlamaIndex’s built-in chat functionalities.

### How it works

1. **Index Initialization**  
   - Checks if a persist directory (`./chat-engine-storage`) exists. If not, reads files from a `data` folder and creates a **VectorStoreIndex**. This index is persisted for future runs.
   - If the directory does exist, loads the index from disk.

2. **Chat Context**  
   - Creates a system message that instructs the assistant on how to respond: short, concise, voice-friendly responses.

3. **Voice Pipeline**  
   - Sets up the `VoicePipelineAgent` using:
     - **Silero** for voice activity detection (VAD).
     - **Deepgram** for speech-to-text (STT).
     - **LlamaIndex** for the large language model logic (using the chat engine).
     - **OpenAI** for text-to-speech (TTS).
   - Hooks everything up so that audio from the user triggers STT, goes to the LLM, and then TTS is generated for responses.

4. **Usage**  
   - Because it directly uses the LlamaIndex “chat engine,” you get a seamless Q&A or conversational experience.  
   - **Trade-off**: You lose some advanced features like function calling (i.e., custom logic via “tools”/“functions”). Everything is handled by the chat engine automatically.

---

## 2. `query_engine.py`

### What it does

- Uses an LLM that supports **function calling** (e.g., OpenAI’s function calling capabilities).  
- Allows you to define custom Python functions—like `query_info`—and then have your LLM “call” these functions when needed.

### How it works

1. **Index Initialization**  
   - Similar to `chat_engine.py`: checks for a `./query-engine-storage` directory. If none exists, builds and persists a vector store index; otherwise, loads it.

2. **System Context**  
   - Sets up a “system” role message to keep answers concise and voice-friendly.

3. **Function Context**  
   - Defines a function in Python (`query_info(query: str) -> str`) that executes a retrieval query against the LlamaIndex index. It returns the result as a string.
   - Registers that function in `fnc_ctx.ai_callable(description="...")`, so the LLM can “call” it programmatically.

4. **Voice Pipeline**  
   - Uses `VoicePipelineAgent` again with VAD, STT, TTS. But it uses **OpenAI** for the LLM instead of the built-in chat engine from LlamaIndex.
   - Inside that OpenAI LLM, you can specify the function context. When the user’s query triggers it, the LLM calls `query_info` automatically, gets extra context, and responds.

5. **Usage**  
   - This approach offers a **mix of retrieval + function calling**. It’s especially valuable if you want your assistant to do more complex actions or gather data from other sources, not just produce text.  
   - **Trade-off**: More setup than the direct `chat_engine` approach, but it gives you greater flexibility and control.

---

## 3. `retrieval.py`

### What it does

- Demonstrates how to **manually retrieve** documents from the index and inject them into the system prompt each time a user asks a question.
- Gives you the most “hands-on” control over how context is delivered to the LLM.

### How it works

1. **Index Initialization**  
   - Same pattern: checks if `./retrieval-engine-storage` exists, if not, reads and builds a VectorStoreIndex. Otherwise, loads from disk.

2. **Manual Context Injection**  
   - Every time the user speaks, the assistant calls a custom `_will_synthesize_assistant_reply` function before generating a response.
   - This function:
     1. Takes the last user message.
     2. Uses the LlamaIndex retriever (`index.as_retriever()`) to fetch the most relevant nodes matching the user’s query.
     3. Appends those retrieved nodes to the system message as “Context that might help answer the user’s question.”
     4. Replaces the conversation’s system message with this expanded content.
     5. Then calls the LLM to get the final answer—now with the retrieved context “injected” at the system level.

3. **Voice Pipeline**  
   - Again, sets up the VAD, STT, TTS from Silero, Deepgram, and OpenAI.  
   - But the LLM calls `openai.LLM()` with the custom “will_synthesize_assistant_reply” hook.

4. **Usage**  
   - You see exactly which snippets were retrieved for each user query and how they get merged into the prompt.  
   - **Trade-off**: This is more manual “prompt engineering” overhead. You gain maximum control but at the cost of more complexity.  

## Common Elements

1. **Data Reading & Index Building**  
   - All scripts look for a persisted index. If not found, they read documents from `data` and build an index using **LlamaIndex** (specifically a `VectorStoreIndex`).
2. **Voice Assistant Setup**  
   - Every script uses the `VoicePipelineAgent` from LiveKit’s framework. This handles:
     - **VAD (Voice Activity Detection)**: figuring out when someone is speaking (Silero).
     - **STT (Speech-to-Text)**: converting audio to text (Deepgram).
     - **LLM**: the heart of it. Either LlamaIndex’s integrated chat engine or OpenAI with function calling.
     - **TTS (Text-to-Speech)**: generating audio responses (OpenAI TTS).
3. **The Overall Flow**  
   - User speaks → audio is captured → STT produces text → text is fed into the LLM → LLM output is converted back to audio → user hears the response.

---

### Summary of the Three RAG Approaches

1. **`chat_engine.py`**  
   - **Pros**: Quick, integrated, minimal fuss.  
   - **Cons**: Not as flexible; no function calling.  

2. **`query_engine.py`**  
   - **Pros**: Function calling gives more control. Good balance of ease-of-use and flexibility.  
   - **Cons**: Some extra setup for function definitions, but still relatively straightforward.  

3. **`retrieval.py`**  
   - **Pros**: Full manual control of how retrieved context is inserted into the prompt.  
   - **Cons**: Highest complexity; you handle the retrieval logic yourself.  
