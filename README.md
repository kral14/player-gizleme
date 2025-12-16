# AnimeCix Video Controls Hider

Browser extension - AnimeCix video player kontrollarını gizlətmək üçün.

## 🚀 Quraşdırma

### Chrome/Edge üçün:

1. **Chrome/Edge açın** və yazın:
   - Chrome: `chrome://extensions/`
   - Edge: `edge://extensions/`

2. **Developer mode** aktivləşdirin (yuxarı sağ küncdə)

3. **"Load unpacked"** düyməsinə basın

4. **extension** qovluğunu seçin:
   ```
   C:\Users\nesib\.gemini\antigravity\scratch\video-player-controls-hider\extension
   ```

5. ✅ Extension quraşdırıldı!

## 💡 İstifadə

Extension quraşdırıldıqdan sonra AnimeCix-ə daxil olun:

- **H** düyməsinə basın → Kontroller toggle olur
- **Ctrl+H** basın → Eyni effekt  
- **🙈 düyməyə** klik edin (sağ alt künc)
- **Video üzərində sağ klik** → Toggle

## ✨ Xüsusiyyətlər

✅ **Avtomatik işləyir** - Tampermonkey lazım deyil  
✅ **iframe dəstəyi** - tau-video.xyz və digər iframe-lər  
✅ **Floating button UI** - Sağ alt küncdə 🙈 düyməsi  
✅ **Klaviatura qısayolları** - H və Ctrl+H  
✅ **Sağ klik dəstəyi** - Video üzərində  
✅ **Dinamik aşkarlama** - MutationObserver ilə  
✅ **Plyr, Video.js** və digər playerləri dəstəkləyir

## 🎮 Necə İşlədir

1. Extension avtomatik olaraq AnimeCix.tv və tau-video.xyz saytlarında aktivləşir
2. Video tapıldıqda sağ alt küncdə 🙈 düyməsi görünür
3. **H** basın və ya **düyməyə klik** edin
4. Kontroller gizlənir/göstərilir

## 📁 Struktur

```
video-player-controls-hider/
├── extension/              # Browser extension
│   ├── manifest.json      # Extension konfiqurasiyası
│   ├── content.js         # Əsas skript
│   ├── icon*.png          # İkonlar
│   └── README.md          # Ətraflı təlimatlar
└── README.md              # Bu fayl
```

## ❓ Problem Həlli

### Extension işləmir
- Developer mode aktivdir?
- Extension enable edilib?
- Səhifəni yeniləyin (F5)

### Kontroller tapılmır
- Video tam yüklənənə qədər gözləyin
- Console açıb (F12) xəta varmı yoxlayın
- Extension-u reload edin

### Düymə görünmür
- Səhifədə video varmı yoxlayın
- Console-da `document.querySelector('video')` yazın

---

**Versiya:** 1.0.0  
**Son yeniləmə:** 2025-12-16  
**GitHub:** https://github.com/kral14/player-gizleme
