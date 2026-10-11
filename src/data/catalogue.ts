import type { EthnicGroup } from '../types';
import {cultureProfiles} from './culture';
import {ethnicDevelopment} from './development';

// Population order follows the census table. Manually transcribed and checked against A0201.jpg.
const names = '汉族 蒙古族 回族 藏族 维吾尔族 苗族 彝族 壮族 布依族 朝鲜族 满族 侗族 瑶族 白族 土家族 哈尼族 哈萨克族 傣族 黎族 傈僳族 佤族 畲族 高山族 拉祜族 水族 东乡族 纳西族 景颇族 柯尔克孜族 土族 达斡尔族 仫佬族 羌族 布朗族 撒拉族 毛南族 仡佬族 锡伯族 阿昌族 普米族 塔吉克族 怒族 乌孜别克族 俄罗斯族 鄂温克族 德昂族 保安族 裕固族 京族 塔塔尔族 独龙族 鄂伦春族 赫哲族 门巴族 珞巴族 基诺族'.split(' ');
const populations = [1284446389,6290204,11377914,7060731,11774538,11067929,9830327,19568546,3576752,1702479,10423303,3495993,3309341,2091543,9587732,1733166,1562518,1329985,1602104,762996,430977,746385,3479,499167,495928,774947,323767,160471,204402,281928,132299,277233,312981,127345,165159,124092,677521,191911,43775,45012,50896,36575,12742,16136,34617,22354,24434,14706,33112,3544,7310,9168,5373,11143,4237,26025];
// Major areas: China Statistical Yearbook 2024, table 25-18. Qualitative, not exhaustive.
const areas = ['全国','内蒙古 辽宁 吉林 河北 黑龙江 新疆','宁夏 甘肃 河南 新疆 青海 云南 河北 山东 安徽 辽宁 北京 内蒙古 天津 黑龙江 陕西 贵州 吉林 江苏 四川','西藏 四川 青海 甘肃 云南','新疆','贵州 湖南 云南 广西 重庆 湖北 四川','云南 四川 贵州','广西 云南 广东','贵州','吉林 黑龙江 辽宁','辽宁 河北 黑龙江 吉林 内蒙古 北京','贵州 湖南 广西','广西 湖南 云南 广东','云南 贵州 湖南','湖南 湖北 重庆 贵州','云南','新疆','云南','海南','云南 四川','云南','福建 浙江 江西 广东','台湾 福建','云南','贵州 广西','甘肃 新疆','云南','云南','新疆','青海 甘肃','内蒙古 黑龙江','广西','四川','云南','青海','广西','贵州','辽宁 新疆','云南','云南','新疆','云南','新疆','新疆 黑龙江','内蒙古','云南','甘肃','甘肃','广西','新疆','云南','黑龙江 内蒙古','黑龙江','西藏','西藏','云南'];
const details: Record<string,{description:string;language:string;culture:string[]}> = {
  高山族:{description:'高山族主要分布于台湾，大陆亦有高山族人口。各社群在语言、服饰和文化传统方面具有多样性。大陆普查的高山族人口不含台湾；台湾官方以原住民户籍分类统计，本页分别展示两种统计口径。',language:'各社群使用不同语言，另使用汉语',culture:['编织工艺','传统歌舞','多元语言']},
  汉族:{description:'汉族人口分布广泛，地域文化呈现多样性。各地在语言、饮食、建筑与民俗方面形成了丰富的地方传统。',language:'汉语，包含多种方言',culture:['春节','书法','地方戏曲']},
  壮族:{description:'壮族主要分布于广西，也分布在云南、广东等地。山地、河谷与村落生活孕育了歌圩、织锦等文化传统。',language:'壮语，属壮侗语族',culture:['三月三','壮锦','歌圩']},
  蒙古族:{description:'蒙古族主要分布于内蒙古以及东北、西北部分地区。草原文化与城镇生活共同构成当代生活的多样面貌。',language:'蒙古语',culture:['那达慕','长调','马头琴']},
  回族:{description:'回族分布广泛，宁夏、甘肃等地是主要分布地区。各地社区在历史交流中形成了具有地方特色的生活文化。',language:'主要使用汉语',culture:['开斋节','饮食文化','社区传统']},
  藏族:{description:'藏族主要分布于西藏以及四川、青海、甘肃、云南部分地区。高原环境与悠久历史孕育了独特的文学、艺术和建筑传统。',language:'藏语',culture:['藏历新年','唐卡','锅庄']},
  维吾尔族:{description:'维吾尔族主要分布于新疆。绿洲农业、商贸交流和城镇生活形成了丰富的歌舞、工艺及饮食文化。',language:'维吾尔语',culture:['十二木卡姆','艾德莱斯绸','传统歌舞']},
  苗族:{description:'苗族主要分布于贵州、湖南、云南等地。不同地区的服饰、语言和节日具有差异，银饰、刺绣与歌舞传统丰富。',language:'苗语，具有不同方言',culture:['苗年','苗绣','芦笙']},
  彝族:{description:'彝族主要分布于云南、四川、贵州。各地形成了不同的支系和地方文化，传统文字、音乐和节庆具有鲜明特色。',language:'彝语',culture:['火把节','彝文','传统歌舞']},
  满族:{description:'满族主要分布于辽宁、河北及其他东北地区，也分布于全国多地。满族文化在长期交往中与各地文化相互融合。',language:'普遍使用汉语，满语有历史传承',culture:['剪纸','传统服饰','民间故事']},
  土家族:{description:'土家族主要分布于湖南、湖北、重庆和贵州。武陵山区的生产生活孕育了织锦、摆手舞及多样民间艺术。',language:'土家语及汉语',culture:['摆手舞','西兰卡普','民间歌谣']},
  侗族:{description:'侗族主要分布于贵州、湖南和广西。侗寨的鼓楼、风雨桥和多声部歌唱体现了建筑与音乐文化的特色。',language:'侗语',culture:['侗族大歌','鼓楼','风雨桥']},
  白族:{description:'白族主要分布于云南，也分布于贵州、湖南等地。大理地区的建筑、扎染及节庆是地方文化的重要组成部分。',language:'白语及汉语',culture:['三月街','扎染','三道茶']},
  瑶族:{description:'瑶族主要分布于广西、湖南、云南、广东等地。不同地区的支系、语言和传统各有特色，民间服饰与节庆丰富。',language:'使用勉语、布努语等多种语言',culture:['盘王节','长鼓舞','传统刺绣']},
  傣族:{description:'傣族主要分布于云南，河谷与坝区生活孕育了独特的节日、建筑、织锦和舞蹈传统。',language:'傣语',culture:['泼水节','孔雀舞','傣锦']},
  哈尼族:{description:'哈尼族主要分布于云南。梯田农业与村寨生活密切联系，体现了山地社区与自然环境的长期互动。',language:'哈尼语',culture:['十月年','梯田文化','多声部民歌']},
  布依族:{description:'布依族主要分布于贵州，村寨、稻作及传统工艺形成了丰富的地方文化。',language:'布依语',culture:['六月六','蜡染','传统民歌']},
  朝鲜族:{description:'朝鲜族主要分布于吉林、黑龙江、辽宁等地。传统舞蹈、饮食与节庆在当代生活中得到传承。',language:'朝鲜语',culture:['农乐舞','长鼓舞','传统饮食']},
  黎族:{description:'黎族主要分布于海南。传统纺染织绣技艺记录着海南岛的生活、历史和审美。',language:'黎语',culture:['三月三','黎锦','传统纺织']},
  纳西族:{description:'纳西族主要分布于云南。东巴文化、传统音乐及村镇建筑构成了地方文化的重要内容。',language:'纳西语',culture:['东巴文化','传统音乐','古城建筑']},
  羌族:{description:'羌族主要分布于四川。山地聚落、碉楼建筑和羌绣体现了地方生活与文化传承。',language:'羌语',culture:['羌年','羌绣','碉楼']},
};
export const ethnicGroups:EthnicGroup[] = names.map((name,i)=>({
  name,national2020:populations[i],majorRegions:areas[i].split(' '),
  description:details[name]?.description ?? `${name}主要分布于${areas[i].split(' ').join('、')}等地。${ethnicDevelopment[name].feature}是本篇的文化阅读线索；${ethnicDevelopment[name].place}呈现了部分地方生活背景。不同社区的语言、传统和当代生活各有差异。`,
  language:details[name]?.language ?? ({德昂族:'德昂语',保安族:'保安语',裕固族:'西部裕固语、东部裕固语等'} as Record<string,string>)[name] ?? cultureProfiles[name].sections[0].title,
  culture:details[name]?.culture ?? ethnicDevelopment[name].feature.split(/、|与/).slice(0,3),
}));
export const catalogueSource = 'https://www.stats.gov.cn/sj/ndsj/2024/html/C25-18.jpg';
export const nationalSource = 'https://www.stats.gov.cn/sj/pcsj/rkpc/7rp/zk/html/A0201.jpg';
