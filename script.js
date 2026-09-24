/**
 * ==========================================================================
 * REMO BISWAS • DIGITAL MARKETER • FOUNDER OF AdgrowX
 * HIGH-PERFORMANCE SCROLL ENGINE • 240-FRAME CANVAS • MARKETING HUD
 * OPTIMIZED: Progressive WebP Ladder, RAF-Throttled Scroll, Layout-Cache
 * ==========================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
    // Canvas & Stage Elements
    const canvas = document.getElementById('animation-canvas');
    if (!canvas) return;
    
    // Disable alpha blending on canvas for 20-30% GPU performance improvement
    const context = canvas.getContext('2d', { alpha: false });
    const canvasLoader = document.getElementById('canvasLoader');
    const loaderStatusText = document.getElementById('loaderStatusText');
    const cinematicContainer = document.getElementById('cinematic');

    // HUD & Navigation Elements
    const scrollProgressBar = document.getElementById('scrollProgressBar');
    const currentSceneIndexEl = document.getElementById('currentSceneIndex');
    const currentSceneLabelEl = document.getElementById('currentSceneLabel');
    const sceneDots = document.querySelectorAll('#sceneNavDots .dot');
    const scenePanels = document.querySelectorAll('.scene-panel');
    const mobileToggle = document.getElementById('mobileToggle');
    const mobileDrawer = document.getElementById('mobileDrawer');
    const drawerClose = document.getElementById('drawerClose');
    const drawerLinks = document.querySelectorAll('.drawer-link');
    const navLinks = document.querySelectorAll('.nav-link');

    // Configuration
    const FRAME_COUNT = 240;
    const SCENE_COUNT = 10;
    const SCENE_LABELS = [
        "Hero Intro",
        "Core Strategy",
        "Meta Ads Suite",
        "Google Search Ads",
        "YouTube Video Ads",
        "SEO Dominance",
        "Social & Reels",
        "Web & Funnels",
        "Design & Video",
        "Customer Engine"
    ];

    // Detect WebP support for ~90% smaller frame payload (13.6MB vs 213MB)
    const supportsWebP = (() => {
        try {
            const testCanvas = document.createElement('canvas');
            if (testCanvas.getContext && testCanvas.getContext('2d')) {
                return testCanvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
            }
            return false;
        } catch (e) {
            return false;
        }
    })();

    // Image Preloader State
    const images = new Array(FRAME_COUNT + 1);
    const loadingSet = new Set();
    let loadedImagesCount = 0;
    let isFirstFrameReady = false;

    // Smooth Interpolation State
    let targetFrame = 1;
    let currentFrame = 1;
    let lastDrawnImage = null;
    let activeScene = null;
    let isCinematicVisible = true;
    let rafLoopId = null;

    // Frame Path Formatter
    const getFramePath = (index) => {
        const padded = index.toString().padStart(4, '0');
        if (supportsWebP) {
            return `frames/video_frames_webp/frame_${padded}.webp?v=1`;
        }
        return `frames/video_frames_png/frame_${padded}.png?v=clean`;
    };

    // Canvas Resize with Cover Math & Retina DPR (Capped at 1.75 to save mobile GPU fillrate)
    const resizeCanvas = () => {
        const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
        canvas.width = Math.round(window.innerWidth * dpr);
        canvas.height = Math.round(window.innerHeight * dpr);
        drawFrame(Math.round(currentFrame));
    };

    // Render Canvas Frame with Cover Aspect Ratio
    const drawFrame = (frameIndex) => {
        let img = images[frameIndex];

        // Nearest Loaded Frame Fallback (Prevents flashing during rapid scrubbing)
        if (!img || !img.complete || img.naturalWidth === 0) {
            if (lastDrawnImage && lastDrawnImage.complete && lastDrawnImage.naturalWidth > 0) {
                img = lastDrawnImage;
            } else {
                for (let i = 1; i < FRAME_COUNT; i++) {
                    const prev = images[frameIndex - i];
                    if (prev && prev.complete && prev.naturalWidth > 0) {
                        img = prev;
                        break;
                    }
                    const next = images[frameIndex + i];
                    if (next && next.complete && next.naturalWidth > 0) {
                        img = next;
                        break;
                    }
                }
            }
        }

        if (!img || !img.complete || img.naturalWidth === 0) return;

        lastDrawnImage = img;

        const cw = canvas.width;
        const ch = canvas.height;
        const iw = img.naturalWidth;
        const ih = img.naturalHeight;

        // Cover Ratio Math (Keeps Remo centered & full screen)
        const ratio = Math.max(cw / iw, ch / ih);
        const nw = iw * ratio;
        const nh = ih * ratio;
        const nx = (cw - nw) * 0.5;
        const ny = (ch - nh) * 0.5;

        context.drawImage(img, 0, 0, iw, ih, nx, ny, nw, nh);
    };

    // Single frame loader helper
    const loadFrame = (index, callback) => {
        if (images[index] || loadingSet.has(index)) {
            if (callback && images[index] && images[index].complete) callback(images[index]);
            return;
        }
        loadingSet.add(index);
        const img = new Image();
        img.decoding = 'async';
        img.src = getFramePath(index);
        img.onload = () => {
            images[index] = img;
            loadingSet.delete(index);
            loadedImagesCount++;
            if (callback) callback(img);
        };
        img.onerror = () => {
            loadingSet.delete(index);
            loadedImagesCount++;
        };
    };

    // High Priority Initial Frame 1 Load
    const loadInitialFrame = () => {
        loadFrame(1, (img) => {
            isFirstFrameReady = true;
            lastDrawnImage = img;
            resizeCanvas();
            if (canvasLoader) canvasLoader.classList.add('hidden');
            // Once initial frame is ready, start progressive keyframe ladder
            startProgressivePreload();
        });
    };

    // Progressive Preloader:
    // Stage 1: Keyframe ladder (every 8th frame) so the whole sequence is scrubbable within 1-2s
    // Stage 2: Concurrent queue for all intermediate frames without choking network
    const startProgressivePreload = () => {
        const keyframes = [];
        const STEP = 8;
        for (let i = 1; i <= FRAME_COUNT; i += STEP) {
            if (i !== 1) keyframes.push(i);
        }
        if (FRAME_COUNT % STEP !== 1) keyframes.push(FRAME_COUNT);

        let keyframeIdx = 0;
        const loadNextKeyframes = () => {
            // Load keyframes in batches of 4
            while (keyframeIdx < keyframes.length && loadingSet.size < 4) {
                const f = keyframes[keyframeIdx++];
                loadFrame(f, () => {
                    if (keyframeIdx >= keyframes.length) {
                        // Keyframe ladder loaded! Now stream remaining frames smoothly
                        startFullQueuePreload();
                    } else {
                        loadNextKeyframes();
                    }
                });
            }
        };
        loadNextKeyframes();
    };

    // Controlled Background Queue for remaining frames
    const startFullQueuePreload = () => {
        const queue = [];
        for (let i = 1; i <= FRAME_COUNT; i++) {
            if (!images[i] && !loadingSet.has(i)) {
                queue.push(i);
            }
        }

        const CONCURRENCY = 4;
        const pumpQueue = () => {
            // Priority: load frames closest to current targetFrame first!
            if (queue.length === 0) return;
            queue.sort((a, b) => Math.abs(a - targetFrame) - Math.abs(b - targetFrame));

            while (queue.length > 0 && loadingSet.size < CONCURRENCY) {
                const nextFrame = queue.shift();
                loadFrame(nextFrame, () => {
                    pumpQueue();
                });
            }
        };

        pumpQueue();
    };

    // Switch Active Scene (Drops smoothly from top into view)
    const updateActiveScene = (newSceneIndex) => {
        if (newSceneIndex === activeScene) return;
        activeScene = newSceneIndex;

        // Update Scene Panels
        scenePanels.forEach((panel, idx) => {
            const sceneNum = idx + 1;
            if (sceneNum === activeScene) {
                panel.classList.add('active');
                panel.classList.remove('exit-down');
            } else if (sceneNum < activeScene) {
                panel.classList.remove('active');
                panel.classList.add('exit-down');
            } else {
                panel.classList.remove('active');
                panel.classList.remove('exit-down');
            }
        });

        // Update HUD Indicator Pill
        if (currentSceneIndexEl) {
            currentSceneIndexEl.textContent = activeScene.toString().padStart(2, '0');
        }
        if (currentSceneLabelEl) {
            currentSceneLabelEl.textContent = SCENE_LABELS[activeScene - 1] || "Experience";
        }

        // Update Nav Dots
        sceneDots.forEach((dot, idx) => {
            if (idx + 1 === activeScene) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
    };

    // Cache section layout metrics on resize instead of recalculating on every scroll event
    let sectionCache = [];
    const cacheSectionMetrics = () => {
        const sectionIds = ['cinematic', 'about', 'services', 'projects', 'testimonials', 'contact'];
        sectionCache = sectionIds.map(id => {
            const el = document.getElementById(id);
            if (!el) return null;
            return {
                id,
                top: el.offsetTop,
                height: el.offsetHeight
            };
        }).filter(Boolean);
    };

    // Navbar active links based on cached positions
    const updateNavbarActive = (scrollPos) => {
        const probe = scrollPos + 200;
        for (let i = 0; i < sectionCache.length; i++) {
            const sec = sectionCache[i];
            if (probe >= sec.top && probe < sec.top + sec.height) {
                navLinks.forEach(link => {
                    if (link.getAttribute('href') === `#${sec.id}`) {
                        link.classList.add('active');
                    } else {
                        link.classList.remove('active');
                    }
                });
                break;
            }
        }
    };

    // RAF-throttled scroll coordinator
    let scrollTicking = false;
    const handleScroll = () => {
        if (!scrollTicking) {
            window.requestAnimationFrame(() => {
                onScrollFrame();
                scrollTicking = false;
            });
            scrollTicking = true;
        }
    };

    const onScrollFrame = () => {
        const scrollTop = window.scrollY || window.pageYOffset;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;

        // 1. Update Global Progress Bar
        if (scrollProgressBar && docHeight > 0) {
            const globalProgress = Math.min(Math.max(scrollTop / docHeight, 0), 1);
            scrollProgressBar.style.width = `${globalProgress * 100}%`;
        }

        // 2. Coordinate Cinematic Canvas & HUD Scenes
        if (cinematicContainer) {
            const rect = cinematicContainer.getBoundingClientRect();
            const travelDistance = cinematicContainer.offsetHeight - window.innerHeight;

            if (travelDistance > 0) {
                const cinematicProgress = Math.min(Math.max(-rect.top / travelDistance, 0), 1);

                targetFrame = Math.min(
                    FRAME_COUNT,
                    Math.max(1, Math.round(cinematicProgress * (FRAME_COUNT - 1)) + 1)
                );

                let sceneIndex = Math.floor(cinematicProgress * SCENE_COUNT) + 1;
                if (sceneIndex > SCENE_COUNT) sceneIndex = SCENE_COUNT;
                if (sceneIndex < 1) sceneIndex = 1;

                updateActiveScene(sceneIndex);

                // Priority load frames around current target
                for (let offset = -4; offset <= 4; offset++) {
                    const f = targetFrame + offset;
                    if (f >= 1 && f <= FRAME_COUNT && !images[f] && !loadingSet.has(f)) {
                        loadFrame(f);
                    }
                }
            }
        }

        // 3. Highlight Navbar Active Section
        updateNavbarActive(scrollTop);
    };

    // Smooth Lerp Animation Loop (Pauses when cinematic stage is off-screen)
    const animationLoop = () => {
        if (isCinematicVisible) {
            const diff = targetFrame - currentFrame;
            if (Math.abs(diff) > 0.01 || !lastDrawnImage) {
                currentFrame += diff * 0.18;
                drawFrame(Math.round(currentFrame));
            }
        }
        rafLoopId = requestAnimationFrame(animationLoop);
    };

    // Visibility Observer to pause RAF loop when user scrolls below the cinematic stage
    if ('IntersectionObserver' in window && cinematicContainer) {
        const visibilityObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                isCinematicVisible = entry.isIntersecting;
            });
        }, { rootMargin: '100px 0px' });
        visibilityObserver.observe(cinematicContainer);
    }

    // Clickable Scene Navigation Dots
    sceneDots.forEach(dot => {
        dot.addEventListener('click', () => {
            const targetIdx = parseInt(dot.getAttribute('data-index'), 10);
            if (!cinematicContainer || isNaN(targetIdx)) return;

            const travelDistance = cinematicContainer.offsetHeight - window.innerHeight;
            const targetScrollTop = cinematicContainer.offsetTop + ((targetIdx - 1) / (SCENE_COUNT - 1)) * travelDistance;

            window.scrollTo({
                top: targetScrollTop,
                behavior: 'smooth'
            });
        });
    });

    // Mobile Drawer Handlers
    if (mobileToggle && mobileDrawer) {
        mobileToggle.addEventListener('click', () => {
            mobileDrawer.classList.toggle('open');
        });
    }

    if (drawerClose && mobileDrawer) {
        drawerClose.addEventListener('click', () => {
            mobileDrawer.classList.remove('open');
        });
    }

    drawerLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (mobileDrawer) mobileDrawer.classList.remove('open');
        });
    });

    // 7+ Years Counter Intersection Observer
    const counterElements = document.querySelectorAll('.exp-number[data-target]');
    let counterAnimated = false;

    if ('IntersectionObserver' in window) {
        const counterObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !counterAnimated) {
                    counterAnimated = true;
                    counterElements.forEach(el => {
                        const target = parseInt(el.getAttribute('data-target'), 10) || 7;
                        let start = 0;
                        const duration = 1200;
                        const stepTime = 50;
                        const steps = duration / stepTime;
                        const increment = target / steps;

                        const timer = setInterval(() => {
                            start += increment;
                            if (start >= target) {
                                el.textContent = target;
                                clearInterval(timer);
                            } else {
                                el.textContent = Math.floor(start);
                            }
                        }, stepTime);
                    });
                }
            });
        }, { threshold: 0.3 });

        counterElements.forEach(el => counterObserver.observe(el));
    }

    // Debounced Resize Listener
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            resizeCanvas();
            cacheSectionMetrics();
            onScrollFrame();
        }, 100);
    });

    // Passive Scroll Listener
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Initialize Everything
    cacheSectionMetrics();
    loadInitialFrame();
    resizeCanvas();
    onScrollFrame();
    rafLoopId = requestAnimationFrame(animationLoop);
});
