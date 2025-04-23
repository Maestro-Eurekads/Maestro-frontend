"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface EditingContextType {
  isEditing: boolean;
  setIsEditing: (value: boolean) => void;
  midcapEditing:any
  setMidcapEditing: any
}

const EditingContext = createContext<EditingContextType | undefined>(undefined);

export function EditingProvider({ children }: { children: ReactNode }) {
  const [isEditing, setIsEditing] = useState(false);
  const [midcapEditing, setMidcapEditing] = useState({
    step: "",
    isEditing: false,
  });

  return (
    <EditingContext.Provider value={{ isEditing, setIsEditing, midcapEditing, setMidcapEditing }}>
      {children}
    </EditingContext.Provider>
  );
}

export function useEditing() {
  const context = useContext(EditingContext);
  if (!context) {
    throw new Error("useEditing must be used within an EditingProvider");
  }
  return context;
}
