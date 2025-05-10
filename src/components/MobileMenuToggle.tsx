import { Menu, X } from "lucide-react";
import { useState } from "react";

export const MobileMenuToggle = ({ variant = "menu" }: { variant?: "menu" | "close" }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    const sidebar = document.querySelector("aside");
    if (sidebar) {
      setIsOpen(!isOpen);
      sidebar.classList.toggle("-translate-x-full");
    }
  };

  return (
    <button
      onClick={toggleMenu}
      className="flex items-center justify-center rounded-4xl h-9 aspect-square text-sm font-medium text-muted-foreground bg-black/5 hover:bg-black hover:text-white transition-colors duration-300 cursor-pointer xl:hidden"
    >
      {variant === "close" ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
    </button>
  );
};
