import os
from PIL import Image, ImageDraw, ImageFont

def create_icon(size, output_path):
    # Arxa plan: Tünd rəngli dairəvi kvadrat
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Küncləri yuvarlaq kvadrat
    radius = size // 6
    draw.rounded_rectangle(
        [(0, 0), (size-1, size-1)],
        radius=radius,
        fill=(33, 150, 243, 255) # Mavi
    )
    
    # Ortada qara player ekranı
    margin = size // 5
    draw.rounded_rectangle(
        [(margin, margin), (size-margin-1, size-margin-1)],
        radius=radius//2,
        fill=(0, 0, 0, 255)
    )
    
    # Play düyməsi üçbucağı (ağ)
    triangle_points = [
        (size//2 - size//10, size//2 - size//8),
        (size//2 - size//10, size//2 + size//8),
        (size//2 + size//8, size//2)
    ]
    draw.polygon(triangle_points, fill=(255, 255, 255, 255))
    
    # Üzərindən keçən qırmızı qadağa xətti (Gizlətmək mənası)
    draw.line(
        [(size//6, size//6), (size - size//6, size - size//6)],
        fill=(244, 67, 54, 255), # Qırmızı
        width=max(2, size // 12)
    )
    
    img.save(output_path, "PNG")

sizes = [16, 48, 128]
out_dir = "e:/player-gizleme/extension"
os.makedirs(out_dir, exist_ok=True)

for s in sizes:
    create_icon(s, os.path.join(out_dir, f"icon{s}.png"))
    print(f"Created icon{s}.png")
