// utils/errorUtils.ts
import { AxiosError } from "axios";

export const parseAxiosError = (err: unknown): string[] => {
  const error = err as AxiosError<any>;
  return (
    error?.response?.data?.error?.details?.errors ||
    error?.response?.data?.error?.message ||
    error?.response?.data?.message ||
    ["An unknown error occurred"]
  );
};
