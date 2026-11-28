import type {
  MuseumMapArtifact,
  MuseumMapData,
  MuseumZone,
} from "../../../shared/types";

export interface NumberedMapArtifact {
  artifact: MuseumMapArtifact;
  number: number;
  zone: MuseumZone | null;
}

export interface MapArtifactGroup {
  zone: MuseumZone | null;
  title: string;
  items: NumberedMapArtifact[];
}

export interface GroupedMapArtifacts {
  groups: MapArtifactGroup[];
  items: NumberedMapArtifact[];
}

export function groupMapArtifacts(data: MuseumMapData): GroupedMapArtifacts {
  const galleryZones = data.zones
    .filter((zone) => zone.kind === "gallery")
    .slice()
    .sort((first, second) =>
      first.sort_order - second.sort_order || first.id.localeCompare(second.id),
    );
  const assigned = new Set<MuseumMapArtifact>();
  const groups: MapArtifactGroup[] = [];
  const items: NumberedMapArtifact[] = [];
  let nextNumber = 1;

  function addGroup(
    zone: MuseumZone | null,
    title: string,
    candidates: MuseumMapArtifact[],
  ): void {
    const groupItems: NumberedMapArtifact[] = [];
    for (const artifact of candidates) {
      if (assigned.has(artifact)) {
        continue;
      }
      assigned.add(artifact);
      const item = { artifact, number: nextNumber++, zone };
      groupItems.push(item);
      items.push(item);
    }

    if (groupItems.length > 0) {
      groups.push({ zone, title, items: groupItems });
    }
  }

  for (const zone of galleryZones) {
    addGroup(
      zone,
      zone.name,
      data.artifacts.filter((artifact) => artifact.zone_id === zone.id),
    );
  }

  addGroup(
    null,
    "Các khu vực khác",
    data.artifacts.filter((artifact) => !assigned.has(artifact)),
  );

  return { groups, items };
}
