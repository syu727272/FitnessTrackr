import { useLocation, Link } from "wouter";
import { cn } from "@/lib/utils";
import { Home, Dumbbell, Calendar, Sparkles, Plus } from "lucide-react";

export function MobileNavigation() {
  const [location] = useLocation();

  const navigation = [
    {
      name: "Home",
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
      name: "New",
      href: "/workout?new=true",
      icon: Plus,
      isSpecial: true,
      current: false,
    },
    {
      name: "History",
      href: "/history",
      icon: Calendar,
      current: location === "/history",
    },
    {
      name: "Coach",
      href: "/ai-coach",
      icon: Sparkles,
      current: location === "/ai-coach",
    },
  ];

  return (
    <div className="md:hidden bg-white fixed bottom-0 inset-x-0 border-t border-gray-200 z-10">
      <div className="grid grid-cols-5 h-16">
        {navigation.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center",
              item.current ? "text-primary" : "text-gray-500",
              item.isSpecial && "relative"
            )}
          >
            {item.isSpecial ? (
              <div className="h-12 w-12 rounded-full flex items-center justify-center bg-primary text-white">
                <item.icon className="h-6 w-6" />
              </div>
            ) : (
              <>
                <item.icon className="h-6 w-6" />
                <span className="text-xs mt-1">{item.name}</span>
              </>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
