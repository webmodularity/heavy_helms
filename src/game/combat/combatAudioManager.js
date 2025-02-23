export class CombatAudioManager {
    constructor(scene) {
        this.scene = scene;
        this.soundsLoaded = false;
        this.activeSounds = new Set();
        
        // Handle window blur/focus
        window.addEventListener('blur', () => this.stopAllSounds());
        window.addEventListener('focus', () => this.stopAllSounds());
    }

    async init() {
        // Load all combat sound effects with correct paths
        const soundEffects = [
            // Attack sounds
            { key: 'SwordAndShield-hit', path: 'audio/weapons/sword_and_shield_hit.ogg' },
            { key: 'SwordAndShield-crit', path: 'audio/weapons/sword_and_shield_crit.ogg' },
            { key: 'SwordAndShield-miss', path: 'audio/weapons/sword_and_shield_miss.ogg' },
            
            // Defense sounds
            { key: 'shield-block', path: 'audio/defense/shield_block.ogg' },
            { key: 'blade-parry', path: 'audio/defense/blade_parry.ogg' }
        ];

        // Load all sounds
        soundEffects.forEach(sound => {
            this.scene.load.audio(sound.key, sound.path);
        });

        // Wait for all sounds to load
        await new Promise(resolve => {
            this.scene.load.once('complete', () => {
                this.soundsLoaded = true;
                resolve();
            });
            this.scene.load.start();
        });
    }

    playAttackSound(weaponType, armorType, isCrit = false, isMiss = false) {
        // Only try to play if sounds are loaded
        if (!this.soundsLoaded) {
            console.warn('Sounds not yet loaded');
            return;
        }

        try {
            const soundKey = this.determineSound(weaponType, armorType, isCrit, isMiss);
            if (soundKey) {
                const sound = this.scene.sound.add(soundKey, { volume: 0.15 });
                sound.once('complete', () => {
                    this.activeSounds.delete(sound);
                    sound.destroy();
                });
                sound.play();
                this.activeSounds.add(sound);
            }
        } catch (error) {
            console.error('Error playing sound:', error);
        }
    }

    playDefenseSound(defenseType, isCrit = false) {
        if (!this.soundsLoaded) return;

        try {
            const soundKey = this.determineDefenseSound(defenseType);
            if (soundKey) {
                const sound = this.scene.sound.add(soundKey, { volume: 0.15 });
                sound.once('complete', () => {
                    this.activeSounds.delete(sound);
                    sound.destroy();
                });
                sound.play();
                this.activeSounds.add(sound);
                
                // For counter/riposte, we'll play the attack sound after a short delay
                if (['COUNTER', 'COUNTER_CRIT', 'RIPOSTE', 'RIPOSTE_CRIT'].includes(defenseType)) {
                    this.scene.time.delayedCall(200, () => {
                        const weaponType = 'SwordAndShield';
                        const attackSoundKey = this.determineSound(weaponType, null, isCrit);
                        const attackSound = this.scene.sound.add(attackSoundKey, { volume: 0.15 });
                        attackSound.once('complete', () => {
                            this.activeSounds.delete(attackSound);
                            attackSound.destroy();
                        });
                        attackSound.play();
                        this.activeSounds.add(attackSound);
                    });
                }
            }
        } catch (error) {
            console.error('Error playing defense sound:', error);
        }
    }

    determineSound(weaponType, armorType, isCrit, isMiss = false) {
        // Add miss check before crit check
        if (isMiss) {
            return `${weaponType}-miss`;
        }
        return isCrit ? `${weaponType}-crit` : `${weaponType}-hit`;
    }

    determineDefenseSound(defenseType) {
        switch (defenseType) {
            case 'BLOCK':
                return 'shield-block';
            case 'PARRY':
                return 'blade-parry';
            case 'COUNTER':
            case 'COUNTER_CRIT':
                return 'shield-block'; // Counter starts with a block
            case 'RIPOSTE':
            case 'RIPOSTE_CRIT':
                return 'blade-parry'; // Riposte starts with a parry
            default:
                return null;
        }
    }

    stopAllSounds() {
        this.activeSounds.forEach(sound => {
            if (sound && sound.stop) {
                sound.stop();
            }
        });
        this.activeSounds.clear();
    }
} 