// @ts-ignore
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

export const Portal = ({ visible = false, containerId = 'modal-root', children }) => {
  const [modalContainer, setModalContainer] = useState<any>();
  useEffect(() => {
    const modalRoot = document.getElementById(containerId);
    setModalContainer(document.createElement('div'));

    if (!modalRoot) {
      const containerDiv = document.createElement('div');
      containerDiv.id = containerId;
      document.documentElement.appendChild(containerDiv);
    }
  }, [containerId]);
  useEffect(() => {
    const modalRoot = document.getElementById(containerId);
    if (modalRoot && modalContainer) {
      modalRoot.appendChild(modalContainer);
    }
    return function cleanup() {
      if (modalContainer) {
        modalRoot.removeChild(modalContainer);
      }
    };
  }, [containerId, modalContainer]);
  useEffect(() => {
    if (modalContainer) {
      modalContainer.style.position = visible ? 'unset' : 'absolute';
      modalContainer.style.height = visible ? 'auto' : '0px';
      modalContainer.style.overflow = visible ? 'auto' : 'hidden';
      modalContainer.style.position = visible ? 'fixed' : '';
      modalContainer.style.top = visible ? '0' : '';
      modalContainer.style.left = visible ? '0' : '';
      modalContainer.style.right = visible ? '0' : '';
      modalContainer.style.bottom = visible ? '0' : '';
      modalContainer.style.background = visible ? 'rgba(0, 0, 0, 0.25)' : '';
      modalContainer.style.zIndex = visible ? '1000' : '';
      modalContainer.style.display = visible ? 'flex' : '';
      modalContainer.style.justifyContent = visible ? 'center' : '';
      modalContainer.style.alignItems = visible ? 'center' : '';
    }
  }, [modalContainer, visible]);
  if (!modalContainer) {
    return null;
  }
  return createPortal(children, modalContainer);
};
