from PIL import Image
from pathlib import Path
import json
im=Image.open('data/raw/A0104.jpg')
out=Path('data/raw/census2020-ocr');out.mkdir(exist_ok=True)
panels=[]
for batch in range(30):
    start=72+batch*2*258
    end=min(15294,start+2*258)
    for half,(top,bottom) in enumerate([(150,600),(600,1000),(1000,1420)]):
        name=f'scaled-{batch*3+half}'
        crop=im.crop((start,top,end,bottom))
        crop=crop.resize((crop.width*4,crop.height*4),Image.Resampling.LANCZOS)
        crop.save(out/f'{name}.png')
        panels.append(dict(name=name,start=start,top=top,scale=4))
(out/'panels.json').write_text(json.dumps(panels))
print('Ninety enlarged census panels prepared')
