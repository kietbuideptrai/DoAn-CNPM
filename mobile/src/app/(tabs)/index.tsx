import { Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { Screen } from "@/components/Screen";
import { colors, styles } from "@/theme";

export default function HomeScreen() {
  return (
    <Screen title="Trang chủ">
      <Text style={styles.bodyText}>
        Khám phá hiện vật, quét mã QR và nghe thuyết minh bằng ngôn ngữ bạn chọn.
      </Text>
      <View style={homeStyles.heroActions}>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push("/artifacts")}
          style={({ pressed }) => [
            homeStyles.primaryAction,
            pressed && homeStyles.pressed,
          ]}
        >
          <Text style={homeStyles.primaryActionText}>Khám phá hiện vật</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push("/scan")}
          style={({ pressed }) => [
            homeStyles.secondaryAction,
            pressed && homeStyles.pressed,
          ]}
        >
          <Text style={homeStyles.secondaryActionText}>Quét mã QR</Text>
        </Pressable>
      </View>
      <Text style={homeStyles.sectionTitle}>Công cụ bổ sung</Text>
      <View style={homeStyles.actions}>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push("/translate")}
          style={({ pressed }) => [
            homeStyles.action,
            pressed && homeStyles.pressed,
          ]}
        >
          <Text style={homeStyles.actionTitle}>Dịch cụm từ</Text>
          <Text style={homeStyles.actionDescription}>
            Thử các cụm từ tiếng Anh và tiếng Việt thông dụng.
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
          <Text style={homeStyles.actionTitle}>Lịch sử bản dịch</Text>
          <Text style={homeStyles.actionDescription}>
            Xem các cụm từ đã dịch trên thiết bị này.
          </Text>
        </Pressable>
      </View>
    </Screen>
  );
}

const homeStyles = StyleSheet.create({
  heroActions: {
    gap: 10,
    marginTop: 24,
    marginBottom: 32,
  },
  primaryAction: {
    minHeight: 52,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    backgroundColor: colors.primary,
  },
  primaryActionText: {
    color: colors.paper,
    fontSize: 16,
    fontWeight: "700",
  },
  secondaryAction: {
    minHeight: 52,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 12,
    backgroundColor: colors.paper,
  },
  secondaryActionText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: "700",
  },
  sectionTitle: {
    marginBottom: 12,
    color: colors.ink,
    fontSize: 17,
    fontWeight: "700",
  },
  actions: {
    gap: 12,
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
