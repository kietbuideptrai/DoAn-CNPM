import { useState } from "react";
import {
  Image,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type {
  ImageSourcePropType,
  ImageStyle,
  StyleProp,
} from "react-native";
import { useTheme } from "@/theme";
import { useTranslation } from "@/utils/i18n";

const localArtifactImages: Record<string, ImageSourcePropType> = {
  "/images/artifacts/uh-1-huey.png": require("../../assets/artifacts/uh-1-huey.png"),
  "/images/artifacts/f-5a-fighter.png": require("../../assets/artifacts/f-5a-fighter.png"),
  "/images/artifacts/m48-patton.png": require("../../assets/artifacts/m48-patton.png"),
  "/images/artifacts/a-1-skyraider.png": require("../../assets/artifacts/a-1-skyraider.png"),
  "/images/artifacts/guillotine.png": require("../../assets/artifacts/guillotine.png"),
  "/images/artifacts/con-dao-tiger-cage.png": require("../../assets/artifacts/con-dao-tiger-cage.png"),
  "/images/artifacts/blu-82-bomb.png": require("../../assets/artifacts/blu-82-bomb.png"),
  "/images/artifacts/artillery-155mm.png": require("../../assets/artifacts/artillery-155mm.png"),
};

interface ArtifactImageProps {
  accessibilityLabel: string;
  source: string;
  style: StyleProp<ImageStyle>;
}

export function ArtifactImage({
  accessibilityLabel,
  source,
  style,
}: ArtifactImageProps) {
  const [hasLoadError, setHasLoadError] = useState(false);
  const { colors } = useTheme();
  const { t } = useTranslation();
  const styles = createStyles(colors);

  if (hasLoadError) {
    return (
      <View
        accessibilityLabel={accessibilityLabel}
        accessibilityRole="image"
        style={[style, styles.placeholder]}
      >
        <Text style={styles.placeholderMark}>◇</Text>
        <Text style={styles.placeholderText}>{t("imageLoadError")}</Text>
      </View>
    );
  }

  return (
    <Image
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="image"
      onError={() => setHasLoadError(true)}
      resizeMode="cover"
      source={localArtifactImages[source] ?? { uri: source }}
      style={style}
    />
  );
}

function createStyles(colors: ReturnType<typeof useTheme>["colors"]) {
  return StyleSheet.create({
  placeholder: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.highlight,
  },
  placeholderMark: {
    marginBottom: 8,
    color: colors.muted,
    fontSize: 28,
  },
  placeholderText: {
    color: colors.muted,
    fontSize: 13,
    textAlign: "center",
  },
  });
}
