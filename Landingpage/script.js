/* ==========================================================================
   UNIFIED PORTFOLIO SCRIPT
   - Fast Frame Loader (with auto-skip & interaction dismiss)
   - Active Nav Highlighting
   - About Section Slider
   - Projects 3D Cylinder Carousel
   - Experience Card Stack & Mouse Follower
   - Achievements Depth Carousel & Detail Inspector
   - Community Can 360° Drag & Click Flip
   - Blog Circular Transition Slider
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  // ------------------------------------------------------------------------
  // 1. FAST LOADER SEQUENCE
  // ------------------------------------------------------------------------
  const loader = document.getElementById("loader");
  const loaderFrame = document.getElementById("loaderFrame");
  const loaderStartedAt = performance.now();
  const minimumLoaderDuration = 800;
  let loaderHidden = false;
  let isSequenceCancelled = false;

  const alreadySeen = (() => {
    try {
      if (window.location.search.includes("skipLoader")) return true;
      return sessionStorage.getItem("portfolio_intro_seen") === "1";
    } catch (_) {
      return false;
    }
  })();

  const hideLoader = (immediate = false) => {
    if (!loader || loaderHidden) return;
    loaderHidden = true;
    isSequenceCancelled = true;

    try {
      sessionStorage.setItem("portfolio_intro_seen", "1");
    } catch (_) {}

    if (immediate || alreadySeen) {
      loader.classList.add("is-hidden");
      loader.style.display = "none";
      if (loaderFrame) loaderFrame.removeAttribute("src");
      return;
    }

    const elapsed = performance.now() - loaderStartedAt;
    const remaining = Math.max(0, minimumLoaderDuration - elapsed);

    setTimeout(() => {
      loader.classList.add("is-hidden");
      setTimeout(() => {
        loader.style.display = "none";
        if (loaderFrame) loaderFrame.removeAttribute("src");
      }, 450);
    }, remaining);
  };

  // Instant dismiss on user interaction
  const dismissEarly = () => {
    if (!loaderHidden) hideLoader(true);
  };
  window.addEventListener("click", dismissEarly, { once: true, passive: true });
  window.addEventListener("keydown", dismissEarly, { once: true, passive: true });
  window.addEventListener("wheel", dismissEarly, { once: true, passive: true });
  window.addEventListener("touchstart", dismissEarly, { once: true, passive: true });

  const padFrame = (frame) => String(frame).padStart(3, "0");
  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  if (alreadySeen) {
    hideLoader(true);
  } else if (loaderFrame) {
    const frameBase = loaderFrame.dataset.frameBase || "Lodingpageframes/ezgif-frame-";
    const frameCount = Number(loaderFrame.dataset.frameCount || 141);
    const frameExt = loaderFrame.dataset.frameExt || "jpg";
    const frameStep = 2;
    const frameDuration = 24;
    const imageCache = new Map();

    const frameSrc = (frame) => `${frameBase}${padFrame(frame)}.${frameExt}`;

    const loadFrame = (frame) => {
      if (imageCache.has(frame)) return imageCache.get(frame);
      const promise = new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = frameSrc(frame);
      });
      imageCache.set(frame, promise);
      return promise;
    };

    const preloadAhead = (frame) => {
      for (let next = frame; next <= Math.min(frame + frameStep * 4, frameCount); next += frameStep) {
        loadFrame(next).catch(() => {});
      }
    };

    const playFrameSequence = async () => {
      await loadFrame(1).catch(() => null);
      if (loaderFrame.naturalWidth > 0) loaderFrame.src = frameSrc(1);

      for (let frame = 1 + frameStep; frame <= frameCount; frame += frameStep) {
        if (isSequenceCancelled) break;
        preloadAhead(frame);
        const image = await loadFrame(frame).catch(() => null);
        if (image && !isSequenceCancelled) {
          loaderFrame.src = frameSrc(frame);
        }
        await wait(frameDuration);
      }
      imageCache.clear();
      hideLoader();
    };

    playFrameSequence();
  } else {
    hideLoader();
  }

  setTimeout(() => {
    if (loader && !loader.classList.contains("is-hidden")) hideLoader(true);
  }, 4500);

  // ------------------------------------------------------------------------
  // 2. ACTIVE NAVBAR LINK HIGHLIGHTING
  // ------------------------------------------------------------------------
  const sections = document.querySelectorAll("main > section, header.landing");
  const navLinks = document.querySelectorAll(".navbar .nav-link");

  const highlightNav = () => {
    let current = "";
    const scrollPos = window.scrollY + 200;

    sections.forEach((sec) => {
      const top = sec.offsetTop;
      const height = sec.offsetHeight;
      if (scrollPos >= top && scrollPos < top + height) {
        current = sec.getAttribute("id");
      }
    });

    navLinks.forEach((link) => {
      link.classList.remove("active");
      if (current && link.getAttribute("href") === `#${current}`) {
        link.classList.add("active");
      }
    });
  };

  window.addEventListener("scroll", highlightNav, { passive: true });
  highlightNav();

  // ------------------------------------------------------------------------
  // 3. ABOUT SECTION SLIDER
  // ------------------------------------------------------------------------
  (() => {
    const aboutSection = document.getElementById("about");
    if (!aboutSection) return;

    const items = aboutSection.querySelectorAll(".about-list .about-item");
    const thumbnails = aboutSection.querySelectorAll(".about-thumbnail .about-thumb-item");
    const nextBtn = document.getElementById("aboutNext");
    const prevBtn = document.getElementById("aboutPrev");
    if (!items.length || !nextBtn || !prevBtn) return;

    let activeIdx = 0;
    const count = items.length;

    const updateSlider = () => {
      items.forEach((item, idx) => {
        item.classList.toggle("active", idx === activeIdx);
      });
      thumbnails.forEach((thumb, idx) => {
        thumb.classList.toggle("active", idx === activeIdx);
      });

      const activeThumb = thumbnails[activeIdx];
      if (activeThumb) {
        const rect = activeThumb.getBoundingClientRect();
        if (rect.left < 0 || rect.right > window.innerWidth) {
          activeThumb.scrollIntoView({ behavior: "smooth", inline: "nearest" });
        }
      }
    };

    let autoInterval = setInterval(() => {
      if (!document.hidden) {
        activeIdx = (activeIdx + 1) % count;
        updateSlider();
      }
    }, 5000);

    const resetAuto = () => {
      clearInterval(autoInterval);
      autoInterval = setInterval(() => {
        if (!document.hidden) {
          activeIdx = (activeIdx + 1) % count;
          updateSlider();
        }
      }, 5000);
    };

    nextBtn.addEventListener("click", () => {
      activeIdx = (activeIdx + 1) % count;
      updateSlider();
      resetAuto();
    });

    prevBtn.addEventListener("click", () => {
      activeIdx = (activeIdx - 1 + count) % count;
      updateSlider();
      resetAuto();
    });

    thumbnails.forEach((thumb, idx) => {
      thumb.addEventListener("click", () => {
        activeIdx = idx;
        updateSlider();
        resetAuto();
      });
    });
  })();

  // ------------------------------------------------------------------------
  // 4. PROJECTS 3D CYLINDER CAROUSEL
  // ------------------------------------------------------------------------
  (() => {
    const projSection = document.getElementById("projects");
    if (!projSection) return;

    const prevBtn = document.getElementById("projectsPrev");
    const nextBtn = document.getElementById("projectsNext");
    const imageContainer = projSection.querySelector(".proj-images");
    const items = projSection.querySelectorAll(".proj-images .proj-img-item");
    const contents = projSection.querySelectorAll(".proj-content-wrap .proj-item");
    if (!imageContainer || !items.length || !prevBtn || !nextBtn) return;

    let rotate = 0;
    let active = 0;
    const count = items.length;
    const rotateStep = 360 / count;

    const render = () => {
      imageContainer.style.setProperty("--rotate", `${rotate}deg`);
      contents.forEach((content, idx) => {
        content.classList.toggle("active", idx === active);
      });
    };

    nextBtn.addEventListener("click", () => {
      active = (active + 1) % count;
      rotate += rotateStep;
      render();
    });

    prevBtn.addEventListener("click", () => {
      active = (active - 1 + count) % count;
      rotate -= rotateStep;
      render();
    });
  })();

  // ------------------------------------------------------------------------
  // 5. EXPERIENCE CARD STACK & BIRD MOUSE-FOLLOW
  // ------------------------------------------------------------------------
  (() => {
    const expSection = document.getElementById("experience");
    if (!expSection) return;

    const items = expSection.querySelectorAll(".exp-item");
    const nextBtn = document.getElementById("expNext");
    const bird = expSection.querySelector(".exp-bird");
    const effect = expSection.querySelector(".exp-effect");
    if (!items.length || !nextBtn) return;

    let active = 0;
    let begin = true;
    const count = items.length;

    const resetBirdPosition = () => {
      if (bird) {
        bird.style.right = "50%";
        bird.style.bottom = "25%";
        bird.style.transform = "rotateY(192deg) rotate(-40deg)";
      }
    };

    const loadCard = () => {
      if (begin) {
        begin = false;
      } else {
        const prevPrevIdx = (active - 2 < -1 ? count - 2 : active - 2 < 0 ? count - 1 : active - 2);
        const prevIdx = (active - 1 < 0 ? count - 1 : active - 1);
        const prevPrevEl = document.getElementById("exp_item_" + prevPrevIdx);
        const prevEl = document.getElementById("exp_item_" + prevIdx);
        if (prevPrevEl) prevPrevEl.classList.remove("hide");
        if (prevEl) {
          prevEl.classList.remove("active");
          prevEl.classList.add("hide");
        }
      }

      const currEl = document.getElementById("exp_item_" + active);
      if (currEl) {
        currEl.classList.remove("hide");
        currEl.classList.add("active");
      }

      if (effect) {
        effect.classList.add("start");
        setTimeout(() => effect.classList.remove("start"), 3000);
      }
      resetBirdPosition();
    };

    loadCard();

    nextBtn.addEventListener("click", () => {
      active = (active + 1) % count;
      loadCard();
    });

    // Mouse movement inside active card tilts bird
    let hoverTicking = false;
    items.forEach((item) => {
      item.addEventListener("mousemove", (event) => {
        if (hoverTicking) return;
        hoverTicking = true;
        requestAnimationFrame(() => {
          hoverTicking = false;
          const rect = item.getBoundingClientRect();
          const pageX = event.clientX - rect.left;
          const pageY = event.clientY - rect.top;
          const topNew = pageY > rect.height / 2 + 30 ? 15 : 35;
          const leftNew = pageX > rect.width / 3 + 30 ? 40 : 60;
          if (bird) {
            bird.style.right = leftNew + "%";
            bird.style.bottom = topNew + "%";
          }
        });
      });
      item.addEventListener("mouseleave", resetBirdPosition);
    });
  })();

  // ------------------------------------------------------------------------
  // 6. ACHIEVEMENTS DEPTH CAROUSEL & DETAIL INSPECTOR
  // ------------------------------------------------------------------------
  (() => {
    const achSection = document.getElementById("achievements");
    if (!achSection) return;

    const nextBtn = document.getElementById("achNext");
    const prevBtn = document.getElementById("achPrev");
    const backBtn = document.getElementById("achBack");
    const carousel = achSection.querySelector(".ach-carousel");
    const listHTML = achSection.querySelector(".ach-list");
    const seeMoreButtons = achSection.querySelectorAll(".seeMore");
    if (!nextBtn || !prevBtn || !carousel || !listHTML) return;

    let unAcceptClick;
    const showSlider = (type) => {
      nextBtn.style.pointerEvents = "none";
      prevBtn.style.pointerEvents = "none";
      carousel.classList.remove("next", "prev");

      const items = achSection.querySelectorAll(".ach-list .ach-item");
      if (type === "next") {
        listHTML.appendChild(items[0]);
        carousel.classList.add("next");
      } else {
        listHTML.prepend(items[items.length - 1]);
        carousel.classList.add("prev");
      }

      clearTimeout(unAcceptClick);
      unAcceptClick = setTimeout(() => {
        nextBtn.style.pointerEvents = "auto";
        prevBtn.style.pointerEvents = "auto";
      }, 1500);
    };

    nextBtn.addEventListener("click", () => showSlider("next"));
    prevBtn.addEventListener("click", () => showSlider("prev"));

    seeMoreButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        carousel.classList.remove("next", "prev");
        carousel.classList.add("showDetail");
      });
    });

    if (backBtn) {
      backBtn.addEventListener("click", () => {
        carousel.classList.remove("showDetail");
      });
    }
  })();

  // ------------------------------------------------------------------------
  // 7. COMMUNITY CAN 360° DRAG & CLICK ROTATION
  // ------------------------------------------------------------------------
  (() => {
    const commSection = document.getElementById("community");
    if (!commSection) return;

    const product = commSection.querySelector(".comm-product");
    const soda = commSection.querySelector(".comm-soda");
    if (!product || !soda) return;

    let isDragging = false;
    let startX = 0;
    let currentOffset = 0;
    let dragDelta = 0;

    const getOffset = () => {
      const val = getComputedStyle(soda).getPropertyValue("--left");
      return parseFloat(val) || 0;
    };

    // Click / Tap toggle between front (mask) and back (logo)
    product.addEventListener("click", () => {
      if (Math.abs(dragDelta) < 6) {
        product.classList.toggle("active");
      }
    });

    const startDrag = (e) => {
      isDragging = true;
      dragDelta = 0;
      startX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
      currentOffset = getOffset();
      soda.style.transition = "none";
    };

    const moveDrag = (e) => {
      if (!isDragging) return;
      const clientX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
      dragDelta = clientX - startX;
      soda.style.setProperty("--left", `${currentOffset + dragDelta}px`);
    };

    const endDrag = () => {
      if (!isDragging) return;
      isDragging = false;
      soda.style.transition = "";
    };

    product.addEventListener("mousedown", startDrag);
    window.addEventListener("mousemove", moveDrag);
    window.addEventListener("mouseup", endDrag);

    product.addEventListener("touchstart", startDrag, { passive: true });
    window.addEventListener("touchmove", moveDrag, { passive: true });
    window.addEventListener("touchend", endDrag);
  })();

  // ------------------------------------------------------------------------
  // 8. BLOG CIRCULAR TRANSITION SLIDER
  // ------------------------------------------------------------------------
  (() => {
    const blogSection = document.getElementById("blog");
    if (!blogSection) return;

    const items = blogSection.querySelectorAll(".blog-list .blog-item");
    const prevBtn = document.getElementById("blogPrev");
    const nextBtn = document.getElementById("blogNext");
    if (!items.length || !prevBtn || !nextBtn) return;

    let active = 0;
    const lastPosition = items.length - 1;

    const setSlider = () => {
      items.forEach((item, idx) => {
        item.classList.toggle("active", idx === active);
      });
      nextBtn.classList.toggle("d-none", active === lastPosition);
      prevBtn.classList.toggle("d-none", active === 0);
    };

    nextBtn.addEventListener("click", () => {
      if (active < lastPosition) {
        active++;
        setSlider();
      }
    });

    prevBtn.addEventListener("click", () => {
      if (active > 0) {
        active--;
        setSlider();
      }
    });

    setSlider();

    const setDiameter = () => {
      const slider = blogSection.querySelector(".blog-slider");
      if (!slider) return;
      const w = slider.offsetWidth;
      const h = slider.offsetHeight;
      const diameter = Math.sqrt(w * w + h * h);
      document.documentElement.style.setProperty("--diameter", `${diameter}px`);
    };

    setDiameter();
    let resizeRaf = null;
    window.addEventListener(
      "resize",
      () => {
        if (resizeRaf) return;
        resizeRaf = requestAnimationFrame(() => {
          resizeRaf = null;
          setDiameter();
        });
      },
      { passive: true }
    );
  })();
});
