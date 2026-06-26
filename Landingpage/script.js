const loader = document.getElementById("loader");
const loaderVideo = document.getElementById("loaderVideo");

const hideLoader = () => {
  if (!loader) return;
  loader.classList.add("is-hidden");
};

if (loaderVideo) {
  loaderVideo.muted = true;
  loaderVideo.defaultMuted = true;
  loaderVideo.playsInline = true;
  loaderVideo.setAttribute("muted", "");
  loaderVideo.setAttribute("playsinline", "");
  loaderVideo.setAttribute("webkit-playsinline", "");

  const tryPlayLoaderVideo = () => {
    const playAttempt = loaderVideo.play();

    if (playAttempt) {
      playAttempt.catch(() => {
        // Keep the loader visible with the poster image if autoplay is blocked.
      });
    }
  };

  const startLoaderVideo = () => {
    loaderVideo.load();

    if (loaderVideo.readyState >= 2) {
      tryPlayLoaderVideo();
      return;
    }

    loaderVideo.addEventListener("loadeddata", tryPlayLoaderVideo, { once: true });
    loaderVideo.addEventListener("canplay", tryPlayLoaderVideo, { once: true });
  };

  loaderVideo.addEventListener("ended", hideLoader, { once: true });
  loaderVideo.addEventListener("error", hideLoader, { once: true });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", startLoaderVideo, { once: true });
  } else {
    startLoaderVideo();
  }
} else {
  hideLoader();
}

setTimeout(() => {
  if (loader && !loader.classList.contains("is-hidden")) {
    hideLoader();
  }
}, 10000);
