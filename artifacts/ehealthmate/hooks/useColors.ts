import { useContext } from "react";
import { useColorScheme } from "react-native";
import colors from "@/constants/colors";
import { AppContext } from "@/contexts/AppContext";

export type AppColors = typeof colors.light;

export function useColors(): AppColors {
  const scheme = useColorScheme();
  const ctx = useContext(AppContext);
  const themeMode = ctx?.profile.themeMode ?? "system";
  const mode = themeMode === "system" ? scheme : themeMode;
  return mode === "dark" ? colors.dark : colors.light;
}
