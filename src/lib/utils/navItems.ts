import { Sparkles, Files, BookOpen, LayoutDashboard } from "lucide-react";


export const navItems = [
    {
      label: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
      disabled:false
    },
    {
      label: 'My Flashcards',
      href: '/flashcards',
      icon: Files,
      disabled:false
    },
    {
      label: 'Generate Flashcards',
      href: '/generate',
      icon: Sparkles,
      disabled:false
    },
    {
     label:'Learn Flashcards',
     href:'#',
     icon: BookOpen,
     badge: 'soon',
     disabled:true
    }
  ];