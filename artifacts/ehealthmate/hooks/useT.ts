import { useCallback } from "react";
import { useApp } from "@/contexts/AppContext";
import { translate } from "@/constants/translations";

export function useT() {
  const { profile } = useApp();
  return useCallback(
    (key: string) => translate(profile.language, key),
    [profile.language],
  );
}
