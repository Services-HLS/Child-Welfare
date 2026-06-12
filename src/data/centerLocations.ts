export interface CenterLocationRecord {
  centerId: string;
  centerName: string;
  village: string;
  district: string;
  lat: number;
  lng: number;
}

export const CENTER_LOCATIONS: Record<string, CenterLocationRecord> = {
  "AWC-TPT-01": {
    centerId: "AWC-TPT-01",
    centerName: "Alipiri Center",
    village: "Alipiri",
    district: "Tirupati",
    lat: 13.6288,
    lng: 79.4192,
  },
  "AWC-TPT-02": {
    centerId: "AWC-TPT-02",
    centerName: "Tiruchanoor Main",
    village: "Tiruchanoor",
    district: "Tirupati",
    lat: 13.6125,
    lng: 79.4533,
  },
  "AWC-TPT-03": {
    centerId: "AWC-TPT-03",
    centerName: "Renigunta Sector",
    village: "Renigunta",
    district: "Tirupati",
    lat: 13.645,
    lng: 79.5122,
  },
};

export function getCenterLocation(centerId: string, fallbackName?: string): CenterLocationRecord {
  const known = CENTER_LOCATIONS[centerId];
  if (known) return known;
  return {
    centerId,
    centerName: fallbackName ?? centerId,
    village: "Assigned village",
    district: "Andhra Pradesh",
    lat: 13.6288,
    lng: 79.4192,
  };
}
