import catalogue from './ethnic-photos.json';
export type EthnicPhotoRecord={name:string;source:string;publisher:string;author:string;license:string;retrieved:string;photos:{file:string;original:string}[]};
const records=catalogue as Record<string,EthnicPhotoRecord>;
export function getEthnicPhoto(name:string){return records[name];}
export function photoUrl(name:string){const photo=getEthnicPhoto(name)?.photos[0];return photo?`${import.meta.env.BASE_URL}${photo.file}`:'';}
