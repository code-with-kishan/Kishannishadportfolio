const loader = document.getElementById("loader");
const loaderFrame = document.getElementById("loaderFrame");
const loaderStartedAt = performance.now();
const minimumLoaderDuration = 4200;
let loaderHidden = false;

const hideLoader = () => {
  if (!loader || loaderHidden) return;
  loaderHidden = true;
  const elapsed = performance.now() - loaderStartedAt;
  const remaining = Math.max(0, minimumLoaderDuration - elapsed);

  setTimeout(() => {
    loader.classList.add("is-hidden");
  }, remaining);
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
    await loadFrame(1).catch(() => null);

    if (loaderFrame.naturalWidth > 0) {
      loaderFrame.src = frameSrc(1);
    }

    for (let frame = 2; frame <= frameCount; frame += 1) {
      preloadAhead(frame);

      const image = await loadFrame(frame).catch(() => null);

      if (image) {
        loaderFrame.src = frameSrc(frame);
      }

      await wait(frameDuration);
    }

    hideLoader();
  };

  playFrameSequence();
} else {
  hideLoader();
}

setTimeout(() => {
  if (loader && !loader.classList.contains("is-hidden")) {
    hideLoader();
  }
}, 45000);
