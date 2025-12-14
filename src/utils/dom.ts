const isElement = (target: EventTarget | null): target is Element => target instanceof Element;

export const isEditableTarget = (target: EventTarget | null) => {
  if (!isElement(target)) return false;
  if (target instanceof HTMLElement && target.isContentEditable) return true;
  return Boolean(target.closest('input, textarea, select, [contenteditable="true"], [contenteditable="plaintext-only"]'));
};

export const isInteractiveTarget = (target: EventTarget | null) => {
  if (!isElement(target)) return false;
  return Boolean(target.closest("input, textarea, select, button, a, [contenteditable]"));
};

