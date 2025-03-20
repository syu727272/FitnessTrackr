import { Express } from "express";
import { storage } from "./storage";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { AiConversation } from "../shared/schema";

// Define message type
interface Message {
  role: "user" | "assistant";
  content: string;
}

// Initialize the Google Generative AI with the API key
const apiKey = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

// Generate a response using Gemini API
async function generateAIResponse(prompt: string, workoutHistory: any): Promise<string> {
  try {
    console.log("Generating AI response using Gemini API for prompt:", prompt);
    
    // Create a more detailed prompt with context
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    // Create a context-rich prompt by including workout history and role description
    let contextPrompt = `You are a knowledgeable fitness coach providing advice to a user. 
Your role is to give helpful, accurate, and personalized fitness guidance.
`;

    // Add workout history if available
    if (workoutHistory && workoutHistory.length > 0) {
      contextPrompt += `\nThe user's recent workout history includes: \n`;
      workoutHistory.forEach((workout: any, index: number) => {
        contextPrompt += `Workout ${index + 1}: ${workout.name} on ${new Date(workout.date).toLocaleDateString()}\n`;
      });
    }

    contextPrompt += `\nUser's question: ${prompt}\n\nYour helpful response:`;
    
    // Generate content
    const result = await model.generateContent(contextPrompt);
    const response = result.response;
    const text = response.text();
    
    // Return the generated text
    return text || "I'm unable to provide a response at the moment. Please try again later.";
  } catch (error) {
    console.error("Error generating AI response:", error);
    
    // Fallback response in case of API error
    return "Sorry, I'm having trouble connecting to my knowledge base right now. Please try asking your question again in a moment.";
  }
}

export function setupGeminiRoutes(app: Express) {
  // Get current conversation or start a new one
  app.get("/api/ai/conversation", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const userId = req.user!.id;
      const conversation = await storage.getUserConversation(userId);
      
      if (!conversation) {
        // Create initial conversation with welcome message
        const initialMessage: Message = {
          role: "assistant", 
          content: "Hello! I'm your AI workout coach. How can I help you with your fitness journey today? You can ask me about workout routines, exercise form, nutrition advice, or recovery strategies."
        };
        
        const newConversation = await storage.saveUserConversation({
          userId,
          messages: [initialMessage]
        });
        
        return res.json(newConversation);
      }
      
      return res.json(conversation);
    } catch (error) {
      console.error("Error fetching conversation:", error);
      res.status(500).json({ message: "Failed to fetch conversation" });
    }
  });
  
  // Send a message to AI and get a response
  app.post("/api/ai/message", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const userId = req.user!.id;
      const { content } = req.body;
      
      if (!content || typeof content !== "string") {
        return res.status(400).json({ message: "Message content is required" });
      }
      
      // Get existing conversation or create a new one
      let conversation = await storage.getUserConversation(userId);
      const messages: Message[] = conversation && Array.isArray(conversation.messages) 
        ? [...conversation.messages as Message[]] 
        : [];
      
      // Add user message
      const userMessage: Message = { role: "user", content };
      messages.push(userMessage);
      
      // Get workout history for context (simplified for now)
      const workoutHistory = await storage.getRecentWorkouts(userId, 5);
      
      // Generate AI response
      const aiResponseContent = await generateAIResponse(content, workoutHistory);
      const aiMessage: Message = { role: "assistant", content: aiResponseContent };
      
      // Save messages
      messages.push(aiMessage);
      await storage.saveUserConversation({
        userId,
        messages
      });
      
      // Return the AI's message
      res.json({ message: aiMessage });
    } catch (error) {
      console.error("Error processing message:", error);
      res.status(500).json({ message: "Failed to process message" });
    }
  });
  
  // Reset conversation
  app.post("/api/ai/conversation/reset", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const userId = req.user!.id;
      const success = await storage.resetUserConversation(userId);
      
      if (!success) {
        return res.status(404).json({ message: "Conversation not found" });
      }
      
      // Create a welcome message for the new conversation
      const initialMessage: Message = {
        role: "assistant", 
        content: "Hello again! I'm your AI workout coach. How can I help you with your fitness journey today?"
      };
      
      await storage.saveUserConversation({
        userId,
        messages: [initialMessage]
      });
      
      res.json({ message: "Conversation reset successfully" });
    } catch (error) {
      console.error("Error resetting conversation:", error);
      res.status(500).json({ message: "Failed to reset conversation" });
    }
  });
}
