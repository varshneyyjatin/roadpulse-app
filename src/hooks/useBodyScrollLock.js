import { useEffect } from 'react';

// Module-level reference count so multiple modals can be locked/unlocked independently
// without one modal's close accidentally re-enabling scroll while another is still open.
let lockCount = 0;

/**
 * Prevents the page behind a modal from scrolling while the modal is open.
 * Call unconditionally at the top of any modal component: useBodyScrollLock(isOpen).
 */
export default function useBodyScrollLock(isLocked) {
  useEffect(() => {
    if (!isLocked) return undefined;

    lockCount += 1;
    document.body.style.overflow = 'hidden';

    return () => {
      lockCount = Math.max(0, lockCount - 1);
      if (lockCount === 0) {
        document.body.style.overflow = '';
      }
    };
  }, [isLocked]);
}
