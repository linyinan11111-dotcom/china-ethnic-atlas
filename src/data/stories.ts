import milestones from './ethnic-milestones.json';
import recentCases from './recent-cases.json';
import {ethnicDevelopment} from './development';
import {ethnicGroups} from './catalogue';
export const ethnicStories=Object.fromEntries(ethnicGroups.map(group=>{
 const records=[...recentCases,...milestones].filter(item=>item.name===group.name);
 const preferred=['交通通信','教育文化','生产生活','生态保护','公共服务','体育文化','特色产业','艺术技艺'];
 const event=records.find(item=>item.year>=1978&&preferred.includes(item.category))??records.find(item=>item.year>=1978)??records[records.length-1];
 const profile=ethnicDevelopment[group.name];
 return [group.name,{name:group.name,title:event.title,year:event.year,period:event.period,region:event.region,category:event.category,text:event.text,sources:event.sources,observation:profile.path,updatedAt:'2026-10-10'}];
}));
