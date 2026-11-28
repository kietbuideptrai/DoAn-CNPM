import { Link } from "expo-router";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { groupMapArtifacts } from "../../../../shared/mapGroups";
import type {
  MapArtifactGroup,
  NumberedMapArtifact,
} from "../../../../shared/mapGroups";
import {
  MUSEUM_MAP_HEIGHT,
  MUSEUM_MAP_WIDTH,
} from "../../../../shared/demoMuseumMap";
import type { MuseumMapData, MuseumZone } from "../../../../shared/types";
import { EmptyState } from "@/components/EmptyState";
import { useLanguage } from "@/context/LanguageContext";
import { useMuseumMap } from "@/hooks/useMuseumMap";
import { createSharedStyles, useTheme } from "@/theme";
import { useTranslation } from "@/utils/i18n";

const PIN_SIZE = 40;

export default function MapScreen() {
  const { language } = useLanguage();
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const sharedStyles = createSharedStyles(colors);
  const { state, isRetrying, retry } = useMuseumMap(language);

  return (
    <SafeAreaView edges={["top"]} style={sharedStyles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={sharedStyles.screenTitle}>{t("map")}</Text>
        <Text style={styles.intro}>{t("mapIntro")}</Text>

        {state.status === "loading" ? (
          <View style={styles.feedback}>
            <ActivityIndicator color={colors.primary} size="large" />
            <Text accessibilityLiveRegion="polite" style={styles.feedbackText}>
              {t("loadingMap")}
            </Text>
          </View>
        ) : state.status === "error" ? (
          <View accessibilityRole="alert" style={styles.errorState}>
            <EmptyState
              title={t("cannotLoadMap")}
              message={state.error.message || t("mapLoadError")}
            />
            <Pressable
              accessibilityRole="button"
              disabled={isRetrying}
              onPress={retry}
              style={styles.retryButton}
            >
              <Text style={styles.retryButtonText}>
                {isRetrying ? t("loadingMap") : t("retry")}
              </Text>
            </Pressable>
          </View>
        ) : (
          <MapContent data={state.data} />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function MapContent({ data }: { data: MuseumMapData }) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const { t } = useTranslation();
  const { groups, items } = groupMapArtifacts(data);

  return (
    <>
      <MuseumDiagram zones={data.zones} items={items} />

      {data.unplaced_artifacts && data.unplaced_artifacts.length > 0 ? (
        <Text accessibilityLiveRegion="polite" style={styles.unplacedNote}>
          {t("mapUnplaced")}:{" "}
          {data.unplaced_artifacts
            .map((artifact) => artifact.title)
            .join(", ")}
        </Text>
      ) : null}

      <Text accessibilityRole="header" style={styles.sectionTitle}>
        {t("mapArtifactsByZone")}
      </Text>

      {groups.length === 0 ? (
        <EmptyState title={t("map")} message={t("mapNoArtifacts")} />
      ) : (
        groups.map((group) => (
          <ZoneArtifactGroup group={group} key={zoneGroupKey(group)} />
        ))
      )}
    </>
  );
}

function MuseumDiagram({
  zones,
  items,
}: {
  zones: MuseumZone[];
  items: NumberedMapArtifact[];
}) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const { t } = useTranslation();
  const sortedZones = zones
    .slice()
    .sort((first, second) => first.sort_order - second.sort_order);

  return (
    <View accessibilityLabel={t("map")} style={styles.mapFrame}>
      {sortedZones.map((zone) => (
        <View
          key={zone.id}
          style={[
            styles.zone,
            {
              backgroundColor: zone.color,
              height: asPercent(zone.height, MUSEUM_MAP_HEIGHT),
              left: asPercent(zone.x, MUSEUM_MAP_WIDTH),
              top: asPercent(zone.y, MUSEUM_MAP_HEIGHT),
              width: asPercent(zone.width, MUSEUM_MAP_WIDTH),
            },
          ]}
        >
          <Text
            accessibilityLabel={t("mapZoneLabel", { name: zone.name })}
            accessibilityRole="header"
            accessible
            numberOfLines={2}
            style={styles.zoneLabel}
          >
            {zone.short_name}
          </Text>
        </View>
      ))}

      {items.map(({ artifact, number, zone }) => (
        <Link
          asChild
          href={{
            pathname: "/artifacts/[slug]",
            params: { slug: artifact.slug },
          }}
          key={artifact.slug}
        >
          <Pressable
            accessibilityLabel={t("mapPinLabel", {
              number,
              title: artifact.title,
              zone: zone?.name ?? t("mapOtherZones"),
            })}
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.pin,
              {
                left: asPercent(artifact.x, MUSEUM_MAP_WIDTH),
                top: asPercent(artifact.y, MUSEUM_MAP_HEIGHT),
              },
              pressed && styles.pinPressed,
            ]}
          >
            <Text style={styles.pinText}>{number}</Text>
          </Pressable>
        </Link>
      ))}
    </View>
  );
}

function ZoneArtifactGroup({ group }: { group: MapArtifactGroup }) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const { t } = useTranslation();

  return (
    <View style={styles.group}>
      <Text accessibilityRole="header" style={styles.groupTitle}>
        {group.title}
      </Text>
      {group.items.map(({ artifact, number }) => (
        <Link
          asChild
          href={{
            pathname: "/artifacts/[slug]",
            params: { slug: artifact.slug },
          }}
          key={artifact.slug}
        >
          <Pressable
            accessibilityLabel={t("mapOpenArtifact", { title: artifact.title })}
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.row,
              pressed && styles.rowPressed,
            ]}
          >
            <View style={styles.numberBadge}>
              <Text style={styles.numberBadgeText}>{number}</Text>
            </View>
            <View style={styles.rowText}>
              <Text numberOfLines={2} style={styles.rowTitle}>
                {artifact.title}
              </Text>
              {artifact.summary ? (
                <Text numberOfLines={2} style={styles.rowSummary}>
                  {artifact.summary}
                </Text>
              ) : null}
            </View>
            <Text style={styles.arrow}>›</Text>
          </Pressable>
        </Link>
      ))}
    </View>
  );
}

function zoneGroupKey(group: MapArtifactGroup): string {
  return group.zone?.id ?? "khac";
}

function asPercent(value: number, total: number): string {
  return `${(value / total) * 100}%`;
}

function createStyles(colors: ReturnType<typeof useTheme>["colors"]) {
  return StyleSheet.create({
    content: {
      paddingHorizontal: 20,
      paddingTop: 20,
      paddingBottom: 32,
    },
    intro: {
      marginBottom: 18,
      color: colors.muted,
      fontSize: 14,
      lineHeight: 21,
    },
    mapFrame: {
      aspectRatio: MUSEUM_MAP_WIDTH / MUSEUM_MAP_HEIGHT,
      width: "100%",
      marginBottom: 8,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      backgroundColor: colors.paper,
      overflow: "hidden",
    },
    zone: {
      position: "absolute",
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 4,
      borderWidth: 1,
      borderColor: "rgba(32, 49, 44, 0.12)",
      borderRadius: 6,
    },
    zoneLabel: {
      color: "#20312C",
      fontSize: 11,
      fontWeight: "700",
      textAlign: "center",
    },
    pin: {
      position: "absolute",
      width: PIN_SIZE,
      height: PIN_SIZE,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 2,
      borderColor: colors.paper,
      borderRadius: PIN_SIZE / 2,
      backgroundColor: colors.primary,
      transform: [
        { translateX: -PIN_SIZE / 2 },
        { translateY: -PIN_SIZE / 2 },
      ],
      zIndex: 2,
    },
    pinPressed: {
      opacity: 0.8,
    },
    pinText: {
      color: colors.paper,
      fontSize: 14,
      fontWeight: "700",
    },
    unplacedNote: {
      marginBottom: 16,
      color: colors.muted,
      fontSize: 13,
      lineHeight: 19,
    },
    sectionTitle: {
      marginTop: 18,
      marginBottom: 12,
      color: colors.ink,
      fontSize: 18,
      fontWeight: "700",
    },
    group: {
      marginBottom: 16,
    },
    groupTitle: {
      marginBottom: 8,
      color: colors.primary,
      fontSize: 14,
      fontWeight: "700",
    },
    row: {
      minHeight: 60,
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      marginBottom: 8,
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      backgroundColor: colors.paper,
    },
    rowPressed: {
      backgroundColor: colors.highlight,
    },
    numberBadge: {
      width: 28,
      height: 28,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 14,
      backgroundColor: colors.highlight,
    },
    numberBadgeText: {
      color: colors.primary,
      fontSize: 13,
      fontWeight: "700",
    },
    rowText: {
      flex: 1,
    },
    rowTitle: {
      color: colors.ink,
      fontSize: 15,
      fontWeight: "600",
    },
    rowSummary: {
      marginTop: 2,
      color: colors.muted,
      fontSize: 12,
      lineHeight: 17,
    },
    arrow: {
      color: colors.muted,
      fontSize: 22,
    },
    feedback: {
      minHeight: 180,
      alignItems: "center",
      justifyContent: "center",
      gap: 12,
    },
    feedbackText: {
      color: colors.muted,
      fontSize: 15,
    },
    errorState: {
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
  });
}
