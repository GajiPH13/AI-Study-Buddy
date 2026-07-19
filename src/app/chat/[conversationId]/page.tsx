import { requirePageSession } from "@/lib/session";
import { ChatClient } from "./chat-client";

type Props = { params: Promise<{ conversationId: string }> };

export default async function ChatPage({ params }: Props) {
  await requirePageSession();
  const { conversationId } = await params;
  return <ChatClient conversationId={conversationId} />;
}
