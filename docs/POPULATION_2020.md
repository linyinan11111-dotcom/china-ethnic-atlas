# 2020年省级民族人口整理

官方来源：国家统计局第七次全国人口普查资料，表1-4《各地区分性别、民族的人口》。

- 原表：https://www.stats.gov.cn/sj/pcsj/rkpc/7rp/zk/html/A0104.jpg
- 原始快照：`data/raw/A0104.jpg`（15295×1455）
- 发布数据：`public/data/population2020.json`
- 核查记录：`data/raw/census2020-ocr/verification.json`
- 独立全国核对：表2-1，项目原有 `src/data/catalogue.ts` 全国2020人口转录。

Windows内置OCR只用于预读；307个小计单元格逐格对照官方图片，检查图、转录值及修正映射均保存在 `data/raw/census2020-ocr/`。表中男女人口识别结果存在51处小计诊断差异，这些列没有发布，也不作为独立人口数据使用。只发布经过核查的小计列。

已经检查31省区市地区代码、每个民族省级小计之和与全国数、各省56民族加未识别民族及入籍外国人的横向合计、全国总计和独立全国转录。原表空白保留为 `null`，零值与缺失分别显示，不推算空白。

重新整理：依次运行 `scripts/crop-census2020.py`、`scripts/ocr-census-all.ps1`、`scripts/build-population2020.mjs`。发布前须保留目视核查映射，再运行 `node scripts/build-population2020.mjs --publish`。仅在纵横向合计和全国独立表一致且所有有印刷数字的小计单元格都有值时生成发布文件。

页面默认2020年，可选择2010年。地图、排名、地区明细、民族比较、发展地区截面和CSV使用同一所选人口年份。GDP仍为2023年，台湾原住民户籍仍为2026-09独立口径。2020与2010之间的变动不能仅凭两个时点解释为政策效果或个人迁移。
