// @ts-nocheck
import axios from 'axios';
import { RECAPTCHA_PUBLIC_KEY } from 'shared/config/recaptcha';

const recaptchaSiteKey = RECAPTCHA_PUBLIC_KEY;

const api = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  async (config) => {
    if (typeof window !== 'undefined' && window.grecaptcha) {
      try {
        const token = await window.grecaptcha.execute(recaptchaSiteKey, {
          action: 'request',
        });
        // eslint-disable-next-line no-param-reassign -- axios expects the interceptor to change the config
        config.headers['X-Recaptcha-Token'] = token;
      } catch {
        // silent fail: don't block request
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

export default api;
