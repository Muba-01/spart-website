document.addEventListener('DOMContentLoaded', (event) => {

            // --- Loading Screen Logic ---
            const loadingScreen = document.getElementById('loading-screen');
            const loadingBar = document.getElementById('loading-bar');
            let progress = 0;
            let interval;

            const updateProgress = () => {
                progress += 1;
                loadingBar.style.width = `${progress}%`;
                if (progress >= 100) {
                    clearInterval(interval);
                }
            };

            const hideLoadingScreen = () => {
                loadingScreen.classList.add('hidden');
                setTimeout(() => {
                    loadingScreen.style.display = 'none';
                }, 500);
            };

            const pageLoadPromise = new Promise(resolve => {
                window.addEventListener('load', resolve);
            });

            const minLoadingTimePromise = new Promise(resolve => {
                setTimeout(resolve, 1000);
            });

            interval = setInterval(updateProgress, 10); // Update progress every 10ms

            Promise.all([pageLoadPromise, minLoadingTimePromise]).then(() => {
                clearInterval(interval);
                loadingBar.style.width = '100%';
                setTimeout(hideLoadingScreen, 200); // Short delay before hiding
            });

            const links = document.querySelectorAll('a[href]');
            links.forEach(link => {
                link.addEventListener('click', (e) => {
                    const href = link.getAttribute('href');
                    if (href && href !== '#' && !href.startsWith('#') && !link.hasAttribute('target')) {
                        e.preventDefault();
                        loadingScreen.style.display = 'flex';
                        loadingScreen.classList.remove('hidden');
                        setTimeout(() => {
                            window.location.href = href;
                        }, 500);
                    }
                });
            });

            // --- Page Load Animation ---
            document.body.classList.add('is-loaded');

            // --- Mobile Menu Toggle ---
            const menuBtn = document.getElementById('menu-btn');
            const mobileMenu = document.getElementById('mobile-menu');
            const iconOpen = document.getElementById('icon-open');
            const iconClose = document.getElementById('icon-close');

            if (menuBtn) {
                menuBtn.addEventListener('click', () => {
                    const isExpanded = menuBtn.getAttribute('aria-expanded') === 'true';
                    menuBtn.setAttribute('aria-expanded', !isExpanded);

                    mobileMenu.classList.toggle('hidden');
                    mobileMenu.classList.toggle('open');
                    iconOpen.classList.toggle('hidden');
                    iconOpen.classList.toggle('block');
                    iconClose.classList.toggle('hidden');
                    iconClose.classList.toggle('block');
                });
            }

            // Close mobile menu when a link is clicked
            if (mobileMenu) {
                mobileMenu.querySelectorAll('a').forEach(link => {
                    link.addEventListener('click', () => {
                        menuBtn.setAttribute('aria-expanded', 'false');
                        mobileMenu.classList.add('hidden');
                        mobileMenu.classList.remove('open');
                        iconOpen.classList.remove('hidden');
                        iconOpen.classList.add('block');
                        iconClose.classList.add('hidden');
                        iconClose.classList.remove('block');
                    });
                });
            }

            // --- Header Scroll Effect ---
            const header = document.getElementById('main-header');
            window.addEventListener('scroll', () => {
                if (window.scrollY > 10) {
                    header.classList.add('header-scrolled');
                } else {
                    header.classList.remove('header-scrolled');
                }
            });

            // --- Scroll Reveal Animation ---
            const revealElements = document.querySelectorAll('.reveal');

            const revealObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-visible');
                    }
                });
            }, {
                threshold: 0.1
            });

            revealElements.forEach(el => {
                revealObserver.observe(el);
            });

            // --- Marquee Animation ---
            const marquee = document.querySelector('.marquee-content');
            const marqueeObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        marquee.style.animationPlayState = 'running';
                    } else {
                        marquee.style.animationPlayState = 'paused';
                    }
                });
            });

            if (marquee) {
                marqueeObserver.observe(marquee);
            }

            // --- Section Fade Transition ---
            const navLinks = document.querySelectorAll('.nav-link');
            navLinks.forEach(link => {
                link.addEventListener('click', (e) => {
                    const targetId = link.getAttribute('data-target');
                    const href = link.getAttribute('href');

                    if (targetId) {
                        e.preventDefault();
                        const targetElement = document.getElementById(targetId);

                        if (targetElement) {
                            // 1. Fade out
                            document.body.classList.add('page-transition-out');

                            // 2. Wait for fade out, then scroll
                            setTimeout(() => {
                                // Scroll to the target element
                                const headerHeight = document.getElementById('main-header').offsetHeight;
                                const targetPosition = targetElement.offsetTop - headerHeight;

                                window.scrollTo({
                                    top: targetPosition,
                                    behavior: 'instant' // Jump, don't smooth scroll
                                });

                                // 3. Fade back in
                                document.body.classList.remove('page-transition-out');
                                document.body.classList.add('page-transition-in');

                                // 4. Clean up class
                                setTimeout(() => {
                                    document.body.classList.remove('page-transition-in');
                                }, 400); // Must match transition-delay

                            }, 400); // Must match transition duration
                        }
                    } else if (href && href !== '#' && !href.startsWith('#') && !link.hasAttribute('target')) {
                        e.preventDefault();
                        document.body.classList.add('page-transition-out');
                        setTimeout(() => {
                            window.location.href = href;
                        }, 500);
                    }
                });
            });

            // --- Global 3D Star Scene (Three.js) ---
            let scene, camera, renderer, particles, originalPositions;
            const sceneContainer = document.getElementById('global-star-scene');

            const mouse = new THREE.Vector2(-99, -99); // Initial out-of-bounds
            let particleData = []; // Store particle info

            const particleCount = 2000; // Reduced from 5000
            const bulgeRadius = 3.5;
            const bulgeStrength = 2.0;
            const smoothness = 0.05;

            function init3DScene() {
                scene = new THREE.Scene();

                // Camera
                const fov = 75;
                const aspect = window.innerWidth / window.innerHeight;
                const near = 0.1;
                const far = 1000;
                camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
                camera.position.z = 10; // Pull camera back to see particles

                // Renderer
                renderer = new THREE.WebGLRenderer({ alpha: true }); // Transparent bg
                renderer.setSize(window.innerWidth, window.innerHeight);
                renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
                sceneContainer.appendChild(renderer.domElement);

                // Particles
                const geometry = new THREE.BufferGeometry();
                const particlePositions = new Float32Array(particleCount * 3);
                originalPositions = new Float32Array(particleCount * 3);
                const colors = new Float32Array(particleCount * 3); // For twinkling

                for (let i = 0; i < particleCount; i++) {
                    const i3 = i * 3;

                    // Box distribution
                    const x = (Math.random() - 0.5) * 30;
                    const y = (Math.random() - 0.5) * 30;
                    const z = (Math.random() - 0.5) * 20; // Depth

                    particlePositions[i3] = x;
                    particlePositions[i3 + 1] = y;
                    particlePositions[i3 + 2] = z;

                    originalPositions[i3] = x;
                    originalPositions[i3 + 1] = y;
                    originalPositions[i3 + 2] = z;

                    colors[i3] = 1.0;
                    colors[i3 + 1] = 1.0;
                    colors[i3 + 2] = 1.0;

                    // Store data for twinkling
                    const baseAlpha = Math.random() * 0.5 + 0.2; // 0.2 to 0.7
                    particleData.push({
                        baseAlpha: baseAlpha,
                        currentAlpha: baseAlpha,
                        twinkleSpeed: (Math.random() - 0.5) * 0.01 // -0.005 to +0.005
                    });
                }

                geometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
                geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

                // --- Updated Material ---
                const starTexture = createStarTexture();
                const material = new THREE.PointsMaterial({
                    size: 0.1,
                    map: starTexture,
                    blending: THREE.AdditiveBlending,
                    depthWrite: false,
                    transparent: true,
                    vertexColors: true // Use colors for opacity
                });

                particles = new THREE.Points(geometry, material);
                scene.add(particles);

                // Event Listeners
                window.addEventListener('resize', onWindowResize);
                const homeElement = document.getElementById('home');
                if (homeElement) {
                    homeElement.addEventListener('mousemove', onMouseMove);
                    homeElement.addEventListener('mouseleave', onMouseLeave);
                }
            }

            function createStarTexture() {
                const canvas = document.createElement('canvas');
                canvas.width = 64;
                canvas.height = 64;
                const ctx = canvas.getContext('2d');

                const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
                gradient.addColorStop(0, 'rgba(255,255,255,1)');
                gradient.addColorStop(0.2, 'rgba(255,255,255,0.8)');
                gradient.addColorStop(0.4, 'rgba(255,255,255,0.3)');
                gradient.addColorStop(1, 'rgba(255,255,255,0)');

                ctx.fillStyle = gradient;
                ctx.fillRect(0, 0, 64, 64);

                return new THREE.CanvasTexture(canvas);
            }

            function onWindowResize() {
                if (camera && renderer) {
                    camera.aspect = window.innerWidth / window.innerHeight;
                    camera.updateProjectionMatrix();
                    renderer.setSize(window.innerWidth, window.innerHeight);
                }
            }

            function onMouseMove(event) {
                mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
                mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
            }
            function onMouseLeave(event) {
                mouse.x = -99;
                mouse.y = -99;
            }

            const raycaster = new THREE.Raycaster();
            const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0); // Plane at z=0
            const mouseWorld = new THREE.Vector3();

            function drawStars() {
                requestAnimationFrame(drawStars);

                if (renderer && particles) {

                    const inHeroSection = window.scrollY < window.innerHeight;
                    const positions = particles.geometry.attributes.position.array;
                    const colors = particles.geometry.attributes.color.array; // Get colors array

                    // Update raycaster
                    raycaster.setFromCamera(mouse, camera);
                    raycaster.ray.intersectPlane(plane, mouseWorld); // This now correctly finds the intersection at Z=0

                    for (let i = 0; i < particleCount; i++) {
                        const i3 = i * 3;

                        // Get original positions (no parallax added here)
                        const originalX = originalPositions[i3];
                        const originalY = originalPositions[i3 + 1];
                        const originalZ = originalPositions[i3 + 2];

                        let targetZ = originalZ;

                        // --- Twinkle Animation ---
                        const p = particleData[i];
                        p.currentAlpha += p.twinkleSpeed;
                        // Clamp and reverse speed
                        if (p.currentAlpha > p.baseAlpha + 0.3 || p.currentAlpha < p.baseAlpha - 0.3) {
                            p.currentAlpha = Math.max(0.1, Math.min(1.0, p.currentAlpha)); // Clamp
                            p.twinkleSpeed *= -1; // Reverse
                        }
                        colors[i3] = p.currentAlpha;
                        colors[i3 + 1] = p.currentAlpha;
                        colors[i3 + 2] = p.currentAlpha;
                        // --- End Twinkle ---


                        // Apply Bulge Effect (only in hero)
                        if (inHeroSection && mouse.x !== -99) {
                            const dx = mouseWorld.x - originalX;
                            const dy = mouseWorld.y - originalY;
                            const distSq = dx * dx + dy * dy;
                            const bulgeRadiusSq = bulgeRadius * bulgeRadius;

                            if (distSq < bulgeRadiusSq) {
                                // Parabolic falloff
                                const factor = (1 - (distSq / bulgeRadiusSq));
                                targetZ = originalZ + factor * bulgeStrength;
                            }
                        }

                        // Smoothly interpolate current Z to target Z
                        positions[i3 + 2] += (targetZ - positions[i3 + 2]) * smoothness;
                    }

                    particles.geometry.attributes.position.needsUpdate = true;
                    particles.geometry.attributes.color.needsUpdate = true; // IMPORTANT: Update colors

                    renderer.render(scene, camera);
                }
            }

            init3DScene();
            drawStars();

        });
