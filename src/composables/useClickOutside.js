import { onMounted, onUnmounted } from "vue";

/**
 * Reusable composable to detect clicks/taps outside a target element ref.
 *
 * @param {import('vue').Ref<HTMLElement|null>} targetRef
 * @param {(event: PointerEvent) => void} callback
 */
export function useClickOutside(targetRef, callback) {
  const handlePointerDown = (event) => {
    const el = targetRef?.value;
    if (!el) return;

    if (!el.contains(event.target)) {
      callback(event);
    }
  };

  onMounted(() => {
    document.addEventListener("pointerdown", handlePointerDown);
  });

  onUnmounted(() => {
    document.removeEventListener("pointerdown", handlePointerDown);
  });
}

export default useClickOutside;
