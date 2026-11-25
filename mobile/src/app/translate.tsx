import { useState } from "react";
import {
  Keyboard,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { createSharedStyles, useTheme } from "@/theme";
import {
  translatePhrase,
  type TranslationLanguage,
} from "@/utils/translation";
import { saveTranslationHistory } from "@/services/translationHistory";
import { useTranslation } from "@/utils/i18n";

export default function TranslateScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const styles = createStyles(colors);
  const sharedStyles = createSharedStyles(colors);
  const [sourceLanguage, setSourceLanguage] =
    useState<TranslationLanguage>("en");
  const [input, setInput] = useState("");
  const [result, setResult] = useState("");
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const targetLanguage = sourceLanguage === "en" ? "vi" : "en";

  function swapLanguages() {
    setSourceLanguage(targetLanguage);
    setInput("");
    setResult("");
    setMessage("");
  }

  async function handleTranslate() {
    Keyboard.dismiss();
    const originalText = input.trim();
    if (!originalText) {
      setResult("");
      setMessage(t("enterPhrase"));
      return;
    }

    if (isSaving) {
      return;
    }

    setIsSaving(true);
    setResult("");
    setMessage("");

    const translatedText = translatePhrase(originalText, sourceLanguage);
    if (!translatedText) {
      setMessage(
        t("phraseMissing"),
      );
      setIsSaving(false);
      return;
    }

    setResult(translatedText);
    try {
      await saveTranslationHistory({
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        sourceLanguage,
        targetLanguage,
        originalText,
        translatedText,
        createdAt: new Date().toISOString(),
      });
      setMessage(t("translationSaved"));
    } catch {
      setMessage(t("translationNotSaved"));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <ScrollView
      contentContainerStyle={sharedStyles.screenContent}
      keyboardShouldPersistTaps="handled"
    >
      <SafeAreaView edges={["top"]} style={sharedStyles.screen}>
        <Text style={sharedStyles.screenTitle}>{t("translatePhrase")}</Text>
        <Text style={styles.description}>
          {t("translateDescription")}
        </Text>

        <View style={styles.languageRow}>
          <View style={styles.languageCard}>
            <Text style={styles.languageCaption}>{t("translateFrom")}</Text>
            <Text style={styles.languageName}>
              {t(sourceLanguage === "en" ? "englishLanguage" : "vietnameseLanguage")}
            </Text>
          </View>
          <Pressable
            accessibilityLabel={t("swapLanguages")}
            accessibilityRole="button"
            onPress={swapLanguages}
            style={({ pressed }) => [
              styles.swapButton,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.swapLabel}>⇄</Text>
          </Pressable>
          <View style={styles.languageCard}>
            <Text style={styles.languageCaption}>{t("translateTo")}</Text>
            <Text style={styles.languageName}>
              {t(targetLanguage === "en" ? "englishLanguage" : "vietnameseLanguage")}
            </Text>
          </View>
        </View>

        <TextInput
          accessibilityLabel={t("phraseToTranslate")}
          autoCapitalize="sentences"
          multiline
          maxLength={200}
          onChangeText={(text) => {
            setInput(text);
            setResult("");
            setMessage("");
          }}
          placeholder={
            sourceLanguage === "en"
              ? t("exampleHello")
              : t("exampleXinChao")
          }
          placeholderTextColor={colors.muted}
          style={styles.input}
          textAlignVertical="top"
          value={input}
        />

        <Pressable
          accessibilityRole="button"
          disabled={isSaving}
          onPress={() => void handleTranslate()}
          style={({ pressed }) => [
            styles.translateButton,
            (pressed || isSaving) && styles.pressed,
          ]}
        >
          <Text style={styles.translateButtonLabel}>
            {isSaving ? t("processing") : t("translate")}
          </Text>
        </Pressable>

        {result ? (
          <View style={styles.resultCard}>
            <Text style={styles.resultCaption}>{t("translatedResult")}</Text>
            <Text style={styles.resultText}>{result}</Text>
          </View>
        ) : null}
        {message ? (
          <Text
            accessibilityRole={result ? "text" : "alert"}
            style={result ? styles.notice : styles.errorMessage}
          >
            {message}
          </Text>
        ) : null}
      </SafeAreaView>
    </ScrollView>
  );
}

function createStyles(colors: ReturnType<typeof useTheme>["colors"]) {
return StyleSheet.create({
  description: {
    marginBottom: 20,
    color: colors.muted,
    fontSize: 14,
    lineHeight: 21,
  },
  languageRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  languageCard: {
    flex: 1,
    minHeight: 72,
    justifyContent: "center",
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.paper,
  },
  languageCaption: {
    marginBottom: 5,
    color: colors.muted,
    fontSize: 12,
  },
  languageName: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: "700",
  },
  swapButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
    backgroundColor: colors.highlight,
  },
  swapLabel: {
    color: colors.primary,
    fontSize: 23,
    fontWeight: "700",
  },
  input: {
    minHeight: 140,
    marginBottom: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.paper,
    color: colors.ink,
    fontSize: 16,
    lineHeight: 24,
  },
  translateButton: {
    minHeight: 50,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    backgroundColor: colors.primary,
  },
  translateButtonLabel: {
    color: colors.paper,
    fontSize: 16,
    fontWeight: "700",
  },
  resultCard: {
    marginTop: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.paper,
  },
  resultCaption: {
    marginBottom: 8,
    color: colors.muted,
    fontSize: 13,
  },
  resultText: {
    color: colors.ink,
    fontSize: 20,
    fontWeight: "700",
    lineHeight: 28,
  },
  notice: {
    marginTop: 12,
    color: colors.muted,
    fontSize: 13,
    lineHeight: 19,
  },
  errorMessage: {
    marginTop: 12,
    color: colors.error,
    fontSize: 14,
    lineHeight: 21,
  },
  pressed: {
    opacity: 0.75,
  },
});
}
