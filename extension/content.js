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
            // Plyr - Genişləndirilmiş
            '.plyr__controls',
            '.plyr-controls',
            '.plyr__control',
            '.plyr__control-bar',
            '.plyr__header',
            '.plyr__top-bar',
            '.plyr__top-controls',
            '.plyr__bottom-controls',
            '.plyr__progress',
            '.plyr__volume',
            '.plyr__time',
            '.plyr__menu',
            '[class*="plyr"][class*="control"]',
            '[class*="plyr__"]',

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

            // Altyazı və Dil Seçim Düymələri
            '[class*="subtitle"]',
            '[class*="caption"]',
            '[class*="language"]',
            '[class*="audio-track"]',
            '[class*="quality"]',
            '[id*="subtitle"]',
            '[id*="caption"]',
            '[id*="language"]',

            // Overlay və Popup Menular
            '[class*="overlay"][class*="button"]',
            '[class*="menu"][class*="button"]',
            '[class*="settings"]',
            '[class*="option"]',

            // Generic
            '[class*="player"][class*="control"]',
            '[class*="video"][class*="control"]',
            '[class*="controls"]',
            '[class*="control-bar"]',
            '[class*="controlbar"]',

            // Generic player selectors
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
        const video = document.querySelector('video');

        if (!video) {
            console.log('⚠️ Video tapılmadı');
            updateButton('❌');
            return;
        }

        const controls = findPlayerControls();

        controlsHidden = !controlsHidden;

        if (controlsHidden) {
            // Əsas kontrolları gizlət
            if (controls) {
                controls.style.cssText = 'display: none !important; opacity: 0 !important; pointer-events: none !important; visibility: hidden !important;';
            }

            // Video container-dəki BÜTÜN overlay elementləri gizlət
            const container = video.closest('div') || video.parentElement;
            if (container) {
                // Bütün div və button elementləri tap
                const overlayElements = container.querySelectorAll('div:not(video), button, a[class*="button"]');

                overlayElements.forEach(el => {
                    // Video özünü gizlətmə
                    if (el !== video && !el.contains(video)) {
                        const rect = el.getBoundingClientRect();
                        const hasPlyrClass = el.className && el.className.toString().includes('plyr');

                        // Plyr elementləri və ya kiçik overlay-lər
                        if (hasPlyrClass || (rect.width > 0 && rect.height > 0 && rect.height < 300)) {
                            el.setAttribute('data-hidden-by-extension', 'true');
                            el.style.cssText = 'display: none !important; opacity: 0 !important; pointer-events: none !important; visibility: hidden !important;';
                        }
                    }
                });
            }


            // Video sibling-lərini də gizlət (iframe player-lər üçün)
            if (video.parentElement) {
                const siblings = Array.from(video.parentElement.children);

                siblings.forEach(sibling => {
                    if (sibling !== video && sibling.tagName !== 'VIDEO') {
                        sibling.setAttribute('data-hidden-by-extension', 'true');
                        sibling.style.cssText = 'display: none !important; opacity: 0 !important; pointer-events: none !important; visibility: hidden !important;';
                    }
                });

                // Grandparent səviyyəsində də yoxla (nested player-lər üçün)
                const grandparent = video.parentElement.parentElement;
                if (grandparent) {
                    const grandSiblings = Array.from(grandparent.children);

                    grandSiblings.forEach(sibling => {
                        // Video parent-i gizlətmə, amma digər sibling-ləri gizlət
                        if (sibling !== video.parentElement && !sibling.contains(video)) {
                            sibling.setAttribute('data-hidden-by-extension', 'true');
                            sibling.style.cssText = 'display: none !important; opacity: 0 !important; pointer-events: none !important; visibility: hidden !important;';
                        }
                    });
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
            // Hamısını geri göstər
            if (controls) {
                controls.style.cssText = '';
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

    function setupVideo(video) {
        if (video.__controlsHiderAttached) return;

        // YouTube üçün sağ klik funksiyasını deaktiv et (sessiya error-u önləmək üçün)
        const isYouTube = window.location.hostname.includes('youtube.com');

        if (!isYouTube) {
            video.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();

                // Sağ klik - düyməni tamamilə gizlət
                buttonPermanentlyHidden = true;
                if (floatingBtn) {
                    floatingBtn.style.opacity = '0';
                    clearTimeout(hideButtonTimeout);
                }

                toggleControls();
                return false;
            }, { capture: true, passive: false });
        }

        video.__controlsHiderAttached = true;
        console.log('✅ Video hazırlandı');
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
