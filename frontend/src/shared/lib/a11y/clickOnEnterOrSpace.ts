import type { KeyboardEvent } from 'react';

// Enter and Space click an element with role="button", like they do on a real button.
// Only when the element itself has focus, so typing in a field inside it still works.
export function clickOnEnterOrSpace(event: KeyboardEvent<HTMLElement>) {
  if (event.target !== event.currentTarget) return;
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    event.currentTarget.click();
  }
}
