import { Express } from "express";
import { storage } from "./storage";

// Simulate Gemini AI response generation
async function generateAIResponse(prompt: string, workoutHistory: any): Promise<string> {
  // In a real implementation, this would make a call to the Gemini API
  // For now, we'll create a mock response based on the input
  
  console.log("Generating AI response for prompt:", prompt);
  
  // Check for common user queries
  if (prompt.toLowerCase().includes("workout for")) {
    // Check what type of workout they're asking for
    if (prompt.toLowerCase().includes("leg") || prompt.toLowerCase().includes("lower body")) {
      return "Here's a leg workout routine I recommend:\n\n1. Barbell Squats: 4 sets of 8-10 reps\n2. Romanian Deadlifts: 3 sets of 10-12 reps\n3. Bulgarian Split Squats: 3 sets of 10 reps per leg\n4. Leg Press: 3 sets of 12-15 reps\n5. Leg Extensions: 3 sets of 12-15 reps\n6. Standing Calf Raises: 4 sets of 15-20 reps\n\nStart with a proper warm-up and focus on good form rather than heavy weight initially.";
    } 
    else if (prompt.toLowerCase().includes("chest") || prompt.toLowerCase().includes("upper body")) {
      return "Here's an effective chest-focused upper body workout:\n\n1. Bench Press: 4 sets of 6-8 reps\n2. Incline Dumbbell Press: 3 sets of 8-10 reps\n3. Chest Flyes: 3 sets of 10-12 reps\n4. Push-Ups: 3 sets to failure\n5. Overhead Tricep Extensions: 3 sets of 12 reps\n6. Lateral Raises: 3 sets of 15 reps\n\nEnsure you're properly warmed up before starting with the heavier compound exercises.";
    }
    else if (prompt.toLowerCase().includes("back")) {
      return "Here's a solid back workout plan:\n\n1. Pull-Ups or Lat Pulldowns: 4 sets of 8-10 reps\n2. Bent-Over Rows: 4 sets of 8-10 reps\n3. Seated Cable Rows: 3 sets of 10-12 reps\n4. Face Pulls: 3 sets of 12-15 reps\n5. Straight-Arm Pulldowns: 3 sets of 12-15 reps\n6. Shrugs: 3 sets of 15 reps\n\nFocus on squeezing your back muscles at the peak of each contraction for maximum engagement.";
    }
    else {
      return "I'd be happy to recommend a workout routine. Could you specify which muscle group or type of workout you're looking for (e.g., legs, upper body, full body, etc.)? This will help me provide you with the most relevant exercises and programming.";
    }
  }
  
  if (prompt.toLowerCase().includes("diet") || prompt.toLowerCase().includes("nutrition")) {
    return "Nutrition is key to supporting your fitness goals. Here are some general guidelines:\n\n1. Protein: Aim for 1.6-2.2g per kg of bodyweight daily to support muscle recovery and growth.\n2. Carbohydrates: Focus on quality sources like whole grains, fruits, and vegetables to fuel your workouts.\n3. Fats: Include healthy fats from sources like olive oil, avocados, and nuts.\n4. Hydration: Drink at least 3-4 liters of water daily, more when exercising intensely.\n\nTiming your nutrition around workouts can help optimize performance and recovery. Try to have a meal with protein and carbs 1-2 hours before training, and another protein-rich meal within 1-2 hours after training.\n\nWould you like more specific nutrition advice based on your particular goals?";
  }
  
  if (prompt.toLowerCase().includes("progress") || prompt.toLowerCase().includes("plateau")) {
    return "If you're hitting a plateau in your progress, here are some strategies to break through:\n\n1. Progressive Overload: Systematically increase weight, reps, or sets over time.\n2. Change Your Rep Ranges: If you usually do 8-10 reps, try 4-6 or 12-15 for a few weeks.\n3. Introduce New Exercises: Your muscles adapt to the same movements over time.\n4. Prioritize Recovery: Ensure you're getting enough sleep and proper nutrition.\n5. Deload Week: Take a week with reduced volume and intensity every 6-8 weeks.\n6. Check Your Form: Sometimes improving technique can restart progress.\n\nConsistency is key, but strategic changes to your program can help overcome plateaus.";
  }
  
  if (prompt.toLowerCase().includes("sore") || prompt.toLowerCase().includes("recovery")) {
    return "For improved recovery and reducing soreness (DOMS), try these strategies:\n\n1. Active Recovery: Light activity like walking or swimming can increase blood flow to sore muscles.\n2. Proper Nutrition: Ensure adequate protein intake and overall calories.\n3. Hydration: Drink plenty of water to support cellular repair processes.\n4. Sleep: Aim for 7-9 hours of quality sleep when possible.\n5. Stretching & Mobility Work: Regular stretching can help maintain range of motion.\n6. Contrast Therapy: Alternating between hot and cold treatments.\n7. Foam Rolling: Self-myofascial release can help reduce muscle tension.\n\nRemember that some soreness is normal, especially after changing your routine, but excessive soreness that impacts your daily activities might indicate you need more recovery time.";
  }
  
  // Default response if no specific query is detected
  return "Based on your training history, I recommend focusing on a balanced approach to your workouts. Make sure you're incorporating progressive overload by gradually increasing the weight or reps in your exercises. Also, ensure you're getting adequate recovery between training sessions and proper nutrition to support your goals.\n\nIs there anything specific about your training that you'd like advice on?";
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
        const initialMessage = {
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
      const messages = conversation ? [...conversation.messages] : [];
      
      // Add user message
      const userMessage = { role: "user", content };
      messages.push(userMessage);
      
      // Get workout history for context (simplified for now)
      const workoutHistory = await storage.getRecentWorkouts(userId, 5);
      
      // Generate AI response
      const aiResponseContent = await generateAIResponse(content, workoutHistory);
      const aiMessage = { role: "assistant", content: aiResponseContent };
      
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
      const initialMessage = {
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
