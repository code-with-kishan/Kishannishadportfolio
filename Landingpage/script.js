const loader = document.getElementById("loader");
const loaderFrame = document.getElementById("loaderFrame");

const hideLoader = () => {
  if (!loader) return;
  loader.classList.add("is-hidden");
};

const padFrame = (frame) => String(frame).padStart(3, "0");

if (loaderFrame) {
  const frameBase = loaderFrame.dataset.frameBase || "Lodingpageframes/ezgif-frame-";
  const frameCount = Number(loaderFrame.dataset.frameCount || 141);
  const frameExt = loaderFrame.dataset.frameExt || "jpg";
  const frameDuration = 1000 / 24;
  const cache = new Map();

  const frameSrc = (frame) => `${frameBase}${padFrame(frame)}.${frameExt}`;

  const preloadFrame = (frame) => {
    if (frame > frameCount || cache.has(frame)) return;

    const image = new Image();
    image.src = frameSrc(frame);
    cache.set(frame, image);
  };

  const preloadAhead = (frame) => {
    for (let next = frame; next <= Math.min(frame + 24, frameCount); next += 1) {
      preloadFrame(next);
    }
  };

  let currentFrame = 1;
  let lastFrameTime = performance.now();

  const playFrames = (time) => {
    if (time - lastFrameTime >= frameDuration) {
      currentFrame += 1;
      lastFrameTime = time;

      if (currentFrame > frameCount) {
        hideLoader();
        return;
      }

      loaderFrame.src = frameSrc(currentFrame);
      preloadAhead(currentFrame + 1);
    }

    requestAnimationFrame(playFrames);
  };

  loaderFrame.addEventListener("error", hideLoader, { once: true });
  preloadAhead(1);
  requestAnimationFrame(playFrames);
} else {
  hideLoader();
}

setTimeout(() => {
  if (loader && !loader.classList.contains("is-hidden")) {
    hideLoader();
  }
}, 12000);
