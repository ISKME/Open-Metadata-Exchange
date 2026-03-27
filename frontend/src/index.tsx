// @ts-nocheck
import { render } from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { setupStore } from 'app/providers/StoreProvider/config/store';
import App from './app/App';
import { RECAPTCHA_PUBLIC_KEY } from 'shared/config/recaptcha';

const store = setupStore();

const recaptchaSiteKey = RECAPTCHA_PUBLIC_KEY;

function bootstrapApp() {
  render(
    <BrowserRouter>
      <Provider store={store}>
        <App />
      </Provider>
    </BrowserRouter>,
    document.getElementById('root')
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

initRecaptcha();
