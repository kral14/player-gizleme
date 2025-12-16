// AnimeCix Video Controls Hider - Browser Extension
// Sağ klik və ya H düyməsi ilə player kontrollarını gizlət/göstər

(function () {
    'use strict';

    if (window.__videoControlsHiderActive) {
        return;
    }
    window.__videoControlsHiderActive = true;

    // Debug - extension yükləndi
    const debugMode = false; // Alert söndürüldü
    if (debugMode) {
        setTimeout(() => {
            alert('🎬 Extension yükləndi! H düyməsinə basın.');
        }, 1000);
    }

    let controlsHidden = false;
    let lastFoundControls = null;
    let floatingBtn = null;

    function findPlayerControls() {
        if (lastFoundControls && document.body.contains(lastFoundControls)) {
            return lastFoundControls;
        }

        const video = document.querySelector('video');
        if (!video) {
            console.log('⚠️ Video elementi tapılmadı');
            return null;
        }

        console.log('🎥 Video tapıldı:', video);

        // Genişləndirilmiş selektor siyahısı
        const selectors = [
            // Plyr
            '.plyr__controls',
            '.plyr-controls',
            '[class*="plyr"][class*="control"]',

            // Video.js
            '.vjs-control-bar',
            '.video-js .vjs-control-bar',

            // JW Player
            '.jw-controlbar',
            '.jw-controls',

            // YouTube
            '.ytp-chrome-bottom',
            '.ytp-chrome-controls',

            // Flowplayer
            '.fp-controls',
            '.flowplayer .fp-controls',

            // Generic
            '[class*="player"][class*="control"]',
            '[class*="video"][class*="control"]',
            '[class*="controls"]',
            '[class*="control-bar"]',
            '[class*="controlbar"]',

            // HDFilmCehennemi və oxşar saytlar
            '[class*="jw"]',
            '[id*="control"]',
            '[id*="player-control"]'
        ];

        for (let selector of selectors) {
            const element = document.querySelector(selector);
            if (element && element.offsetHeight > 0) {
                lastFoundControls = element;
                console.log('✅ Kontroller tapıldı:', selector, element);
                return element;
            }
        }

        // Video parent-də axtarış
        if (video.parentElement) {
            console.log('🔍 Video parent-də axtarış...');
            const siblings = Array.from(video.parentElement.querySelectorAll('div'));
            for (let sibling of siblings) {
                const height = sibling.offsetHeight;
                const width = sibling.offsetWidth;
                // Kontrol bar adətən geniş və qısa olur
                if (height > 30 && height < 200 && width > 200 && sibling !== video) {
                    lastFoundControls = sibling;
                    console.log('✅ Kontroller tapıldı (parent div):', sibling);
                    return sibling;
                }
            }
        }

        // Video container-də axtarış
        const container = video.closest('[class*="player"], [class*="video"], [id*="player"]');
        if (container) {
            console.log('🔍 Container-də axtarış...', container);
            const controlDivs = container.querySelectorAll('div');
            for (let div of controlDivs) {
                const height = div.offsetHeight;
                const width = div.offsetWidth;
                if (height > 30 && height < 200 && width > 200 && div !== video) {
                    lastFoundControls = div;
                    console.log('✅ Kontroller tapıldı (container div):', div);
                    return div;
                }
            }
        }

        console.log('❌ Heç bir kontrol tapılmadı');
        return null;
    }

    function toggleControls() {
        const controls = findPlayerControls();

        if (!controls) {
            console.log('⚠️ Kontroller tapılmadı - video yüklənməyi gözləyin');
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

    function createFloatingButton() {
        floatingBtn = document.createElement('div');
        floatingBtn.innerHTML = '🙈';
        floatingBtn.title = 'Kontroller gizlət/göstər (və ya H basın)';
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
        });

        floatingBtn.addEventListener('mouseleave', () => {
            floatingBtn.style.transform = 'scale(1)';
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
        console.log('🎬 AnimeCix Video Controls Hider Extension');

        if (!checkForVideo()) {
            if (document.body) {
                observer.observe(document.body, {
                    childList: true,
                    subtree: true
                });
            }
        }

        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'h') {
                e.preventDefault();
                toggleControls();
            }
            if (e.key === 'h' && !e.ctrlKey && !e.altKey && !e.shiftKey) {
                const target = e.target;
                if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
                    e.preventDefault();
                    toggleControls();
                }
            }
        }, { capture: true });

        console.log('💡 Düyməyə klik və ya H basın');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
