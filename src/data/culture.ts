import rows from './culture-profiles.json';
export interface CultureSource {url:string;publisher:string;snapshot:string;sha256:string;retrievedAt:string|null;evidence:string;}
export interface CultureSection {id:string;label:string;title:string;text:string;sourceType?:string;sources:CultureSource[];}
export interface CultureProfile {name:string;updatedAt:string;sections:CultureSection[];}
export const cultureProfiles:Record<string,CultureProfile>=Object.fromEntries(rows.map(row=>[row.name,row]));
