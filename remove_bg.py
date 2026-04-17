from PIL import Image
import os

names = ['tower_basic', 'tower_aoe', 'tower_slow', 'tower_poison']

for name in names:
    imgPath = f'img/{name}.png'
    if not os.path.exists(imgPath):
        continue
    img = Image.open(imgPath).convert("RGBA")
    datas = img.getdata()
    
    newData = []
    # If pixel is almost white, make it transparent
    for item in datas:
        if item[0] > 240 and item[1] > 240 and item[2] > 240:
            newData.append((255, 255, 255, 0))
        else:
            newData.append(item)
            
    img.putdata(newData)
    img.save(imgPath, "PNG")
    print(f"Processed {name}")
