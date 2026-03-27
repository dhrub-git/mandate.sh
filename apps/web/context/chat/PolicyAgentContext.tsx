import { ChatMessageAI } from "@/utils/types";
import { ChatStatus, DefaultChatTransport } from "ai";
import { createContext, useContext, useState } from "react";
import { useChat, UseChatHelpers } from "@ai-sdk/react";
import { fetchWithErrorHandlers } from "@/utils/ai-utils";
import { Policy } from "@repo/database";

interface PolicyAgentContextValue {
  messages: ChatMessageAI[];
  status: ChatStatus;
  error: Error | undefined;
  sendMessage: UseChatHelpers<ChatMessageAI>["sendMessage"];
  setMessages: UseChatHelpers<ChatMessageAI>["setMessages"];
  resumeStream: UseChatHelpers<ChatMessageAI>["resumeStream"];
  setVersion: (version: number) => void;
}

export interface PolicyUpdateProps {
  sectionId: string;
  rewrittenInfo: string;
  changeNotes: string;
  version: number;
  updatedPolicy: Policy;
}

interface PolicyAgentProviderProps {
  children: React.ReactNode;
  threadId: string;
  setPolicyUpdate: (update: PolicyUpdateProps) => void;
}

const PolicyAgentContext = createContext<PolicyAgentContextValue | undefined>(
  undefined,
);

export const PolicyAgentProvider = ({
  children,
  threadId,
  setPolicyUpdate,
}: PolicyAgentProviderProps) => {
  const [policyVersion, setPolicyVersion] = useState<number | null>(null);
  const { messages, status, sendMessage, setMessages, resumeStream, error } =
    useChat<ChatMessageAI>({
      experimental_throttle: 100,
      transport: new DefaultChatTransport({
        api: "/api/chat",
        fetch: fetchWithErrorHandlers,
        prepareSendMessagesRequest(request) {
          return {
            body: {
              threadId,
              version: policyVersion,
              messages: request.messages,
              ...request.body,
            },
          };
        },
      }),
      onData: (dataPart) => {
        console.log("Data Parts: ", dataPart);
        switch (dataPart.type) {
          case "data-update-section":
            const update = dataPart.data as PolicyUpdateProps;
            setPolicyUpdate(update);
            break;
          default:
            console.warn("Unhandled data part type:", dataPart.type);
            break;
        }
      },
    });

  const setVersion = (version: number) => {
    setPolicyVersion(version);
  };

  return (
    <PolicyAgentContext.Provider
      value={{
        messages: messages,
        status: status,
        error: error,
        sendMessage: sendMessage,
        setMessages: setMessages,
        resumeStream: resumeStream,
        setVersion: setVersion,
      }}
    >
      {children}
    </PolicyAgentContext.Provider>
  );
};

export const usePolicyAgent = () => {
  const context = useContext(PolicyAgentContext);
  if (!context) {
    throw new Error("usePolicyAgent must be used within a PolicyAgentProvider");
  }
  return context;
};
