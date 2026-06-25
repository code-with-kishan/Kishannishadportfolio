const loader = document.getElementById("loader");
const loaderVideo = document.getElementById("loaderVideo");

const hideLoader = () => {
  loader.classList.add("is-hidden");
};

loaderVideo.addEventListener("ended", hideLoader, { once: true });
loaderVideo.addEventListener(
  "error",
  () => {
    hideLoader();
  },
  { once: true },
);

setTimeout(() => {
  if (!loader.classList.contains("is-hidden")) {
    hideLoader();
  }
}, 9000);
