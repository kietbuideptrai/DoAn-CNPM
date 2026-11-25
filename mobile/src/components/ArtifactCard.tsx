import { Pressable, StyleSheet, Text, View } from "react-native";
import type { ArtifactListItem } from "../../../shared/types";
import { ArtifactImage } from "@/components/ArtifactImage";
import { useTheme } from "@/theme";
import { useTranslation } from "@/utils/i18n";

interface ArtifactCardProps {
  artifact: ArtifactListItem;
  onPress: () => void;
}

export function ArtifactCard({ artifact, onPress }: ArtifactCardProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const styles = createStyles(colors);

  return (
    <Pressable
      accessibilityHint={t("openArtifactHint")}
      accessibilityLabel={`${artifact.title}. ${artifact.summary}`}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <ArtifactImage
        accessibilityLabel={t("artifactImage", { name: artifact.title })}
        source={artifact.image_url}
        style={styles.image}
      />
      <View style={styles.content}>
        <Text style={styles.title}>{artifact.title}</Text>
        <Text style={styles.summary} numberOfLines={3}>
          {artifact.summary}
        </Text>
        <Text style={styles.linkText}>{t("viewNarration")}</Text>
      </View>
    </Pressable>
  );
}

function createStyles(colors: ReturnType<typeof useTheme>["colors"]) {
  return StyleSheet.create({
  card: {
    overflow: "hidden",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    backgroundColor: colors.paper,
  },
  pressed: {
    opacity: 0.82,
  },
  image: {
    width: "100%",
    height: 190,
    backgroundColor: colors.highlight,
  },
  content: {
    padding: 16,
  },
  title: {
    marginBottom: 7,
    color: colors.ink,
    fontSize: 19,
    fontWeight: "700",
  },
  summary: {
    marginBottom: 15,
    color: colors.muted,
    fontSize: 14,
    lineHeight: 21,
  },
  linkText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "700",
  },
  });
}
