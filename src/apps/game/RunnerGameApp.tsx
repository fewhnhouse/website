import { Trophy } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'

import { osAppHeight, osAppShellClass } from '@/apps/shared/appStyles'

type RunnerState = 'ready' | 'running' | 'paused' | 'gameover'

type Obstacle = {
  gapAfter: number
  height: number
  kind: 'birdHigh' | 'birdLow' | 'birdSky' | 'hedge' | 'log' | 'mushroom' | 'spike'
  width: number
  x: number
  y: number
}

type RunnerScore = {
  id: string
  name: string
  score: number
  submittedAt: string
}

type GameModel = {
  crouching: boolean
  distance: number
  groundY: number
  lastSpawn: number
  nextSpawnGap: number
  obstacles: Obstacle[]
  playerY: number
  seed: number
  speed: number
  velocityY: number
}

type SpriteKey =
  | 'forestBack'
  | 'forestFront'
  | 'forestLights'
  | 'forestMiddle'
  | 'otter'

type SpriteAssets = Partial<Record<SpriteKey, HTMLImageElement>>

type SpriteFrame = {
  height: number
  width: number
  x: number
  y: number
}

const canvasWidth = 900
const canvasHeight = 360
const player = {
  x: 96,
  width: 48,
  height: 58,
}
const gravity = 2500
const jumpVelocity = -860
const highScoreStorageKey = 'felix-runner-high-scores'
const initialGroundY = 300
const spriteSources = {
  forestBack: '/game/parallax-forest-back-trees.png',
  forestFront: '/game/parallax-forest-front-trees.png',
  forestLights: '/game/parallax-forest-lights.png',
  forestMiddle: '/game/parallax-forest-middle-trees.png',
  otter: '/spritesheet.webp',
} satisfies Record<SpriteKey, string>
// The otter spritesheet is a clean 8 columns × 9 rows grid of 192 × 208 cells.
const spriteCellWidth = 192
const spriteCellHeight = 208
const spriteCell = (col: number, row: number): SpriteFrame => ({
  x: col * spriteCellWidth,
  y: row * spriteCellHeight,
  width: spriteCellWidth,
  height: spriteCellHeight,
})

const otterIdleFrames: SpriteFrame[] = [spriteCell(0, 0), spriteCell(1, 0)]
const otterRunFrames: SpriteFrame[] = [
  spriteCell(0, 1),
  spriteCell(1, 1),
  spriteCell(2, 1),
  spriteCell(3, 1),
  spriteCell(4, 1),
  spriteCell(5, 1),
  spriteCell(6, 1),
  spriteCell(7, 1),
]
// Row 3 has the "arms raised" otters — sells the jump pose much better.
const otterJumpFrame = spriteCell(0, 3)
// No real crouch art exists in the sheet, so we reuse the calm sitting otter
// and squash it on the draw call to get a low/ducking silhouette.
const otterCrouchFrame = spriteCell(0, 0)
const jumpAirTime = Math.abs((2 * jumpVelocity) / gravity)

function createGame(): GameModel {
  return {
    crouching: false,
    distance: 0,
    groundY: initialGroundY,
    lastSpawn: 0,
    nextSpawnGap: 620,
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
  const spritesRef = useRef<SpriteAssets>({})
  const lastFrameRef = useRef<number | null>(null)
  const stateRef = useRef<RunnerState>('ready')
  const [runnerState, setRunnerState] = useState<RunnerState>('ready')
  const [score, setScore] = useState(0)
  const [highScores, setHighScores] = useState<RunnerScore[]>([])
  const [playerName, setPlayerName] = useState('')
  const [savedScoreId, setSavedScoreId] = useState<string | null>(null)
  const [highScoresOpen, setHighScoresOpen] = useState(false)

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

    model.crouching = false
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
    const sprites: SpriteAssets = {}

    Object.entries(spriteSources).forEach(([key, src]) => {
      const image = new Image()
      image.src = src
      sprites[key as SpriteKey] = image
    })

    spritesRef.current = sprites
  }, [])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLElement && event.target.closest('input,textarea')) return

      if (event.code === 'ArrowDown' || event.code === 'KeyS') {
        event.preventDefault()
        const model = modelRef.current
        const onGround = model.playerY >= model.groundY - player.height - 0.5
        if (stateRef.current === 'running' && onGround) {
          model.crouching = true
        }
      }

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

    const onKeyUp = (event: KeyboardEvent) => {
      if (event.code === 'ArrowDown' || event.code === 'KeyS') {
        modelRef.current.crouching = false
      }
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
    }
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
          setHighScoresOpen(false)
        }
      }

      const liveScore = Math.floor(modelRef.current.distance / 9)
      drawGame(canvasRef.current, modelRef.current, stateRef.current, spritesRef.current, liveScore)
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

  const canSaveScore = runnerState === 'gameover' && savedScoreId === null

  return (
    <section
      className={`${osAppShellClass} ${osAppHeight.tall} felix-arcade-screen text-white`}
    >
      <div className="relative min-h-0 flex-1 overflow-hidden">
        <canvas
          ref={canvasRef}
          width={canvasWidth}
          height={canvasHeight}
          className="block h-full w-full touch-none object-cover [image-rendering:pixelated]"
          onPointerDown={runnerState === 'ready' ? jump : undefined}
          aria-label="Procedurally generated runner game"
        />

        <div className="felix-arcade-scanlines" aria-hidden="true" />
        <div className="felix-arcade-vignette" aria-hidden="true" />

        {runnerState === 'ready' ? (
          <GameOverlay>
            {highScoresOpen ? (
              <HighScoresView
                highScores={highScores}
                savedScoreId={savedScoreId}
                onBack={() => setHighScoresOpen(false)}
              />
            ) : (
              <>
                <p className="felix-arcade-tag mb-2 text-[clamp(0.95rem,2.2vw,1.3rem)] uppercase tracking-[0.3em] text-cyan-200/90">
                  FelixOS Arcade · 1P
                </p>
                <h1 className="felix-arcade felix-arcade-title text-[clamp(1.6rem,4.2vw,3rem)] uppercase leading-[1.05]">
                  Offline Runner
                </h1>
                <p className="felix-arcade-tag mt-4 text-[clamp(0.95rem,2vw,1.2rem)] uppercase tracking-[0.18em] text-white/70">
                  <span className="felix-arcade-blink">▶</span> Press{' '}
                  <span className="text-[#ffd23f]">SPACE</span> to jump ·{' '}
                  <span className="text-[#ffd23f]">↓</span> to duck
                </p>
                <div className="mt-7 flex flex-wrap justify-center gap-3">
                  <ArcadeButton onClick={jump}>Insert Coin</ArcadeButton>
                  <ArcadeButton variant="cool" onClick={() => setHighScoresOpen(true)}>
                    Hi-Scores
                  </ArcadeButton>
                </div>
              </>
            )}
          </GameOverlay>
        ) : null}

        {runnerState === 'paused' ? (
          <GameOverlay>
            <h2 className="felix-arcade felix-arcade-glow text-[clamp(1.4rem,3.6vw,2.4rem)] uppercase text-cyan-200">
              ▮▮ Paused
            </h2>
            <div className="mt-7 flex justify-center">
              <ArcadeButton onClick={togglePause}>Resume</ArcadeButton>
            </div>
          </GameOverlay>
        ) : null}

        {runnerState === 'gameover' ? (
          <GameOverlay>
            {highScoresOpen ? (
              <HighScoresView
                highScores={highScores}
                savedScoreId={savedScoreId}
                onBack={() => setHighScoresOpen(false)}
              />
            ) : (
              <>
                <h2 className="felix-arcade felix-arcade-title-crash text-[clamp(1.6rem,4.2vw,3rem)] uppercase leading-[1.05]">
                  Game Over
                </h2>
                <p className="felix-arcade-tag mt-2 text-[clamp(1.1rem,2.4vw,1.6rem)] uppercase tracking-[0.2em] text-[#ffd23f]">
                  Score · {Math.round(score).toString().padStart(6, '0')}
                </p>
                <div className="mt-4 flex flex-wrap justify-center gap-3">
                  <ArcadeButton onClick={resetGame}>Retry</ArcadeButton>
                  <ArcadeButton variant="cool" onClick={() => setHighScoresOpen(true)}>
                    Hi-Scores
                  </ArcadeButton>
                </div>
                <form
                  className="mt-4 w-[min(29rem,92vw)]"
                  onSubmit={(event) => {
                    event.preventDefault()
                    saveScore()
                    setHighScoresOpen(true)
                  }}
                >
                  <div className="flex gap-2">
                    <input
                      className="felix-arcade-input min-h-11 flex-1 rounded-control px-3 text-xs uppercase tracking-[0.1em] placeholder:text-[10px]"
                      value={playerName}
                      onChange={(event) => setPlayerName(event.target.value)}
                      placeholder="AAA"
                      maxLength={18}
                      disabled={!canSaveScore}
                    />
                    <ArcadeButton type="submit" disabled={!canSaveScore}>
                      {savedScoreId ? 'Saved' : 'Save'}
                    </ArcadeButton>
                  </div>
                </form>
              </>
            )}
          </GameOverlay>
        ) : null}
      </div>
    </section>
  )
}

function ArcadeButton({
  children,
  disabled = false,
  onClick,
  type = 'button',
  variant = 'warm',
}: {
  children: React.ReactNode
  disabled?: boolean
  onClick?: () => void
  type?: 'button' | 'submit'
  variant?: 'warm' | 'cool'
}) {
  return (
    <button
      type={type}
      data-variant={variant}
      className="felix-arcade-button min-h-11 min-w-32 cursor-pointer whitespace-nowrap rounded-control px-4 text-[11px] uppercase leading-none disabled:cursor-not-allowed disabled:opacity-45"
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  )
}

function GameOverlay({ children }: { children: React.ReactNode }) {
  return (
    <div className="absolute inset-0 grid place-items-center bg-[radial-gradient(120%_80%_at_50%_50%,rgba(0,0,0,0.35),rgba(0,0,0,0.7))] px-5 text-center">
      <div className="flex max-h-[92%] max-w-[min(34rem,94vw)] flex-col items-center overflow-auto px-5 py-6">
        {children}
      </div>
    </div>
  )
}

function HighScoresView({
  highScores,
  onBack,
  savedScoreId,
}: {
  highScores: RunnerScore[]
  onBack: () => void
  savedScoreId: string | null
}) {
  return (
    <>
      <h2 className="felix-arcade felix-arcade-title text-[clamp(1.4rem,3.6vw,2.4rem)] uppercase leading-[1.05]">
        Top Scores
      </h2>
      <HighScoresList highScores={highScores} savedScoreId={savedScoreId} />
      <div className="mt-4 flex justify-center">
        <ArcadeButton variant="cool" onClick={onBack}>
          Back
        </ArcadeButton>
      </div>
    </>
  )
}

function HighScoresList({
  highScores,
  savedScoreId,
}: {
  highScores: RunnerScore[]
  savedScoreId: string | null
}) {
  return (
    <div className="mt-4 w-[min(29rem,92vw)] rounded-card border-2 border-cyan-300/40 bg-[#070d1a]/85 p-3 text-white shadow-[0_0_24px_rgba(110,240,255,0.18)]">
      <div className="mb-2 flex items-center justify-center gap-2">
        <Trophy aria-hidden="true" size={14} className="text-[#ffd23f]" />
        <span className="felix-arcade text-[9px] uppercase tracking-[0.2em] text-[#ffd23f]/80">
          Leaderboard
        </span>
      </div>
      <ol className="space-y-1.5">
        {highScores.length > 0 ? (
          highScores.map((entry, index) => (
            <li
              key={entry.id}
              className={`grid grid-cols-[1.7rem_minmax(0,1fr)_auto] items-center gap-2 rounded-control border px-2 py-2 felix-arcade-tag text-base uppercase tracking-[0.08em] ${
                entry.id === savedScoreId
                  ? 'border-[#ffd23f]/60 bg-[#ffd23f]/12 text-[#ffd23f]'
                  : 'border-cyan-300/15 bg-white/[0.04] text-cyan-100/90'
              }`}
            >
              <span className="text-cyan-300/70">{(index + 1).toString().padStart(2, '0')}</span>
              <span className="truncate">{entry.name}</span>
              <span className="tabular-nums text-white">
                {entry.score.toString().padStart(6, '0')}
              </span>
            </li>
          ))
        ) : (
          <li className="rounded-control border border-cyan-300/15 bg-white/[0.04] px-3 py-4 felix-arcade-tag text-base uppercase tracking-[0.08em] text-cyan-100/55">
            No scores yet.
          </li>
        )}
      </ol>
    </div>
  )
}

function updateGame(model: GameModel, deltaSeconds: number) {
  model.distance += model.speed * deltaSeconds
  // Ramp from 330 → 760 over ~8.6k distance (~960 score), so the game gets
  // genuinely fast after the first ~30s but never outpaces a clean jump.
  model.speed = Math.min(760, 330 + model.distance * 0.05)
  model.velocityY += gravity * deltaSeconds
  model.playerY = Math.min(
    model.groundY - player.height,
    model.playerY + model.velocityY * deltaSeconds,
  )

  if (model.playerY >= model.groundY - player.height) {
    model.velocityY = 0
  }

  model.lastSpawn += model.speed * deltaSeconds
  if (model.lastSpawn > model.nextSpawnGap) {
    const obstacle = createObstacle(model)
    model.obstacles.push(obstacle)
    model.lastSpawn = 0
    model.nextSpawnGap = obstacle.gapAfter
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
  const roll = seededRandom(model)
  const kind: Obstacle['kind'] =
    roll > 0.9
      ? 'birdSky'
      : roll > 0.78
        ? 'birdHigh'
        : roll > 0.64
          ? 'birdLow'
          : roll > 0.5
            ? 'hedge'
            : roll > 0.34
              ? 'spike'
              : roll > 0.17
                ? 'mushroom'
                : 'log'
  const minimumGap = minimumJumpableGap(model.speed)
  const gapAfter = minimumGap + 70 + seededRandom(model) * 190

  if (kind === 'birdSky') {
    // Sits well above a standing player but inside the jump arc, so it only
    // hits when the otter is airborne.
    const height = 28

    return {
      gapAfter,
      height,
      kind,
      width: 48,
      x: canvasWidth + 20,
      y: model.groundY - 110,
    }
  }

  if (kind === 'birdHigh' || kind === 'birdLow') {
    const height = 28

    return {
      gapAfter,
      height,
      kind,
      width: 48,
      x: canvasWidth + 20,
      // Both bird heights must overlap the standing player's hit box but clear
      // the crouching hit box (top at groundY - 30), so y sits in the
      // groundY - 70..groundY - 50 band.
      y: kind === 'birdLow' ? model.groundY - 56 : model.groundY - 70,
    }
  }

  if (kind === 'hedge') {
    const height = 72

    return {
      gapAfter,
      height,
      kind,
      width: 56,
      x: canvasWidth + 20,
      y: model.groundY - height,
    }
  }

  if (kind === 'spike') {
    const height = 34

    return {
      gapAfter,
      height,
      kind,
      width: 42,
      x: canvasWidth + 20,
      y: model.groundY - height,
    }
  }

  if (kind === 'mushroom') {
    const height = 46

    return {
      gapAfter,
      height,
      kind,
      width: 38,
      x: canvasWidth + 20,
      y: model.groundY - height,
    }
  }

  return {
    gapAfter,
    height: 34,
    kind,
    width: 58,
    x: canvasWidth + 20,
    y: model.groundY - 34,
  }
}

function minimumJumpableGap(speed: number) {
  // 1.05× the horizontal distance covered by a single jump, so even at max
  // speed there is always enough room to land and re-jump cleanly.
  return Math.max(390, speed * jumpAirTime * 1.05)
}

function hasCollision(model: GameModel) {
  const crouchHeight = 34
  const playerHeight = model.crouching ? crouchHeight : player.height
  const playerTop = model.playerY + (model.crouching ? player.height - crouchHeight : 0)
  const playerBox = {
    x: player.x + 5,
    y: playerTop + 4,
    width: player.width - 10,
    height: playerHeight - 6,
  }

  return model.obstacles.some((obstacle) => {
    const bird =
      obstacle.kind === 'birdHigh' ||
      obstacle.kind === 'birdLow' ||
      obstacle.kind === 'birdSky'
    const obstacleBox = {
      x: obstacle.x + (bird ? 8 : 5),
      y: obstacle.y + (bird ? 7 : 4),
      width: obstacle.width - (bird ? 16 : 10),
      height: obstacle.height - (bird ? 14 : 8),
    }

    return (
      playerBox.x < obstacleBox.x + obstacleBox.width &&
      playerBox.x + playerBox.width > obstacleBox.x &&
      playerBox.y < obstacleBox.y + obstacleBox.height &&
      playerBox.y + playerBox.height > obstacleBox.y
    )
  })
}

function drawGame(
  canvas: HTMLCanvasElement | null,
  model: GameModel,
  runnerState: RunnerState,
  sprites: SpriteAssets,
  score: number,
) {
  const context = canvas?.getContext('2d')
  if (!context) return

  context.clearRect(0, 0, canvasWidth, canvasHeight)
  drawBackground(context, model, sprites)
  drawGround(context, model)

  model.obstacles.forEach((obstacle) => drawObstacle(context, model, obstacle))
  drawPlayer(context, model, runnerState, sprites)
  drawScore(context, score)
}

function drawScore(context: CanvasRenderingContext2D, score: number) {
  const value = Math.round(score).toString().padStart(6, '0')
  context.save()
  context.font = '20px "Press Start 2P", ui-monospace, monospace'
  context.textBaseline = 'top'

  context.textAlign = 'left'
  context.fillStyle = 'rgba(110, 240, 255, 0.75)'
  context.fillText('SCORE', 22, 22)

  context.textAlign = 'right'
  context.fillStyle = 'rgba(0,0,0,0.5)'
  context.fillText(value, canvasWidth - 20, 24)
  context.fillStyle = '#ffd23f'
  context.shadowColor = 'rgba(255, 138, 26, 0.85)'
  context.shadowBlur = 12
  context.fillText(value, canvasWidth - 22, 22)
  context.restore()
}

function drawBackground(
  context: CanvasRenderingContext2D,
  model: GameModel,
  sprites: SpriteAssets,
) {
  const sky = context.createLinearGradient(0, 0, 0, canvasHeight)
  sky.addColorStop(0, '#142a33')
  sky.addColorStop(0.58, '#203f3c')
  sky.addColorStop(1, '#101b18')
  context.fillStyle = sky
  context.fillRect(0, 0, canvasWidth, canvasHeight)

  drawParallaxLayer(context, sprites.forestBack, model.distance, 0.08, 2.35, 0, 0.85)
  drawParallaxLayer(context, sprites.forestLights, model.distance, 0.13, 2.35, 0, 0.82)
  drawParallaxLayer(context, sprites.forestMiddle, model.distance, 0.22, 2.35, 0, 0.72)
  drawParallaxLayer(context, sprites.forestFront, model.distance, 0.36, 2.35, 0, 0.9)

  const shade = context.createLinearGradient(0, 0, 0, canvasHeight)
  shade.addColorStop(0, 'rgba(8,23,25,0.08)')
  shade.addColorStop(0.7, 'rgba(8,23,25,0.12)')
  shade.addColorStop(1, 'rgba(8,23,25,0.5)')
  context.fillStyle = shade
  context.fillRect(0, 0, canvasWidth, canvasHeight)
}

function drawParallaxLayer(
  context: CanvasRenderingContext2D,
  image: HTMLImageElement | undefined,
  distance: number,
  speed: number,
  scale: number,
  y: number,
  opacity: number,
) {
  if (!image?.complete || image.naturalWidth === 0) return

  const width = image.naturalWidth * scale
  const height = image.naturalHeight * scale
  const offset = -((distance * speed) % width)

  context.save()
  context.globalAlpha = opacity
  context.imageSmoothingEnabled = false

  for (let x = offset - width; x < canvasWidth + width; x += width) {
    context.drawImage(image, x, y, width, height)
  }

  context.restore()
}

function drawGround(context: CanvasRenderingContext2D, model: GameModel) {
  context.fillStyle = '#1e2118'
  context.fillRect(0, model.groundY, canvasWidth, canvasHeight - model.groundY)
  context.fillStyle = '#6f5c38'
  context.fillRect(0, model.groundY, canvasWidth, 4)
  context.fillStyle = 'rgba(246,200,95,0.18)'

  const tileWidth = 36
  const offset = -((model.distance * 0.62) % tileWidth)
  for (let x = offset; x < canvasWidth + tileWidth; x += tileWidth) {
    context.fillRect(x, model.groundY + 12, 18, 3)
    context.fillRect(x + 20, model.groundY + 34, 9, 3)
  }
}

function drawObstacle(context: CanvasRenderingContext2D, model: GameModel, obstacle: Obstacle) {
  if (
    obstacle.kind === 'birdHigh' ||
    obstacle.kind === 'birdLow' ||
    obstacle.kind === 'birdSky'
  ) {
    drawBirdObstacle(context, model, obstacle)
    return
  }

  if (obstacle.kind === 'hedge') {
    drawHedgeObstacle(context, obstacle)
    return
  }

  if (obstacle.kind === 'spike') {
    drawSpikeObstacle(context, obstacle)
    return
  }

  if (obstacle.kind === 'mushroom') {
    drawMushroomObstacle(context, obstacle)
    return
  }

  drawLogObstacle(context, obstacle)
}

function drawHedgeObstacle(context: CanvasRenderingContext2D, obstacle: Obstacle) {
  const { x, y, width, height } = obstacle
  // Trunk
  context.fillStyle = '#5a3a1c'
  context.fillRect(x + width / 2 - 3, y + height - 14, 6, 14)
  // Bush body (dark green base)
  context.fillStyle = '#23502c'
  context.fillRect(x + 2, y + 10, width - 4, height - 18)
  // Lighter green crown
  context.fillStyle = '#3c8b3f'
  context.fillRect(x + 6, y + 4, width - 12, 18)
  context.fillRect(x, y + 16, 10, 14)
  context.fillRect(x + width - 10, y + 16, 10, 14)
  // Pixel highlights
  context.fillStyle = '#7ad06a'
  context.fillRect(x + 12, y + 6, 6, 4)
  context.fillRect(x + width - 22, y + 14, 6, 4)
  context.fillRect(x + 4, y + 28, 4, 3)
  // Berries
  context.fillStyle = '#e84545'
  context.fillRect(x + 18, y + 26, 4, 4)
  context.fillRect(x + width - 22, y + 36, 4, 4)
}

function drawSpikeObstacle(context: CanvasRenderingContext2D, obstacle: Obstacle) {
  context.fillStyle = '#e66e45'
  context.beginPath()
  context.moveTo(obstacle.x, obstacle.y + obstacle.height)
  context.lineTo(obstacle.x + obstacle.width / 2, obstacle.y)
  context.lineTo(obstacle.x + obstacle.width, obstacle.y + obstacle.height)
  context.closePath()
  context.fill()
  context.fillStyle = '#f4c36b'
  context.fillRect(obstacle.x + obstacle.width / 2 - 3, obstacle.y + 13, 6, 16)
}

function drawMushroomObstacle(context: CanvasRenderingContext2D, obstacle: Obstacle) {
  context.fillStyle = '#e95b48'
  context.beginPath()
  context.ellipse(
    obstacle.x + obstacle.width / 2,
    obstacle.y + 17,
    obstacle.width / 2,
    18,
    0,
    Math.PI,
    0,
  )
  context.fill()
  context.fillStyle = '#f6d7a4'
  context.fillRect(obstacle.x + 13, obstacle.y + 20, 13, 24)
  context.fillStyle = '#f9ead0'
  context.fillRect(obstacle.x + 8, obstacle.y + 13, 6, 5)
  context.fillRect(obstacle.x + 24, obstacle.y + 9, 5, 5)
}

function drawLogObstacle(context: CanvasRenderingContext2D, obstacle: Obstacle) {
  context.fillStyle = '#7a4f2c'
  context.fillRect(obstacle.x, obstacle.y + 8, obstacle.width, 20)
  context.fillStyle = '#a06a39'
  context.fillRect(obstacle.x + 5, obstacle.y + 12, obstacle.width - 10, 4)
  context.fillStyle = '#d0a15b'
  context.beginPath()
  context.ellipse(obstacle.x + obstacle.width - 6, obstacle.y + 18, 8, 10, 0, 0, Math.PI * 2)
  context.fill()
  context.fillStyle = '#59361e'
  context.beginPath()
  context.ellipse(obstacle.x + obstacle.width - 6, obstacle.y + 18, 4, 5, 0, 0, Math.PI * 2)
  context.fill()
}

function drawBirdObstacle(
  context: CanvasRenderingContext2D,
  model: GameModel,
  obstacle: Obstacle,
) {
  const flap = Math.sin(model.distance / 34) > 0 ? -6 : 6
  // Birds are drawn ~16px above their hit box so they visually fly over the
  // crouched otter. Collision logic still uses the (lower) obstacle box.
  const visualLift = 16
  const centerX = obstacle.x + obstacle.width / 2
  const centerY = obstacle.y + obstacle.height / 2 - visualLift

  const bodyColor =
    obstacle.kind === 'birdSky'
      ? '#ffb3d1'
      : obstacle.kind === 'birdLow'
        ? '#f0d47b'
        : '#d7e7ef'
  const wingColor =
    obstacle.kind === 'birdSky'
      ? '#a53266'
      : obstacle.kind === 'birdLow'
        ? '#6c4428'
        : '#496575'
  context.fillStyle = bodyColor
  context.fillRect(centerX - 10, centerY - 6, 20, 13)
  context.fillStyle = wingColor
  context.beginPath()
  context.moveTo(centerX - 4, centerY - 2)
  context.lineTo(centerX - 24, centerY + flap)
  context.lineTo(centerX - 6, centerY + 7)
  context.closePath()
  context.fill()
  context.beginPath()
  context.moveTo(centerX + 4, centerY - 2)
  context.lineTo(centerX + 24, centerY + flap)
  context.lineTo(centerX + 6, centerY + 7)
  context.closePath()
  context.fill()
  context.fillStyle = '#151b18'
  context.fillRect(centerX + 5, centerY - 4, 3, 3)
}

function drawPlayer(
  context: CanvasRenderingContext2D,
  model: GameModel,
  runnerState: RunnerState,
  sprites: SpriteAssets,
) {
  const bob =
    runnerState === 'running' && model.velocityY === 0 ? Math.sin(model.distance / 24) * 2 : 0
  const y = model.playerY + bob
  const otter = sprites.otter

  if (otter?.complete && otter.naturalWidth > 0) {
    const frame = getOtterFrame(model, runnerState)
    const crouching = isPlayerCrouching(model, runnerState)

    // Draw size: anchor the sprite by its feet to the bottom of the hit box.
    // Standing keeps the source aspect ratio so the otter never compresses
    // (the previous code stretched a 192×208 frame into a 100×104 box).
    // Crouch is an intentional horizontal squash so the silhouette clearly
    // sits below incoming birds.
    const aspect = frame.width / frame.height
    const drawHeight = crouching ? 44 : 96
    const drawWidth = crouching ? 68 : drawHeight * aspect
    const playerCenterX = player.x + player.width / 2
    const playerFeetY = y + player.height
    const drawX = playerCenterX - drawWidth / 2
    const drawY = playerFeetY - drawHeight

    context.imageSmoothingEnabled = false
    context.drawImage(otter, frame.x, frame.y, frame.width, frame.height, drawX, drawY, drawWidth, drawHeight)
    return
  }

  context.fillStyle = '#eaf7f3'
  context.fillRect(player.x, y, player.width, player.height)
  context.fillStyle = '#081719'
  context.fillRect(player.x + 22, y + 10, 5, 5)
  context.fillStyle = '#7fdad1'
  context.fillRect(player.x + 6, y + player.height - 8, 9, 8)
  context.fillRect(player.x + 22, y + player.height - 8, 9, 8)
}

function getOtterFrame(model: GameModel, runnerState: RunnerState) {
  const onGround = model.playerY >= model.groundY - player.height - 0.5

  if (isPlayerCrouching(model, runnerState)) return otterCrouchFrame

  if (!onGround) return otterJumpFrame

  if (runnerState !== 'running') {
    return otterIdleFrames[Math.floor(Date.now() / 260) % otterIdleFrames.length]
  }

  return otterRunFrames[Math.floor(model.distance / 42) % otterRunFrames.length]
}

function isPlayerCrouching(model: GameModel, runnerState: RunnerState) {
  const onGround = model.playerY >= model.groundY - player.height - 0.5
  return runnerState === 'running' && model.crouching && onGround
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
