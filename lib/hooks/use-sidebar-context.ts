import { createContext, useContext } from 'react';

interface SidebarContextType {
  isOpen: boolean;
  toggleSidebar: () => void;
}

export const SidebarContext = createContext<SidebarContextType>({
  isOpen: true,
  toggleSidebar: () => undefined,
});

export const useSidebarContext = (): SidebarContextType => {
  const context = useContext(SidebarContext: unknown);
  if (!context) {
    throw new Error('useSidebarContext must be used within a SidebarProvider');
  }
  return context;
};
