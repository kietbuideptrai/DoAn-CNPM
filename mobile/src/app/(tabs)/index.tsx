import { Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { Screen } from "@/components/Screen";
import { createSharedStyles, useTheme } from "@/theme";
import { useTranslation } from "@/utils/i18n";

export default function HomeScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const styles = createSharedStyles(colors);
  const homeStyles = createHomeStyles(colors);

  return (
    <Screen title={t("home")}>
      <Text style={styles.bodyText}>{t("homeIntro")}</Text>
      <View style={homeStyles.actions}>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push("/translate")}
          style={({ pressed }) => [
            homeStyles.action,
            pressed && homeStyles.pressed,
          ]}
        >
          <Text style={homeStyles.actionTitle}>{t("translatePhrase")}</Text>
          <Text style={homeStyles.actionDescription}>
            {t("translationDemoDescription")}
          </Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push("/translation-history")}
          style={({ pressed }) => [
            homeStyles.action,
            pressed && homeStyles.pressed,
          ]}
        >
          <Text style={homeStyles.actionTitle}>{t("translationHistory")}</Text>
          <Text style={homeStyles.actionDescription}>
            {t("translationHistoryDescription")}
          </Text>
        </Pressable>
      </View>
    </Screen>
  );
}

function createHomeStyles(colors: ReturnType<typeof useTheme>["colors"]) {
return StyleSheet.create({
  actions: {
    gap: 12,
    marginTop: 24,
  },
  action: {
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.paper,
  },
  actionTitle: {
    marginBottom: 6,
    color: colors.ink,
    fontSize: 16,
    fontWeight: "700",
  },
  actionDescription: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
  },
  pressed: {
    opacity: 0.75,
  },
});
}
