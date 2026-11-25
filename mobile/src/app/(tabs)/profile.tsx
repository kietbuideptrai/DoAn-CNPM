import { useMemo } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";
import { EmptyState } from "@/components/EmptyState";
import { Screen } from "@/components/Screen";
import { useLanguage } from "@/context/LanguageContext";
import { useLocalData } from "@/context/LocalDataContext";
import { useArtifacts } from "@/hooks/useArtifacts";
import { languages } from "@/utils/languages";
import { useTheme } from "@/theme";
import { useTranslation } from "@/utils/i18n";

export default function ProfileScreen() {
  const { language, setLanguage, storageError } = useLanguage();
  const {
    historySlugs,
    storageError: localStorageError,
  } = useLocalData();
  const { colors, mode, setMode, storageError: themeStorageError } = useTheme();
  const { t } = useTranslation();
  const styles = createStyles(colors);
  const { state, retry } = useArtifacts(language, "");
  const artifactsBySlug = useMemo(
    () =>
      state.status === "success"
        ? new Map(state.data.map((artifact) => [artifact.slug, artifact]))
        : new Map(),
    [state],
  );
  const history = historySlugs
    .map((slug) => artifactsBySlug.get(slug))
    .filter((artifact) => artifact !== undefined);

  return (
    <Screen title={t("profile")}>
      <Text style={styles.sectionTitle}>{t("language")}</Text>
      <Text style={styles.description}>
        {t("artifactLanguageDescription")}
      </Text>
      <View style={styles.languageList}>
        {languages.map((item) => {
          const isSelected = item.code === language;

          return (
            <Pressable
              accessibilityRole="radio"
              accessibilityState={{ checked: isSelected }}
              key={item.code}
              onPress={() => void setLanguage(item.code)}
              style={({ pressed }) => [
                styles.languageOption,
                isSelected && styles.selectedLanguageOption,
                pressed && styles.languageOptionPressed,
              ]}
            >
              <Text
                style={[
                  styles.languageLabel,
                  isSelected && styles.selectedLanguageLabel,
                ]}
              >
                {item.label}
              </Text>
              <Text style={styles.radioMark}>{isSelected ? "●" : "○"}</Text>
            </Pressable>
          );
        })}
      </View>
      {storageError ? (
        <Text style={styles.storageError} accessibilityRole="alert">
          {t("storageError")}
        </Text>
      ) : null}

      {themeStorageError ? (
        <Text style={styles.storageError} accessibilityRole="alert">
          {t("storageError")}
        </Text>
      ) : null}

      <Text style={styles.sectionTitle}>{t("theme")}</Text>
      <Text style={styles.description}>
        {t("themeDescription")}
      </Text>
      <View style={styles.themeOptions}>
        {([
          ["light", t("light")],
          ["dark", t("dark")],
        ] as const).map(([value, label]) => {
          const isSelected = mode === value;
          return (
            <Pressable
              accessibilityRole="radio"
              accessibilityState={{ checked: isSelected }}
              key={value}
              onPress={() => void setMode(value)}
              style={({ pressed }) => [
                styles.themeOption,
                isSelected && styles.selectedThemeOption,
                pressed && styles.languageOptionPressed,
              ]}
            >
              <Text
                style={[
                  styles.themeLabel,
                  isSelected && styles.selectedLanguageLabel,
                ]}
              >
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={styles.sectionTitle}>{t("learningTools")}</Text>
      <View style={styles.learningActions}>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push("/translate")}
          style={({ pressed }) => [
            styles.learningAction,
            pressed && styles.languageOptionPressed,
          ]}
        >
          <Text style={styles.learningActionTitle}>{t("translatePhrase")}</Text>
          <Text style={styles.learningActionDescription}>
          {t("translationDemoShort")}
          </Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push("/translation-history")}
          style={({ pressed }) => [
            styles.learningAction,
            pressed && styles.languageOptionPressed,
          ]}
        >
          <Text style={styles.learningActionTitle}>{t("translationHistory")}</Text>
          <Text style={styles.learningActionDescription}>
          {t("savedTranslationsDescription")}
          </Text>
        </Pressable>
      </View>

      <Text style={styles.sectionTitle}>{t("viewedHistory")}</Text>
      {localStorageError ? (
        <Text style={styles.storageError} accessibilityRole="alert">
          {localStorageError}
        </Text>
      ) : null}
      {historySlugs.length === 0 ? (
        <EmptyState
          title={t("noViewedArtifacts")}
          message={t("viewedArtifactsDescription")}
        />
      ) : state.status === "loading" ? (
        <View style={styles.historyFeedback}>
          <ActivityIndicator color={colors.primary} />
          <Text style={styles.description}>{t("loadingHistory")}</Text>
        </View>
      ) : state.status === "error" ? (
        <View style={styles.historyFeedback}>
          <Text style={styles.storageError} accessibilityRole="alert">
            {t("artifactLoadError")}
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={retry}
            style={styles.retryButton}
          >
            <Text style={styles.retryButtonLabel}>{t("retry")}</Text>
          </Pressable>
        </View>
      ) : history.length === 0 ? (
        <EmptyState
          title={t("noHistoryInLanguage")}
          message={t("historyNoTranslation")}
        />
      ) : (
        <View style={styles.historyList}>
          {history.map((artifact) => (
            <Pressable
              accessibilityHint={t("openNarrationHint")}
              accessibilityRole="button"
              key={artifact.slug}
              onPress={() =>
                router.push({
                  pathname: "/artifacts/[slug]",
                  params: { slug: artifact.slug },
                })
              }
              style={({ pressed }) => [
                styles.historyItem,
                pressed && styles.languageOptionPressed,
              ]}
            >
              <Text style={styles.historyTitle}>{artifact.title}</Text>
              <Text style={styles.historySummary} numberOfLines={2}>
                {artifact.summary}
              </Text>
            </Pressable>
          ))}
        </View>
      )}
    </Screen>
  );
}

function createStyles(colors: ReturnType<typeof useTheme>["colors"]) {
return StyleSheet.create({
  sectionTitle: {
    marginBottom: 6,
    color: colors.ink,
    fontSize: 17,
    fontWeight: "700",
  },
  description: {
    marginBottom: 16,
    color: colors.muted,
    fontSize: 14,
    lineHeight: 21,
  },
  languageList: {
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.paper,
  },
  languageOption: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  selectedLanguageOption: {
    backgroundColor: colors.highlight,
  },
  languageOptionPressed: {
    opacity: 0.75,
  },
  languageLabel: {
    color: colors.ink,
    fontSize: 15,
  },
  selectedLanguageLabel: {
    color: colors.primary,
    fontWeight: "700",
  },
  radioMark: {
    color: colors.primary,
    fontSize: 18,
  },
  storageError: {
    marginTop: 14,
    color: colors.error,
    fontSize: 13,
    lineHeight: 19,
  },
  themeOptions: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 28,
  },
  themeOption: {
    minHeight: 44,
    minWidth: 110,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    backgroundColor: colors.paper,
  },
  selectedThemeOption: {
    borderColor: colors.primary,
    backgroundColor: colors.highlight,
  },
  themeLabel: {
    color: colors.ink,
    fontSize: 14,
  },
  learningActions: {
    gap: 10,
    marginBottom: 28,
  },
  learningAction: {
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.paper,
  },
  learningActionTitle: {
    marginBottom: 4,
    color: colors.ink,
    fontSize: 15,
    fontWeight: "700",
  },
  learningActionDescription: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 19,
  },
  historyFeedback: {
    gap: 12,
    marginBottom: 16,
  },
  historyList: {
    overflow: "hidden",
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.paper,
  },
  historyItem: {
    padding: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  historyTitle: {
    marginBottom: 5,
    color: colors.ink,
    fontSize: 15,
    fontWeight: "700",
  },
  historySummary: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 19,
  },
  retryButton: {
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    backgroundColor: colors.primary,
  },
  retryButtonLabel: {
    color: colors.paper,
    fontSize: 14,
    fontWeight: "700",
  },
});
}
