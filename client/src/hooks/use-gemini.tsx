import { createContext, ReactNode, useContext, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface GeminiContextType {
  messages: Message[];
  sendMessage: (content: string) => void;
  isLoading: boolean;
  error: Error | null;
  resetConversation: () => void;
}

const GeminiContext = createContext<GeminiContextType | null>(null);

export function GeminiProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const { i18n } = useTranslation();

  const { isLoading: isLoadingHistory, error: historyError } = useQuery({
    queryKey: ["/api/ai/conversation"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/ai/conversation");
      const data = await res.json();
      if (data && data.messages) {
        setMessages(data.messages);
      }
      return data;
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to load conversation",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const { mutate, isPending: isSending, error: sendError } = useMutation({
    mutationFn: async (content: string) => {
      const currentLang = i18n.language || "en";
      // Add language header to the request for the backend to detect
      const headers = {
        "Accept-Language": currentLang
      };
      const res = await apiRequest("POST", "/api/ai/message", { content }, { headers });
      return res.json();
    },
    onSuccess: (data) => {
      setMessages((prev) => [...prev, data.message]);
      queryClient.invalidateQueries({ queryKey: ["/api/ai/conversation"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to send message",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const resetMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/ai/conversation/reset");
      return res.json();
    },
    onSuccess: () => {
      setMessages([]);
      queryClient.invalidateQueries({ queryKey: ["/api/ai/conversation"] });
      toast({
        title: "Conversation reset",
        description: "Started a new conversation with AI coach",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to reset conversation",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const sendMessage = (content: string) => {
    const userMessage: Message = { role: "user", content };
    setMessages((prev) => [...prev, userMessage]);
    mutate(content);
  };

  const resetConversation = () => {
    resetMutation.mutate();
  };

  return (
    <GeminiContext.Provider
      value={{
        messages,
        sendMessage,
        isLoading: isLoadingHistory || isSending,
        error: historyError || sendError,
        resetConversation,
      }}
    >
      {children}
    </GeminiContext.Provider>
  );
}

export function useGemini() {
  const context = useContext(GeminiContext);
  if (!context) {
    throw new Error("useGemini must be used within a GeminiProvider");
  }
  return context;
}
