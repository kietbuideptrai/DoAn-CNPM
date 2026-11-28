import { Link } from "react-router";
import type { MuseumZone } from "../../../shared/types";
import type { NumberedMapArtifact } from "../utils/mapGroups";

interface MuseumMapProps {
  zones: MuseumZone[];
  items: NumberedMapArtifact[];
  search: string;
}

export function MuseumMap({ zones, items, search }: MuseumMapProps) {
  const sortedZones = zones
    .slice()
    .sort((first, second) => first.sort_order - second.sort_order);

  return (
    <div className="map-frame">
      <svg
        aria-label="Sơ đồ bảo tàng một tầng với các phòng trưng bày và vị trí hiện vật"
        className="museum-map-svg"
        role="img"
        viewBox="0 0 1000 600"
      >
        <rect className="map-wall" height={580} rx={10} width={980} x={10} y={10} />
        <rect
          className="map-wall-inner"
          height={564}
          rx={6}
          width={964}
          x={18}
          y={18}
        />
        {sortedZones.map((zone) => (
          <g className={`map-zone map-zone-${zone.kind}`} key={zone.id}>
            <rect
              fill={zone.color}
              height={zone.height}
              rx={8}
              width={zone.width}
              x={zone.x}
              y={zone.y}
            />
            <text
              textAnchor="middle"
              x={zone.x + zone.width / 2}
              y={zone.y + zone.height / 2 + 7}
            >
              {zone.short_name}
            </text>
          </g>
        ))}
        <line className="map-door" x1={470} x2={530} y1={580} y2={580} />
        <text className="map-door-label" textAnchor="middle" x={500} y={598}>
          Cửa vào
        </text>
      </svg>

      {items.map(({ artifact, number, zone }) => (
        <Link
          aria-label={`Ghim ${number}: ${artifact.title}${zone ? ` tại ${zone.name}` : ""}`}
          className="map-pin"
          key={artifact.slug}
          style={{
            left: `${(artifact.x / 1000) * 100}%`,
            top: `${(artifact.y / 600) * 100}%`,
          }}
          to={{
            pathname: `/artifacts/${encodeURIComponent(artifact.slug)}`,
            search,
          }}
        >
          <span aria-hidden="true">{number}</span>
        </Link>
      ))}
    </div>
  );
}
