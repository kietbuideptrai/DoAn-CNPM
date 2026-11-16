import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useFocusEffect } from "expo-router";
import { EmptyState } from "@/components/EmptyState";
import { Screen } from "@/components/Screen";
import {
  clearTranslationHistory,
  getTranslationHistory,
  type TranslationHistoryItem,
} from "@/services/translationHistory";
import { useTheme } from "@/theme";
import { useLanguage } from "@/context/LanguageContext";
import { useTranslation } from "@/utils/i18n";

export default function TranslationHistoryScreen() {
  const { colors } = useTheme();
  const { language } = useLanguage();
  const { t } = useTranslation();
  const styles = createStyles(colors);
  const [history, setHistory] = useState<TranslationHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadHistory = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      setHistory(await getTranslationHistory());
    } catch {
      setErrorMessage(t("historyLoadError"));
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  useFocusEffect(
    useCallback(() => {
      void loadHistory();
    }, [loadHistory]),
  );

  function confirmClearHistory() {
    Alert.alert(t("clearHistory"), t("clearHistoryConfirm"), [
      { text: t("cancel"), style: "cancel" },
      {
        text: t("delete"),
        style: "destructive",
        onPress: () => void handleClearHistory(),
      },
    ]);
  }

  async function handleClearHistory() {
    try {
      await clearTranslationHistory();
      setHistory([]);
      setErrorMessage(null);
    } catch {
      setErrorMessage(t("historyDeleteError"));
    }
  }

  return (
    <Screen title={t("translationHistory")}>
      {history.length > 0 && !isLoading ? (
        <Pressable
          accessibilityRole="button"
          onPress={confirmClearHistory}
          style={({ pressed }) => [
            styles.clearButton,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.clearButtonLabel}>{t("clearHistory")}</Text>
        </Pressable>
      ) : null}

      {isLoading ? (
        <View style={styles.feedback}>
          <ActivityIndicator color={colors.primary} size="large" />
          <Text style={styles.feedbackText}>{t("loadingTranslations")}</Text>
        </View>
      ) : errorMessage ? (
        <View style={styles.feedback}>
          <Text accessibilityRole="alert" style={styles.errorMessage}>
            {errorMessage}
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => void loadHistory()}
            style={styles.retryButton}
          >
            <Text style={styles.retryButtonLabel}>{t("retry")}</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={confirmClearHistory}
            style={styles.clearButton}
          >
            <Text style={styles.clearButtonLabel}>{t("clearHistoryData")}</Text>
          </Pressable>
        </View>
      ) : history.length === 0 ? (
        <EmptyState
          title={t("noTranslations")}
          message={t("noTranslationsDescription")}
        />
      ) : (
        <View style={styles.historyList}>
          {history.map((item) => (
            <View key={item.id} style={styles.historyItem}>
              <Text style={styles.languagePair}>
                {t(item.sourceLanguage === "en" ? "englishLanguage" : "vietnameseLanguage")} →{" "}
                {t(item.targetLanguage === "en" ? "englishLanguage" : "vietnameseLanguage")}
              </Text>
              <Text style={styles.originalText}>{item.originalText}</Text>
              <Text style={styles.translatedText}>{item.translatedText}</Text>
              <Text style={styles.dateText}>
                {new Date(item.createdAt).toLocaleString(dateLocales[language])}
              </Text>
            </View>
          ))}
        </View>
      )}
    </Screen>
  );
}

const dateLocales = {
  vi: "vi-VN",
  en: "en-US",
  zh: "zh-CN",
  ja: "ja-JP",
  ko: "ko-KR",
} as const;

function createStyles(colors: ReturnType<typeof useTheme>["colors"]) {
return StyleSheet.create({
  clearButton: {
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-end",
    marginBottom: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    backgroundColor: colors.paper,
  },
  clearButtonLabel: {
    color: colors.error,
    fontSize: 14,
    fontWeight: "700",
  },
  historyList: {
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.paper,
  },
  historyItem: {
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  languagePair: {
    marginBottom: 8,
    color: colors.muted,
    fontSize: 12,
  },
  originalText: {
    marginBottom: 4,
    color: colors.ink,
    fontSize: 15,
  },
  translatedText: {
    marginBottom: 8,
    color: colors.primary,
    fontSize: 17,
    fontWeight: "700",
  },
  dateText: {
    color: colors.muted,
    fontSize: 12,
  },
  feedback: {
    minHeight: 190,
    justifyContent: "center",
    gap: 12,
  },
  feedbackText: {
    color: colors.muted,
    fontSize: 14,
    textAlign: "center",
  },
  errorMessage: {
    color: colors.error,
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
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
  pressed: {
    opacity: 0.75,
  },
});
}
