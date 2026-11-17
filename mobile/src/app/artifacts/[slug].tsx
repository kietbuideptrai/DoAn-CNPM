import { useCallback, useEffect, useState } from "react";
import { useFocusEffect, useLocalSearchParams } from "expo-router";
import {
  ActivityIndicator,
  Modal,
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

type FallbackChoice = "accepted" | "dismissed";

export default function ArtifactDetailScreen() {
  const { slug: requestedSlug } = useLocalSearchParams<{ slug: string }>();
  const slug = Array.isArray(requestedSlug) ? requestedSlug[0] : requestedSlug;
  const { language, setLanguage, storageError } = useLanguage();
  const { colors } = useTheme();
  const sharedStyles = createSharedStyles(colors);
  const styles = createStyles(colors);
  const { favoriteSlugs, recordViewed, toggleFavorite } = useLocalData();
  const fallbackKey = `${slug ?? ""}\u0000${language}`;
  const [fallbackChoice, setFallbackChoice] = useState<{
    key: string;
    choice: FallbackChoice;
  } | null>(null);
  const currentFallbackChoice =
    fallbackChoice?.key === fallbackKey ? fallbackChoice : null;
  const showingEnglishFallback =
    currentFallbackChoice?.choice === "accepted";
  const contentLanguage = showingEnglishFallback ? "en" : language;
  const { state, isNotFound, retry } = useArtifact(slug, contentLanguage);
  const artifact = state.status === "success" ? state.data : null;
  const translation = artifact?.translation;
  const isFavorite = slug ? favoriteSlugs.includes(slug) : false;
  const speech = useSpeech(
    translation?.content ?? "",
    translation?.language_code ?? contentLanguage,
  );
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
        <Text style={styles.feedbackText}>Đang tải thuyết minh...</Text>
      </View>
    );
  }

  if (state.status === "error") {
    return (
      <View style={[sharedStyles.screen, styles.errorState]}>
        <EmptyState
          title={isNotFound ? "Không tìm thấy hiện vật" : "Không thể tải hiện vật"}
          message={
            isNotFound
              ? `Không có hiện vật với mã "${slug ?? ""}".`
              : state.error.message
          }
        />
        {!isNotFound ? (
          <Pressable
            accessibilityRole="button"
            onPress={retry}
            style={styles.retryButton}
          >
            <Text style={styles.retryButtonText}>Thử lại</Text>
          </Pressable>
        ) : null}
      </View>
    );
  }

  if (!artifact) {
    return null;
  }

  if (!translation) {
    const hasEnglish = artifact.available_languages.includes("en");
    const canOfferEnglish =
      !showingEnglishFallback &&
      hasEnglish &&
      currentFallbackChoice?.choice !== "dismissed";

    return (
      <>
        <ScrollView contentContainerStyle={styles.content}>
          <ArtifactImage
            accessibilityLabel={`Ảnh hiện vật ${artifact.slug}`}
            source={artifact.image_url}
            style={styles.image}
          />
          <EmptyState
            title={
              hasEnglish
                ? `Chưa có thuyết minh bằng ${getLanguageLabel(language)}`
                : "Nội dung chưa khả dụng"
            }
            message={
              hasEnglish
                ? `Hiện vật này chưa có nội dung bằng ${getLanguageLabel(
                    language,
                  )}. Nội dung hiện có: ${artifact.available_languages
                    .map(getLanguageLabel)
                    .join(", ")}.`
                : `Hiện chưa có nội dung bằng ${getLanguageLabel(
                    language,
                  )} hoặc tiếng Anh cho hiện vật này.`
            }
          />
          <LanguageSelector
            language={language}
            onChange={setLanguage}
            storageError={storageError}
          />
          <FavoriteButton
            isFavorite={isFavorite}
            onPress={() => slug && toggleFavorite(slug)}
          />
        </ScrollView>
        {canOfferEnglish ? (
          <EnglishFallbackDialog
            onAccept={() =>
              setFallbackChoice({ key: fallbackKey, choice: "accepted" })
            }
            onCancel={() =>
              setFallbackChoice({ key: fallbackKey, choice: "dismissed" })
            }
          />
        ) : null}
      </>
    );
  }

  const paragraphs = splitIntoParagraphs(translation.content);

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <ArtifactImage
        accessibilityLabel={`Ảnh hiện vật ${translation.title}`}
        source={artifact.image_url}
        style={styles.image}
      />
      <LanguageSelector
        language={language}
        onChange={setLanguage}
        storageError={storageError}
      />
      <FavoriteButton
        isFavorite={isFavorite}
        onPress={() => slug && toggleFavorite(slug)}
      />
      {showingEnglishFallback ? (
        <Text style={styles.fallbackNotice} accessibilityRole="note">
          Đang hiển thị nội dung tiếng Anh. Lựa chọn ngôn ngữ của bạn vẫn là{" "}
          {getLanguageLabel(language)}.
        </Text>
      ) : null}
      <Text style={styles.languageTag}>
        {getLanguageLabel(translation.language_code)}
      </Text>
      <Text
        style={styles.title}
      >
        {translation.title}
      </Text>
      <Text style={styles.summary}>
        {translation.summary}
      </Text>
      <View style={styles.speechControls}>
        {speech.voiceAvailability === "unavailable" ? (
          <View style={styles.speechUnavailable}>
            <Text style={styles.speechMessage} accessibilityRole="alert">
              Hiện giờ chưa có voice
            </Text>
            <Text style={styles.speechMessage}>
              Thiết bị chưa cài giọng đọc{" "}
              {getLanguageLabel(translation.language_code)}. Bạn vẫn có thể đọc
              nội dung bên dưới.
            </Text>
            <Pressable
              accessibilityRole="button"
              onPress={speech.recheckVoice}
              style={styles.recheckButton}
            >
              <Text style={styles.recheckButtonText}>
                Kiểm tra lại giọng đọc
              </Text>
            </Pressable>
          </View>
        ) : speech.status === "idle" ? (
          <Pressable
            accessibilityLabel={`Nghe thuyết minh bằng ${getLanguageLabel(
              translation.language_code,
            )}`}
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
                ? "Đang kiểm tra giọng đọc..."
                : "▶  Nghe thuyết minh"}
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
                <Text style={styles.speechButtonText}>▶  Tiếp tục</Text>
              </Pressable>
            ) : (
              <Pressable
                accessibilityRole="button"
                onPress={speech.pause}
                style={styles.speechButton}
              >
                <Text style={styles.speechButtonText}>Ⅱ  Tạm dừng</Text>
              </Pressable>
            )}
            <Pressable
              accessibilityRole="button"
              onPress={speech.stop}
              style={styles.stopButton}
            >
              <Text style={styles.stopButtonText}>Dừng</Text>
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
  const styles = createStyles(colors);

  return (
    <Pressable
      accessibilityLabel={
        isFavorite ? "Bỏ khỏi danh sách yêu thích" : "Thêm vào danh sách yêu thích"
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
        {isFavorite ? "♥  Đã yêu thích" : "♡  Thêm yêu thích"}
      </Text>
    </Pressable>
  );
}

interface EnglishFallbackDialogProps {
  onAccept: () => void;
  onCancel: () => void;
}

function EnglishFallbackDialog({
  onAccept,
  onCancel,
}: EnglishFallbackDialogProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <Modal
      animationType="fade"
      onRequestClose={onCancel}
      transparent
      visible
    >
      <View style={styles.dialogBackdrop}>
        <View
          accessibilityViewIsModal
          style={styles.dialogCard}
        >
          <Text accessibilityRole="header" style={styles.dialogTitle}>
            Chưa có bản dịch
          </Text>
          <Text style={styles.dialogMessage}>
            Hiện chưa có nội dung bằng ngôn ngữ bạn chọn. Bạn có muốn xem nội
            dung bằng tiếng Anh không?
          </Text>
          <View style={styles.dialogActions}>
            <Pressable
              accessibilityRole="button"
              onPress={onAccept}
              style={styles.dialogPrimaryButton}
            >
              <Text style={styles.dialogPrimaryButtonText}>Xem tiếng Anh</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={onCancel}
              style={styles.dialogSecondaryButton}
            >
              <Text style={styles.dialogSecondaryButtonText}>Hủy</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

interface LanguageSelectorProps {
  language: Language;
  onChange: (language: Language) => Promise<void>;
  storageError: string | null;
}

function LanguageSelector({
  language,
  onChange,
  storageError,
}: LanguageSelectorProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <View style={styles.languageSelector}>
      <Text style={styles.languageSelectorLabel}>Ngôn ngữ thuyết minh</Text>
      <View style={styles.languageOptions}>
        {languages.map((item) => {
          const isSelected = item.code === language;
          return (
            <Pressable
              accessibilityRole="radio"
              accessibilityState={{ checked: isSelected }}
              key={item.code}
              onPress={() => void onChange(item.code)}
              style={[
                styles.languageOption,
                isSelected && styles.selectedLanguageOption,
              ]}
            >
              <Text
                style={[
                  styles.languageOptionText,
                  isSelected && styles.selectedLanguageOptionText,
                ]}
              >
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
      {storageError ? (
        <Text style={styles.storageError} accessibilityRole="alert">
          {storageError}
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
    fallbackNotice: {
      marginBottom: 14,
      padding: 12,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 10,
      backgroundColor: colors.highlight,
      color: colors.ink,
      fontSize: 14,
      lineHeight: 20,
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
    speechUnavailable: {
      gap: 8,
    },
    recheckButton: {
      minHeight: 44,
      alignSelf: "flex-start",
      justifyContent: "center",
      marginTop: 4,
      paddingHorizontal: 14,
      borderWidth: 1,
      borderColor: colors.primary,
      borderRadius: 10,
      backgroundColor: colors.paper,
    },
    recheckButtonText: {
      color: colors.primary,
      fontSize: 14,
      fontWeight: "700",
    },
    speechError: {
      marginTop: 10,
      color: colors.error,
      fontSize: 14,
      lineHeight: 20,
    },
    dialogBackdrop: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      padding: 20,
      backgroundColor: "rgba(18, 32, 25, 0.58)",
    },
    dialogCard: {
      width: "100%",
      maxWidth: 520,
      padding: 26,
      borderRadius: 16,
      backgroundColor: colors.paper,
    },
    dialogTitle: {
      marginBottom: 10,
      color: colors.ink,
      fontSize: 24,
      fontWeight: "700",
      lineHeight: 30,
    },
    dialogMessage: {
      color: colors.muted,
      fontSize: 16,
      lineHeight: 24,
    },
    dialogActions: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 10,
      marginTop: 24,
    },
    dialogPrimaryButton: {
      minHeight: 48,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 18,
      borderRadius: 10,
      backgroundColor: colors.primary,
    },
    dialogPrimaryButtonText: {
      color: colors.paper,
      fontSize: 15,
      fontWeight: "700",
    },
    dialogSecondaryButton: {
      minHeight: 48,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 18,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 10,
      backgroundColor: colors.paper,
    },
    dialogSecondaryButtonText: {
      color: colors.ink,
      fontSize: 15,
      fontWeight: "700",
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
