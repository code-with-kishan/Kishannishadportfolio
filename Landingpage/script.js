const loader = document.getElementById("loader");
const loaderFrame = document.getElementById("loaderFrame");

const hideLoader = () => {
  if (!loader) return;
  loader.classList.add("is-hidden");
};

const padFrame = (frame) => String(frame).padStart(3, "0");

const wait = (duration) =>
  new Promise((resolve) => {
    setTimeout(resolve, duration);
  });

if (loaderFrame) {
  const frameBase = loaderFrame.dataset.frameBase || "Lodingpageframes/ezgif-frame-";
  const frameCount = Number(loaderFrame.dataset.frameCount || 141);
  const frameExt = loaderFrame.dataset.frameExt || "jpg";
  const frameDuration = 1000 / 24;
  const imageCache = new Map();

  const frameSrc = (frame) => `${frameBase}${padFrame(frame)}.${frameExt}`;

  const loadFrame = (frame) => {
    if (imageCache.has(frame)) return imageCache.get(frame);

    const promise = new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = reject;
      image.src = frameSrc(frame);
    });

    imageCache.set(frame, promise);
    return promise;
  };

  const preloadAhead = (frame) => {
    for (let next = frame; next <= Math.min(frame + 18, frameCount); next += 1) {
      loadFrame(next).catch(() => {});
    }
  };

  const playFrameSequence = async () => {
    try {
      await loadFrame(1);
      loaderFrame.src = frameSrc(1);

      for (let frame = 2; frame <= frameCount; frame += 1) {
        preloadAhead(frame);
        await loadFrame(frame);
        loaderFrame.src = frameSrc(frame);
        await wait(frameDuration);
      }
    } catch (error) {
      // Keep the first frame/poster visible briefly if a later frame fails.
      await wait(1800);
    } finally {
      hideLoader();
    }
  };

  playFrameSequence();
} else {
  hideLoader();
}

setTimeout(() => {
  if (loader && !loader.classList.contains("is-hidden")) {
    hideLoader();
  }
}, 15000);
