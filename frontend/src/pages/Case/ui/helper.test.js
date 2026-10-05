import {
  createVideoAnalyticsTracker,
  getVideoEntryId,
  matomoTag,
} from './helper'

class FakePlayer {
  constructor() {
    this.handlers = new Map()
    this.position = 0
    this.length = 100
    this.pausedValue = true
    this.fullscreenValue = false
    this.rate = 1
    this.tracks = [{ kind: 'captions', label: 'English', mode: 'disabled' }]
  }

  on(event, handler) {
    const handlers = this.handlers.get(event) || []
    this.handlers.set(event, [...handlers, handler])
  }

  off(event, handler) {
    this.handlers.set(
      event,
      (this.handlers.get(event) || []).filter(item => item !== handler),
    )
  }

  trigger(event) {
    if (event === 'play') this.pausedValue = false
    if (event === 'pause' || event === 'ended') this.pausedValue = true
    const handlers = this.handlers.get(event) || []
    handlers.forEach(handler => handler())
  }

  currentTime() { return this.position }

  duration() { return this.length }

  paused() { return this.pausedValue }

  isFullscreen() { return this.fullscreenValue }

  playbackRate() { return this.rate }

  currentWidth() { return 1280 }

  currentHeight() { return 720 }

  textTracks() { return this.tracks }

  error() { return null }
}

const eventActions = () => window._paq
  .filter(item => item[0] === 'trackEvent' && item[1] === 'Video Analytics')
  .map(item => item[2])

describe('Matomo video analytics', () => {
  let player
  let nativeMediaTracker

  beforeEach(() => {
    jest.useFakeTimers()
    window._paq = []
    window.matomoDataLayer = []
    window.matomoVideoAnalyticsDimensions = {
      videoId: 12,
    }
    nativeMediaTracker = {
      setMediaTitle: jest.fn(),
      setMediaTotalLengthInSeconds: jest.fn(),
      setMediaProgressInSeconds: jest.fn(),
      setWidth: jest.fn(),
      setHeight: jest.fn(),
      setFullscreen: jest.fn(),
      trackUpdate: jest.fn(),
      play: jest.fn(),
      pause: jest.fn(),
      update: jest.fn(),
      seekStart: jest.fn(),
      seekFinish: jest.fn(),
      finish: jest.fn(),
    }
    window.Matomo = {
      MediaAnalytics: {
        mediaType: { VIDEO: 'video' },
        MediaTracker: jest.fn(() => {
          expect(window._paq).toContainEqual([
            'setCustomDimension',
            12,
            '0_entry',
          ])
          return nativeMediaTracker
        }),
      },
    }
    player = new FakePlayer()
  })

  afterEach(() => {
    jest.useRealTimers()
    delete window.Matomo
    delete window.matomoVideoAnalyticsDimensions
  })

  test('matomoTag preserves zero and sends action dimensions', () => {
    matomoTag({
      category: 'Test',
      action: 'Zero',
      value: 0,
      dimensions: { 12: 'video-1' },
    })

    expect(window._paq[0]).toEqual([
      'trackEvent',
      'Test',
      'Zero',
      '',
      0,
      { dimension12: 'video-1' },
    ])
  })

  test.each([
    ['/video/0_local123?check_status', '0_local123'],
    ['https://cdnapi.kaltura.com/p/1821311/embed?entry_id=0_query123&foo=1', '0_query123'],
    ['https://cdnapi.kaltura.com/embed?foo=1&amp;entry_id=0_html123&amp;bar=2', '0_html123'],
    ['https://cdnapi.kaltura.com/embed?foo=1&amp;entry_id/0_legacy123&amp;bar=2', '0_legacy123'],
    ['https://cdnapi.kaltura.com/p/1821311/entry_id/0_path123/embed', '0_path123'],
  ])('extracts a Kaltura entry id without changing attachment data', (url, expected) => {
    expect(getVideoEntryId(url)).toBe(expected)
  })

  test('sets Video ID directly before tracking a native media impression', () => {
    const tracker = createVideoAnalyticsTracker({
      player,
      videoId: 41,
      kalturaEntryId: '0_entry',
      videoTitle: 'Case video',
    })

    expect(window.Matomo.MediaAnalytics.MediaTracker).toHaveBeenCalledWith(
      'atlas-videojs',
      'video',
      'http://localhost/video/0_entry',
    )
    expect(nativeMediaTracker.trackUpdate).toHaveBeenCalledTimes(1)
    expect(window._paq).toContainEqual([
      'setCustomDimension',
      12,
      '0_entry',
    ])
    expect(eventActions()).toEqual(['player_impression'])
    expect(window._paq[window._paq.length - 1][5]).toEqual({
      dimension12: '0_entry',
    })

    tracker.destroy()
    expect(window._paq).toContainEqual(['deleteCustomDimension', 12])
  })

  test('distinguishes play and resume and emits every milestone once', () => {
    const tracker = createVideoAnalyticsTracker({
      player,
      kalturaEntryId: '0_entry',
      lessonId: 759,
    })

    player.trigger('play')
    player.trigger('pause')
    player.position = 10
    player.trigger('play')
    player.position = 30
    player.trigger('timeupdate')
    player.position = 80
    player.trigger('timeupdate')
    player.trigger('timeupdate')

    expect(eventActions()).toEqual([
      'player_impression',
      'play',
      'pause',
      'resume',
      'progress_25',
      'progress_50',
      'progress_75',
    ])
    expect(nativeMediaTracker.play).toHaveBeenCalledTimes(2)

    tracker.destroy()
  })

  test('tracks captions and completes and cleans up one playback session', () => {
    const tracker = createVideoAnalyticsTracker({
      player,
      kalturaEntryId: '0_entry',
      lessonId: 759,
    })

    player.trigger('play')
    player.tracks[0].mode = 'showing'
    player.trigger('texttrackchange')
    player.position = 100
    player.trigger('ended')
    tracker.destroy()

    expect(eventActions()).toEqual([
      'player_impression',
      'play',
      'caption_selected',
      'progress_25',
      'progress_50',
      'progress_75',
      'progress_100',
      'complete',
      'session_end',
    ])
    expect(nativeMediaTracker.finish).toHaveBeenCalledTimes(1)
    expect(window._paq.filter(item => item[0] === 'deleteCustomDimension')).toEqual([
      ['deleteCustomDimension', 12],
    ])
    expect([...player.handlers.values()].every(handlers => handlers.length === 0)).toBe(true)
  })
})
