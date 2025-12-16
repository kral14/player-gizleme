// Video Player Controls Hider - AnimeCix üçün
// Sağ klik ilə player kontrollarını gizlət/göstər

(function () {
    'use strict';

    // Duplikasiya yoxla
    if (window.__videoControlsHiderActive) {
        return;
    }
    window.__videoControlsHiderActive = true;

    let controlsHidden = false;
    let lastFoundControls = null;

    // Player kontrollarını tap
    function findPlayerControls() {
        // Əvvəlki tapılanı yoxla
        if (lastFoundControls && document.body.contains(lastFoundControls)) {
            return lastFoundControls;
        }

        // Video elementini tap
        const video = document.querySelector('video');
        if (!video) return null;

        // Ümumi player selektorları
        const selectors = [
            '.plyr__controls',
            '.vjs-control-bar',
            '.jw-controlbar',
            '.ytp-chrome-bottom',
            '[class*="plyr"]',
            '[class*="controls"]',
            '[class*="control-bar"]'
        ];

        for (let selector of selectors) {
            const element = document.querySelector(selector);
            if (element && element.offsetHeight > 0) {
                lastFoundControls = element;
                console.log('✅ Kontroller tapıldı:', selector);
                return element;
            }
        }

        // Video parent-indəki div-ləri yoxla
        if (video.parentElement) {
            const siblings = Array.from(video.parentElement.querySelectorAll('div'));
            for (let sibling of siblings) {
                const height = sibling.offsetHeight;
                if (height > 30 && height < 200 && sibling !== video) {
                    lastFoundControls = sibling;
                    console.log('✅ Kontroller tapıldı (parent div)');
                    return sibling;
                }
            }
        }

        return null;
    }

    // Toggle funksiyası
    function toggleControls() {
        const controls = findPlayerControls();

        if (!controls) {
            console.log('⚠️ Kontroller tapılmadı. Video yüklənməyi gözləyin.');
            return;
        }

        controlsHidden = !controlsHidden;

        if (controlsHidden) {
            controls.style.cssText = 'display: none !important; opacity: 0 !important; pointer-events: none !important; visibility: hidden !important;';
            console.log('✅ Kontroller gizlədildi');
        } else {
            controls.style.cssText = '';
            console.log('✅ Kontroller göstərildi');
        }
    }

    // Sağ klik handler
    function handleRightClick(e) {
        e.preventDefault();
        e.stopPropagation();
        toggleControls();
        return false;
    }

    // Video tapıldıqda setup et
    function setupVideo(video) {
        if (video.__controlsHiderAttached) return;

        video.addEventListener('contextmenu', handleRightClick, true);
        video.__controlsHiderAttached = true;
        console.log('✅ Hazırdır! Video üzərinə sağ klik edin.');
    }

    // Videoları izlə
    let checkCount = 0;
    const maxChecks = 50; // 50 saniyə

    function checkForVideo() {
        const videos = document.querySelectorAll('video');

        if (videos.length > 0) {
            videos.forEach(setupVideo);
            console.log(`✅ ${videos.length} video tapıldı və hazırlandı`);
            return true;
        }

        checkCount++;
        if (checkCount < maxChecks) {
            setTimeout(checkForVideo, 1000);
        } else {
            console.log('❌ Video tapılmadı (50 saniyə gözlənildi)');
        }
        return false;
    }

    // MutationObserver - yeni videolar üçün
    const observer = new MutationObserver((mutations) => {
        const videos = document.querySelectorAll('video');
        videos.forEach(setupVideo);
    });

    // Başlat
    console.log('🎬 Video Controls Hider yükləndi (AnimeCix)');

    // İlk yoxlama
    if (!checkForVideo()) {
        // Observer başlat
        if (document.body) {
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        } else {
            document.addEventListener('DOMContentLoaded', () => {
                observer.observe(document.body, {
                    childList: true,
                    subtree: true
                });
                checkForVideo();
            });
        }
    }

    // Klaviatura qısayolu
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'h') {
            e.preventDefault();
            toggleControls();
        }
    }, true);

    console.log('💡 Sağ klik və ya Ctrl+H ilə toggle edin');
})();
