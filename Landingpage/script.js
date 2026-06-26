const loader = document.getElementById("loader");
const loaderVideo = document.getElementById("loaderVideo");

const hideLoader = () => {
  if (!loader) return;
  loader.classList.add("is-hidden");
};

if (loaderVideo) {
  loaderVideo.muted = true;
  loaderVideo.playsInline = true;

  const startLoaderVideo = () => {
    loaderVideo.load();
    const playAttempt = loaderVideo.play();

    if (playAttempt) {
      playAttempt.catch(() => {
        hideLoader();
      });
    }
  };

  loaderVideo.addEventListener("ended", hideLoader, { once: true });
  loaderVideo.addEventListener("error", hideLoader, { once: true });
  loaderVideo.addEventListener("stalled", hideLoader, { once: true });

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
}, 9000);
