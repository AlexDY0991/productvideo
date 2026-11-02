# 把多张图拼成对比图。用法: python3 sheet.py out.jpg 列数 单图宽度 图1 图2 ...
import sys
from PIL import Image, ImageDraw
out=sys.argv[1]; cols=int(sys.argv[2]); w=int(sys.argv[3]); files=sys.argv[4:]
ims=[]
for f in files:
    im=Image.open(f).convert('RGB'); r=w/im.width; im=im.resize((w,int(im.height*r))); ims.append((f,im))
h=max(i.height for _,i in ims); rows=(len(ims)+cols-1)//cols
S=Image.new('RGB',(cols*w,rows*(h+18)),'white'); d=ImageDraw.Draw(S)
for k,(f,im) in enumerate(ims):
    x=(k%cols)*w; y=(k//cols)*(h+18); S.paste(im,(x,y+18)); d.text((x+4,y+3),f.split('/')[-1],fill='black')
S.save(out,quality=88)
