"use client";

import { useState, useEffect } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    setMounted(true);
    const theme = localStorage.getItem("theme");
    setDarkMode(theme === "dark" || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches));
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode, mounted]);

  if (!mounted) {
    return (
      <Button variant="ghost">
        <Sun className="w-5 h-5" />
      </Button>
    );
  }

  return (
    <Button 
      variant="ghost" 
      onClick={() => setDarkMode(!darkMode)}
      title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
    >
      {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
    </Button>
  );
}

export default ThemeToggle;
