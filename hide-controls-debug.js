// Video Controls Hider - Debug Versiyası
// Console-da ətraflı məlumat göstərir

(function () {
    'use strict';

    if (window.__videoControlsHiderActive) {
        console.log('⚠️ Skript artıq işləyir');
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
        if (!video) {
            console.log('⚠️ Video elementi tapılmadı');
            return null;
        }

        console.log('✅ Video tapıldı:', video);
        console.log('   Video parent:', video.parentElement);

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
                console.log('✅ Kontroller tapıldı:', selector, element);
                return element;
            }
        }

        // Parent-dəki div-ləri yoxla
        if (video.parentElement) {
            const siblings = Array.from(video.parentElement.querySelectorAll('div'));
            console.log(`   Parent-də ${siblings.length} div tapıldı`);

            for (let sibling of siblings) {
                const height = sibling.offsetHeight;
                console.log(`   Div yoxlanır: height=${height}px, classes=${sibling.className}`);

                if (height > 30 && height < 200 && sibling !== video) {
                    lastFoundControls = sibling;
                    console.log('✅ Kontroller tapıldı (parent div):', sibling);
                    return sibling;
                }
            }
        }

        console.log('❌ Kontroller tapılmadı');
        return null;
    }

    function toggleControls() {
        console.log('🔄 Toggle çağırıldı...');
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

    function handleRightClick(e) {
        console.log('🖱️ Sağ klik aşkarlandı!');
        e.preventDefault();
        e.stopPropagation();
        toggleControls();
        return false;
    }

    function setupVideo(video) {
        if (video.__controlsHiderAttached) {
            console.log('⚠️ Bu videoya artıq əlavə edilib');
            return;
        }

        video.addEventListener('contextmenu', handleRightClick, true);
        video.__controlsHiderAttached = true;
        console.log('✅ Video hazırlandı! Sağ klik edin.');
    }

    let checkCount = 0;
    const maxChecks = 50;

    function checkForVideo() {
        console.log(`🔍 Video axtarılır... (${checkCount + 1}/${maxChecks})`);
        const videos = document.querySelectorAll('video');

        if (videos.length > 0) {
            console.log(`✅ ${videos.length} video tapıldı!`);
            videos.forEach((v, i) => {
                console.log(`   Video ${i + 1}:`, v);
                setupVideo(v);
            });
            return true;
        }

        checkCount++;
        if (checkCount < maxChecks) {
            setTimeout(checkForVideo, 1000);
        } else {
            console.log('❌ 50 saniyə gözlənildi, video tapılmadı');
        }
        return false;
    }

    const observer = new MutationObserver((mutations) => {
        const videos = document.querySelectorAll('video');
        if (videos.length > 0) {
            console.log('🔔 MutationObserver: Video aşkarlandı!');
            videos.forEach(setupVideo);
        }
    });

    console.log('🎬 Video Controls Hider (DEBUG MODE)');
    console.log('📊 DOM vəziyyəti:', document.readyState);
    console.log('📊 Body mövcud:', !!document.body);

    if (!checkForVideo()) {
        if (document.body) {
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
            console.log('👁️ MutationObserver başladı');
        }
    }

    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'h') {
            e.preventDefault();
            console.log('⌨️ Ctrl+H basıldı');
            toggleControls();
        }
    }, true);

    console.log('💡 Hazır! Sağ klik və ya Ctrl+H ilə test edin');
    console.log('💡 Əgər işləmirsə, console-da nə yazır yoxlayın');
})();
