import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "@/theme";

interface EmptyStateProps {
  message: string;
  title: string;
}

export function EmptyState({ message, title }: EmptyStateProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <View accessibilityLiveRegion="polite" style={styles.container}>
      <Text style={styles.mark} accessibilityElementsHidden>
        ◇
      </Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

function createStyles(colors: ReturnType<typeof useTheme>["colors"]) {
  return StyleSheet.create({
  container: {
    minHeight: 190,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    backgroundColor: colors.paper,
  },
  mark: {
    marginBottom: 12,
    color: colors.muted,
    fontSize: 28,
  },
  title: {
    marginBottom: 8,
    color: colors.ink,
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
  },
  message: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
  },
  });
}
