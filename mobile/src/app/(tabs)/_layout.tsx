import { Tabs } from "expo-router";
import { StyleSheet, Text } from "react-native";
import { useTheme } from "@/theme";
import { useTranslation } from "@/utils/i18n";

const tabSymbols: Record<string, string> = {
  index: "⌂",
  artifacts: "▤",
  scan: "▦",
  favorites: "♡",
  profile: "●",
  map: "◎",
};

export default function TabLayout() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const styles = createStyles(colors);

  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: styles.tabBar,
        tabBarItemStyle: styles.tabItem,
        tabBarLabelStyle: styles.tabLabel,
        tabBarIcon: ({ color, focused }) => (
          <Text
            style={[
              styles.tabSymbol,
              { color },
              focused && styles.tabSymbolFocused,
            ]}
          >
            {tabSymbols[route.name] ?? ""}
          </Text>
        ),
      })}
    >
      <Tabs.Screen name="index" options={{ title: t("home") }} />
      <Tabs.Screen name="artifacts" options={{ title: t("artifacts") }} />
      <Tabs.Screen name="scan" options={{ title: t("scanQr") }} />
      <Tabs.Screen name="favorites" options={{ title: t("favorites") }} />
      <Tabs.Screen name="profile" options={{ title: t("profile") }} />
      <Tabs.Screen name="map" options={{ title: t("map") }} />
    </Tabs>
  );
}

function createStyles(colors: ReturnType<typeof useTheme>["colors"]) {
return StyleSheet.create({
  tabBar: {
    height: 76,
    paddingTop: 8,
    paddingBottom: 8,
    borderTopColor: colors.border,
    backgroundColor: colors.paper,
  },
  tabItem: {
    flex: 1,
    paddingHorizontal: 0,
  },
  tabLabel: {
    fontSize: 9,
    fontWeight: "600",
    textAlign: "center",
  },
  tabSymbol: {
    width: 28,
    height: 28,
    textAlign: "center",
    textAlignVertical: "center",
    fontSize: 23,
  },
  tabSymbolFocused: {
    fontWeight: "700",
  },
});
}
