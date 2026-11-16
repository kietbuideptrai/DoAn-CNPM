import type { ReactNode } from "react";
import { ScrollView, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { createSharedStyles, useTheme } from "@/theme";

interface ScreenProps {
  children: ReactNode;
  title: string;
}

export function Screen({ children, title }: ScreenProps) {
  const { colors } = useTheme();
  const styles = createSharedStyles(colors);

  return (
    <ScrollView contentContainerStyle={styles.screenContent}>
      <SafeAreaView edges={["top"]} style={styles.screen}>
        <Text style={styles.screenTitle}>{title}</Text>
        {children}
      </SafeAreaView>
    </ScrollView>
  );
}
