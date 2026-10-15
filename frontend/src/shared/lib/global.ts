export function extractUrlParams() {
  const params = {}
  const search = new URLSearchParams(window.location.search)
  for (const [key, val] of Array.from(search.entries())) {
    if (['filters'].includes(key)) continue
    if (params[key]) {
      if (Array.isArray(params[key])) params[key].push(val)
      else params[key] = [params[key], val]
    } else params[key] = val
  }
  // params[key] = value
  return params
}
