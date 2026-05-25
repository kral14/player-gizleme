// Video Controls Hider - Universal Browser Extension
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
    let buttonPermanentlyHidden = false; // Sağ klik sonra düymə tamamilə gizlənir

    function findPlayerControls() {
        const video = document.querySelector('video');
        if (!video) return [];

        let foundControls = [];

        // Genişləndirilmiş selektor siyahısı
        const selectors = [
            '.plyr__controls', '.plyr-controls', '.plyr__control-bar', '.plyr__header', '.plyr__top-bar',
            '.vjs-control-bar', '.jw-controlbar', '.jw-controls', '.jw-title', '.jw-overlays',
            '.ytp-chrome-bottom', '.ytp-chrome-top', '.fp-controls', 
            '.art-controls', '.art-bottom', '.art-top',
            '.dplayer-controller', '.dplayer-mask',
            '.macis-controls', '.v-ui', '.player-ui',
            '[class*="subtitle"]:not(track)', '[class*="language"]', '[class*="quality"]',
            '[class*="overlay"][class*="button"]', '[class*="menu"][class*="button"]',
            '[class*="player"][class*="control"]', '[class*="video"][class*="control"]',
            '[class*="controls"]', '[class*="control-bar"]', '[class*="controlbar"]'
        ];

        for (let selector of selectors) {
            try {
                const elements = document.querySelectorAll(selector);
                elements.forEach(el => {
                    if (el && el.offsetHeight > 0 && !foundControls.includes(el) && !el.contains(video)) {
                        foundControls.push(el);
                    }
                });
            } catch(e) {}
        }

        // Parent axtarışı (əgər spesifik kontrol tapılmadılarsa)
        if (foundControls.length === 0 && video.parentElement) {
            const siblings = Array.from(video.parentElement.children);
            for (let sibling of siblings) {
                if (sibling !== video && sibling.tagName === 'DIV') {
                    foundControls.push(sibling);
                }
            }
        }

        return foundControls;
    }

    function toggleControls() {
        const video = document.querySelector('video');

        if (!video) {
            console.log('⚠️ Video tapılmadı');
            updateButton('❌');
            return;
        }

        const controls = findPlayerControls();

        controlsHidden = !controlsHidden;

        if (controlsHidden) {
            const isYouTube = window.location.hostname.includes('youtube.com');

            if (isYouTube) {
                // YouTube üçün xüsusi və təhlükəsiz gizlətmə (Shorts daxil olmaqla)
                const ytControls = document.querySelectorAll('.ytp-chrome-bottom, .ytp-chrome-top, .ytp-gradient-bottom, .ytp-gradient-top, .ytp-watermark, .ytp-ce-element, .ytp-iv-video-content, ytd-reel-player-overlay-renderer, ytd-reel-video-renderer #overlay, ytd-reel-video-renderer #actions, ytd-shorts-player-controls, .ytp-shorts-controls, ytd-reel-video-renderer .overlay');
                ytControls.forEach(el => {
                    el.setAttribute('data-hidden-by-extension', 'true');
                    el.style.cssText = 'opacity: 0 !important; pointer-events: none !important;';
                });
            } else {
                // Köməkçi funksiya: tapılan element həqiqətən altyazıdır, yoxsa sadəcə CC düyməsidir?
                const subtitleSelectors = '[class*="caption"], [class*="Caption"], [class*="subtitle"], [class*="Subtitle"], [class*="subs"], [class*="text-track"], [class*="shaka-text"], [class*="jw-captions"], [class*="jw-text"], [class*="altyaz"], track, [id*="caption"], [id*="subtitle"], [id*="subs"], [id*="track"], [id*="altyaz"]';
                
                const isValidSubtitle = (el) => {
                    if (!el) return false;
                    if (el.tagName === 'BUTTON' || el.tagName === 'A') return false;
                    // Əgər düymə, tooltip, ikon və ya menyu içindədirsə, bu altyazı yox, idarəetmə düyməsidir!
                    if (el.closest('button, a, [class*="button"], [class*="btn"], [class*="tooltip"], [class*="icon"], [class*="menu"]')) return false;
                    const cName = (el.className || '').toString().toLowerCase();
                    if (cName.includes('button') || cName.includes('btn') || cName.includes('tooltip') || cName.includes('icon') || cName.includes('menu') || cName.includes('setting')) return false;
                    return true;
                };

                // Native HTML5 controls
                if (video.hasAttribute('controls')) {
                    video.removeAttribute('controls');
                    video.setAttribute('data-native-controls-hidden', 'true');
                }

                // Əsas kontrolları gizlət
                if (controls && controls.length > 0) {
                    controls.forEach(ctrl => {
                        let hasSubtitleChild = false;
                        try { 
                            const subs = ctrl.querySelectorAll(subtitleSelectors);
                            hasSubtitleChild = Array.from(subs).some(isValidSubtitle);
                        } catch(e){}
                        
                        if (hasSubtitleChild) {
                            Array.from(ctrl.children).forEach(child => {
                                let isSubtitleOrInside = false;
                                let childHasSubtitle = false;
                                try {
                                    const closestSub = child.closest(subtitleSelectors);
                                    isSubtitleOrInside = closestSub !== null && isValidSubtitle(closestSub);
                                    const subs = child.querySelectorAll(subtitleSelectors);
                                    childHasSubtitle = Array.from(subs).some(isValidSubtitle);
                                } catch(e){}
                                
                                if (!isSubtitleOrInside && !childHasSubtitle) {
                                    child.setAttribute('data-hidden-by-extension', 'true');
                                    child.style.cssText = 'opacity: 0 !important; pointer-events: none !important;';
                                }
                            });
                            ctrl.setAttribute('data-hidden-by-extension', 'true');
                            ctrl.style.background = 'transparent';
                        } else {
                            ctrl.setAttribute('data-hidden-by-extension', 'true');
                            ctrl.style.cssText = 'opacity: 0 !important; pointer-events: none !important;';
                        }
                    });
                }

                // Video container-dəki BÜTÜN overlay elementləri gizlət
                const container = video.closest('.jwplayer, .plyr, .video-js, div.player, div#player') || video.closest('div') || video.parentElement;
                if (container) {
                    // Bütün div və button elementləri tap
                    const overlayElements = container.querySelectorAll('div:not(video), button, a[class*="button"]');

                    overlayElements.forEach(el => {
                        // Video özünü gizlətmə
                        if (el !== video && !el.contains(video)) {
                            let isSubtitleOrInside = false;
                            let hasSubtitleChild = false;
                            
                            try {
                                const closestSub = el.closest(subtitleSelectors);
                                isSubtitleOrInside = closestSub !== null && isValidSubtitle(closestSub);
                                const subs = el.querySelectorAll(subtitleSelectors);
                                hasSubtitleChild = Array.from(subs).some(isValidSubtitle);
                            } catch(e) {}

                            // Əgər element özü altyazıdırsa, altyazının içindədirsə və ya daxilində altyazı varsa, gizlətmə!
                            if (!isSubtitleOrInside && !hasSubtitleChild) {
                                console.log('🛑 GİZLƏDİLDİ:', el.tagName, el.className, el.id);
                                el.setAttribute('data-hidden-by-extension', 'true');
                                el.style.cssText = 'opacity: 0 !important; pointer-events: none !important;';
                            }
                        }
                    });
                }


                // Video sibling-lərini də gizlət (iframe player-lər üçün)
                if (video.parentElement) {
                    const siblings = Array.from(video.parentElement.children);
                    siblings.forEach(sibling => {
                        if (sibling !== video && sibling.tagName !== 'VIDEO') {
                            let isSubtitleOrInside = false;
                            let hasSubtitleChild = false;
                            
                            try {
                                const closestSub = sibling.closest(subtitleSelectors);
                                isSubtitleOrInside = closestSub !== null && isValidSubtitle(closestSub);
                                const subs = sibling.querySelectorAll(subtitleSelectors);
                                hasSubtitleChild = Array.from(subs).some(isValidSubtitle);
                            } catch(e) {}

                            if (!isSubtitleOrInside && !hasSubtitleChild) {
                                console.log('🛑 SIBLING GİZLƏDİLDİ:', sibling.tagName, sibling.className, sibling.id);
                                sibling.setAttribute('data-hidden-by-extension', 'true');
                                sibling.style.cssText = 'opacity: 0 !important; pointer-events: none !important;';
                            }
                        }
                    });

                    // Grandparent səviyyəsində də yoxla (nested player-lər üçün)
                    const grandparent = video.parentElement.parentElement;
                    if (grandparent) {
                        const grandSiblings = Array.from(grandparent.children);

                        grandSiblings.forEach(sibling => {
                            // Video parent-i gizlətmə, amma digər sibling-ləri gizlət
                            if (sibling !== video.parentElement && !sibling.contains(video)) {
                                let isSubtitleOrInside = false;
                                let hasSubtitleChild = false;
                                
                                try {
                                    const closestSub = sibling.closest(subtitleSelectors);
                                    isSubtitleOrInside = closestSub !== null && isValidSubtitle(closestSub);
                                    const subs = sibling.querySelectorAll(subtitleSelectors);
                                    hasSubtitleChild = Array.from(subs).some(isValidSubtitle);
                                } catch(e) {}

                                if (!isSubtitleOrInside && !hasSubtitleChild) {
                                    sibling.setAttribute('data-hidden-by-extension', 'true');
                                    sibling.style.cssText = 'opacity: 0 !important; pointer-events: none !important;';
                                }
                            }
                        });
                    }
                }
            }

            console.log('✅ Bütün kontroller və overlay-lər gizlədildi');
            updateButton('👁️');

            // Düyməni də gizlət
            setTimeout(() => {
                if (floatingBtn && controlsHidden) {
                    floatingBtn.style.opacity = '0';
                }
            }, 2000);
        } else {
            if (video.hasAttribute('data-native-controls-hidden')) {
                video.setAttribute('controls', 'controls');
                video.removeAttribute('data-native-controls-hidden');
            }

            // Hamısını geri göstər
            if (controls && controls.length > 0) {
                controls.forEach(ctrl => {
                    ctrl.style.cssText = '';
                });
            }

            // Gizlədilmiş overlay-ləri geri göstər
            const hiddenElements = document.querySelectorAll('[data-hidden-by-extension="true"]');
            hiddenElements.forEach(el => {
                el.removeAttribute('data-hidden-by-extension');
                el.style.cssText = '';
            });

            console.log('✅ Kontroller göstərildi');
            updateButton('🙈');

            // Düyməni göstər
            if (floatingBtn) {
                floatingBtn.style.opacity = '1';
                clearTimeout(hideButtonTimeout);
            }
        }
    }

    let hideButtonTimeout = null;

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
            transition: all 0.3s ease, opacity 0.5s ease;
            opacity: 1;
        `;

        floatingBtn.addEventListener('mouseenter', () => {
            floatingBtn.style.transform = 'scale(1.1)';
            floatingBtn.style.opacity = '1';
            clearTimeout(hideButtonTimeout);
        });

        floatingBtn.addEventListener('mouseleave', () => {
            floatingBtn.style.transform = 'scale(1)';
            scheduleButtonHide();
        });

        floatingBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleControls();
        });

        document.body.appendChild(floatingBtn);
        console.log('✅ Floating button əlavə edildi');

        // Mouse hərəkətində düyməni göstər
        document.addEventListener('mousemove', showButtonTemporarily);
    }

    function showButtonTemporarily() {
        if (!floatingBtn || buttonPermanentlyHidden) return; // Permanent gizlidirsə göstərmə

        floatingBtn.style.opacity = '1';
        scheduleButtonHide();
    }

    function scheduleButtonHide() {
        clearTimeout(hideButtonTimeout);
        hideButtonTimeout = setTimeout(() => {
            if (floatingBtn) {
                floatingBtn.style.opacity = '0';
            }
        }, 5000); // 5 saniyə sonra gizlən
    }

    function updateButton(emoji) {
        if (floatingBtn) {
            floatingBtn.innerHTML = emoji;
        }
    }

    // Long press (sağ klik) üçün qlobal dəyişənlər
    let activationTimeout = null;
    let uiDelayTimeout = null;
    let countdownInterval = null;
    let wasLongPress = false;
    let countdownOverlay = null;

    function createCountdownOverlay() {
        if (countdownOverlay) return countdownOverlay;
        countdownOverlay = document.createElement('div');
        countdownOverlay.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 72px;
            color: white;
            background: rgba(0,0,0,0.8);
            padding: 30px 50px;
            border-radius: 20px;
            z-index: 2147483647;
            pointer-events: none;
            display: none;
            font-family: 'Segoe UI', Arial, sans-serif;
            font-weight: bold;
            transition: opacity 0.2s;
            box-shadow: 0 4px 20px rgba(0,0,0,0.6);
            text-align: center;
        `;
        document.body.appendChild(countdownOverlay);
        return countdownOverlay;
    }

    function showCountdown(text) {
        const overlay = createCountdownOverlay();
        overlay.innerHTML = text;
        overlay.style.display = 'block';
        overlay.style.opacity = '1';
    }

    function hideCountdown() {
        if (countdownOverlay) {
            countdownOverlay.style.opacity = '0';
            setTimeout(() => {
                if (countdownOverlay) countdownOverlay.style.display = 'none';
            }, 200);
        }
    }

    function setupVideo(video) {
        if (video.__controlsHiderAttached) return;

        function cancelLongPress() {
            clearTimeout(uiDelayTimeout);
            clearTimeout(activationTimeout);
            clearInterval(countdownInterval);
            if (!wasLongPress) {
                hideCountdown();
            }
        }

        video.addEventListener('mousedown', (e) => {
            if (e.button === 2) { // Sağ klik
                wasLongPress = false;

                // Ani klikləri (normal kontekst menyusu) fərqləndirmək üçün 200ms gözləyirik
                uiDelayTimeout = setTimeout(() => {
                    let timeLeft = 0.3; // 0.5 saniyədən 0.2-si getdi
                    showCountdown(timeLeft.toFixed(1) + "s");

                    countdownInterval = setInterval(() => {
                        timeLeft -= 0.1;
                        if (timeLeft > 0.05) { // 0-ın altına düşməməsi üçün
                            showCountdown(timeLeft.toFixed(1) + "s");
                        }
                    }, 100);
                }, 200);

                // Əsas əməliyyat 0.5 saniyə (500ms) sonra icra edilir
                activationTimeout = setTimeout(() => {
                    clearInterval(countdownInterval);
                    wasLongPress = true;

                    // Sağ klik - düyməni tamamilə gizlət
                    buttonPermanentlyHidden = true;
                    if (floatingBtn) {
                        floatingBtn.style.opacity = '0';
                        clearTimeout(hideButtonTimeout);
                    }

                    toggleControls();

                    const statusText = controlsHidden ? "AKTİVLƏŞDİRİLDİ<br><span style='font-size:24px'>Kontrollar Gizlədildi</span>" : "DEAKTİVLƏŞDİRİLDİ<br><span style='font-size:24px'>Kontrollar Göstərildi</span>";
                    showCountdown(statusText);

                    setTimeout(() => {
                        hideCountdown();
                    }, 1200);

                }, 500);
            }
        });

        video.addEventListener('mouseup', (e) => {
            if (e.button === 2) cancelLongPress();
        });

        video.addEventListener('mouseleave', (e) => cancelLongPress());

        // Kontekst menyu (əgər 1.5 saniyə basılı qalıbsa, açılmasının qarşısını al)
        video.addEventListener('contextmenu', (e) => {
            if (wasLongPress) {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                wasLongPress = false; // reset
                return false;
            }
        }, { capture: true, passive: false });

        // Debugging: sol düymə hadisələrini izləyirik
        video.addEventListener('mousedown', (e) => {
            if (e.button === 0 && controlsHidden) {
                e.stopPropagation();
            }
        }, { capture: true });

        video.addEventListener('mouseup', (e) => {
            if (e.button === 0 && controlsHidden) {
                e.stopPropagation();
            }
        }, { capture: true });

        // Kontrollar gizli olduqda bəzi playerlərdə sol klik (play/pause) işləmir, bunu bərpa edirik
        video.addEventListener('click', (e) => {
            if (e.button === 0) { // Sol klik
                if (controlsHidden) {
                    e.preventDefault();
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                    
                    if (video.paused) {
                        video.play();
                    } else {
                        video.pause();
                    }
                }
            }
        }, { capture: true });

        video.__controlsHiderAttached = true;
        console.log('✅ Video hazırlandı (1.5 saniyəlik basılı tutma aktivdir)');
    }

    let checkCount = 0;
    const maxChecks = 100;

    function checkForVideo() {
        const videos = document.querySelectorAll('video');
        const isIframe = window.self !== window.top;
        const context = isIframe ? '🖼️' : '📄';

        if (videos.length > 0) {
            videos.forEach(setupVideo);
            console.log(`${context} ✅ ${videos.length} video tapıldı`);

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
        const isIframe = window.self !== window.top;
        const context = isIframe ? '🖼️ IFRAME' : '📄 MAIN PAGE';
        console.log(`${context} 🎬 Video Controls Hider Extension`);
        console.log(`${context} URL: ${window.location.href}`);

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
            if (e.altKey && e.key.toLowerCase() === 'd') {
                e.preventDefault();
                const video = document.querySelector('video');
                if (video) {
                    // Əsas player qutusunu tam tutmaq üçün
                    let container = video.closest('.jwplayer') || video.closest('.plyr') || video.closest('.video-js') || video.closest('.html5-video-player') || video.closest('#player') || video.closest('.player') || video.parentElement.parentElement || video.parentElement;
                    
                    let html = container ? container.outerHTML : video.outerHTML;
                    html = html.replace(/<svg.*?<\/svg>/gi, '<svg>...</svg>');
                    html = html.replace(/<script.*?<\/script>/gi, '');
                    html = html.replace(/<style.*?<\/style>/gi, '');
                    
                    var element = document.createElement('a');
                    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(html));
                    element.setAttribute('download', 'player_html_tam.txt');
                    element.style.display = 'none';
                    document.body.appendChild(element);
                    element.click();
                    document.body.removeChild(element);
                    alert("TAM HTML kod yükləndi! Zəhmət olmasa yeni yüklənən player_html_tam.txt faylını mənə göndərin.");
                }
            }
            // Sərbəst "H" düyməsi deaktiv edildi, çünki yazarkən problem yaradır
        }, { capture: true });

        console.log('💡 Düyməyə klik və ya H basın');
    }

    // Kontekst menyudan mesaj dinlə
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        console.log('📨 Mesaj alındı:', message);

        if (message.action === 'toggleControlsFromContextMenu') {
            console.log('🎬 Kontekst menyudan toggle işə salınır...');
            toggleControls();
            sendResponse({ success: true });
            console.log('✅ Toggle tamamlandı');
        }

        return true; // Async response üçün
    });

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
