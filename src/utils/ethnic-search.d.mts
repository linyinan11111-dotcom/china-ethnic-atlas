export const ethnicNames:string[];
export const ethnicSearchIndex:Record<string,{pinyin:string;initials:string;short:string}>;
export function normalizeSearch(value:unknown):string;
export function searchEthnics<T extends {name:string}>(groups:T[],query:string):T[];
export function searchDirectory<T extends {name:string;majorRegions?:string[];culture?:string[];keywords?:string[]}>(groups:T[],query:string,filters?:{region?:string;topic?:string}):T[];
