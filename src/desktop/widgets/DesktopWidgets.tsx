import { Clock3, Cloud, MapPin } from '@/components/PixelIcon'
import { motion } from 'motion/react'
import { useEffect, useState } from 'react'

// Lightweight widget layer painted on the desktop background, behind windows.
// The container itself is pointer-events-none so it never intercepts clicks
// meant for windows or shortcuts; each widget re-enables pointer events for
// its own hover affordances only.
//
// Everything that reads `Date` or fetches live data is gated on a client
// mount flag to avoid SSR hydration mismatches.

const widgetCardClass =
  'pointer-events-auto select-none border-2 border-ink bg-os-panel/92 px-3.5 py-2.5 text-os-ink shadow-island backdrop-blur-[6px]'
const widgetLabelClass =
  'flex items-center gap-1.5 font-display text-[0.58rem] font-normal uppercase tracking-[0.12em] text-os-ink-soft'

export function DesktopWidgets() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Not rendered during SSR / before mount so time and weather never mismatch
  // between server and client. Hidden on narrow viewports — the widget layer
  // is a desktop-first flourish.
  if (!mounted) return null

  return (
    <div
      className="pointer-events-none absolute right-4 top-[64px] z-[1] flex w-[210px] flex-col items-end gap-3 max-[860px]:hidden"
      aria-label="Desktop widgets"
    >
      <ClockWidget />
      <WeatherWidget />
    </div>
  )
}

function ClockWidget() {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(id)
  }, [])

  const time = now.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
  const seconds = now.toLocaleTimeString([], { second: '2-digit' }).padStart(2, '0')
  const date = now.toLocaleDateString([], {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })

  return (
    <motion.div
      className={`${widgetCardClass} w-full`}
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
    >
      <span className={widgetLabelClass}>
        <Clock3 aria-hidden="true" size={12} />
        Clock
      </span>
      <div className="mt-1.5 flex items-baseline gap-1 font-display leading-none">
        <span className="text-[1.7rem] tracking-[0.02em]">{time}</span>
        <span className="text-[0.8rem] text-os-ink-soft">{seconds}</span>
      </div>
      <div className="mt-1 text-[0.7rem] font-bold uppercase tracking-[0.06em] text-os-ink-soft">
        {date}
      </div>
    </motion.div>
  )
}

type WeatherState =
  | { status: 'loading' }
  | { status: 'error' }
  | {
      status: 'ready'
      temperature: number
      label: string
      place: string
    }

function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherState>({ status: 'loading' })

  useEffect(() => {
    const controller = new AbortController()

    void loadWeather(controller.signal)
      .then((data) => setWeather({ status: 'ready', ...data }))
      .catch((error: unknown) => {
        if (controller.signal.aborted) return
        if (error instanceof DOMException && error.name === 'AbortError') return
        setWeather({ status: 'error' })
      })

    return () => controller.abort()
  }, [])

  return (
    <motion.div
      className={`${widgetCardClass} w-full`}
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.32, delay: 0.06, ease: [0.22, 1, 0.36, 1] }}
    >
      <span className={widgetLabelClass}>
        <Cloud aria-hidden="true" size={12} />
        Weather
      </span>
      {weather.status === 'ready' ? (
        <>
          <div className="mt-1.5 flex items-baseline gap-1 font-display leading-none">
            <span className="text-[1.7rem] tracking-[0.02em]">
              {Math.round(weather.temperature)}°
            </span>
            <span className="text-[0.7rem] uppercase tracking-[0.06em] text-os-ink-soft">C</span>
          </div>
          <div className="mt-1 text-[0.7rem] font-bold uppercase tracking-[0.04em] text-os-ink-soft">
            {weather.label}
          </div>
          <div className="mt-0.5 flex items-center gap-1 text-[0.66rem] font-bold text-os-ink-soft">
            <MapPin aria-hidden="true" size={11} />
            {weather.place}
          </div>
        </>
      ) : weather.status === 'loading' ? (
        <div className="mt-2 text-[0.72rem] font-bold uppercase tracking-[0.06em] text-os-ink-soft">
          Loading…
        </div>
      ) : (
        <div className="mt-2 text-[0.72rem] font-bold uppercase tracking-[0.06em] text-os-ink-soft">
          Unavailable
        </div>
      )}
    </motion.div>
  )
}

// open-meteo.com — free, no API key. We try the browser geolocation API and
// fall back to a fixed location (Felix is based in Switzerland) when it is
// blocked, unavailable, or slow.
const fallbackLocation = { latitude: 47.05, longitude: 8.31, place: 'Lucerne' }

async function loadWeather(signal: AbortSignal) {
  const location = await resolveLocation(signal)
  const params = new URLSearchParams({
    latitude: String(location.latitude),
    longitude: String(location.longitude),
    current: 'temperature_2m,weather_code',
    timezone: 'auto',
  })
  const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params.toString()}`, {
    signal,
  })

  if (!response.ok) throw new Error('weather request failed')

  const data = (await response.json()) as {
    current?: { temperature_2m?: number; weather_code?: number }
  }
  const temperature = data.current?.temperature_2m

  if (typeof temperature !== 'number') throw new Error('weather payload invalid')

  return {
    temperature,
    label: weatherCodeLabel(data.current?.weather_code ?? -1),
    place: location.place,
  }
}

function resolveLocation(signal: AbortSignal) {
  return new Promise<{ latitude: number; longitude: number; place: string }>((resolve) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      resolve(fallbackLocation)
      return
    }

    const timeoutId = window.setTimeout(() => resolve(fallbackLocation), 4000)
    const settle = (value: { latitude: number; longitude: number; place: string }) => {
      window.clearTimeout(timeoutId)
      resolve(value)
    }

    signal.addEventListener('abort', () => settle(fallbackLocation), { once: true })

    navigator.geolocation.getCurrentPosition(
      (position) =>
        settle({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          place: 'Here',
        }),
      () => settle(fallbackLocation),
      { timeout: 3500, maximumAge: 600000 },
    )
  })
}

// WMO weather interpretation codes → short pixel-friendly labels.
function weatherCodeLabel(code: number) {
  if (code === 0) return 'Clear'
  if (code <= 2) return 'Partly cloudy'
  if (code === 3) return 'Overcast'
  if (code <= 48) return 'Fog'
  if (code <= 57) return 'Drizzle'
  if (code <= 67) return 'Rain'
  if (code <= 77) return 'Snow'
  if (code <= 82) return 'Showers'
  if (code <= 86) return 'Snow showers'
  if (code <= 99) return 'Thunderstorm'

  return 'Clear'
}
