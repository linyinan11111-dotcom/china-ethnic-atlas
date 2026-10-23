export interface EthnicTheme {
  id: string;
  name: string;
  label: string;
  accent: string;
  deep: string;
  muted: string;
  soft: string;
  pale: string;
  border: string;
  palette: string[];
}
export const ethnicThemes: Record<string, EthnicTheme>;
export function mixColor(first: string, second: string, ratio: number): string;
export function getEthnicTheme(name: string): EthnicTheme;
export function themeVariables(theme: EthnicTheme): Record<string, string>;
