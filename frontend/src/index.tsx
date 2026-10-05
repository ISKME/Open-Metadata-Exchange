// @ts-nocheck
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { setupStore } from 'app/providers/StoreProvider/config/store';
import App from './app/App';
import { RECAPTCHA_PUBLIC_KEY } from 'shared/config/recaptcha';

const store = setupStore();

const recaptchaSiteKey = RECAPTCHA_PUBLIC_KEY;

function bootstrapApp() {
  const container = document.getElementById('root')
  const root = createRoot(container!)
  root.render(
    <BrowserRouter>
      <Provider store={store}>
        <App />
      </Provider>
    </BrowserRouter>
  );
}

function initRecaptcha() {
  const script = document.createElement('script');
  script.src = `https://www.google.com/recaptcha/api.js?render=${recaptchaSiteKey}`;
  script.async = true;
  script.defer = true;

  script.onload = () => {
    if (window.grecaptcha) {
      window.grecaptcha.ready(() => {
        bootstrapApp();
      });
    } else {
      bootstrapApp();
    }
  };

  script.onerror = bootstrapApp;

  document.head.appendChild(script);
}

(function start() {
  if (typeof window === 'undefined') {
    bootstrapApp();
    return;
  }

  const recaptchaEnabled = (window as any).RECAPTCHA_ENABLED;

  if (recaptchaEnabled === false) {
    bootstrapApp();
  } else {
    initRecaptcha();
  }
})();
