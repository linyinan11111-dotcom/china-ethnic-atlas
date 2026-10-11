# 山河同心 · 中国民族分布图谱

Vue 3 + TypeScript + OpenLayers + ECharts 实现的静态民族分布与地区发展网站，适合 GitHub Pages。无需数据库、API Key、登录或在线地图服务。人口表、行政边界与经济数据随项目部署。

![一页式民族专题](docs/screenshots/民族专题一页式桌面.png)

## 已实现

- 56 民族选择、搜索、主要分布地区概览。
- 一族一页：民族分布、民族介绍、分布分析、地区经济和民族发展连续展示，固定页内导航支持快速跳转；切换民族更新全部模块。
- 人文杂志视觉：纸张底色、宋体大标题、服饰插画开篇、章节编号与细线分隔；使用本地资源，民族主题色作为重点标记。
- 每个民族独立主题色，联动界面、地图、图例和图表。
- 56民族服饰插画头像，专题封面、侧栏及搜索结果使用本地裁切图片，附原图来源链接。
- 全局民族搜索支持汉字、拼音、首字母及声调输入，Ctrl/Cmd + K打开，方向键选择，Enter确认，Esc关闭；侧栏亦支持拼音搜索。
- 31 省区市民族人口地图：人口数量 / 当地人口占比切换、图例、名称开关、悬停、点击、缩放、南海诸岛附图。
- 民族介绍：大陆普查人口、文化编辑概述、主要分布地；部分民族的语言信息暂未收录，并明确显示。
- 分布分析：前八地区图表、前五地区集中度、全部地区明细、地图联动。
- 排名百分比统一自适应小数位，极小非零值不误显示为零，图表提示带单位。
- 高山族另展示台湾官方2026年9月底原住民户籍统计641,332人、占比2.76%，含前三县市与独立导出；地图台湾虚线标注、点击显示参考详情。
- 地区经济：31 省区市的 GDP、人均 GDP、三次产业增加值、实际增长率；默认本民族主要分布地区，支持五个自治区/全部省区市筛选和最多五地区对比。
- 民族发展：56个民族各自的特色发展线索和独立时间轴，140条历史发展事件结合176条已核查文化保护记录，主要分布地区经济截面；文化成果按年份筛选并区分新增与扩展项目，全国共同政策以折叠背景保留。
- 数据说明、带来源及单位的 CSV 导出、移动端布局、哈希链接。

## 本地运行

推荐 Node.js 22 或以上。

```bash
npm ci
npm run dev
```

访问终端显示的 `http://127.0.0.1:5173`。不能直接双击 `index.html` 使用，因为地图和数据通过 HTTP 加载。

```bash
npm run data:check    # 校验人口数据、边界关联、全国合计和2020转录校验和
npm test             # 验证缺失数据、分级边界、数量/占比与CSV
npm run build        # TypeScript检查及生产构建，输出dist
npm run preview      # 预览构建结果
npm run test:e2e     # 桌面及手机浏览器测试
```

Windows 浏览器测试使用系统 Edge。其他系统先执行 `npx playwright install chromium`。测试截图保存在 `test-results/`，该目录默认不上传仓库。

## 部署到 GitHub Pages

1. 在 GitHub 新建一个仓库，例如 `china-ethnic-atlas`。首次创建时不勾选额外生成 README，便于上传当前项目。
2. 把项目源代码上传仓库，分支使用 `main`。需要包含隐藏目录 `.github/workflows/`、`package-lock.json`、`public/` 和数据原表；不要上传 `node_modules/`。
3. 仓库打开 **Settings → Pages → Build and deployment → Source → GitHub Actions**。
4. 推送到 `main` 后，**Actions → Deploy GitHub Pages** 自动运行校验、测试、构建与部署；也可以点击 **Run workflow** 手动运行。
5. 部署完成后的页面通常为 `https://你的用户名.github.io/仓库名/`，准确地址以 Actions 部署结果为准。

已有 Git 的情况下，可在项目目录执行以下命令。先替换仓库地址；不要直接照抄占位地址。

```bash
git init
git add .
git commit -m "feat: add China ethnic atlas"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
git push -u origin main
```

如果你已有仓库、远程地址或分支，不要重复执行 `git init` / `git remote add`；先确认当前 Git 状态。

`vite.config.ts` 使用 `base: './'`，资源地址支持仓库子目录和用户主页。每个民族统一使用哈希链接，如 `/#ethnic?ethnic=白族`，刷新不需要服务端路由重写。原有 `/#map`、`/#culture`、`/#analysis`、`/#economy`、`/#reform` 链接自动转到同一页面的对应模块。GitHub Actions 使用 Node.js 22，并依照锁文件安装依赖。

验证包括：2010/2020人口合计与31省级边界关联、56民族文化原文及快照、州县代表点、近期案例、目录筛选与民族比较、CSV年份同步、台湾独立口径、移动布局、仓库子路径部署及哈希刷新。执行 `npm run verify` 可运行数据检查、单元测试、生产构建和浏览器检查。

## 服饰头像与主题维护

当前页面使用用户提供的昵图网服饰插画裁切头像。每个民族使用独立本地文件，裁切保留原始背景与水印；插画用于文化示意，不代表该民族所有地区和时代的服饰。此前收录的人物照片作为历史素材保留，页面不再引用。

- `src/data/ethnic-avatars.json`：56个头像的文件、原图行列、裁切坐标与来源记录。
- `public/avatars/`：本地PNG头像与完整原图，随GitHub Pages部署。
- `scripts/crop-ethnic-avatars.py`：从保存的原图重新裁切头像。
- `src/components/EthnicPhoto.vue`：头像与来源展示。
- `src/utils/themes.mjs`：56套主题色与地图色阶。
- `src/utils/ethnic-search.mjs`：名称、拼音、首字母索引。

头像每格约100×132像素，保留原始像素，未进行AI扩图。替换头像时按对应表覆盖同名文件，并更新来源记录；详见 `docs/AVATAR_SOURCES.md`。原照片清单见 `docs/PHOTO_SOURCES.md`。

## 数据年份与口径

| 内容 | 年份 | 公开来源 | 获取方式 |
| --- | --- | --- | --- |
| 省级56民族人口 | 2010 | 国家统计局第六次人口普查表1-6 | HTML自动采集，保存原表及SHA-256 |
| 省级56民族人口 | 2020 | 国家统计局第七次人口普查表1-4 | 图片识别预读、307格目视核对、纵横向及独立全国表校验 |
| 全国56民族人口 | 2020 | 国家统计局第七次人口普查表2-1 | 图片表逐项转录，合计校验 |
| 民族主要分布地区 | 定性资料 | 中国统计年鉴2024表25-18 | 原表转录 |
| GDP、人均GDP、产业及增速 | 2023 | 中国统计年鉴2024表3-9 | 原表转录，初步核算数 |
| 改革开放与减贫历程 | 截至2021 | 《人类减贫的中国实践》白皮书 | 官方资料编辑概述 |
| 各民族文化保护成果 | 2006、2008、2011、2014、2021及国际项目年份 | 国务院国家级非遗名录、UNESCO | 核对新增与扩展项目，2021图片附件人工转录并保留快照与校验和 |
| 省级行政边界 | 获取时版本 | 阿里云DataV公开边界 | 下载为本地GeoJSON |
| 台湾原住民户籍人口及前三县市 | 2026年9月底 | 台湾内政部门户政司月度户口报告 | 自动采集官方HTML，分母及原文快照校验 |

省级地图默认2020年，支持2010/2020切换。原表 `data/raw/A0104.jpg`的小计列已经整理为 `public/data/population2020.json`，不是按全国人口比例推算。地图、排名、比较、地区人口截面和CSV同步切换；经济保持2023年。完整核查方法见 `docs/POPULATION_2020.md`。

2020年民族原表不包含港澳台地区，页面已改用“大陆普查人口”标签。高山族3,479人不包含台湾；台湾641,332人采用2026年9月底“原住民”户籍分类，两种统计分别展示和导出，不加入同年的大陆排名或合计。详细来源与口径见`docs/TAIWAN_STATISTICS.md`，执行`npm run taiwan:fetch`可重复获取本版选定的官方报告。

2020年全国人口按表2-1原表口径，总计为1,409,778,724人。56民族人口之和加上未定族称人口836,488人、入籍16,595人，等于该原表总计。不能用其他人口公报总计直接替换。

源表空白保存为 `null`，不默认解释为零；31省区市之外未接入同口径人口与经济数据。文化摘要与319个有原文支持的栏目保留地域和时代背景，另外17个栏目明确待核查。56个民族均有地方故事和行政地区代表点，点位不提供县级人口估计或建筑精确位置。民族发展新增11条2025—2026地区报道案例。照片沿用既有素材，经济模块代表地区整体经济。

## 更新数据

```bash
npm run data:fetch
npm run data:check
npm test
npm run build
```

`data:fetch` 只更新自动采集的2010人口表和省级边界；不会覆盖人工核验的2020人口、2023经济数据及文化资料。更新其余数据需要修改 `src/data/catalogue.ts`、`src/data/economy.ts`、`src/data/reform.ts` 并同步来源说明。

文化、地图、案例、比较与资料日期的任务清单、完成情况和维护脚本见 `docs/IMPROVEMENT_TASKS.md`。文化原文由 `scripts/build-culture-profiles.mjs`生成；代表点与近期案例分别使用 `scripts/build-cultural-places.mjs`、`scripts/build-recent-cases.mjs`，发布构建无需连接源站。

脚本顺序请求公开页面，设置45秒超时并校验表格结构；不会登录、绕过访问限制或高并发抓取。结构变化时终止并报错，不能忽略校验继续生成数据。

## 目录

```text
src/App.vue                 页面与筛选联动
src/components/ChinaMap.vue  OpenLayers主图及南海附图
src/components/Chart.vue     按需加载ECharts
src/components/Landscape.vue 自绘示意插画
src/data/                   民族、经济、改革开放内容
src/utils/analysis.mjs       统计计算、地图分级、CSV格式
public/data/population.json  自动采集的人口数据
public/china-provinces.geojson 行政边界
data/raw/                   原始人口与统计年鉴表
data/manifest.json          自动采集来源与内容哈希
scripts/                    采集、校验与辅助工具
tests/                      指标及浏览器测试
.github/workflows/deploy.yml GitHub Pages自动部署
docs/DATA_DICTIONARY.md      数据字段、公式和扩展方法
```

## 下一步扩展

后续可补齐17个文化缺项，增加有原文支持的地方案例、精确文化地点与同口径历年经济序列。若扩展自治州县人口，应采集对应统计表和历史行政边界，不能把省级数字分摊到县级；发展趋势图需要真实的历史序列。

## 民族插画头像与页内定位

当前使用用户提供的56民族服饰插画裁切头像，文件在 `public/avatars/`，替换方法与标注待核查的两格见 [头像来源说明](docs/AVATAR_SOURCES.md)。封面、目录与搜索使用相同头像。点击页内导航、地区详情、文化线索、地方故事和时间轴节点会定位到相应内容，目标有高亮反馈并兼顾键盘焦点与减少动画设置。
