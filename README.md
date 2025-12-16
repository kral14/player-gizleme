# Video Player Controls Hider

Film izləyərkən altyazıların üzərindəki player kontrollarını gizlətmək üçün skript.

## 🎯 İstifadə

### AnimeCix.tv üçün

1. Film səhifəsini açın: https://animecix.tv
2. **F12** basıb Console açın
3. [hide-controls-simple.js](file:///C:/Users/nesib/.gemini/antigravity/scratch/video-player-controls-hider/hide-controls-simple.js) faylını açın
4. Bütün kodu kopyalayıb console-a yapışdırın
5. **Enter** basın

### Nəticə

Console-da görəcəksiniz:
```
🎬 Video Controls Hider yükləndi (AnimeCix)
✅ 1 video tapıldı və hazırlandı
✅ Hazırdır! Video üzərinə sağ klik edin.
```

## 🎮 Necə İşlədir

- **İlk SAĞ KLIK** → Kontroller gizlənir
- **İkinci SAĞ KLIK** → Kontroller göstərilir
- **Ctrl+H** → Eyni funksiya

## 🔧 Xüsusiyyətlər

✅ Dinamik video yüklənməsi dəstəyi (50 saniyə gözləyir)  
✅ MutationObserver ilə avtomatik aşkarlama  
✅ Kontrol cache sistemi (performans)  
✅ Event capturing (daha güclü)  
✅ Plyr, Video.js və digər playerləri dəstəkləyir

## ❓ Problem Həlli

### Video tapılmır
- Səhifəni yeniləyin və yenidən cəhd edin
- Video tam yüklənənə qədər gözləyin (50 saniyə)

### Sağ klik işləmir
- Console-da xəta varmı yoxlayın
- Skripti yenidən yapışdırın

### Kontroller tapılmır
Console-da yazın:
```javascript
document.querySelector('video')
```
Video varsa, sonra:
```javascript
document.querySelector('.plyr__controls')
```

## 📝 Qeydlər

- Skript yalnız cari səhifədə işləyir
- Səhifəni yeniləyəndə yenidən yapışdırmalısınız
- Daimi həll üçün Tampermonkey istifadə edin

---

**Son yeniləmə:** 2025-12-16  
**Versiya:** 2.0 (AnimeCix optimized)
