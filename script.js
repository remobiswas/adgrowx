/**
 * ==========================================================================
 * REMO BISWAS • DIGITAL MARKETER • FOUNDER OF ADGROWX
 * SCROLL ENGINE • 240-FRAME CANVAS • MARKETING HUD COORDINATOR
 * ==========================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
    // Canvas & Stage Elements
    const canvas = document.getElementById('animation-canvas');
    if (!canvas) return;
    const context = canvas.getContext('2d');
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

    // Image Preloader State
    const images = [];
    let loadedImagesCount = 0;
    let isFirstFrameReady = false;

    // Smooth Interpolation State
    let targetFrame = 1;
    let currentFrame = 1;
    let lastDrawnImage = null;
    let activeScene = null; // Start null so updateActiveScene(1) ALWAYS executes on boot

    // Frame Path Formatter (e.g. frames/video_frames_png/frame_0001.png)
    const getFramePath = (index) => {
        const padded = index.toString().padStart(4, '0');
        return `frames/video_frames_png/frame_${padded}.png`;
    };

    // Canvas Resize with Cover Math & Retina DPR
    const resizeCanvas = () => {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = window.innerWidth * dpr;
        canvas.height = window.innerHeight * dpr;
        drawFrame(Math.round(currentFrame));
    };

    // Render Canvas Frame with Cover Aspect Ratio (Maintains Remo centered & full screen)
    const drawFrame = (frameIndex) => {
        let img = images[frameIndex];

        // Nearest Loaded Frame Fallback (Prevents flashing during rapid scrubbing)
        if (!img || !img.complete || img.naturalWidth === 0) {
            if (lastDrawnImage && lastDrawnImage.complete) {
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

        // Cover Ratio Math (Keeps Remo perfectly scaled across any screen)
        const ratio = Math.max(cw / iw, ch / ih);
        const nw = iw * ratio;
        const nh = ih * ratio;
        const nx = (cw - nw) / 2;
        const ny = (ch - nh) / 2;

        context.clearRect(0, 0, cw, ch);
        context.drawImage(img, 0, 0, iw, ih, nx, ny, nw, nh);
    };

    // High Priority Initial Frame 1 Load
    const loadInitialFrame = () => {
        const initialImg = new Image();
        initialImg.src = getFramePath(1);
        initialImg.onload = () => {
            images[1] = initialImg;
            isFirstFrameReady = true;
            lastDrawnImage = initialImg;
            resizeCanvas();
            if (canvasLoader) {
                canvasLoader.classList.add('hidden');
            }
        };
        images[1] = initialImg;
    };

    // Preload Remaining Frames in Background
    const preloadFrames = () => {
        for (let i = 1; i <= FRAME_COUNT; i++) {
            if (i === 1 && images[1]) continue;

            const img = new Image();
            img.src = getFramePath(i);

            img.onload = () => {
                loadedImagesCount++;

                // Update Loader Status if still active
                if (loaderStatusText && loadedImagesCount < FRAME_COUNT && !isFirstFrameReady) {
                    const pct = Math.round((loadedImagesCount / FRAME_COUNT) * 100);
                    loaderStatusText.textContent = `Loading 3D Visual Stage... (${pct}%)`;
                }

                if (i === 1 && !isFirstFrameReady) {
                    isFirstFrameReady = true;
                    resizeCanvas();
                    if (canvasLoader) canvasLoader.classList.add('hidden');
                }

                if (loadedImagesCount >= FRAME_COUNT - 5 && canvasLoader) {
                    canvasLoader.classList.add('hidden');
                }
            };

            img.onerror = () => {
                loadedImagesCount++;
                if (loadedImagesCount >= FRAME_COUNT - 5 && canvasLoader) {
                    canvasLoader.classList.add('hidden');
                }
            };

            images[i] = img;
        }
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

    // Main Scroll Handler
    const handleScroll = () => {
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
                // Progress strictly within the cinematic stage (0.0 to 1.0)
                const cinematicProgress = Math.min(Math.max(-rect.top / travelDistance, 0), 1);

                // Map smoothly to 1..240 frames
                targetFrame = Math.min(
                    FRAME_COUNT,
                    Math.max(1, Math.round(cinematicProgress * (FRAME_COUNT - 1)) + 1)
                );

                // Map smoothly to 1..10 scenes
                let sceneIndex = Math.floor(cinematicProgress * SCENE_COUNT) + 1;
                if (sceneIndex > SCENE_COUNT) sceneIndex = SCENE_COUNT;
                if (sceneIndex < 1) sceneIndex = 1;

                updateActiveScene(sceneIndex);
            }
        }

        // 3. Highlight Navbar Active Section
        updateNavbarActive();
    };

    // Navbar active links based on section positions
    const updateNavbarActive = () => {
        const sections = ['cinematic', 'about', 'services', 'projects', 'testimonials', 'contact'];
        const scrollPos = (window.scrollY || window.pageYOffset) + 200;

        sections.forEach((id) => {
            const el = document.getElementById(id);
            if (!el) return;
            const top = el.offsetTop;
            const height = el.offsetHeight;

            if (scrollPos >= top && scrollPos < top + height) {
                navLinks.forEach(link => {
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                    } else {
                        link.classList.remove('active');
                    }
                });
            }
        });
    };

    // Smooth Lerp Animation Loop (60fps continuous interpolation)
    const animationLoop = () => {
        const diff = targetFrame - currentFrame;
        // Keep drawing until first image is rendered, then interpolate on scroll
        if (Math.abs(diff) > 0.01 || !lastDrawnImage) {
            currentFrame += diff * 0.18;
            drawFrame(Math.round(currentFrame));
        }
        requestAnimationFrame(animationLoop);
    };

    // Clickable Scene Navigation Dots (Jump smoothly to scene position)
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

    // Window Events
    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Initialize Everything
    loadInitialFrame();
    preloadFrames();
    resizeCanvas();
    handleScroll();
    requestAnimationFrame(animationLoop);
});
