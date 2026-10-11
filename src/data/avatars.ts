import catalogue from './ethnic-avatars.json';
export type EthnicAvatarRecord={name:string;file:string;source:string;publisher:string;mappingStatus:string;note:string};
const records=catalogue.records as Record<string,EthnicAvatarRecord>;
export function getEthnicAvatar(name:string){return records[name];}
export function avatarUrl(name:string){const avatar=getEthnicAvatar(name);return avatar?`${import.meta.env.BASE_URL}${avatar.file}`:'';}
export const avatarSource=catalogue.sourceUrl;
