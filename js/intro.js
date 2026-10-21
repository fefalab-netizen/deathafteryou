export function showIntro(onEnter) {
  const overlay = document.getElementById('introMenu');
  overlay.hidden = false;
  overlay.scrollTop = 0;
  document.getElementById('enterCemetery').onclick = () => {
    overlay.hidden = true;
    onEnter();
  };
}
