import { useCallback, useEffect } from "react";
import { useFocusEffect, useLocalSearchParams } from "expo-router";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { Language } from "../../../../shared/types";
import { ArtifactImage } from "@/components/ArtifactImage";
import { EmptyState } from "@/components/EmptyState";
import { useLanguage } from "@/context/LanguageContext";
import { useLocalData } from "@/context/LocalDataContext";
import { useArtifact } from "@/hooks/useArtifact";
import { useSpeech } from "@/hooks/useSpeech";
import { createSharedStyles, useTheme } from "@/theme";
import { getLanguageLabel, languages } from "@/utils/languages";
import { useTranslation } from "@/utils/i18n";

export default function ArtifactDetailScreen() {
  const { slug: requestedSlug } = useLocalSearchParams<{ slug: string }>();
  const slug = Array.isArray(requestedSlug) ? requestedSlug[0] : requestedSlug;
  const { language, setLanguage, storageError } = useLanguage();
  const { t } = useTranslation();
  const { favoriteSlugs, recordViewed, toggleFavorite } = useLocalData();
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const sharedStyles = createSharedStyles(colors);
  const { state, isNotFound, retry } = useArtifact(slug, language);
  const artifact = state.status === "success" ? state.data : null;
  const translation = artifact?.translation;
  const isFavorite = slug ? favoriteSlugs.includes(slug) : false;
  const speech = useSpeech(translation?.content ?? "", language);
  const stopSpeech = speech.stop;

  useFocusEffect(
    useCallback(() => () => stopSpeech(), [stopSpeech]),
  );

  useEffect(() => {
    if (artifact && slug) {
      recordViewed(slug);
    }
  }, [artifact, recordViewed, slug]);

  if (state.status === "loading") {
    return (
      <View style={[sharedStyles.screen, styles.feedback]}>
        <ActivityIndicator color={colors.primary} size="large" />
        <Text style={styles.feedbackText}>{t("loadingNarration")}</Text>
      </View>
    );
  }

  if (state.status === "error") {
    return (
      <View style={[sharedStyles.screen, styles.errorState]}>
        <EmptyState
          title={isNotFound ? t("artifactNotFound") : t("cannotLoadArtifacts")}
          message={
            isNotFound
              ? t("artifactNotFoundMessage", { slug: slug ?? "" })
              : t("artifactLoadError")
          }
        />
        {!isNotFound ? (
          <Pressable
            accessibilityRole="button"
            onPress={retry}
            style={styles.retryButton}
          >
            <Text style={styles.retryButtonText}>{t("retry")}</Text>
          </Pressable>
        ) : null}
      </View>
    );
  }

  if (!artifact) {
    return null;
  }

  if (!translation) {
    return (
      <ScrollView contentContainerStyle={styles.content}>
        <ArtifactImage
          accessibilityLabel={t("artifactImage", { name: artifact.slug })}
          source={artifact.image_url}
          style={styles.image}
        />
        <EmptyState
          title={t("noNarrationLanguage", { language: getLanguageLabel(language) })}
          message={t("noTranslationMessage", {
            languages: artifact.available_languages.map(getLanguageLabel).join(", "),
          })}
        />
        <LanguageSelector
          language={language}
          availableLanguages={artifact.available_languages}
          onChange={setLanguage}
          storageError={storageError}
        />
        <FavoriteButton
          isFavorite={isFavorite}
          onPress={() => slug && toggleFavorite(slug)}
        />
      </ScrollView>
    );
  }

  const paragraphs = splitIntoParagraphs(translation.content);

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <ArtifactImage
        accessibilityLabel={t("artifactImage", { name: translation.title })}
        source={artifact.image_url}
        style={styles.image}
      />
      <LanguageSelector
        language={language}
        availableLanguages={artifact.available_languages}
        onChange={setLanguage}
        storageError={storageError}
      />
      <FavoriteButton
        isFavorite={isFavorite}
        onPress={() => slug && toggleFavorite(slug)}
      />
      <Text style={styles.languageTag}>{getLanguageLabel(language)}</Text>
      <Text style={styles.title}>
        {translation.title}
      </Text>
      <Text style={styles.summary}>
        {translation.summary}
      </Text>
      <View style={styles.speechControls}>
        {speech.voiceAvailability === "unavailable" ? (
          <View>
            <Text style={styles.speechMessage} accessibilityRole="alert">
              {t("voiceUnavailable", { language: getLanguageLabel(language) })}
            </Text>
            <Pressable
              accessibilityRole="button"
              onPress={speech.checkVoices}
              style={styles.retryVoiceButton}
            >
              <Text style={styles.retryVoiceButtonText}>{t("checkVoice")}</Text>
            </Pressable>
          </View>
        ) : speech.status === "idle" ? (
          <Pressable
            accessibilityLabel={t("listenNarration", {
              language: getLanguageLabel(language),
            })}
            accessibilityRole="button"
            disabled={speech.voiceAvailability === "checking"}
            onPress={speech.play}
            style={[
              styles.speechButton,
              speech.voiceAvailability === "checking" && styles.disabledButton,
            ]}
          >
            <Text style={styles.speechButtonText}>
              {speech.voiceAvailability === "checking"
                ? t("checkingVoice")
                : t("listen")}
            </Text>
          </Pressable>
        ) : (
          <View style={styles.speechButtonRow}>
            {speech.status === "paused" ? (
              <Pressable
                accessibilityRole="button"
                onPress={speech.resume}
                style={styles.speechButton}
              >
                <Text style={styles.speechButtonText}>{t("resume")}</Text>
              </Pressable>
            ) : (
              <Pressable
                accessibilityRole="button"
                onPress={speech.pause}
                style={styles.speechButton}
              >
                <Text style={styles.speechButtonText}>{t("pause")}</Text>
              </Pressable>
            )}
            <Pressable
              accessibilityRole="button"
              onPress={speech.stop}
              style={styles.stopButton}
            >
              <Text style={styles.stopButtonText}>{t("stop")}</Text>
            </Pressable>
          </View>
        )}
        {speech.error ? (
          <Text style={styles.speechError} accessibilityRole="alert">
            {speech.error}
          </Text>
        ) : null}
      </View>
      <View style={styles.article}>
        {paragraphs.map((paragraph, index) => (
          <Text
            key={`${index}-${paragraph}`}
            style={styles.paragraph}
          >
            {paragraph}
          </Text>
        ))}
      </View>
    </ScrollView>
  );
}

interface FavoriteButtonProps {
  isFavorite: boolean;
  onPress: () => void;
}

function FavoriteButton({ isFavorite, onPress }: FavoriteButtonProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const styles = createStyles(colors);

  return (
    <Pressable
      accessibilityLabel={
        isFavorite ? t("removeFavorite") : t("addFavorite")
      }
      accessibilityRole="button"
      accessibilityState={{ selected: isFavorite }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.favoriteButton,
        isFavorite && styles.favoriteButtonSelected,
        pressed && styles.favoriteButtonPressed,
      ]}
    >
      <Text
        style={[
          styles.favoriteButtonText,
          isFavorite && styles.favoriteButtonTextSelected,
        ]}
      >
        {isFavorite ? t("favorited") : t("addFavoriteShort")}
      </Text>
    </Pressable>
  );
}

interface LanguageSelectorProps {
  language: Language;
  availableLanguages: Language[];
  onChange: (language: Language) => Promise<void>;
  storageError: string | null;
}

function LanguageSelector({
  language,
  availableLanguages,
  onChange,
  storageError,
}: LanguageSelectorProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const styles = createStyles(colors);

  return (
    <View style={styles.languageSelector}>
      <Text style={styles.languageSelectorLabel}>{t("narrationLanguage")}</Text>
      <View style={styles.languageOptions}>
        {languages.map((item) => {
          const isSelected = item.code === language;
          const isAvailable = availableLanguages.includes(item.code);
          return (
            <Pressable
              accessibilityRole="radio"
              accessibilityState={{
                checked: isSelected,
                disabled: !isAvailable,
              }}
              key={item.code}
              disabled={!isAvailable}
              onPress={() => void onChange(item.code)}
              style={[
                styles.languageOption,
                isSelected && styles.selectedLanguageOption,
                !isAvailable && styles.unavailableLanguageOption,
              ]}
            >
              <Text
                style={[
                  styles.languageOptionText,
                  isSelected && styles.selectedLanguageOptionText,
                ]}
              >
                {isAvailable ? item.label : `${item.label} · ${t("unavailable")}`}
              </Text>
            </Pressable>
          );
        })}
      </View>
      {storageError ? (
        <Text style={styles.storageError} accessibilityRole="alert">
          {t("storageError")}
        </Text>
      ) : null}
    </View>
  );
}

function splitIntoParagraphs(content: string): string[] {
  return (
    content
      .match(/[^.!?。！？]+[.!?。！？]?/gu)
      ?.map((sentence) => sentence.trim())
      .filter(Boolean) ?? []
  );
}

function createStyles(colors: ReturnType<typeof useTheme>["colors"]) {
  return StyleSheet.create({
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  retryVoiceButton: {
    minHeight: 44,
    alignSelf: "flex-start",
    justifyContent: "center",
    marginTop: 6,
    paddingHorizontal: 10,
  },
  retryVoiceButtonText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "700",
  },
  image: {
    width: "100%",
    height: 230,
    marginBottom: 22,
    borderRadius: 14,
  },
  feedback: {
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  feedbackText: {
    color: colors.muted,
    fontSize: 15,
  },
  errorState: {
    justifyContent: "center",
    gap: 14,
  },
  retryButton: {
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    backgroundColor: colors.primary,
  },
  retryButtonText: {
    color: colors.paper,
    fontSize: 15,
    fontWeight: "700",
  },
  languageSelector: {
    marginBottom: 18,
  },
  favoriteButton: {
    minHeight: 44,
    alignSelf: "flex-start",
    justifyContent: "center",
    marginBottom: 20,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    backgroundColor: colors.paper,
  },
  favoriteButtonSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.highlight,
  },
  favoriteButtonPressed: {
    opacity: 0.75,
  },
  favoriteButtonText: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: "700",
  },
  favoriteButtonTextSelected: {
    color: colors.primary,
  },
  languageSelectorLabel: {
    marginBottom: 9,
    color: colors.ink,
    fontSize: 14,
    fontWeight: "700",
  },
  languageOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  languageOption: {
    minHeight: 40,
    justifyContent: "center",
    paddingHorizontal: 13,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    backgroundColor: colors.paper,
  },
  selectedLanguageOption: {
    borderColor: colors.primary,
    backgroundColor: colors.highlight,
  },
  unavailableLanguageOption: {
    opacity: 0.5,
  },
  languageOptionText: {
    color: colors.ink,
    fontSize: 14,
  },
  selectedLanguageOptionText: {
    color: colors.primary,
    fontWeight: "700",
  },
  storageError: {
    marginTop: 10,
    color: colors.error,
    fontSize: 13,
    lineHeight: 19,
  },
  languageTag: {
    marginBottom: 8,
    color: colors.primary,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  title: {
    marginBottom: 10,
    color: colors.ink,
    fontSize: 30,
    fontWeight: "700",
    lineHeight: 38,
  },
  summary: {
    marginBottom: 18,
    color: colors.muted,
    fontSize: 16,
    lineHeight: 25,
  },
  speechControls: {
    marginBottom: 22,
  },
  speechButton: {
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
    borderRadius: 10,
    backgroundColor: colors.primary,
  },
  speechButtonText: {
    color: colors.paper,
    fontSize: 15,
    fontWeight: "700",
  },
  speechButtonRow: {
    flexDirection: "row",
    gap: 10,
  },
  stopButton: {
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    backgroundColor: colors.paper,
  },
  stopButtonText: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: "700",
  },
  disabledButton: {
    opacity: 0.6,
  },
  speechMessage: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 21,
  },
  speechError: {
    marginTop: 10,
    color: colors.error,
    fontSize: 14,
    lineHeight: 20,
  },
  article: {
    paddingTop: 18,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  paragraph: {
    marginBottom: 18,
    color: colors.ink,
    fontSize: 17,
    lineHeight: 29,
  },
  });
}
