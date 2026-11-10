export function extractUrlParams() {
  const params = {};
  const search = new URLSearchParams(window.location.search);
  Array.from(search.entries()).forEach(([key, val]) => {
    if (['filters'].includes(key)) return;
    if (params[key]) {
      if (Array.isArray(params[key])) params[key].push(val);
      else params[key] = [params[key], val];
    } else params[key] = val;
  });
  // params[key] = value
  return params;
}
