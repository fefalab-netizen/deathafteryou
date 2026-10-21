const pages = [
  'The familiar stillness. Another catalepsy episode.\n\nYou couldn’t move. You couldn’t tell them you were still there.',
  'You wake inside a coffin, at the bottom of an open grave. Your grave.\n\nThey haven’t filled it in. The lid is splintered, broken open.\n\nYou don’t remember breaking it.',
  'You climb out into Blackthorn Cemetery. No mourners. No gravediggers.\n\nA bell sounds in the distance. Shapes move between the stones.\n\nYou’ve woken from this before. Never somewhere like this.',
  'A wooden bat lies beside an abandoned shed. You take it.\n\nYou don’t know what happened here. You only know you need to leave.\n\nSomething beyond the graves has heard you.'
];
let timer;
export function showIntro(onEnter) {
  clearTimeout(timer);
  const get = id => document.getElementById(id);
  const overlay = get('introMenu'), copy = get('introTyped'), next = get('enterCemetery');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let page = 0, cursor = 0;
  overlay.hidden = false;
  function finish() {
    clearTimeout(timer);
    overlay.hidden = true;
    onEnter();
  }
  function label() {
    next.textContent = cursor < pages[page].length ? 'Show the words →' : page === pages.length - 1 ? 'Take the bat. Survive. →' : 'Read on →';
  }
  function type() {
    copy.textContent = pages[page].slice(0, ++cursor);
    label();
    if (cursor < pages[page].length) {
      const char = pages[page][cursor - 1];
      timer = setTimeout(type, /[.!?]/.test(char) ? 280 : char === '\n' ? 180 : 28);
    } else copy.classList.remove('typing');
  }
  function display() {
    clearTimeout(timer);
    cursor = reducedMotion ? pages[page].length : 0;
    copy.textContent = reducedMotion ? pages[page] : '';
    copy.classList.toggle('typing', !reducedMotion);
    get('introAccessible').textContent = pages[page];
    get('introPage').textContent = `${page + 1} / ${pages.length}`;
    label();
    if (!reducedMotion) timer = setTimeout(type, 250);
  }
  next.onclick = () => {
    if (cursor < pages[page].length) {
      clearTimeout(timer);
      cursor = pages[page].length;
      copy.textContent = pages[page];
      copy.classList.remove('typing');
      label();
    } else if (++page < pages.length) display();
    else finish();
  };
  get('skipIntro').onclick = finish;
  display();
  next.focus();
}
