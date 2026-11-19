// @ts-nocheck
import { useState, forwardRef, useImperativeHandle } from 'react';
import cls from './Modal.module.scss';

export const Modal = forwardRef((props, ref) => {
  const [isOpen, setIsOpen] = useState(false);

  const close = () => {
    setIsOpen(false);
  };

  const open = () => {
    setIsOpen(true);
  };

  useImperativeHandle(ref, () => ({
    open,
  }));

  return (
    <div className={cls.modal}>
      {isOpen && (
        <div role="presentation" className={cls.overlay} onClick={close}>
          <div role="presentation" className={cls.content} onClick={(e) => e.stopPropagation()}>
            {props.header && (
              <div className={cls.header}>
                {props.header}
                <button type="button" className={cls.close} onClick={close}>X</button>
              </div>
            )}
            <div className={cls.children}>
              {props.children}
            </div>
          </div>
        </div>
      )}
    </div>
  );
});
