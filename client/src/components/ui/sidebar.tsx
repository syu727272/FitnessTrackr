import { useLocation, Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { Dumbbell, Home, Calendar, Sparkles, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();

  const navigation = [
    {
      name: "Dashboard",
      href: "/",
      icon: Home,
      current: location === "/",
    },
    {
      name: "Workouts",
      href: "/workout",
      icon: Dumbbell,
      current: location === "/workout",
    },
    {
      name: "History",
      href: "/history",
      icon: Calendar,
      current: location === "/history",
    },
    {
      name: "AI Coach",
      href: "/ai-coach",
      icon: Sparkles,
      current: location === "/ai-coach",
    },
    {
      name: "Profile",
      href: "/profile",
      icon: User,
      current: location === "/profile",
    },
  ];

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <div className={cn("hidden md:flex md:flex-col md:w-64 md:bg-white md:border-r md:border-gray-200 md:fixed md:inset-y-0 md:py-4 md:px-3", className)}>
      {/* Logo */}
      <div className="flex items-center justify-center mb-8 px-4">
        <Dumbbell className="h-8 w-8 text-primary" />
        <span className="ml-2 text-xl font-bold text-gray-800">FitTrack</span>
      </div>
      
      {/* Navigation Links */}
      <nav className="flex-1 space-y-1">
        {navigation.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              "flex items-center px-4 py-3 text-sm font-medium rounded-md",
              item.current
                ? "bg-indigo-50 text-primary"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            )}
          >
            <item.icon className="mr-3 h-5 w-5" />
            {item.name}
          </Link>
        ))}
      </nav>
      
      {/* User Profile */}
      <div className="mt-auto border-t border-gray-200 pt-4">
        <div className="flex items-center px-4 py-2">
          <div className="flex-shrink-0">
            {user?.profileImage ? (
              <img
                className="h-10 w-10 rounded-full"
                src={user.profileImage}
                alt={`${user.firstName || user.username}'s profile`}
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-white">
                {(user?.firstName?.[0] || user?.username?.[0] || "").toUpperCase()}
              </div>
            )}
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-700">
              {user?.firstName ? `${user.firstName} ${user.lastName || ""}` : user?.username}
            </p>
            <p className="text-xs font-medium text-gray-500">{user?.email}</p>
          </div>
        </div>
        <div className="px-4 mt-2">
          <Button 
            variant="outline" 
            className="w-full text-sm flex items-center justify-center" 
            onClick={handleLogout}
            disabled={logoutMutation.isPending}
          >
            {logoutMutation.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <LogOut className="h-4 w-4 mr-2" />
            )}
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
}

// Add Loader2 import at the top
import { Loader2 } from "lucide-react";
