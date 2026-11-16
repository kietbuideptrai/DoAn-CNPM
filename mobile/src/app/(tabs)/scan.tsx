import { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CameraView, useCameraPermissions } from "expo-camera";
import { router, useFocusEffect } from "expo-router";
import { EmptyState } from "@/components/EmptyState";
import { createSharedStyles, useTheme } from "@/theme";
import { parseArtifactSlug } from "@/utils/qr";
import { useTranslation } from "@/utils/i18n";

export default function ScanScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const styles = createStyles(colors);
  const sharedStyles = createSharedStyles(colors);
  const [permission, requestPermission] = useCameraPermissions();
  const [isScreenFocused, setIsScreenFocused] = useState(false);
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [isScanned, setIsScanned] = useState(false);
  const didHandleScan = useRef(false);

  useFocusEffect(
    useCallback(() => {
      setIsScreenFocused(true);
      didHandleScan.current = false;
      setScanError(null);
      setIsScanned(false);
      return () => setIsScreenFocused(false);
    }, []),
  );

  async function handleRequestPermission() {
    setIsRequestingPermission(true);
    setPermissionError(null);

    try {
      await requestPermission();
    } catch {
      setPermissionError(t("cameraPermissionRequestError"));
    } finally {
      setIsRequestingPermission(false);
    }
  }

  async function handleOpenSettings() {
    setPermissionError(null);

    try {
      await Linking.openSettings();
    } catch {
      setPermissionError(t("openSettingsError"));
    }
  }

  function handleBarcodeScanned(data: string) {
    if (didHandleScan.current) {
      return;
    }

    didHandleScan.current = true;
    setIsScanned(true);
    const slug = parseArtifactSlug(data);

    if (!slug) {
      setScanError(t("invalidQr"));
      return;
    }

    router.push({
      pathname: "/artifacts/[slug]",
      params: { slug },
    });
  }

  function handleScanAgain() {
    didHandleScan.current = false;
    setScanError(null);
    setIsScanned(false);
  }

  if (!permission) {
    return (
      <SafeAreaView edges={["top"]} style={sharedStyles.screen}>
        <View style={styles.permissionState}>
          <ActivityIndicator color={colors.primary} size="large" />
          <Text style={styles.permissionText}>{t("cameraChecking")}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    const canAskAgain = permission.canAskAgain;

    return (
      <SafeAreaView edges={["top"]} style={sharedStyles.screen}>
        <Text style={sharedStyles.screenTitle}>{t("scanQr")}</Text>
        <EmptyState
          title={t("cameraPermissionTitle")}
          message={
            canAskAgain
              ? t("cameraPermissionAsk")
              : t("cameraPermissionDenied")
          }
        />
        {permissionError ? (
          <Text style={styles.errorText} accessibilityRole="alert">
            {permissionError}
          </Text>
        ) : null}
        <Pressable
          accessibilityRole="button"
          disabled={isRequestingPermission}
          onPress={canAskAgain ? handleRequestPermission : handleOpenSettings}
          style={({ pressed }) => [
            styles.primaryButton,
            pressed && styles.buttonPressed,
            isRequestingPermission && styles.buttonDisabled,
          ]}
        >
          {isRequestingPermission ? (
            <ActivityIndicator color={colors.paper} />
          ) : (
            <Text style={styles.primaryButtonText}>
              {canAskAgain ? t("cameraPermission") : t("openSettings")}
            </Text>
          )}
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["top"]} style={sharedStyles.screen}>
      <Text style={sharedStyles.screenTitle}>{t("scanQr")}</Text>
      <Text style={styles.instruction}>
        {t("scanInstruction")}
      </Text>
      <View style={styles.cameraFrame}>
        <CameraView
          active={isScreenFocused && !isScanned}
          barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
          onBarcodeScanned={({ data }) => handleBarcodeScanned(data)}
          facing="back"
          style={styles.camera}
        />
        <View pointerEvents="none" style={styles.scanFrame}>
          <View style={styles.scanCornerTopLeft} />
          <View style={styles.scanCornerTopRight} />
          <View style={styles.scanCornerBottomLeft} />
          <View style={styles.scanCornerBottomRight} />
        </View>
      </View>
      {scanError ? (
        <View style={styles.errorCard} accessibilityLiveRegion="polite">
          <Text style={styles.errorText} accessibilityRole="alert">
            {scanError}
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={handleScanAgain}
            style={({ pressed }) => [
              styles.secondaryButton,
              pressed && styles.buttonPressed,
            ]}
          >
            <Text style={styles.secondaryButtonText}>{t("scanAgain")}</Text>
          </Pressable>
        </View>
      ) : (
        <Text style={styles.cameraHint}>{t("validQrHint")}</Text>
      )}
    </SafeAreaView>
  );
}

function createStyles(colors: ReturnType<typeof useTheme>["colors"]) {
return StyleSheet.create({
  permissionState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
  },
  permissionText: {
    color: colors.muted,
    fontSize: 15,
  },
  instruction: {
    marginBottom: 18,
    color: colors.muted,
    fontSize: 15,
    lineHeight: 22,
  },
  cameraFrame: {
    width: "100%",
    maxWidth: 500,
    height: 390,
    maxHeight: "58%",
    alignSelf: "center",
    overflow: "hidden",
    borderRadius: 18,
    backgroundColor: "#18221E",
  },
  camera: {
    flex: 1,
  },
  scanFrame: {
    position: "absolute",
    top: "25%",
    right: "12%",
    bottom: "25%",
    left: "12%",
  },
  scanCornerTopLeft: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 42,
    height: 42,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderColor: colors.paper,
    borderTopLeftRadius: 13,
  },
  scanCornerTopRight: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 42,
    height: 42,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderColor: colors.paper,
    borderTopRightRadius: 13,
  },
  scanCornerBottomLeft: {
    position: "absolute",
    bottom: 0,
    left: 0,
    width: 42,
    height: 42,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderColor: colors.paper,
    borderBottomLeftRadius: 13,
  },
  scanCornerBottomRight: {
    position: "absolute",
    right: 0,
    bottom: 0,
    width: 42,
    height: 42,
    borderRightWidth: 4,
    borderBottomWidth: 4,
    borderColor: colors.paper,
    borderBottomRightRadius: 13,
  },
  cameraHint: {
    marginTop: 18,
    color: colors.muted,
    fontSize: 14,
    textAlign: "center",
  },
  errorCard: {
    marginTop: 18,
    padding: 16,
    borderRadius: 12,
    backgroundColor: colors.errorBackground,
  },
  errorText: {
    color: colors.error,
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
  },
  primaryButton: {
    minHeight: 48,
    marginTop: 20,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    backgroundColor: colors.primary,
  },
  primaryButtonText: {
    color: colors.paper,
    fontSize: 15,
    fontWeight: "700",
  },
  secondaryButton: {
    minHeight: 42,
    marginTop: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 9,
    backgroundColor: colors.paper,
  },
  secondaryButtonText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "700",
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
}
