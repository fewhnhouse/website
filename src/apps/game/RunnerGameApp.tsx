import { Pause, Play, RotateCcw, Trophy } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'

import {
  osAppHeight,
  osAppShellClass,
  osInputClass,
  osPanelBareClass,
  osPanelClass,
  osToolbarButtonClass,
} from '@/apps/shared/appStyles'

type RunnerState = 'ready' | 'running' | 'paused' | 'gameover'

type Obstacle = {
  height: number
  kind: 'block' | 'spike'
  width: number
  x: number
}

type RunnerScore = {
  id: string
  name: string
  score: number
  submittedAt: string
}

type GameModel = {
  distance: number
  groundY: number
  lastSpawn: number
  obstacles: Obstacle[]
  playerY: number
  seed: number
  speed: number
  velocityY: number
}

const canvasWidth = 900
const canvasHeight = 360
const player = {
  x: 96,
  width: 34,
  height: 44,
}
const gravity = 2500
const jumpVelocity = -860
const highScoreStorageKey = 'felix-runner-high-scores'
const initialGroundY = 300

function createGame(): GameModel {
  return {
    distance: 0,
    groundY: initialGroundY,
    lastSpawn: 0,
    obstacles: [],
    playerY: initialGroundY - player.height,
    seed: Math.floor(Math.random() * 100_000) + 1,
    speed: 330,
    velocityY: 0,
  }
}

export function RunnerGameApp() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const modelRef = useRef(createGame())
  const lastFrameRef = useRef<number | null>(null)
  const stateRef = useRef<RunnerState>('ready')
  const [runnerState, setRunnerState] = useState<RunnerState>('ready')
  const [score, setScore] = useState(0)
  const [highScores, setHighScores] = useState<RunnerScore[]>([])
  const [playerName, setPlayerName] = useState('')
  const [savedScoreId, setSavedScoreId] = useState<string | null>(null)

  const setGameState = useCallback((nextState: RunnerState) => {
    stateRef.current = nextState
    setRunnerState(nextState)
  }, [])

  const resetGame = useCallback(() => {
    modelRef.current = createGame()
    lastFrameRef.current = null
    setScore(0)
    setSavedScoreId(null)
    setGameState('ready')
  }, [setGameState])

  const jump = useCallback(() => {
    const model = modelRef.current

    if (stateRef.current === 'ready') {
      setGameState('running')
    }

    if (stateRef.current !== 'running') return

    const onGround = model.playerY >= model.groundY - player.height - 0.5
    if (!onGround) return

    model.velocityY = jumpVelocity
  }, [setGameState])

  const togglePause = useCallback(() => {
    if (stateRef.current === 'running') {
      setGameState('paused')
      return
    }

    if (stateRef.current === 'paused') {
      lastFrameRef.current = null
      setGameState('running')
    }
  }, [setGameState])

  useEffect(() => {
    setHighScores(readHighScores())
  }, [])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLElement && event.target.closest('input,textarea')) return

      if (event.code === 'Space' || event.code === 'ArrowUp') {
        event.preventDefault()
        jump()
      }

      if (event.code === 'KeyP') {
        event.preventDefault()
        togglePause()
      }

      if (event.code === 'KeyR' && stateRef.current === 'gameover') {
        event.preventDefault()
        resetGame()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [jump, resetGame, togglePause])

  useEffect(() => {
    let animationId = 0

    const frame = (time: number) => {
      const lastFrame = lastFrameRef.current ?? time
      const deltaSeconds = Math.min((time - lastFrame) / 1000, 0.032)
      lastFrameRef.current = time

      if (stateRef.current === 'running') {
        const nextScore = updateGame(modelRef.current, deltaSeconds)
        setScore(nextScore)

        if (hasCollision(modelRef.current)) {
          setGameState('gameover')
        }
      }

      drawGame(canvasRef.current, modelRef.current, stateRef.current)
      animationId = window.requestAnimationFrame(frame)
    }

    animationId = window.requestAnimationFrame(frame)
    return () => window.cancelAnimationFrame(animationId)
  }, [setGameState])

  const saveScore = () => {
    const trimmedName = playerName.trim()
    const name = trimmedName.length > 0 ? trimmedName.slice(0, 18) : 'Anonymous'
    const entry = {
      id: `${Date.now()}-${Math.round(score)}`,
      name,
      score: Math.round(score),
      submittedAt: new Date().toISOString(),
    }
    const nextScores = [entry, ...highScores]
      .sort((a, b) => b.score - a.score || a.submittedAt.localeCompare(b.submittedAt))
      .slice(0, 10)

    window.localStorage.setItem(highScoreStorageKey, JSON.stringify(nextScores))
    setHighScores(nextScores)
    setSavedScoreId(entry.id)
  }

  const topScore = highScores[0]?.score ?? 0
  const canSaveScore = runnerState === 'gameover' && savedScoreId === null

  return (
    <section className={`${osAppShellClass} ${osAppHeight.tall} bg-[#081719] text-white`}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-white/[0.04] px-4 py-3">
        <div>
          <p className="text-caption font-black uppercase tracking-[0.14em] text-[#7fdad1]">
            runner.app
          </p>
          <h1 className="text-lg font-black leading-tight">Offline Runner</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className={`${osToolbarButtonClass} border-white/15 bg-white/10 text-white hover:bg-white/18`}
            onClick={togglePause}
            disabled={runnerState === 'ready' || runnerState === 'gameover'}
            aria-label={runnerState === 'paused' ? 'Resume game' : 'Pause game'}
          >
            {runnerState === 'paused' ? <Play aria-hidden="true" size={16} /> : <Pause aria-hidden="true" size={16} />}
          </button>
          <button
            type="button"
            className={`${osToolbarButtonClass} border-white/15 bg-white/10 text-white hover:bg-white/18`}
            onClick={resetGame}
            aria-label="Reset game"
          >
            <RotateCcw aria-hidden="true" size={16} />
          </button>
        </div>
      </div>

      <div className="grid min-h-0 flex-1 gap-4 overflow-auto p-4 lg:grid-cols-[minmax(0,1fr)_260px]">
        <div className="min-w-0">
          <div className="relative overflow-hidden rounded-card border border-white/12 bg-[#0b2225] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
            <canvas
              ref={canvasRef}
              width={canvasWidth}
              height={canvasHeight}
              className="block aspect-[5/2] w-full touch-none"
              onPointerDown={jump}
              aria-label="Procedurally generated runner game"
            />
            {runnerState !== 'running' ? (
              <div className="pointer-events-none absolute inset-0 grid place-items-center bg-black/20 px-6 text-center">
                <div>
                  <p className="text-2xl font-black">
                    {runnerState === 'gameover'
                      ? 'Crash'
                      : runnerState === 'paused'
                        ? 'Paused'
                        : 'Press Space'}
                  </p>
                  <p className="mt-1 text-sm font-bold text-white/72">
                    {runnerState === 'gameover'
                      ? 'Save your score or restart.'
                      : 'Jump over generated obstacles. Space, arrow up, or tap.'}
                  </p>
                </div>
              </div>
            ) : null}
          </div>

          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            <Stat label="Score" value={Math.round(score).toLocaleString()} />
            <Stat label="Best" value={topScore.toLocaleString()} />
            <Stat label="Speed" value={`${Math.round(modelRef.current.speed)} px/s`} />
          </div>

          {runnerState === 'gameover' ? (
            <form
              className={`${osPanelClass} mt-3 border-white/12 bg-white/[0.06]`}
              onSubmit={(event) => {
                event.preventDefault()
                saveScore()
              }}
            >
              <label className="text-caption font-black uppercase tracking-[0.12em] text-white/60">
                High score name
              </label>
              <div className="mt-2 flex gap-2">
                <input
                  className={`${osInputClass} border-white/15 bg-white/10 text-white placeholder:text-white/40`}
                  value={playerName}
                  onChange={(event) => setPlayerName(event.target.value)}
                  placeholder="Your name"
                  maxLength={18}
                  disabled={!canSaveScore}
                />
                <button
                  type="submit"
                  className={`${osToolbarButtonClass} border-[#7fdad1]/40 bg-[#7fdad1]/20 text-white hover:bg-[#7fdad1]/28`}
                  disabled={!canSaveScore}
                >
                  Submit
                </button>
              </div>
            </form>
          ) : null}
        </div>

        <aside className={`${osPanelBareClass} border-white/12 bg-white/[0.06] p-3 text-white`}>
          <div className="mb-3 flex items-center gap-2">
            <Trophy aria-hidden="true" size={18} className="text-[#f6c85f]" />
            <h2 className="text-sm font-black">High Scores</h2>
          </div>
          <ol className="space-y-2">
            {highScores.length > 0 ? (
              highScores.map((entry, index) => (
                <li
                  key={entry.id}
                  className={`grid grid-cols-[1.7rem_minmax(0,1fr)_auto] items-center gap-2 rounded-control border px-2 py-2 text-sm ${
                    entry.id === savedScoreId
                      ? 'border-[#7fdad1]/40 bg-[#7fdad1]/14'
                      : 'border-white/10 bg-white/[0.05]'
                  }`}
                >
                  <span className="font-black text-white/45">{index + 1}</span>
                  <span className="truncate font-bold">{entry.name}</span>
                  <span className="font-black tabular-nums">{entry.score.toLocaleString()}</span>
                </li>
              ))
            ) : (
              <li className="rounded-control border border-white/10 bg-white/[0.05] px-3 py-4 text-sm font-bold text-white/55">
                No scores yet.
              </li>
            )}
          </ol>
        </aside>
      </div>
    </section>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-card border border-white/10 bg-white/[0.06] px-3 py-2">
      <p className="text-caption font-black uppercase tracking-[0.12em] text-white/45">{label}</p>
      <p className="mt-1 text-lg font-black tabular-nums text-white">{value}</p>
    </div>
  )
}

function updateGame(model: GameModel, deltaSeconds: number) {
  model.distance += model.speed * deltaSeconds
  model.speed = Math.min(620, 330 + model.distance * 0.035)
  model.velocityY += gravity * deltaSeconds
  model.playerY = Math.min(
    model.groundY - player.height,
    model.playerY + model.velocityY * deltaSeconds,
  )

  if (model.playerY >= model.groundY - player.height) {
    model.velocityY = 0
  }

  model.lastSpawn += model.speed * deltaSeconds
  if (model.lastSpawn > 360 + seededRandom(model) * 230) {
    model.obstacles.push(createObstacle(model))
    model.lastSpawn = 0
  }

  model.obstacles = model.obstacles
    .map((obstacle) => ({
      ...obstacle,
      x: obstacle.x - model.speed * deltaSeconds,
    }))
    .filter((obstacle) => obstacle.x + obstacle.width > -20)

  return Math.floor(model.distance / 9)
}

function createObstacle(model: GameModel): Obstacle {
  const tall = seededRandom(model) > 0.62
  const spike = seededRandom(model) > 0.72

  return {
    height: spike ? 34 : tall ? 56 : 42,
    kind: spike ? 'spike' : 'block',
    width: spike ? 42 : tall ? 28 : 34,
    x: canvasWidth + 20,
  }
}

function hasCollision(model: GameModel) {
  const playerBox = {
    x: player.x + 5,
    y: model.playerY + 4,
    width: player.width - 10,
    height: player.height - 6,
  }

  return model.obstacles.some((obstacle) => {
    const obstacleBox = {
      x: obstacle.x + 3,
      y: model.groundY - obstacle.height,
      width: obstacle.width - 6,
      height: obstacle.height,
    }

    return (
      playerBox.x < obstacleBox.x + obstacleBox.width &&
      playerBox.x + playerBox.width > obstacleBox.x &&
      playerBox.y < obstacleBox.y + obstacleBox.height &&
      playerBox.y + playerBox.height > obstacleBox.y
    )
  })
}

function drawGame(canvas: HTMLCanvasElement | null, model: GameModel, runnerState: RunnerState) {
  const context = canvas?.getContext('2d')
  if (!context) return

  context.clearRect(0, 0, canvasWidth, canvasHeight)
  const sky = context.createLinearGradient(0, 0, 0, canvasHeight)
  sky.addColorStop(0, '#0b2225')
  sky.addColorStop(1, '#102c2b')
  context.fillStyle = sky
  context.fillRect(0, 0, canvasWidth, canvasHeight)

  drawGrid(context, model.distance)
  context.fillStyle = '#7fdad1'
  context.fillRect(0, model.groundY, canvasWidth, 3)
  context.fillStyle = 'rgba(127,218,209,0.18)'
  context.fillRect(0, model.groundY + 3, canvasWidth, canvasHeight - model.groundY)

  model.obstacles.forEach((obstacle) => drawObstacle(context, model, obstacle))
  drawPlayer(context, model, runnerState)
}

function drawGrid(context: CanvasRenderingContext2D, distance: number) {
  context.strokeStyle = 'rgba(127,218,209,0.12)'
  context.lineWidth = 1
  const offset = -(distance % 44)

  for (let x = offset; x < canvasWidth; x += 44) {
    context.beginPath()
    context.moveTo(x, 0)
    context.lineTo(x, canvasHeight)
    context.stroke()
  }
}

function drawObstacle(context: CanvasRenderingContext2D, model: GameModel, obstacle: Obstacle) {
  const y = model.groundY - obstacle.height

  context.fillStyle = obstacle.kind === 'spike' ? '#f66d44' : '#f6c85f'
  if (obstacle.kind === 'spike') {
    context.beginPath()
    context.moveTo(obstacle.x, model.groundY)
    context.lineTo(obstacle.x + obstacle.width / 2, y)
    context.lineTo(obstacle.x + obstacle.width, model.groundY)
    context.closePath()
    context.fill()
    return
  }

  context.fillRect(obstacle.x, y, obstacle.width, obstacle.height)
  context.fillStyle = 'rgba(8,23,25,0.22)'
  context.fillRect(obstacle.x + obstacle.width - 8, y + 6, 4, obstacle.height - 12)
}

function drawPlayer(context: CanvasRenderingContext2D, model: GameModel, runnerState: RunnerState) {
  const bob = runnerState === 'running' && model.velocityY === 0 ? Math.sin(model.distance / 24) * 2 : 0
  const y = model.playerY + bob

  context.fillStyle = '#eaf7f3'
  context.fillRect(player.x, y, player.width, player.height)
  context.fillStyle = '#081719'
  context.fillRect(player.x + 22, y + 10, 5, 5)
  context.fillStyle = '#7fdad1'
  context.fillRect(player.x + 6, y + player.height - 8, 9, 8)
  context.fillRect(player.x + 22, y + player.height - 8, 9, 8)
}

function seededRandom(model: GameModel) {
  model.seed = (model.seed * 16807) % 2147483647
  return (model.seed - 1) / 2147483646
}

function readHighScores(): RunnerScore[] {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(highScoreStorageKey) ?? '[]')
    if (!Array.isArray(parsed)) return []

    return parsed
      .filter(isRunnerScore)
      .sort((a, b) => b.score - a.score || a.submittedAt.localeCompare(b.submittedAt))
      .slice(0, 10)
  } catch {
    return []
  }
}

function isRunnerScore(value: unknown): value is RunnerScore {
  if (!value || typeof value !== 'object') return false

  const score = value as Record<string, unknown>
  return (
    typeof score.id === 'string' &&
    typeof score.name === 'string' &&
    typeof score.score === 'number' &&
    Number.isFinite(score.score) &&
    typeof score.submittedAt === 'string'
  )
}
