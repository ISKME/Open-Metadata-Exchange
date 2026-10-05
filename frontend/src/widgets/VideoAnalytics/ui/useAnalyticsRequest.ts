import axios from 'axios';
import { useEffect, useState } from 'react';

type RequestState<T> = {
  key: string;
  data: T | null;
  error: string;
  loading: boolean;
};

// eslint-disable-next-line no-unused-vars -- TypeScript callback signature.
type ResponseValidator<T> = (data: T) => boolean;

export function useAnalyticsRequest<T>(url: string, params: object, enabled = true, validate: ResponseValidator<T> | undefined = undefined) {
  const [revision, setRevision] = useState(0);
  const serializedParams = JSON.stringify(params);
  const key = `${url}:${serializedParams}:${revision}`;
  const [state, setState] = useState<RequestState<T>>({
    key: '', data: null, error: '', loading: false,
  });

  useEffect(() => {
    if (!enabled) return undefined;
    let active = true;
    const controller = new AbortController();
    setState({
      key, data: null, error: '', loading: true,
    });
    axios.get<T>(url, { params: JSON.parse(serializedParams), signal: controller.signal })
      .then(({ data }) => {
        if (!active) return;
        if (!data || typeof data !== 'object' || Array.isArray(data) || 'error' in data || (validate && !validate(data))) {
          throw new Error('Unexpected analytics response');
        }
        setState({
          key, data, error: '', loading: false,
        });
      })
      .catch(() => {
        if (active) {
          setState({
            key, data: null, error: 'Unable to load video analytics. Please try again.', loading: false,
          });
        }
      });
    return () => {
      active = false;
      controller.abort();
    };
  }, [enabled, key, serializedParams, url, validate]);

  // Hide old results immediately on a filter change, even before the effect
  // runs. A delayed request must never relabel old data with new filters.
  const current = enabled && state.key === key;
  return {
    data: current ? state.data : null,
    error: current ? state.error : '',
    loading: enabled && (!current || state.loading),
    retry: () => setRevision((value) => value + 1),
  };
}
