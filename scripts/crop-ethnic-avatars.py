"""Crop the user-supplied clothing sheet; keep source pixels and watermarks."""
import argparse
import hashlib
import json
from pathlib import Path
from shutil import copyfile
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SOURCE_URL = 'https://pic.nximg.cn/file/20240409/35284279_092240047105_2.jpg'
GRID = '''藏族 哈萨克族 佤族 阿昌族 布依族 回族 哈尼族 景颇族
京族 裕固族 柯尔克孜族 达斡尔族 仫佬族 黎族 珞巴族 基诺族
满族 毛南族 门巴族 蒙古族 苗族 仡佬族 傣族 畲族
纳西族 怒族 普米族 布朗族 羌族 撒拉族 水族 傈僳族
塔吉克族 赫哲族 俄罗斯族 土家族 土族 汉族 维吾尔族 保安族
乌孜别克族 锡伯族 瑶族 彝族 侗族 独龙族 拉祜族 壮族
白族 东乡族 德昂族 朝鲜族 塔塔尔族 鄂伦春族 鄂温克族 高山族'''

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('source', type=Path)
    args = parser.parse_args()
    image = Image.open(args.source).convert('RGB')
    if image.size != (956, 1024):
        raise ValueError('Crop coordinates apply only to the supplied 956×1024 preview.')
    names = '汉族 蒙古族 回族 藏族 维吾尔族 苗族 彝族 壮族 布依族 朝鲜族 满族 侗族 瑶族 白族 土家族 哈尼族 哈萨克族 傣族 黎族 傈僳族 佤族 畲族 高山族 拉祜族 水族 东乡族 纳西族 景颇族 柯尔克孜族 土族 达斡尔族 仫佬族 羌族 布朗族 撒拉族 毛南族 仡佬族 锡伯族 阿昌族 普米族 塔吉克族 怒族 乌孜别克族 俄罗斯族 鄂温克族 德昂族 保安族 裕固族 京族 塔塔尔族 独龙族 鄂伦春族 赫哲族 门巴族 珞巴族 基诺族'.split()
    assert set(names) == set(json.loads((ROOT / 'src/data/ethnic-photos.json').read_text(encoding='utf-8')))
    grid = GRID.split()
    assert len(grid) == 56 and set(grid) == set(names)
    target = ROOT / 'public/avatars'
    target.mkdir(parents=True, exist_ok=True)
    if args.source.resolve() != (target / 'ethnic-sheet.jpg').resolve():
        copyfile(args.source, target / 'ethnic-sheet.jpg')
    xs = [30, 144, 258, 371, 485, 598, 712, 825]
    ys = [22, 164, 305, 447, 587, 728, 870]
    bottoms = [155, 296, 438, 579, 720, 861, 1002]
    records = {}
    for index, name in enumerate(grid):
        row, column = divmod(index, 8)
        box = (xs[column], ys[row], xs[column] + 100, bottoms[row])
        crop = image.crop(box)
        file = f'avatars/ethnic-{names.index(name) + 1}.png'
        crop.save(ROOT / 'public' / file)
        unclear = name in ['布依族', '景颇族']
        records[name] = dict(name=name, file=file, source=SOURCE_URL,
            publisher='昵图网 · 用户提供的民族服饰插画',
            row=row+1, column=column+1, crop=list(box), width=crop.width, height=crop.height,
            mappingStatus='pending' if unclear else 'reviewed',
            note='原图标注不清，对应关系待核查' if unclear else '按原图民族名称整理',
            license='未提供开放许可', retrieved='2026-10-11')
    metadata = dict(sourceUrl=SOURCE_URL, sourceFile='avatars/ethnic-sheet.jpg',
        sourceSha256=hashlib.sha256(args.source.read_bytes()).hexdigest(),
        sourceWidth=image.width, sourceHeight=image.height, records=records)
    (ROOT / 'src/data/ethnic-avatars.json').write_text(
        json.dumps(metadata, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(f'Created {len(records)} avatars; 2 source labels need confirmation.')

if __name__ == '__main__':
    main()
