'use client'

import { useEffect, useRef } from 'react'
import Phaser from 'phaser'
import BootScene from '../game/scenes/BootScene'
import FightScene from '../game/scenes/FightScene'

export default function Game() {
  const gameRef = useRef(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const config = {
        type: Phaser.AUTO,
        width: 960,
        height: 540,
        parent: gameRef.current,
        scene: [BootScene, FightScene],
        physics: {
          default: 'arcade',
          arcade: {
            gravity: { y: 0 },
            debug: false
          }
        },
        scale: {
          mode: Phaser.Scale.FIT,
          autoCenter: Phaser.Scale.CENTER_BOTH,
          min: {
            width: 960,
            height: 540
          },
          max: {
            width: 960,
            height: 540
          }
        },
        render: {
          pixelArt: false,
          antialias: true,
          roundPixels: false
        }
      }

      const game = new Phaser.Game(config)

      return () => {
        game.destroy(true)
      }
    }
  }, [])

  return <div ref={gameRef} className="w-full h-full" />
}