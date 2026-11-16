import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import type { Language } from "../../../shared/types";
import { LanguageProvider, useLanguage } from "@/context/LanguageContext";
import { LocalDataProvider, useLocalData } from "@/context/LocalDataContext";
import { createSharedStyles, ThemeProvider, useTheme } from "@/theme";
import { useTranslation } from "@/utils/i18n";
import { languages } from "@/utils/languages";

function AppNavigator() {
  const { isLoading, language, setLanguage } = useLanguage();
  const { t } = useTranslation();
  const { isLoading: isLocalDataLoading } = useLocalData();
  const { colors, isLoading: isThemeLoading, mode } = useTheme();
  const sharedStyles = createSharedStyles(colors);
  const [startupState, setStartupState] = useState<
    "selecting" | "saving" | "welcome" | "ready"
  >("selecting");
  const [selectedLanguage, setSelectedLanguage] = useState<Language>("vi");
  const welcomeAnimation = useRef(new Animated.Value(0)).current;
  const isChoosingLanguage = useRef(false);
  const startupStyles = createStartupStyles(colors);

  useEffect(() => {
    if (!isLoading) {
      setSelectedLanguage(language);
    }
  }, [isLoading, language]);

  useEffect(() => {
    if (startupState !== "welcome") {
      return;
    }

    welcomeAnimation.setValue(0);
    Animated.timing(welcomeAnimation, {
      toValue: 1,
      duration: 650,
      useNativeDriver: false,
    }).start();

    const timeout = setTimeout(() => setStartupState("ready"), 2200);
    return () => clearTimeout(timeout);
  }, [startupState, welcomeAnimation]);

  async function handleConfirmLanguage() {
    if (isChoosingLanguage.current) {
      return;
    }

    isChoosingLanguage.current = true;
    setStartupState("saving");
    try {
      await setLanguage(selectedLanguage);
      setStartupState("welcome");
    } finally {
      isChoosingLanguage.current = false;
    }
  }

  if (isLoading || isLocalDataLoading || isThemeLoading) {
    return (
      <View
        style={[
          sharedStyles.screen,
          { alignItems: "center", justifyContent: "center" },
        ]}
      >
        <ActivityIndicator color={colors.primary} size="large" />
        <Text accessibilityRole="text" style={{ color: colors.muted }}>
          {t("loadingApp")}
        </Text>
      </View>
    );
  }

  if (startupState === "selecting" || startupState === "saving") {
    return (
      <SafeAreaView style={startupStyles.screen}>
        <StatusBar style={mode === "dark" ? "light" : "dark"} />
        <ScrollView
          contentContainerStyle={startupStyles.content}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={startupStyles.title}>{t("startupPrompt")}</Text>
          <View style={startupStyles.languageList}>
            {languages.map((item) => {
              const isSelected = selectedLanguage === item.code;
              return (
                  <Pressable
                    accessibilityRole="radio"
                    accessibilityState={{
                      checked: isSelected,
                      disabled: startupState === "saving",
                    }}
                    disabled={startupState === "saving"}
                    key={item.code}
                    onPress={() => setSelectedLanguage(item.code)}
                    style={({ pressed }) => [
                      startupStyles.languageOption,
                      isSelected && startupStyles.selectedLanguageOption,
                      pressed && startupStyles.pressed,
                    ]}
                  >
                    <Text
                      style={[
                        startupStyles.languageLabel,
                        isSelected && startupStyles.selectedLanguageLabel,
                      ]}
                    >
                      {item.label}
                    </Text>
                    {isSelected ? (
                      <Text style={startupStyles.selectedMark}>✓</Text>
                    ) : null}
                </Pressable>
              );
            })}
          </View>
          <Pressable
            accessibilityRole="button"
            disabled={startupState === "saving"}
            onPress={() => void handleConfirmLanguage()}
            style={({ pressed }) => [
              startupStyles.confirmButton,
              pressed && startupStyles.pressed,
              startupState === "saving" && startupStyles.disabledButton,
            ]}
          >
            {startupState === "saving" ? (
              <ActivityIndicator color={colors.paper} />
            ) : (
              <Text style={startupStyles.confirmButtonText}>
                {t("confirmLanguage")}
              </Text>
            )}
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (startupState === "welcome") {
    return (
      <SafeAreaView style={startupStyles.screen}>
        <StatusBar style={mode === "dark" ? "light" : "dark"} />
        <Animated.View
          accessibilityLiveRegion="polite"
          style={[
            startupStyles.welcomeContent,
            {
              opacity: welcomeAnimation,
              transform: [
                {
                  translateY: welcomeAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [10, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <Text accessibilityRole="header" style={startupStyles.welcomeText}>
            {t("welcomeGreeting")}
          </Text>
        </Animated.View>
      </SafeAreaView>
    );
  }

  return (
    <>
      <StatusBar style={mode === "dark" ? "light" : "dark"} />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.paper },
          headerTintColor: colors.ink,
          headerTitleStyle: { fontWeight: "700" },
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="artifacts/[slug]"
          options={{ title: t("artifactDetails") }}
        />
        <Stack.Screen name="translate" options={{ title: t("translatePhrase") }} />
        <Stack.Screen
          name="translation-history"
          options={{ title: t("translationHistory") }}
        />
      </Stack>
    </>
  );
}

function createStartupStyles(colors: ReturnType<typeof useTheme>["colors"]) {
  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      flexGrow: 1,
      justifyContent: "center",
      paddingHorizontal: 24,
      paddingVertical: 32,
    },
    title: {
      marginBottom: 24,
      color: colors.ink,
      fontSize: 26,
      fontWeight: "800",
      textAlign: "center",
    },
    languageList: {
      overflow: "hidden",
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 14,
      backgroundColor: colors.paper,
    },
    languageOption: {
      minHeight: 56,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 18,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
    },
    selectedLanguageOption: {
      backgroundColor: colors.highlight,
    },
    languageLabel: {
      color: colors.ink,
      fontSize: 17,
    },
    selectedLanguageLabel: {
      color: colors.primary,
      fontWeight: "700",
    },
    selectedMark: {
      color: colors.primary,
      fontSize: 20,
      fontWeight: "700",
    },
    confirmButton: {
      minHeight: 50,
      alignItems: "center",
      justifyContent: "center",
      marginTop: 20,
      borderRadius: 12,
      backgroundColor: colors.primary,
    },
    confirmButtonText: {
      color: colors.paper,
      fontSize: 16,
      fontWeight: "700",
    },
    disabledButton: {
      opacity: 0.7,
    },
    pressed: {
      opacity: 0.75,
    },
    welcomeContent: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 28,
    },
    welcomeText: {
      color: colors.ink,
      fontSize: 28,
      fontWeight: "800",
      lineHeight: 40,
      textAlign: "center",
    },
  });
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <LanguageProvider>
        <LocalDataProvider>
          <ThemeProvider>
            <AppNavigator />
          </ThemeProvider>
        </LocalDataProvider>
      </LanguageProvider>
    </SafeAreaProvider>
  );
}
