export function convertSeconds(seconds, full = false) {
  seconds = Number(seconds || 0)
  if (seconds === 0) return '00:00'
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secondsRemaining = seconds % 60
  if (full) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secondsRemaining.toString().padStart(2, '0')}`
  }
  if (hours > 0)
   return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secondsRemaining.toString().padStart(2, '0')}`
  // } else if (minutes > 0) {
  return `${minutes.toString().padStart(2, '0')}:${secondsRemaining.toString().padStart(2, '0')}`
  // } else {
  //  return `${secondsRemaining.toString().padStart(2, '0')}`
  // }
}

/**
* Groups data into sub-arrays based on the start_position being within the specified range.
*
* @param {number} range - The range to group the data by.
* @param {object[]} data - The data to group.
* @returns {object[][]} - The grouped data.
*/
export function categorizeByTimeRange(data, range) {
  // Sort the data by start_position
  data.sort((a, b) => a.start_position - b.start_position)
  // Initialize the result array with the first data point
  const result = [[data[0] || []]]
  // Iterate over the rest of the data
  for (let i = 1; i < data.length; i++) {
    // Get the current data point and the last group
    const current = data[i]
    const lastGroup = result[result.length - 1]
    // Get the start position of the first data point in the last group
    const firstStartPosition = lastGroup[0].start_position
    // Check if the current data point is within the range of the last group
    if (current.start_position - firstStartPosition <= range) {
      // Add the current data point to the last group
      lastGroup.push(current)
    } else {
      // Create a new group for the current data point
      result.push([current])
    }
  }
  return result
}

function getHtmlPosition(htmlString, textPosition) {
  // Create a temporary div to parse the HTML string
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = htmlString;

  // Get the text content of the entire HTML string
  const textContent = tempDiv.textContent;

  // Ensure the text position is within the bounds of the text content
  if (textPosition < 0 || textPosition > textContent.length) {
    throw new Error('Invalid text position');
  }

  // Initialize variables to keep track of the current position in the text content and HTML string
  let currentTextPos = 0;
  let currentHtmlPos = 0;

  // Function to traverse nodes and find the HTML position
  function traverseNodes(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      const nodeLength = node.textContent.length;
      if (currentTextPos + nodeLength >= textPosition) {
        currentHtmlPos += textPosition - currentTextPos;
        return true; // Stop traversal
      }
      currentTextPos += nodeLength;
      currentHtmlPos += nodeLength;
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      currentHtmlPos += node.outerHTML.length - node.innerHTML.length;
      for (let i = 0; i < node.childNodes.length; i++) {
        if (traverseNodes(node.childNodes[i])) {
          return true; // Stop traversal
        }
      }
    }
    return false;
  }

  traverseNodes(tempDiv);

  return currentHtmlPos;
}

export function insertMarkTag(html, start, end) {
  start -= 2
  end -= 2
  const modified = html.slice(start, end).replace(/(<([a-zA-Z0-9]+)[^>]*>)/g, '$1<mark>').replace(/(<\/([a-zA-Z0-9]+)[^>]*>)/g, '</mark>$1')
  const result = `${html.slice(0, start)}<mark>${modified}</mark>${html.slice(end)}`
  return result
}

export function getTagPosition(htmlString, paragraphNumber) {
  paragraphNumber = parseInt(paragraphNumber) - 1
  const regex = /<p[^>]*>(.*?)<\/p>/g;
  let match;
  let currentParagraph = 0;
  let startPos = -1;
  let endPos = -1;

  while ((match = regex.exec(htmlString)) !== null) {
    if (currentParagraph == paragraphNumber) {
      startPos = match.index;
      endPos = regex.lastIndex;
      break;
    }
    currentParagraph++;
  }

  if (startPos === -1 || endPos === -1) {
    throw new Error('Paragraph not found');
  }

  return { startPos, endPos };
}

export const getTagPositions = (htmlString) => {
  const regex = /(<\/?([a-zA-Z0-9]+)[^>]*>)/g
  const positions = []
  let match
  while ((match = regex.exec(htmlString)) !== null) {
    const tag = match[1];                     // the full tag
    const startPos = match.index;             // start position of the tag
    const endPos = startPos + tag.length - 1; // end position of the tag
    positions.push({
      tag: match[2], // the tag name
      start: startPos,
      end: endPos
    })
  }
  return positions
}

export function paragraphNumber(html, index) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const all = Array.from(doc.querySelectorAll('h1, h2, h3, h4, h5, h6, p'));
  let counter = -1
  for (let i = 0; i < all.length; i++) {
    if (all[i].tagName === 'P') counter++
    if (counter == index) return i
  }
}

export function getTextInRange(html, startPos, endPos) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const paragraphs = Array.from(doc.querySelectorAll('p'));
  let textInRange = '';

  for (let i = 0; i < paragraphs.length; i++) {
    const pText = paragraphs[i].textContent;

    if (i === startPos.paragraph && i === endPos.paragraph) {
      textInRange += pText.substring(startPos.position, endPos.position);
      break;
    } else if (i === startPos.paragraph) {
      textInRange += pText.substring(startPos.position);
    } else if (i > startPos.paragraph && i < endPos.paragraph) {
      textInRange += pText;
    } else if (i === endPos.paragraph) {
      textInRange += pText.substring(0, endPos.position);
      break;
    }
  }

  return textInRange;
}

export function getSelectionPosition() {
  const selection = document.getSelection();
  if (!selection || selection.rangeCount === 0) return null;

  const range = selection.getRangeAt(0);
  const startContainer = range.startContainer;
  const endContainer = range.endContainer;

  const paragraphs = Array.from(document.querySelectorAll('.commentary>div>div>p'));
  let startPos = null;
  let endPos = null;

  paragraphs.forEach((p, index) => {
    if (p.contains(startContainer)) {
      const offset = getOffsetWithinParagraph(p, startContainer, range.startOffset);
      startPos = { paragraph: index, position: offset };
    }
    if (p.contains(endContainer)) {
      const offset = getOffsetWithinParagraph(p, endContainer, range.endOffset);
      endPos = { paragraph: index, position: offset };
    }
  });

  return { startPos, endPos };
}

function getOffsetWithinParagraph(paragraph, container, offset) {
  let currentNode = container;
  let currentOffset = offset;

  while (currentNode !== paragraph) {
    const parent = currentNode.parentNode;
    const siblings = Array.from(parent.childNodes);
    const index = siblings.indexOf(currentNode);

    for (let i = 0; i < index; i++) {
      currentOffset += siblings[i].textContent.length;
    }

    currentNode = parent;
  }

  return currentOffset;
}

export function findTextRange(html, text) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const elements = Array.from(doc.body.childNodes);
  text = text.replace(/\n/g, '')
  const start = doc.body.innerText.indexOf(text)
  let end = null
  if (start !== -1)
    end = start + text.length
  let raw = 0
  let total = 0
  let newStart = null
  let newEnd = null
  let paragraph = -1
  let startParagraph = -1
  let endParagraph = -1
  let startOffset = 0
  let endOffset = 0
  let offset = 0
  for (const node of elements) {
    raw += node.innerHTML.length
    total += node.outerHTML.length
    if (node.tagName === 'P') paragraph++
    if (newStart === null) {
      if (raw > start) {
        newStart = start + total - raw - 4
        startParagraph = paragraph
        startOffset = offset + 3
      }
    }
    if (newEnd === null) {
      if (raw >= end) {
        newEnd = end + total - raw - 4
        endParagraph = paragraph
        endOffset = offset + 3
      }
    }
    offset += node.outerHTML.length
    if (newStart !== null && newEnd !== null) break
  }
  if (newStart === null || newEnd === null) return null
  return {
    start: {
      paragraph: startParagraph,
      position: newStart - startOffset
    },
    end: {
      paragraph: endParagraph,
      position: newEnd - endOffset
    }
  }
}

export function timeToSeconds(duration, timeString, text = '') {
  if (typeof timeString === 'number') return timeString
  const parts = timeString.split(':')
  let seconds = 0
  if (parts.length === 3) {
    // hh:mm:ss format
    seconds = parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(parts[2])
  } else if (parts.length === 2) {
    // mm:ss format
    seconds = parseInt(parts[0]) * 60 + parseInt(parts[1])
  } else if (parts.length === 1) {
    // ss format
    seconds = parseInt(parts[0])
  }
  if (isNaN(seconds)) alert('Enter valid time!')
  else if (seconds > duration) alert(text + ' time entered cannot be bigger than duration of the video')
  else if (seconds < 0) alert('Time cannot be negative')
  else return seconds
}

export function matchTimeFormat(input) {
  if (input === '') return false
  const regex = /^(?:(\d{1,2}):(\d{2}):(\d{2})|(\d{1,2}):(\d{2})|(\d{1,2}))$/
  return !regex.test(input)
}

export function matchDigitFormat(input) {
  const regex = /^\d+$/
  return !regex.test(input)
}

export function filtering(data, duration) {
  return data
    ?.filter(({ quote, can_view, user }) => !quote && can_view && user)
    ?.filter(({ text }) => !!text)
    ?.filter(({ start_position: s, end_position: e }) => (e <= duration && s >= 0 && s <= duration && e >= 0))
    || []
}

const VIDEO_ANALYTICS_CATEGORY = 'Video Analytics'
const VIDEO_ANALYTICS_DATA_LAYER_EVENT = 'videoAnalytics'
const VIDEO_ANALYTICS_SCHEMA_VERSION = '1'
const VIDEO_PROGRESS_MILESTONES = [25, 50, 75, 100]

const hasValue = value => value !== null && value !== undefined && value !== ''

const toFiniteNumber = (value, fallback = 0) => {
  const number = Number(value)
  return Number.isFinite(number) ? number : fallback
}

const roundMetric = value => Math.round(toFiniteNumber(value) * 1000) / 1000

/**
 * Related-resource URLs exist in two formats in Atlas: our local /video/:id
 * URL and a Kaltura embed URL containing entry_id. Keep this parsing separate
 * from the API response shape so analytics never changes the player contract.
 */
export const getVideoEntryId = (value) => {
  if (!hasValue(value)) return ''

  let url = String(value)
  try {
    url = decodeURIComponent(url)
  } catch (error) {
    // A malformed escape sequence must not prevent the video from loading.
  }
  url = url.replace(/&amp;/gi, '&')

  const patterns = [
    /\/video\/([^/?#&]+)/i,
    /(?:^|[?&/])entry_id(?:=|\/)([^/?#&]+)/i,
  ]
  const match = patterns.map(pattern => url.match(pattern)).find(Boolean)
  return match ? match[1] : ''
}

const getDimensionData = (dimensions = {}) => Object.entries(dimensions).reduce((result, [id, value]) => {
  if (!hasValue(value)) return result
  const key = String(id).startsWith('dimension') ? String(id) : `dimension${id}`
  result[key] = String(value)
  return result
}, {})

/**
 * Send a regular Matomo event. `dimensions` are scoped to this action only,
 * which prevents video metadata leaking into unrelated page events.
 */
export const matomoTag = ({
  category,
  action,
  name = '',
  value = null,
  dimensions = {},
}) => {
  window._paq = window._paq || []
  const customData = getDimensionData(dimensions)
  const hasCustomData = Object.keys(customData).length > 0

  if (value !== null && value !== undefined) {
    window._paq.push([
      'trackEvent', category, action, name, value,
      ...(hasCustomData ? [customData] : []),
    ])
  } else if (hasCustomData) {
    // Matomo's custom action data is the sixth trackEvent argument.
    window._paq.push(['trackEvent', category, action, name, undefined, customData])
  } else if (name) {
    window._paq.push(['trackEvent', category, action, name])
  } else {
    window._paq.push(['trackEvent', category, action])
  }
}

export const getMatomoDataLayerValue = (key) => {
  const dataLayer = window.matomoDataLayer || []
  for (let index = dataLayer.length - 1; index >= 0; index -= 1) {
    const item = dataLayer[index]
    if (item && typeof item === 'object' && Object.prototype.hasOwnProperty.call(item, key)) {
      return item[key]
    }
  }
  return undefined
}

const splitDataLayerIds = value => String(value || '')
  .split('|')
  .map(item => item.trim())
  .filter(Boolean)

const entityIds = values => (values || [])
  .map(value => (value && typeof value === 'object' ? value.id : value))
  .filter(hasValue)
  .map(String)

const entityNames = values => (values || [])
  .map(value => (value && typeof value === 'object' ? value.name : ''))
  .filter(Boolean)

const canonicalPageData = () => {
  if (!window.location) return { pageUrl: '', pageHost: '' }
  return {
    // Query strings can contain search terms or tokens and are not needed for
    // the Case-level Page URL filter.
    pageUrl: `${window.location.origin}${window.location.pathname}`,
    pageHost: window.location.hostname,
  }
}

const createPlaybackSessionId = () => {
  if (window.crypto && typeof window.crypto.randomUUID === 'function') {
    return window.crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

const getVideoDimensionMap = () => window.matomoVideoAnalyticsDimensions || {}

const getVideoDimensions = data => {
  const mapping = getVideoDimensionMap()
  return Object.entries(mapping).reduce((dimensions, [field, id]) => {
    if (hasValue(data[field]) && Number.isInteger(Number(id))) {
      dimensions[id] = data[field]
    }
    return dimensions
  }, {})
}

const pushVideoDataLayerEvent = attributes => {
  if (typeof window.matomoDataLayerTrackEvent === 'function') {
    window.matomoDataLayerTrackEvent(VIDEO_ANALYTICS_DATA_LAYER_EVENT, attributes)
    return
  }
  window.matomoDataLayer = window.matomoDataLayer || []
  window.matomoDataLayer.push({
    event: VIDEO_ANALYTICS_DATA_LAYER_EVENT,
    attributes,
  })
}

/**
 * Send a normalized Video Analytics event both to Matomo directly and to the
 * data layer. Direct tracking is the production path; the data-layer copy is
 * useful for preview/debugging and keeps a Tag Manager implementation possible
 * without changing player code.
 */
export const matomoVideoEvent = (action, data = {}) => {
  const attributes = {
    schemaVersion: VIDEO_ANALYTICS_SCHEMA_VERSION,
    eventAction: action,
    ...canonicalPageData(),
    ...data,
  }
  const videoId = attributes.kalturaEntryId || attributes.videoId || ''

  pushVideoDataLayerEvent(attributes)
  matomoTag({
    category: VIDEO_ANALYTICS_CATEGORY,
    action,
    name: String(videoId),
    dimensions: getVideoDimensions({
      videoId,
      lessonId: attributes.lessonId,
      organizationId: attributes.organizationId,
    }),
  })
}

const callTracker = (tracker, method, ...args) => {
  if (tracker && typeof tracker[method] === 'function') {
    try {
      return tracker[method](...args)
    } catch (error) {
      return undefined
    }
  }
  return undefined
}

const setPersistentVideoDimensions = data => {
  const dimensions = getVideoDimensions(data)
  window._paq = window._paq || []
  Object.entries(dimensions).forEach(([id, value]) => {
    window._paq.push(['setCustomDimension', Number(id), String(value)])
  })
  return Object.keys(dimensions).map(Number)
}

const clearPersistentVideoDimensions = dimensionIds => {
  window._paq = window._paq || []
  dimensionIds.forEach(id => window._paq.push(['deleteCustomDimension', id]))
}

/**
 * Connect a Video.js player to Matomo Media Analytics and the Atlas event
 * contract. Matomo Media Analytics supplies watched_time/media_progress/etc.;
 * regular events supply milestones and content interactions.
 */
export const createVideoAnalyticsTracker = ({
  player,
  videoId,
  kalturaEntryId,
  videoTitle = '',
  lessonId,
  resourceUrl = '',
  organizationId = getMatomoDataLayerValue('currentOrganizationId'),
  groups = splitDataLayerIds(getMatomoDataLayerValue('userGroupIds')),
  owners = [],
  tags = [],
  subjects = [],
  heartbeatSeconds = 10,
  now = () => Date.now(),
}) => {
  if (!player || typeof player.on !== 'function') {
    return { destroy: () => {}, trackInteraction: () => {} }
  }

  let playbackSessionId = createPlaybackSessionId()
  let nativeTracker = null
  let persistentDimensionIds = []
  let destroyed = false
  let hasPlayed = false
  let ended = false
  let buffering = false
  let seeking = false
  let nativeSuspended = false
  let seekFrom = null
  let watchStartedAt = null
  let pendingWatchedSeconds = 0
  let totalWatchedSeconds = 0
  let sessionFinalized = false
  let lastCaption = null
  const reachedMilestones = new Set()
  const handlers = []

  const currentTime = () => roundMetric(callTracker(player, 'currentTime') || 0)
  const duration = () => roundMetric(callTracker(player, 'duration') || 0)
  const progress = () => {
    const total = duration()
    return total > 0 ? roundMetric(Math.min(100, (currentTime() / total) * 100)) : 0
  }
  const fullscreen = () => Boolean(callTracker(player, 'isFullscreen'))

  const baseEventData = () => ({
    videoId: hasValue(videoId) ? String(videoId) : '',
    kalturaEntryId: hasValue(kalturaEntryId) ? String(kalturaEntryId) : '',
    videoTitle,
    lessonId: hasValue(lessonId) ? String(lessonId) : '',
    organizationId: hasValue(organizationId) ? String(organizationId) : '',
    groupIds: entityIds(groups),
    ownerIds: entityIds(owners),
    ownerNames: entityNames(owners),
    tagIds: entityIds(tags),
    tagNames: entityNames(tags),
    // Subjects are intentionally not called categories until product defines
    // that mapping.
    subjectIds: entityIds(subjects),
    subjectNames: entityNames(subjects),
    playbackSessionId,
    positionSeconds: currentTime(),
    durationSeconds: duration(),
    progressPercent: progress(),
    totalWatchedSeconds: roundMetric(totalWatchedSeconds),
    fullscreen: fullscreen(),
  })

  const emit = (action, extra = {}) => {
    try {
      matomoVideoEvent(action, { ...baseEventData(), ...extra })
    } catch (error) {
      // Tracking is fail-open: a Matomo/Tag Manager failure cannot affect playback.
    }
  }

  const configureNativeTracker = () => {
    if (nativeTracker) return nativeTracker
    const mediaAnalytics = window.Matomo && window.Matomo.MediaAnalytics
    if (!mediaAnalytics || typeof mediaAnalytics.MediaTracker !== 'function') return null

    const stableVideoId = kalturaEntryId || videoId
    const mediaResource = stableVideoId
      ? `${window.location.origin}/video/${encodeURIComponent(stableVideoId)}`
      : resourceUrl || canonicalPageData().pageUrl

    try {
      persistentDimensionIds = setPersistentVideoDimensions({ videoId: stableVideoId })
      nativeTracker = new mediaAnalytics.MediaTracker(
        'atlas-videojs',
        (mediaAnalytics.mediaType && mediaAnalytics.mediaType.VIDEO) || 'video',
        mediaResource,
      )
    } catch (error) {
      clearPersistentVideoDimensions(persistentDimensionIds)
      persistentDimensionIds = []
      nativeTracker = null
      return null
    }
    callTracker(nativeTracker, 'setMediaTitle', videoTitle || String(stableVideoId || ''))
    callTracker(nativeTracker, 'setMediaTotalLengthInSeconds', duration())
    callTracker(nativeTracker, 'setMediaProgressInSeconds', currentTime())
    callTracker(nativeTracker, 'setWidth', callTracker(player, 'currentWidth') || 0)
    callTracker(nativeTracker, 'setHeight', callTracker(player, 'currentHeight') || 0)
    callTracker(nativeTracker, 'setFullscreen', fullscreen())
    // The initial update is the native Media Analytics player impression.
    callTracker(nativeTracker, 'trackUpdate')
    return nativeTracker
  }

  const collectWatchedTime = () => {
    if (watchStartedAt === null) return
    const seconds = Math.max(0, (now() - watchStartedAt) / 1000)
    watchStartedAt = now()
    pendingWatchedSeconds += seconds
    totalWatchedSeconds += seconds
  }

  const startWatchClock = () => {
    if (watchStartedAt === null && !buffering && !seeking) watchStartedAt = now()
  }

  const stopWatchClock = () => {
    collectWatchedTime()
    watchStartedAt = null
  }

  const suspendNativeProgress = () => {
    const tracker = configureNativeTracker()
    if (tracker && !nativeSuspended) {
      callTracker(tracker, 'seekStart')
      nativeSuspended = true
    }
  }

  const resumeNativeProgress = () => {
    const tracker = configureNativeTracker()
    if (tracker && nativeSuspended) {
      callTracker(tracker, 'setMediaProgressInSeconds', currentTime())
      callTracker(tracker, 'setMediaTotalLengthInSeconds', duration())
      callTracker(tracker, 'seekFinish')
      nativeSuspended = false
    }
  }

  const emitReachedMilestones = () => {
    const percentage = progress()
    VIDEO_PROGRESS_MILESTONES.forEach((milestone) => {
      if (percentage >= milestone && !reachedMilestones.has(milestone)) {
        reachedMilestones.add(milestone)
        emit(`progress_${milestone}`, { milestonePercent: milestone })
      }
    })
  }

  const flushFallbackHeartbeat = () => {
    collectWatchedTime()
    if (nativeTracker || pendingWatchedSeconds < 1) return
    emit('heartbeat', { watchedSeconds: roundMetric(pendingWatchedSeconds) })
    pendingWatchedSeconds = 0
  }

  const finalizeSession = (reason) => {
    if (sessionFinalized || !hasPlayed) return
    stopWatchClock()
    sessionFinalized = true
    emit('session_end', {
      reason,
      watchedSeconds: roundMetric(totalWatchedSeconds),
    })
  }

  const on = (event, handler) => {
    player.on(event, handler)
    handlers.push([event, handler])
  }

  const onPlay = () => {
    if (ended) {
      playbackSessionId = createPlaybackSessionId()
      reachedMilestones.clear()
      totalWatchedSeconds = 0
      pendingWatchedSeconds = 0
      sessionFinalized = false
      ended = false
    }

    const tracker = configureNativeTracker()
    callTracker(tracker, 'play')
    if (!hasPlayed || currentTime() < 0.25) {
      emit('play')
      hasPlayed = true
    } else {
      emit('resume')
    }
    startWatchClock()
  }

  const onPlaying = () => {
    if (buffering) {
      buffering = false
      resumeNativeProgress()
      emit('buffer_end')
    }
    startWatchClock()
  }

  const onPause = () => {
    stopWatchClock()
    if (ended) return
    callTracker(configureNativeTracker(), 'pause')
    emit('pause')
  }

  const onTimeUpdate = () => {
    const tracker = configureNativeTracker()
    callTracker(tracker, 'setMediaProgressInSeconds', currentTime())
    callTracker(tracker, 'setMediaTotalLengthInSeconds', duration())
    callTracker(tracker, 'update')
    if (!seeking) emitReachedMilestones()
  }

  const onSeeking = () => {
    seeking = true
    seekFrom = currentTime()
    stopWatchClock()
    suspendNativeProgress()
  }

  const onSeeked = () => {
    const to = currentTime()
    seeking = false
    resumeNativeProgress()
    if (!callTracker(player, 'paused')) startWatchClock()
    emit('seek', { seekFromSeconds: seekFrom, seekToSeconds: to })
    seekFrom = null
  }

  const onWaiting = () => {
    if (buffering) return
    buffering = true
    stopWatchClock()
    suspendNativeProgress()
    emit('buffer_start')
  }

  const onEnded = () => {
    stopWatchClock()
    ended = true
    emitReachedMilestones()
    if (!reachedMilestones.has(100)) {
      reachedMilestones.add(100)
      emit('progress_100', { milestonePercent: 100, progressPercent: 100 })
    }
    callTracker(configureNativeTracker(), 'finish')
    emit('complete', { progressPercent: 100 })
    finalizeSession('complete')
  }

  const getCaption = () => {
    const tracks = callTracker(player, 'textTracks')
    if (!tracks) return null
    for (let index = 0; index < tracks.length; index += 1) {
      const track = tracks[index]
      if (track.mode === 'showing' && ['captions', 'subtitles'].includes(track.kind)) {
        return track.label || track.language || 'captions'
      }
    }
    return ''
  }

  const onCaptionChange = () => {
    const caption = getCaption()
    if (caption === null || caption === lastCaption) return
    lastCaption = caption
    emit(caption ? 'caption_selected' : 'caption_disabled', { caption })
  }

  const onFullscreenChange = () => {
    const tracker = configureNativeTracker()
    callTracker(tracker, 'setFullscreen', fullscreen())
    callTracker(tracker, 'trackUpdate')
    emit(fullscreen() ? 'fullscreen_enter' : 'fullscreen_exit')
  }

  const onRateChange = () => {
    emit('playback_rate_change', {
      playbackRate: roundMetric(callTracker(player, 'playbackRate') || 1),
    })
  }

  const onResize = () => {
    const tracker = configureNativeTracker()
    callTracker(tracker, 'setWidth', callTracker(player, 'currentWidth') || 0)
    callTracker(tracker, 'setHeight', callTracker(player, 'currentHeight') || 0)
  }

  const onError = () => {
    const error = callTracker(player, 'error') || {}
    emit('error', {
      errorCode: hasValue(error.code) ? String(error.code) : '',
      errorMessage: error.message || 'Video playback error',
    })
  }

  const onPageHide = () => {
    finalizeSession('page_hide')
    callTracker(configureNativeTracker(), 'pause')
  }

  on('play', onPlay)
  on('playing', onPlaying)
  on('pause', onPause)
  on('timeupdate', onTimeUpdate)
  on('seeking', onSeeking)
  on('seeked', onSeeked)
  on('waiting', onWaiting)
  on('ended', onEnded)
  on('texttrackchange', onCaptionChange)
  on('fullscreenchange', onFullscreenChange)
  on('ratechange', onRateChange)
  on('playerresize', onResize)
  on('error', onError)
  window.addEventListener('pagehide', onPageHide)

  lastCaption = getCaption()
  configureNativeTracker()
  emit('player_impression')

  const heartbeatId = window.setInterval(flushFallbackHeartbeat, Math.max(5, heartbeatSeconds) * 1000)

  return {
    trackInteraction: (action, extra = {}) => emit(action, extra),
    destroy: (reason = 'player_destroyed') => {
      if (destroyed) return
      destroyed = true
      finalizeSession(reason)
      handlers.forEach(([event, handler]) => callTracker(player, 'off', event, handler))
      window.removeEventListener('pagehide', onPageHide)
      window.clearInterval(heartbeatId)
      callTracker(nativeTracker, 'pause')
      clearPersistentVideoDimensions(persistentDimensionIds)
    },
  }
}

export function sorting(a1, a2) {
  try {
    // a1 = [...a1]
    const sortChildren = (children) => {
      children.sort((a, b) =>
        a.full_code.localeCompare(b.full_code, undefined, { numeric: true })
      )
    }
    a1.sort((a, b) => a.name.localeCompare(b.name))
    a1.forEach(item => {
      sortChildren(item.children)
    })
    return a1
  } catch (e) {
    return a1
  }
}

export function getVideoSegments(ranges) {
  const segments = Array.isArray(ranges) ? ranges : [ranges]
  return segments.filter(segment =>
    !!segment &&
    (!!segment.kaltura_entry_id || segment.video_id != null) &&
    (!!segment.entire_video || segment.video_start != null || segment.video_stop != null)
  )
}

export function videoSegmentToAnnotation(segment) {
  const entire = !!segment.entire_video
  return {
    scope: 'video',
    entire_entity: entire,
    start_position: entire ? 0 : Number(segment.video_start || 0),
    end_position: entire || segment.video_stop == null ? null : Number(segment.video_stop),
    kaltura_entry_id: segment.kaltura_entry_id,
  }
}
