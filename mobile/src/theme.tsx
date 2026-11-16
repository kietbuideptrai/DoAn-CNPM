import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";
import { StyleSheet } from "react-native";

export type ThemeMode = "light" | "dark";

export interface ThemeColors {
  background: string;
  paper: string;
  ink: string;
  muted: string;
  primary: string;
  border: string;
  highlight: string;
  error: string;
  errorBackground: string;
}

const palettes: Record<ThemeMode, ThemeColors> = {
  light: {
    background: "#F7F8F4",
    paper: "#FFFFFF",
    ink: "#20312C",
    muted: "#62716A",
    primary: "#176B52",
    border: "#DCE4DE",
    highlight: "#EAF2EC",
    error: "#9B2C2C",
    errorBackground: "#FBEAEA",
  },
  dark: {
    background: "#101815",
    paper: "#1B2520",
    ink: "#F1F5F2",
    muted: "#B2C0B8",
    primary: "#71C7A4",
    border: "#36453D",
    highlight: "#27372F",
    error: "#FF9A9A",
    errorBackground: "#3B2424",
  },
};

const THEME_STORAGE_KEY = "artifact-guide.theme";

interface ThemeContextValue {
  colors: ThemeColors;
  isLoading: boolean;
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => Promise<void>;
  storageError: string | null;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [mode, setModeState] = useState<ThemeMode>("light");
  const [isLoading, setIsLoading] = useState(true);
  const [storageError, setStorageError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    AsyncStorage.getItem(THEME_STORAGE_KEY)
      .then((savedMode) => {
        if (isMounted && isThemeMode(savedMode)) {
          setModeState(savedMode);
        }
      })
      .catch(() => {
        if (isMounted) {
          setStorageError("Không thể đọc giao diện đã lưu. Ứng dụng dùng giao diện sáng.");
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const setMode = useCallback(async (nextMode: ThemeMode) => {
    setModeState(nextMode);
    setStorageError(null);
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, nextMode);
    } catch {
      setStorageError(
        "Không thể lưu giao diện. Lựa chọn này chỉ được giữ đến khi đóng ứng dụng.",
      );
    }
  }, []);

  const value = useMemo(
    () => ({
      colors: palettes[mode],
      isLoading,
      mode,
      setMode,
      storageError,
    }),
    [isLoading, mode, setMode, storageError],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  return context;
}

export function createSharedStyles(colors: ThemeColors) {
  return StyleSheet.create({
    screen: {
      flex: 1,
      paddingHorizontal: 20,
      paddingTop: 20,
      backgroundColor: colors.background,
    },
    screenContent: {
      flexGrow: 1,
      paddingBottom: 24,
    },
    screenTitle: {
      marginBottom: 18,
      color: colors.ink,
      fontSize: 28,
      fontWeight: "800",
    },
    bodyText: {
      color: colors.muted,
      fontSize: 16,
      lineHeight: 25,
    },
  });
}

function isThemeMode(value: string | null): value is ThemeMode {
  return value === "light" || value === "dark";
}
