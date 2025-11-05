'use client'

import { useState, useEffect, useRef } from 'react'
import styles from './page.module.css'

type Color = 'green' | 'red' | 'yellow' | 'blue'

const colors: Color[] = ['green', 'red', 'yellow', 'blue']

const audioContext = typeof window !== 'undefined' ? new (window.AudioContext || (window as any).webkitAudioContext)() : null

const playSound = (frequency: number) => {
  if (!audioContext) return
  const oscillator = audioContext.createOscillator()
  const gainNode = audioContext.createGain()

  oscillator.connect(gainNode)
  gainNode.connect(audioContext.destination)

  oscillator.frequency.value = frequency
  oscillator.type = 'sine'

  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)

  oscillator.start(audioContext.currentTime)
  oscillator.stop(audioContext.currentTime + 0.3)
}

const soundFrequencies: Record<Color, number> = {
  green: 329.63,
  red: 261.63,
  yellow: 392.00,
  blue: 440.00,
}

export default function Home() {
  const [sequence, setSequence] = useState<Color[]>([])
  const [userSequence, setUserSequence] = useState<Color[]>([])
  const [isPlaying, setIsPlaying] = useState(false)
  const [isUserTurn, setIsUserTurn] = useState(false)
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(0)
  const [activeColor, setActiveColor] = useState<Color | null>(null)
  const [gameStarted, setGameStarted] = useState(false)
  const [gameOver, setGameOver] = useState(false)

  useEffect(() => {
    const savedHighScore = localStorage.getItem('simonHighScore')
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore))
    }
  }, [])

  const startGame = () => {
    setGameStarted(true)
    setGameOver(false)
    setScore(0)
    setSequence([])
    setUserSequence([])
    setTimeout(() => addToSequence(), 500)
  }

  const addToSequence = () => {
    const newColor = colors[Math.floor(Math.random() * colors.length)]
    const newSequence = [...sequence, newColor]
    setSequence(newSequence)
    playSequence(newSequence)
  }

  const playSequence = async (seq: Color[]) => {
    setIsPlaying(true)
    setIsUserTurn(false)

    for (let i = 0; i < seq.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 500))
      setActiveColor(seq[i])
      playSound(soundFrequencies[seq[i]])
      await new Promise(resolve => setTimeout(resolve, 500))
      setActiveColor(null)
    }

    setIsPlaying(false)
    setIsUserTurn(true)
  }

  const handleColorClick = (color: Color) => {
    if (!isUserTurn || isPlaying) return

    setActiveColor(color)
    playSound(soundFrequencies[color])
    setTimeout(() => setActiveColor(null), 300)

    const newUserSequence = [...userSequence, color]
    setUserSequence(newUserSequence)

    if (color !== sequence[newUserSequence.length - 1]) {
      endGame()
      return
    }

    if (newUserSequence.length === sequence.length) {
      const newScore = score + 1
      setScore(newScore)

      if (newScore > highScore) {
        setHighScore(newScore)
        localStorage.setItem('simonHighScore', newScore.toString())
      }

      setUserSequence([])
      setIsUserTurn(false)
      setTimeout(() => addToSequence(), 1000)
    }
  }

  const endGame = () => {
    setGameOver(true)
    setIsUserTurn(false)
    setGameStarted(false)
  }

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <h1 className={styles.title}>SIMON</h1>

        <div className={styles.scoreBoard}>
          <div className={styles.scoreItem}>
            <div className={styles.scoreLabel}>Score</div>
            <div className={styles.scoreValue}>{score}</div>
          </div>
          <div className={styles.scoreItem}>
            <div className={styles.scoreLabel}>High Score</div>
            <div className={styles.scoreValue}>{highScore}</div>
          </div>
        </div>

        <div className={styles.gameBoard}>
          <div className={styles.buttonGrid}>
            <button
              className={`${styles.gameButton} ${styles.green} ${activeColor === 'green' ? styles.active : ''}`}
              onClick={() => handleColorClick('green')}
              disabled={!isUserTurn}
            />
            <button
              className={`${styles.gameButton} ${styles.red} ${activeColor === 'red' ? styles.active : ''}`}
              onClick={() => handleColorClick('red')}
              disabled={!isUserTurn}
            />
            <button
              className={`${styles.gameButton} ${styles.yellow} ${activeColor === 'yellow' ? styles.active : ''}`}
              onClick={() => handleColorClick('yellow')}
              disabled={!isUserTurn}
            />
            <button
              className={`${styles.gameButton} ${styles.blue} ${activeColor === 'blue' ? styles.active : ''}`}
              onClick={() => handleColorClick('blue')}
              disabled={!isUserTurn}
            />
          </div>

          <div className={styles.center}>
            {!gameStarted && !gameOver && (
              <button className={styles.startButton} onClick={startGame}>
                START
              </button>
            )}
            {gameOver && (
              <div className={styles.gameOverContainer}>
                <div className={styles.gameOverText}>Game Over!</div>
                <button className={styles.startButton} onClick={startGame}>
                  PLAY AGAIN
                </button>
              </div>
            )}
            {gameStarted && !gameOver && (
              <div className={styles.statusText}>
                {isPlaying ? 'Watch...' : isUserTurn ? 'Your Turn!' : ''}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
