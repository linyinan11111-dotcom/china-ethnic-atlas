from PIL import Image,ImageDraw
from pathlib import Path
import json
root=Path('data/raw/census2020-ocr')
im=Image.open('data/raw/A0104.jpg').convert('RGB')
matrix=json.loads((root/'matrix-draft.json').read_text())
ys=[190,254,286,318,350,382,446,478,510,574,606,638,670,702,734,766,830,862,894,926,958,990,1054,1086,1118,1150,1182,1246,1278,1310,1342,1374]
issues=[];inks=[]
for r,y in enumerate(ys):
    for g in range(59):
        x=72+g*258
        ink=sum(1 for p in im.crop((x+3,y-12,x+85,y+12)).getdata() if max(p)<180)
        inks.append(dict(row=r,group=g,ink=ink))
        total,male,female=matrix[r][g]
        if (ink and total is None) or (total is not None and male is not None and female is not None and total!=male+female):
            issues.append(dict(row=r,group=g,value=total,male=male,female=female,ink=ink))
(root/'ink.json').write_text(json.dumps(inks))
(root/'review.json').write_text(json.dumps(issues))
for batch in range((len(issues)+39)//40):
    sheet=Image.new('RGB',(1000,((min(40,len(issues)-batch*40)+3)//4)*90),'white');draw=ImageDraw.Draw(sheet)
    for i,item in enumerate(issues[batch*40:(batch+1)*40]):
        r,g=item['row'],item['group'];x=72+g*258;y=ys[r];px=(i%4)*250;py=(i//4)*90
        draw.text((px+4,py+4),f"r{r} g{g}: OCR {item['value']}",fill='black')
        crop=im.crop((x+2,y-12,x+86,y+12)).resize((210,60))
        sheet.paste(crop,(px+4,py+20))
    sheet.save(root/f'review-{batch}.png')
print(len(issues),'cells need visual checking')
