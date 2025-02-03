import { createContext, useContext } from 'react';

interface SidebarContextType {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export const SidebarContext = createContext<SidebarContextType | null>(null);

export function useSidebarContext(): SidebarContextType {
  const context = useContext(SidebarContext);
  
  if (!context) {
    throw new Error('useSidebarContext must be used within a SidebarProvider');
  }
  
  return context;
}
