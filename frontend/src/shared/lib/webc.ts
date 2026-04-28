import React from 'react';
import ReactDOM from 'react-dom';

type PropsMapper<T> = (element: HTMLElement) => T;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function defineWebComponent<T = any>(
  tagName: string,
  Component: React.ComponentType<T>,
  observedAttributes: string[],
  propsMapper: PropsMapper<T>,
): void {
  class ReactWebComponent extends HTMLElement {
    private mountPoint: HTMLElement | null = null;

    static get observedAttributes() {
      return observedAttributes;
    }

    connectedCallback() {
      this.mountPoint = document.createElement('div');
      this.appendChild(this.mountPoint);
      this.render();
    }

    disconnectedCallback() {
      if (this.mountPoint) {
        ReactDOM.unmountComponentAtNode(this.mountPoint);
      }
    }

    attributeChangedCallback() {
      this.render();
    }

    render() {
      if (!this.mountPoint) return;
      const props = propsMapper(this);
      ReactDOM.render(React.createElement(Component, props), this.mountPoint);
    }
  }

  if (!customElements.get(tagName)) {
    customElements.define(tagName, ReactWebComponent);
  }
}

export default defineWebComponent;
