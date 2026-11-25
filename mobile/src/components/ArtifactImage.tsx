import { useState } from "react";
import {
  Image,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { ImageStyle, StyleProp } from "react-native";
import { useTheme } from "@/theme";

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
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [hasLoadError, setHasLoadError] = useState(false);
  const isRightsPlaceholder =
    source === "/images/artifacts/museum-placeholder.svg";

  if (hasLoadError || isRightsPlaceholder) {
    return (
      <View
        accessibilityLabel={accessibilityLabel}
        accessibilityRole="image"
        style={[style, styles.placeholder]}
      >
        <Text style={styles.placeholderMark}>◇</Text>
        <Text style={styles.placeholderText}>
          {isRightsPlaceholder
            ? "Ảnh chờ xác nhận quyền sử dụng"
            : "Không tải được ảnh hiện vật"}
        </Text>
      </View>
    );
  }

  return (
    <Image
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="image"
      onError={() => setHasLoadError(true)}
      resizeMode="cover"
      source={{ uri: source }}
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
