// Video Controls Hider - Sağ Klik Bloku Bypass
// Floating button + Klaviatura qısayolu

(function () {
    'use strict';

    if (window.__videoControlsHiderActive) {
        return;
    }
    window.__videoControlsHiderActive = true;

    let controlsHidden = false;
    let lastFoundControls = null;

    function findPlayerControls() {
        if (lastFoundControls && document.body.contains(lastFoundControls)) {
            return lastFoundControls;
        }

        const video = document.querySelector('video');
        if (!video) return null;

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

    function toggleControls() {
        const controls = findPlayerControls();

        if (!controls) {
            console.log('⚠️ Kontroller tapılmadı');
            updateButton('❌');
            return;
        }

        controlsHidden = !controlsHidden;

        if (controlsHidden) {
            controls.style.cssText = 'display: none !important; opacity: 0 !important; pointer-events: none !important; visibility: hidden !important;';
            console.log('✅ Kontroller gizlədildi');
            updateButton('👁️');
        } else {
            controls.style.cssText = '';
            console.log('✅ Kontroller göstərildi');
            updateButton('🙈');
        }
    }

    // Floating button yaradır
    let floatingBtn = null;

    function createFloatingButton() {
        floatingBtn = document.createElement('div');
        floatingBtn.innerHTML = '🙈';
        floatingBtn.style.cssText = `
            position: fixed;
            bottom: 100px;
            right: 20px;
            width: 50px;
            height: 50px;
            background: rgba(0, 0, 0, 0.7);
            color: white;
            border: 2px solid #4CAF50;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            font-size: 24px;
            z-index: 999999;
            box-shadow: 0 4px 8px rgba(0,0,0,0.3);
            transition: all 0.3s ease;
        `;

        floatingBtn.addEventListener('mouseenter', () => {
            floatingBtn.style.transform = 'scale(1.1)';
            floatingBtn.style.boxShadow = '0 6px 12px rgba(0,0,0,0.4)';
        });

        floatingBtn.addEventListener('mouseleave', () => {
            floatingBtn.style.transform = 'scale(1)';
            floatingBtn.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3)';
        });

        floatingBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleControls();
        });

        document.body.appendChild(floatingBtn);
        console.log('✅ Floating button əlavə edildi');
    }

    function updateButton(emoji) {
        if (floatingBtn) {
            floatingBtn.innerHTML = emoji;
        }
    }

    function setupVideo(video) {
        if (video.__controlsHiderAttached) return;

        // Sağ klik - ən yüksək prioritet ilə
        video.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            toggleControls();
            return false;
        }, { capture: true, passive: false });

        video.__controlsHiderAttached = true;
        console.log('✅ Video hazırlandı');
    }

    let checkCount = 0;
    const maxChecks = 100;

    function checkForVideo() {
        const videos = document.querySelectorAll('video');

        if (videos.length > 0) {
            videos.forEach(setupVideo);
            console.log(`✅ ${videos.length} video tapıldı`);

            // Floating button əlavə et
            if (!floatingBtn && document.body) {
                createFloatingButton();
            }
            return true;
        }

        checkCount++;
        if (checkCount < maxChecks) {
            setTimeout(checkForVideo, 1000);
        }
        return false;
    }

    const observer = new MutationObserver(() => {
        const videos = document.querySelectorAll('video');
        videos.forEach(setupVideo);

        if (videos.length > 0 && !floatingBtn && document.body) {
            createFloatingButton();
        }
    });

    function init() {
        console.log('🎬 Video Controls Hider (Button + Hotkey)');

        if (!checkForVideo()) {
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

        // Klaviatura qısayolları
        document.addEventListener('keydown', (e) => {
            // Ctrl+H
            if (e.ctrlKey && e.key === 'h') {
                e.preventDefault();
                toggleControls();
            }
            // Sadəcə H (input field-də deyilsə)
            if (e.key === 'h' && !e.ctrlKey && !e.altKey && !e.shiftKey) {
                const target = e.target;
                if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
                    e.preventDefault();
                    toggleControls();
                }
            }
        }, { capture: true });

        console.log('💡 İstifadə:');
        console.log('   - Sağ alt küncdəki düyməyə klik edin');
        console.log('   - və ya "H" düyməsinə basın');
        console.log('   - və ya Ctrl+H basın');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
