export interface PopulationRegion {
  code: string;
  name: string;
  total: number;
  populations: Record<string, number | null>;
  year: number;
  sourceId: string;
}
export interface PopulationData {
  year: number;
  sourceUrl: string;
  national: PopulationRegion;
  regions: PopulationRegion[];
}
export interface EthnicGroup {
  name: string;
  national2020: number;
  majorRegions: string[];
  description: string;
  culture: string[];
  language: string;
}
export interface EconomyRegion {
  code: string;
  name: string;
  gdp: number;
  perCapita: number;
  sectors: [number, number, number];
  growth: number;
  autonomous: boolean;
}
