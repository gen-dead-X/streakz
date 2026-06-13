export function playSound(src: string): void {
  const audio = new Audio(src);
  audio.play().catch(() => {
    // Browser may block autoplay before user interaction — silently ignore
  });
}
