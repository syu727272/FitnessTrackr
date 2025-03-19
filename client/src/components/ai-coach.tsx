import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGemini } from "@/hooks/use-gemini";
import { Sparkles, SendIcon, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

export function AiCoach() {
  const [message, setMessage] = useState("");
  const { messages, sendMessage, isLoading, resetConversation } = useGemini();
  const { user } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      sendMessage(message);
      setMessage("");
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <div className="flex items-center">
          <div className="flex items-center justify-center h-8 w-8 rounded-full bg-indigo-100">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <CardTitle className="ml-2 text-lg font-semibold text-gray-800">Gemini Coach</CardTitle>
        </div>
        <div>
          <Button
            variant="ghost"
            className="text-sm font-medium text-primary hover:text-indigo-700"
            onClick={resetConversation}
          >
            <span className="hidden sm:inline">New Conversation</span>
            <span className="sm:hidden">New</span>
          </Button>
        </div>
      </CardHeader>

      <CardContent className="custom-scrollbar h-80 overflow-y-auto p-4 bg-gray-50 flex flex-col space-y-3">
        {messages.length === 0 && !isLoading ? (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <Sparkles className="h-12 w-12 text-primary mb-4" />
            <p className="text-gray-500 max-w-md">
              Welcome to your AI Workout Coach! Ask me for advice on your workout routine, form
              tips, or nutrition recommendations based on your fitness goals.
            </p>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div
              key={index}
              className={cn(
                "flex items-start",
                msg.role === "user" && "justify-end"
              )}
            >
              {msg.role === "assistant" && (
                <div className="flex-shrink-0 mr-3">
                  <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                    <Sparkles className="h-5 w-5 text-primary" />
                  </div>
                </div>
              )}
              <div
                className={cn(
                  "rounded-lg px-4 py-3 max-w-md",
                  msg.role === "user"
                    ? "bg-indigo-600 text-white"
                    : "bg-white text-gray-800"
                )}
              >
                <p className="text-sm whitespace-pre-line">{msg.content}</p>
              </div>
              {msg.role === "user" && (
                <div className="flex-shrink-0 ml-3">
                  <Avatar>
                    {user?.profileImage && (
                      <AvatarImage src={user.profileImage} alt={user.username} />
                    )}
                    <AvatarFallback className="bg-primary text-white">
                      {(user?.firstName?.[0] || user?.username?.[0] || "").toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </div>
              )}
            </div>
          ))
        )}
        {isLoading && (
          <div className="flex items-start">
            <div className="flex-shrink-0 mr-3">
              <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div className="bg-white rounded-lg px-4 py-3">
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <p className="text-sm text-gray-500">Thinking...</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="px-4 py-3 bg-white border-t border-gray-200">
        <form className="flex items-center w-full" onSubmit={handleSubmit}>
          <Input
            type="text"
            placeholder="Ask for advice..."
            className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={isLoading}
          />
          <Button
            type="submit"
            disabled={isLoading || !message.trim()}
            className="inline-flex items-center justify-center ml-3 px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-indigo-700 focus:outline-none"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <SendIcon className="h-5 w-5" />
            )}
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}
