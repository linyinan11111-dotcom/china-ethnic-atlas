# 项目结构与维护

页面采用 Vue 3 组合式 API。一族一页的五个章节保持连续展示，数据说明单独展示。

```text
src/
  App.vue                       页面装配、弹窗、加载提示
  components/
    layout/                     页头、封面、民族目录、章节导航、页脚
    sections/                   分布、介绍、分析、经济、发展、来源六个区域
    ChinaMap.vue                OpenLayers 实例、事件、边界加载与销毁
    Chart.vue                   ECharts 实例与响应式尺寸
    Ethnic*.vue                 文化、时间轴、对比等业务组件
  composables/
    useAtlasController.ts       当前民族、地区与共享业务动作
    atlasContext.ts             页面内类型安全的 provide / inject
    usePopulationData.ts        人口年份、分年度加载、缓存与故障恢复
    useAtlasNavigation.ts       旧链接兼容、章节滚动与导航高亮
    useAtlasCharts.ts           图表配置
    useEthnicDirectory.ts       目录搜索和筛选（组件本地状态）
    useToast.ts                 反馈提示与定时器清理
  config/navigation.ts          导航项与页面类型
  data/                         数据快照、来源目录与领域模型组装
  utils/                        统计、搜索、主题、CSV 与滚动工具
  styles/index.css              样式唯一入口，明确级联顺序
public/                         随网站部署的地图、人口表与头像
scripts/                        数据采集、构建、校验与发布验证
tests/                          单元测试与浏览器回归
```

## 改动入口

- 修改某个章节的界面：改 `components/sections/` 对应组件。
- 修改民族选择联动：改 `useAtlasController.ts`；仅属于一个组件的交互状态留在组件中。
- 修改跳转及滚动反馈：改 `useAtlasNavigation.ts` 与 `utils/content-navigation.ts`。
- 修改人口加载：改 `usePopulationData.ts`。2010、2020 年独立处理；不可用年份禁选，可用年份继续展示，失败可以重试。
- 修改全国人口独立转录：改 `data/national-population2020.json`，并核对原表。它与省级人口矩阵独立保存，用于交叉校验；不能从省级矩阵反向生成。
- 修改数据来源说明：改 `data/sources.ts`。
- 修改样式：基础规则按基础、布局、目录、地图、内容和响应式拆分，民族主题和杂志样式分别保存。`styles/index.css` 的导入顺序决定覆盖关系，勿随意调整。

`useAtlas()` 仅在本页面的后代组件使用，共享同一组 ref；每个组件只取自己使用的状态和动作。不存在额外的全局 store，也不需要为单个页面引入状态管理依赖。

## 代码规范与检查

```bash
npm ci
npm run dev
npm run format        # 统一 Vue、TS、JS、CSS、脚本和测试排版
npm run format:check  # 只检查，不修改
npm run typecheck    # 检查类型、未使用变量与参数
npm run verify       # 格式、数据、单元、构建、浏览器完整检查
```

`.editorconfig` 统一 UTF-8、两空格、LF 与文件结尾换行；Prettier 固定版本并统一代码排版。快照、原始资料、图片和生产构建不参与源码格式化。生产构建仍会压缩 JS/CSS，修改时应打开 `src/`，不要编辑 `dist/`。

浏览器测试使用生产构建预览，Windows 默认使用已安装的 Edge；Linux/CI 使用 Playwright Chromium。GitHub Pages 发布前会运行格式、数据、单元、构建及浏览器检查，发布后另检查公开资源、地图和移动端导航。

## 资源和统计边界

地图请求在卸载时取消，重试先释放旧地图、事件和观察器；尺寸改变只更新地图大小，不覆盖用户缩放。切换民族会回到全国视图。再次点击同一代表点仍会重新定位。

同一民族在章节间导航不重置地区或经济对比；首次数据返回和重试不会覆盖访客已经做出的选择。旧 `#map` / `#culture` 等地址仍可进入对应章节，随后规范为 `#ethnic?ethnic=…`。

大陆普查、高山族台湾户籍参考、地区经济维持各自年份和统计范围；缺失值保留为空，不用零替代。本次结构调整没有重新采集数据或更改文化资料的核查日期。
