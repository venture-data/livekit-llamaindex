import os

from dotenv import load_dotenv
from livekit.agents import AutoSubscribe, JobContext, WorkerOptions, cli, llm
from livekit.agents.pipeline import VoicePipelineAgent
from livekit.plugins import deepgram, openai, silero, uplift
from llama_index.core import (
    SimpleDirectoryReader,
    StorageContext,
    VectorStoreIndex,
    load_index_from_storage,
)

load_dotenv()

# check if storage already exists
PERSIST_DIR = "./query-engine-storage"
if not os.path.exists(PERSIST_DIR):
    # load the documents and create the index
    documents = SimpleDirectoryReader("data").load_data()
    index = VectorStoreIndex.from_documents(documents)
    # store it for later
    index.storage_context.persist(persist_dir=PERSIST_DIR)
else:
    # load the existing index
    storage_context = StorageContext.from_defaults(persist_dir=PERSIST_DIR)
    index = load_index_from_storage(storage_context)


async def entrypoint(ctx: JobContext):
    initial_ctx = llm.ChatContext().append(
        role="system",
        text=(
            "You're an Urdu speaking livebot on a LiveKit call. "
            "No matter what, you should generate Urdu responses, in urdu script, no matter what. "
            "It should not be in Roman Urdu, it should be in Urdu script. "
        ),
    )

    await ctx.connect(auto_subscribe=AutoSubscribe.AUDIO_ONLY)

    fnc_ctx = llm.FunctionContext()

    @fnc_ctx.ai_callable(description="Get more information about a specific topic")
    async def query_info(query: str) -> str:
        query_engine = index.as_query_engine(use_async=True)
        res = await query_engine.aquery(query)
        print("Query result:", res)
        return str(res)

    assistant = VoicePipelineAgent(
        vad=silero.VAD.load(),
        stt=openai.STT(language="ur"),
        llm=openai.LLM(),
        tts=uplift.TTS(voice="v_30s70t3a"),
        chat_ctx=initial_ctx,
        fnc_ctx=fnc_ctx,
    )
    assistant.start(ctx.room)
    await assistant.say("ہیلو، آپ کیسے ہیں؟", allow_interruptions=True)


if __name__ == "__main__":
    cli.run_app(WorkerOptions(entrypoint_fnc=entrypoint))