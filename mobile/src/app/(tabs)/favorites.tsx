import { useMemo } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";
import { ArtifactCard } from "@/components/ArtifactCard";
import { EmptyState } from "@/components/EmptyState";
import { Screen } from "@/components/Screen";
import { useLanguage } from "@/context/LanguageContext";
import { useLocalData } from "@/context/LocalDataContext";
import { useArtifacts } from "@/hooks/useArtifacts";
import { useTheme } from "@/theme";
import { useTranslation } from "@/utils/i18n";

export default function FavoritesScreen() {
  const { language } = useLanguage();
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const { favoriteSlugs } = useLocalData();
  const { state, retry } = useArtifacts(language, "");
  const artifactsBySlug = useMemo(
    () =>
      state.status === "success"
        ? new Map(state.data.map((artifact) => [artifact.slug, artifact]))
        : new Map(),
    [state],
  );
  const favorites = favoriteSlugs
    .map((slug) => artifactsBySlug.get(slug))
    .filter((artifact) => artifact !== undefined);

  return (
    <Screen title={t("favorites")}>
      {favoriteSlugs.length === 0 ? (
        <EmptyState
          title={t("favoriteEmptyTitle")}
          message={t("favoriteEmptyMessage")}
        />
      ) : state.status === "loading" ? (
        <View style={styles.feedback}>
          <ActivityIndicator color={colors.primary} size="large" />
          <Text style={styles.message}>{t("loadingFavorites")}</Text>
        </View>
      ) : state.status === "error" ? (
        <View style={styles.feedback}>
          <EmptyState title={t("cannotLoadArtifacts")} message={t("artifactLoadError")} />
          <Pressable
            accessibilityRole="button"
            onPress={retry}
            style={styles.retryButton}
          >
            <Text style={styles.retryButtonText}>{t("retry")}</Text>
          </Pressable>
        </View>
      ) : favorites.length === 0 ? (
        <EmptyState
          title={t("noFavoriteInLanguage")}
          message={t("favoritesNoTranslation")}
        />
      ) : (
        favorites.map((artifact) => (
          <ArtifactCard
            artifact={artifact}
            key={artifact.slug}
            onPress={() =>
              router.push({
                pathname: "/artifacts/[slug]",
                params: { slug: artifact.slug },
              })
            }
          />
        ))
      )}
    </Screen>
  );
}

function createStyles(colors: ReturnType<typeof useTheme>["colors"]) {
return StyleSheet.create({
  feedback: {
    gap: 14,
  },
  message: {
    color: colors.muted,
    fontSize: 15,
    textAlign: "center",
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
});
}
