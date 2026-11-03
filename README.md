# 山河同心 · 中国民族分布图谱

[访问网站](https://linyinan11111-dotcom.github.io/china-ethnic-atlas/) · [GitHub 仓库](https://github.com/linyinan11111-dotcom/china-ethnic-atlas) · [部署状态](https://github.com/linyinan11111-dotcom/china-ethnic-atlas/actions/workflows/deploy.yml) · [维护说明](docs/ARCHITECTURE.md) · [更新记录](docs/CHANGELOG.md)

Vue 3 + TypeScript + OpenLayers + ECharts 的静态民族分布与地区发展网站，适合 GitHub Pages。无需数据库、API Key、登录或在线地图服务。人口表、行政边界与经济数据随项目部署。

线上页面只使用服饰插画头像，不展示历史人物照片。专题封面、侧栏和搜索结果都读取本地裁切图。

![液态玻璃民族专题](docs/screenshots/液态玻璃桌面.png)

## 已实现

- 56 民族选择、搜索、主要分布地区概览。一族一页连续展示分布、介绍、分布分析、地区经济和民族发展，页内导航可快速跳转。
- 液态玻璃视觉：渐变背景、折射封面、玻璃浮层与圆角控件，保留章节结构和民族主题色。正文 16px，辅助文字 12–14px。
- 每个民族独立主题色，联动界面、地图、图例和图表。
- 56 个服饰插画头像，附原图来源链接。插画只作文化示意，不代表该民族所有地区和时代的服饰。
- 全局民族搜索支持汉字、拼音、首字母及声调；Ctrl/Cmd + K 打开，方向键选择，Enter 确认，Esc 关闭。
- 31 省区市民族人口地图：数量与当地占比切换、图例、名称开关、悬停、点击、缩放、南海诸岛附图。
- 民族介绍、前八地区分布分析、地区经济对比，以及 56 个民族各自的发展线索和时间轴。
- 数据说明、带来源及单位的 CSV 导出、移动端布局、哈希链接。高山族另列台湾官方户籍统计，不并入大陆普查合计。

设计与维护细节见 [液态玻璃设计说明](docs/GLASS_DESIGN.md) 和 [更新记录](docs/CHANGELOG.md)。

## 本地运行

推荐 Node.js 22 或以上。

```bash
npm ci
npm run dev
```

访问终端显示的 `http://127.0.0.1:5173`。不能直接双击 `index.html`，地图和数据通过 HTTP 加载。

```bash
npm run format        # 整理源码、脚本与测试排版
npm run format:check  # 只检查格式
npm run typecheck     # 严格类型及未使用变量检查
npm run data:check    # 校验人口数据、边界关联、全国合计和 2020 转录校验和
npm test              # 统计计算、数据一致性、文化资料与来源快照测试
npm run build         # TypeScript 检查及生产构建，输出 dist
npm run preview       # 预览构建结果
npm run test:e2e      # 桌面及手机浏览器测试
npm run verify        # 格式、数据、单元、构建和浏览器完整检查
```

Windows 浏览器测试使用系统 Edge。其他系统先执行 `npx playwright install chromium`。浏览器测试运行生产构建预览，因此单独执行 `test:e2e` 前应先运行 `npm run build`。失败信息和临时截图位于 `test-results/`。

开发请修改 `src/` 中的可读源码。`dist/` 是自动生成的压缩产物，不应手动编辑或上传。

## 部署到 GitHub Pages

本站仓库为 `linyinan11111-dotcom/china-ethnic-atlas`，发布分支为 `main`，线上地址为：

**https://linyinan11111-dotcom.github.io/china-ethnic-atlas/**

维护现有项目时，完成修改和检查后提交到 `main`：

```bash
npm run verify
git add .
git commit -m "Describe the change"
git push origin main
```

GitHub Actions 的 **Deploy GitHub Pages** 工作流会先进行格式、数据、单元测试、生产构建和浏览器测试，全部通过后再部署，并核对公开人口数据、56 个头像、应用资源、地图和移动端导航。进度见[部署记录](https://github.com/linyinan11111-dotcom/china-ethnic-atlas/actions/workflows/deploy.yml)，也可 **Run workflow** 手动运行。

若复制到自己的仓库，在 **Settings → Pages → Build and deployment → Source** 选择 **GitHub Actions**，并保留 `.github/workflows/`、锁文件、`public/` 和数据原表。不要上传 `node_modules/`、`dist/`、`.tools/` 或本地环境变量。

`vite.config.ts` 使用 `base: './'`，资源地址支持仓库子目录和用户主页。每个民族使用哈希链接，如 `/#ethnic?ethnic=白族`。原有 `/#map`、`/#culture`、`/#analysis`、`/#economy`、`/#reform` 链接转到同一页面的对应模块。Actions 使用 Node.js 22，并依照锁文件安装依赖。

## 服饰头像

当前页面只使用本地服饰插画头像，由 `EthnicPhoto.vue` 读取。历史人物照片已从仓库移除，不再随页面发布。

- `src/data/ethnic-avatars.json`：56 个头像的文件、原图行列、裁切坐标与来源记录。
- `public/avatars/`：本地 PNG 头像与完整原图，随 GitHub Pages 部署。
- `scripts/crop-ethnic-avatars.py`：从保存的原图重新裁切头像。
- `src/components/EthnicPhoto.vue`：头像与来源展示。
- `src/utils/themes.mjs`：56 套主题色与地图色阶。
- `src/utils/ethnic-search.mjs`：名称、拼音、首字母索引。

头像每格约 100×132 像素，保留原始像素，未进行 AI 扩图。替换头像时按对应表覆盖同名文件，并更新来源记录。详见 [头像来源与替换说明](docs/AVATAR_SOURCES.md)。

## 数据年份与口径

| 内容                         | 年份                                       | 公开来源                       | 获取方式                                                   |
| ---------------------------- | ------------------------------------------ | ------------------------------ | ---------------------------------------------------------- |
| 省级 56 民族人口             | 2010                                       | 国家统计局第六次人口普查表 1-6 | HTML 自动采集，保存原表及 SHA-256                          |
| 省级 56 民族人口             | 2020                                       | 国家统计局第七次人口普查表 1-4 | 图片识别预读、307 格目视核对、纵横向及独立全国表校验       |
| 全国 56 民族人口             | 2020                                       | 国家统计局第七次人口普查表 2-1 | 图片表逐项转录，合计校验                                   |
| 民族主要分布地区             | 定性资料                                   | 中国统计年鉴 2024 表 25-18     | 原表转录                                                   |
| GDP、人均 GDP、产业及增速    | 2023                                       | 中国统计年鉴 2024 表 3-9       | 原表转录，初步核算数                                       |
| 改革开放与减贫历程           | 截至 2021                                  | 《人类减贫的中国实践》白皮书   | 官方资料编辑概述                                           |
| 各民族文化保护成果           | 2006、2008、2011、2014、2021 及国际项目年份 | 国务院国家级非遗名录、UNESCO   | 核对新增与扩展项目，2021 图片附件人工转录并保留快照与校验和 |
| 省级行政边界                 | 获取时版本                                 | 阿里云 DataV 公开边界          | 下载为本地 GeoJSON                                         |
| 台湾原住民户籍人口及前三县市 | 2026 年 9 月底                             | 台湾内政部门户政司月度户口报告 | 自动采集官方 HTML，分母及原文快照校验                      |

省级地图默认 2020 年，支持 2010/2020 切换。原表 `data/raw/A0104.jpg` 的小计列已经整理为 `public/data/population2020.json`，不是按全国人口比例推算。地图、排名、比较、地区人口截面和 CSV 同步切换；经济保持 2023 年。完整核查方法见 `docs/POPULATION_2020.md`。重建 2020 年人口表时仍使用 `data/raw/census2020-ocr/` 中的识别证据。

2020 年民族原表不包含港澳台地区，页面使用“大陆普查人口”标签。高山族 3,479 人不包含台湾；台湾 641,332 人采用 2026 年 9 月底“原住民”户籍分类，两种统计分别展示和导出，不加入同年的大陆排名或合计。详细来源与口径见 `docs/TAIWAN_STATISTICS.md`，执行 `npm run taiwan:fetch` 可重复获取本版选定的官方报告。

2020 年全国人口按表 2-1 原表口径，总计为 1,409,778,724 人。56 民族人口之和加上未定族称人口 836,488 人、入籍 16,595 人，等于该原表总计。不能用其他人口公报总计直接替换。

源表空白保存为 `null`，不默认解释为零。文化摘要与 319 个有原文支持的栏目保留地域和时代背景，另外 17 个栏目明确待核查。56 个民族均有地方故事和行政地区代表点，点位不提供县级人口估计或建筑精确位置。经济模块代表地区整体经济，不等于某个民族的收入。

## 更新数据

```bash
npm run data:fetch
npm run data:check
npm test
npm run build
```

`data:fetch` 只更新自动采集的 2010 人口表和省级边界；不会覆盖人工核验的 2020 人口、2023 经济数据及文化资料。维护其余数据时应修改对应数据文件并同步来源说明：

- 全国人口独立转录：`src/data/national-population2020.json`，顺序遵循普查表，与省级矩阵独立校验。
- 民族简介与主要地区：`src/data/catalogue.ts`。
- 地区经济：`src/data/economy.ts`。
- 民族时间轴与文化记录：参考 [民族发展维护说明](docs/ETHNIC_DEVELOPMENT.md)。
- 页面来源目录：`src/data/sources.ts`。

文化、地图、案例与资料日期的任务清单见 `docs/IMPROVEMENT_TASKS.md`。文化原文由 `scripts/build-culture-profiles.mjs` 生成；代表点与近期案例分别使用 `scripts/build-cultural-places.mjs`、`scripts/build-recent-cases.mjs`，发布构建无需连接源站。

脚本顺序请求公开页面，设置 45 秒超时并校验表格结构；不会登录、绕过访问限制或高并发抓取。结构变化时终止并报错。

## 目录

```text
src/
  App.vue                        页面装配、弹窗与加载提示
  components/layout/             页头、封面、目录、导航与页脚
  components/sections/           分布、介绍、分析、经济、发展与来源区域
  components/ChinaMap.vue        OpenLayers 主图、附图与资源生命周期
  components/Chart.vue           ECharts 实例与响应式尺寸
  components/EthnicPhoto.vue     服饰插画头像与来源
  composables/                   页面状态、数据加载、导航与图表配置
  config/navigation.ts           导航配置与页面类型
  data/                          民族、文化、人口、经济及来源目录
  utils/                         统计、搜索、主题、滚动与 CSV 导出
  styles/index.css               样式唯一入口，保持级联顺序
public/data/                     2010 与 2020 年省级人口数据
public/avatars/                  本地服饰插画头像
public/china-provinces.geojson   本地行政边界
data/raw/                        原始资料、普查识别证据、快照与校验记录
scripts/                         采集、构建、校验与发布检查
tests/browser/                   桌面、移动端及故障恢复回归
.github/workflows/deploy.yml     GitHub Pages 检查与自动部署
docs/ARCHITECTURE.md             结构、修改入口与维护规范
docs/CHANGELOG.md                界面改版与结构维护记录
docs/DATA_DICTIONARY.md          数据字段、计算公式和扩展方法
```

## 许可证

本项目采用 [MIT 许可证](LICENSE)。`src/vendor/lens/` 是第三方代码，保留其自带的 MIT 许可证。

## 下一步扩展

后续可补齐 17 个文化缺项，增加有原文支持的地方案例、精确文化地点与同口径历年经济序列。若扩展自治州县人口，应采集对应统计表和历史行政边界，不能把省级数字分摊到县级。
