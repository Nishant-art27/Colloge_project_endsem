import { Link, useLocation } from "react-router-dom";
import { ChefHat, Grid2x2, List, SquareCheck, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";

export function AppNavbar() {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  
  const menu = [
    { title: "Home", url: "/", icon: Grid2x2 },
    { title: "Browse", url: "/browse", icon: List },
    { title: "Favorites", url: "/favorites", icon: SquareCheck },
  ];

  return (
    <div className="sticky top-0 z-40 w-full bg-white shadow-sm">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
          <ChefHat className="text-accent" size={24} />
          <span className="font-playfair text-lg font-bold tracking-tight">Recipe Radar</span>
        </Link>
        
        <div className="hidden md:flex items-center space-x-6">
          {menu.map((item) => (
            <Link 
              key={item.title}
              to={item.url}
              className={`flex items-center space-x-1 font-medium ${
                pathname === item.url ? 'text-primary' : 'text-gray-600 hover:text-primary'
              }`}
            >
              <item.icon size={16} />
              <span>{item.title}</span>
            </Link>
          ))}
        </div>
        
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu size={20} />
            </Button>
          </SheetTrigger>
          <SheetContent side="right">
            <div className="flex flex-col space-y-4 mt-8">
              {menu.map((item) => (
                <Link
                  key={item.title}
                  to={item.url}
                  className={`flex items-center space-x-2 px-2 py-2 rounded-md font-medium hover:bg-soft/40 transition ${
                    pathname === item.url ? 'bg-soft/70 text-primary' : ''
                  }`}
                  onClick={() => setOpen(false)}
                >
                  <item.icon size={18} />
                  <span>{item.title}</span>
                </Link>
              ))}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
} 