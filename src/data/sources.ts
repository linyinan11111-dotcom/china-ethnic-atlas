import taiwan from './taiwan-indigenous.json';
import { avatarSource } from './avatars';
import { catalogueSource, nationalSource } from './catalogue';
import { economySource } from './economy';
export const sourceEntries = [
  {
    name: '台湾原住民户籍人口 · ' + taiwan.period,
    publisher: taiwan.publisher,
    url: taiwan.sourceUrl,
    description:
      '官方月度户口统计：原住民登记人口641,332人，占同月总人口2.76%。原文列出花莲、桃园、台东三个县市的原住民人口。与大陆高山族普查采用不同时间及分类，单独展示并导出。',
  },
  {
    name: '民族服饰插画头像',
    publisher: '昵图网 · 用户提供图片',
    url: avatarSource,
    description:
      '按用户提供的8列×7行服饰插画裁切56个本地头像，保留背景与原有水印。插画是服饰示意，不代表当代所有人的穿着。裁切表记录原图位置。原图未提供开放许可。',
  },
  {
    name: '省级民族人口 · 2010',
    publisher: '国家统计局 · 第六次全国人口普查',
    url: 'https://www.stats.gov.cn/sj/pcsj/rkpc/6rp/html/A0106a.htm',
    description:
      '表1-6：各地区分性别、民族的人口。自动采集31省区市、56民族的小计列；人口单位为人。',
  },
  {
    name: '省级民族人口 · 2020',
    publisher: '国家统计局 · 第七次全国人口普查',
    url: 'https://www.stats.gov.cn/sj/pcsj/rkpc/7rp/zk/html/A0104.jpg',
    description:
      '表1-4：各地区分性别、民族的人口。按官方图片表的小计列整理31省区市、56民族；307个单元格逐格目视核对。核对民族纵向合计、地区横向合计与独立全国表。空白保持缺失，不发布未核查的男女人口识别列。',
  },
  {
    name: '语言、节庆与日常文化',
    publisher: '国家民族事务委员会 · 中国网 · 国务院',
    url: 'https://www.neac.gov.cn/seac/ztzl/zgmzjs/index.shtml',
    description:
      '六类文化栏目覆盖56民族。原文与保存快照支持319个栏目，其余17个栏目明确待核查；传统记述保留地域与年代背景，不能概括为当代所有人的习惯。',
  },
  {
    name: '州县文化代表点',
    publisher: '国家民族事务委员会 · 国务院 · DataV',
    url: 'https://geo.datav.aliyun.com/areas_v3/bound/all.json',
    description:
      '56个民族各有一个原文支持的州、市、县、区或旗代表地区。坐标采用公开行政区参考点，不能解释为村落、具体建筑或文化项目精确位置；点位不提供县级人口估计。',
  },
  {
    name: '大陆民族人口 · 2020',
    publisher: '国家统计局 · 第七次全国人口普查',
    url: nationalSource,
    description:
      '表2-1：全国各民族人口及比重。该表民族数据不含港澳台地区，页面标注为大陆普查口径。根据官方图片表逐项转录；表内总计为1,409,778,724人，按该表口径展示。',
  },
  {
    name: '主要分布地区',
    publisher: '国家统计局 · 中国统计年鉴2024',
    url: catalogueSource,
    description:
      '表25-18：少数民族分布的主要地区及人口。主要分布地区为定性信息，不是独占范围或完整人口分布。',
  },
  {
    name: '地区经济 · 2023',
    publisher: '国家统计局 · 中国统计年鉴2024',
    url: economySource,
    description:
      '表3-9：地区生产总值。原表为2023年初步核算数；GDP单位为亿元、人均GDP单位为元，增长率由可比价格指数减100得到。',
  },
  {
    name: '民族发展专题',
    publisher: '国家民委 · 中国政府网 · 中国网 · UNESCO',
    url: 'https://www.neac.gov.cn/seac/ztzl/zgmzjs/index.shtml',
    description:
      '56个民族各有独立时间轴：140个历史、教育、交通、产业等节点，新补11条2025—2026地方案例，结合176条已核查文化保护记录按发生时间排列；同年不同事件分别保留。每个节点标注地区、原文和资料来源。旧资料只用于历史叙述，地区成就不归为单一民族独占。全国政策收为可展开背景，台湾社群与大陆案例分别标注。',
  },
  {
    name: '省级行政区边界',
    publisher: '阿里云 DataV · 公开边界服务',
    url: 'https://geo.datav.aliyun.com/areas_v3/bound/100000_full.json',
    description:
      '本地保存全国省级边界，保留来源中的南海诸岛几何。本版不叠加在线底图；边界仅用于省级专题展示。',
  },
];
