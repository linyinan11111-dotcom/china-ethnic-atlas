import milestones from './ethnic-milestones.json';
import recentCases from './recent-cases.json';
import { ethnicDevelopment } from './development';

export interface TimelineSource {
  url: string;
  publisher: string;
}
export interface EthnicTimelineEvent {
  id: string;
  year: number;
  period: string;
  category: string;
  region: string;
  title: string;
  text: string;
  items?: { title: string; text: string }[];
  sources: TimelineSource[];
}

// No common-policy fallback: each group has its own verified milestones.
// Multiple events in the same year remain distinct, with stable unique IDs.
export const ethnicTimelines: Record<string, EthnicTimelineEvent[]> = Object.fromEntries(
  Object.values(ethnicDevelopment).map((profile) => {
    const events: EthnicTimelineEvent[] = [...milestones, ...recentCases]
      .filter((item) => item.name === profile.name)
      .map((item, index) => ({ ...item, id: `${profile.name}-history-${index}` }));
    const years = [...new Set(profile.achievements.map((item) => item.year))];
    for (const year of years) {
      const achievements = profile.achievements.filter((item) => item.year === year);
      const projects = achievements.map((item) =>
        item.title.replace(/列入国家级非遗名录|扩展保护范围/g, ''),
      );
      const sources = Array.from(
        new Map(
          achievements.map((item) => [item.url, { url: item.url, publisher: item.publisher }]),
        ).values(),
      );
      events.push({
        id: `${profile.name}-heritage-${year}`,
        year,
        period: String(year),
        category: '文化保护',
        region: profile.name === '高山族' ? '大陆 · 福建华安' : profile.place,
        title:
          achievements.length === 1
            ? achievements[0].title
            : `${projects.slice(0, 2).join('、')}${projects.length > 2 ? '等' : ''}保护记录`,
        text: `这一年收录 ${achievements.length} 项文化保护记录。名录年份表示保护制度中的节点；扩展项目表示新增申报地区或保护范围。`,
        items: achievements.map((item) => ({ title: item.title, text: item.text })),
        sources,
      });
    }
    return [profile.name, events.sort((a, b) => a.year - b.year)];
  }),
);
