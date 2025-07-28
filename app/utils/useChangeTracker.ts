"use client";

import { useEffect, useRef } from "react";
import { useActive } from "./ActiveContext";

interface UseChangeTrackerOptions {
  formData: any;
  initialData?: any;
  enabled?: boolean;
}

export const useChangeTracker = ({ formData, initialData, enabled = true }: UseChangeTrackerOptions) => {
  const { setChange } = useActive();
  const previousDataRef = useRef<any>(null);

  useEffect(() => {
    if (!enabled) return;

    // Skip the first render
    if (previousDataRef.current === null) {
      previousDataRef.current = formData;
      return;
    }

    // Compare current data with previous data
    const hasChanged = JSON.stringify(formData) !== JSON.stringify(previousDataRef.current);
    
    if (hasChanged) {
      setChange(true);
    }

    previousDataRef.current = formData;
  }, [formData, setChange, enabled]);

  // Reset change state when form is saved or reset
  const resetChange = () => {
    setChange(false);
    previousDataRef.current = formData;
  };

  return { resetChange };
}; 