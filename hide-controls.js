// Video Player Controls Hider
// Film izləyərkən altyazıların üzərindəki player kontrollarını gizlədir
// Sağ klik ilə açılan menyudan idarə edilir

(function () {
    'use strict';

    // Əgər skript artıq işləyirsə, yenidən başlatma
    if (window.__videoControlsHiderActive) {
        return;
    }
    window.__videoControlsHiderActive = true;

    let controlsHidden = false;

    // Video player elementlərini tap
    function findPlayerControls() {
        // Ümumi video player selektorları
        const selectors = [
            '.plyr__controls',           // Plyr player
            '.vjs-control-bar',          // Video.js
            '.jw-controlbar',            // JW Player
            '.ytp-chrome-bottom',        // YouTube
            '[class*="controls"]',       // Generic
            '[class*="control-bar"]',    // Generic
            'video + div',               // Video-dan sonrakı div
            'video ~ div[class*="control"]'
        ];

        for (let selector of selectors) {
            const element = document.querySelector(selector);
            if (element) {
                return element;
            }
        }

        // Əgər heç biri tapılmadısa, video elementinin parent-indəki bütün div-ləri yoxla
        const video = document.querySelector('video');
        if (video && video.parentElement) {
            const siblings = video.parentElement.querySelectorAll('div');
            for (let sibling of siblings) {
                if (sibling.offsetHeight > 30 && sibling.offsetHeight < 150) {
                    return sibling;
                }
            }
        }

        return null;
    }

    // Kontrolları gizlət/göstər
    function toggleControls() {
        const controls = findPlayerControls();
        if (!controls) {
            alert('Player kontrolları tapılmadı! Video playerı yükləndikdən sonra yenidən cəhd edin.');
            return;
        }

        controlsHidden = !controlsHidden;

        if (controlsHidden) {
            controls.style.cssText = 'display: none !important; opacity: 0 !important; pointer-events: none !important;';
            showNotification('Kontroller gizlədildi ✓');
        } else {
            controls.style.cssText = '';
            showNotification('Kontroller göstərildi ✓');
        }
    }

    // Bildiriş göstər
    function showNotification(message) {
        const notification = document.createElement('div');
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 15px 25px;
            border-radius: 8px;
            font-size: 14px;
            z-index: 999999;
            font-family: Arial, sans-serif;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        `;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.transition = 'opacity 0.3s';
            notification.style.opacity = '0';
            setTimeout(() => notification.remove(), 300);
        }, 2000);
    }

    // Sağ klik ilə birbaşa toggle et
    function handleRightClick(e) {
        e.preventDefault();
        toggleControls();
    }

    // Video elementinə sağ klik hadisəsini əlavə et
    function attachRightClick(video) {
        if (video.__controlsHiderAttached) return; // Artıq əlavə edilib

        video.addEventListener('contextmenu', handleRightClick);
        video.__controlsHiderAttached = true;
        console.log('✅ Hazırdır! Video üzərinə sağ klik edin.');
        showNotification('Hazırdır! Sağ klik ilə gizlət/göstər');
    }

    // Mövcud videoları tap və hadisə əlavə et
    function attachToExistingVideos() {
        const videos = document.querySelectorAll('video');
        videos.forEach(video => attachRightClick(video));
        return videos.length > 0;
    }

    // Yeni əlavə olunan videoları izlə
    const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
            mutation.addedNodes.forEach(node => {
                if (node.nodeType === 1) { // Element node
                    if (node.tagName === 'VIDEO') {
                        attachRightClick(node);
                    } else if (node.querySelectorAll) {
                        const videos = node.querySelectorAll('video');
                        videos.forEach(video => attachRightClick(video));
                    }
                }
            });
        }
    });

    // Skripti başlat
    console.log('🎬 Video Player Controls Hider başladı...');

    // Mövcud videoları yoxla
    const foundVideos = attachToExistingVideos();

    // MutationObserver-i başlat (yeni videolar üçün)
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    if (!foundVideos) {
        console.log('⏳ Video gözlənilir... (Dinamik yüklənmə)');
    }

    // Klaviatura qısayolu (Ctrl+H)
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'h') {
            e.preventDefault();
            toggleControls();
        }
    });

    console.log('💡 İstifadə qaydası:');
    console.log('   - Video üzərinə SAĞ KLIK edin');
    console.log('   - və ya Ctrl+H basın');
})();
