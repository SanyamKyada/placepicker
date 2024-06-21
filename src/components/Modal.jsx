import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

function Modal({ open, children, onClose }) {
  const dialog = useRef();

  useEffect(() => {
    if (open) {
      dialog.current.showModal();
    }
    else {
      dialog.current.close();
    }
  }, [open]); 
  // here we have used 'open' prop which can cause this component execute again. And that is why it is a dependency for this useEffect.
  // Still, it is not neccessory that this block inside useEffect will run everytime. It will only run if Modal is re-executed and open prop's values is changed.


  return createPortal(
    <dialog className="modal" ref={dialog} onClose={onClose}>
      {open ? children : null}
    </dialog>,
    document.getElementById('modal')
  );
}

export default Modal;
