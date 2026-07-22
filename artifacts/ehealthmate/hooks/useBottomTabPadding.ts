import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const TAB_BAR_BASE_HEIGHT = 56;

/**
 * Returns the total bottom padding a scrollable screen needs
 * to clear the tab bar + home indicator on any device.
 */
export function useBottomTabPadding(extra = 0): number {
  const insets = useSafeAreaInsets();
  if (Platform.OS === "web") return TAB_BAR_BASE_HEIGHT + 28 + extra;
  return TAB_BAR_BASE_HEIGHT + insets.bottom + extra;
}

/**
 * Returns only the device bottom inset (home indicator / gesture bar).
 */
export function useBottomInset(): number {
  const insets = useSafeAreaInsets();
  return insets.bottom;
}
