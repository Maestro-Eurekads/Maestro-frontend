"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

interface ActiveContextType {
  active: number;
  setActive: React.Dispatch<React.SetStateAction<number>>;
  subStep: number;
  setSubStep: React.Dispatch<React.SetStateAction<number>>;
  change: boolean;
  showModal: boolean;
  setChange: React.Dispatch<React.SetStateAction<boolean>>;
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
}

const ActiveContext = createContext<ActiveContextType | undefined>(undefined);

export const ActiveProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  // Helper to get stored values from localStorage with campaign scoping
  const getStoredValue = <T,>(key: string, defaultValue: T): T => {
    if (typeof window !== "undefined") {
      // Get campaign ID from URL or use default
      const urlParams = new URLSearchParams(window.location.search);
      const campaignId = urlParams.get("campaignId") || "default";
      const storageKey = `${campaignId}_${key}`;

      const storedValue = localStorage.getItem(storageKey);
      try {
        return storedValue !== null ? JSON.parse(storedValue) : defaultValue;
      } catch {
        return defaultValue;
      }
    }
    return defaultValue;
  };

  // States with persisted values - initialize with defaults to prevent hydration mismatch
  const [active, setActive] = useState<number>(0);
  const [subStep, setSubStep] = useState<number>(0);
  const [change, setChange] = useState<boolean>(false);
  const [showModal, setShowModal] = useState(false);

  // Load values from localStorage after component mounts (client-side only)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedActive = getStoredValue("active", 0);
      const storedSubStep = getStoredValue("subStep", 0);
      const storedChange = getStoredValue("change", false);

      setActive(storedActive);
      setSubStep(storedSubStep);
      setChange(storedChange);
    }
  }, []);

  // Save values to localStorage when they change
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const campaignId = urlParams.get("campaignId") || "default";
    const storageKey = `${campaignId}_active`;
    localStorage.setItem(storageKey, JSON.stringify(active));
  }, [active]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const campaignId = urlParams.get("campaignId") || "default";
    const storageKey = `${campaignId}_subStep`;
    localStorage.setItem(storageKey, JSON.stringify(subStep));
  }, [subStep]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const campaignId = urlParams.get("campaignId") || "default";
    const storageKey = `${campaignId}_change`;
    localStorage.setItem(storageKey, JSON.stringify(change));
  }, [change]);

  return (
    <ActiveContext.Provider
      value={{
        active,
        setActive,
        subStep,
        setSubStep,
        change,
        setChange,
        showModal,
        setShowModal,
      }}>
      {children}
    </ActiveContext.Provider>
  );
};

export const useActive = (): ActiveContextType => {
  const context = useContext(ActiveContext);
  if (!context) {
    throw new Error("useActive must be used within an ActiveProvider");
  }
  return context;
};
