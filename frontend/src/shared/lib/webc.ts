import { createElement } from 'react';
import { createRoot, Root } from 'react-dom/client';

export default function defineWebComponent(name: string, ReactComponent: React.FC<any>, attrs: string[], props: (wc: HTMLElement) => any) {
  class WebComponent extends HTMLElement {
    private mountPoint: Element | ShadowRoot;
    private root: Root;

    constructor() {
      super();
      this.mountPoint = this;
      this.root = createRoot(this.mountPoint as Element)
    }

    static get observedAttributes() { return attrs; }

    connectedCallback() {
      this.mount();
    }

    disconnectedCallback() {
      this.root.unmount();
    }

    private mount() {
      this.root.render(createElement(ReactComponent, props(this)));
    }
  }

  customElements.define(name, WebComponent);
}
