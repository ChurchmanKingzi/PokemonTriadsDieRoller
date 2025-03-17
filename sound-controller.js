/**
 * Würfel-Simulator: Sound-Controller-Modul
 */

class SoundController {
    constructor() {
        // Audio-Kontext erstellen
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // Array für Sound-Buffers
        this.soundBuffers = [];
        
        // Würfel-Sound laden
        this.loadDiceSound();
        
        // Flag zum Überprüfen, ob die Sounds geladen sind
        this.soundsLoaded = false;
    }
    
    /**
     * Lädt den Würfel-Sound
     */
    async loadDiceSound() {
        try {
            console.log('Versuche Sound zu laden: snd_wuerfel.mp3');
            const response = await fetch('snd_wuerfel.mp3');
            if (!response.ok) {
                console.error(`HTTP error! status: ${response.status}`);
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
            
            this.soundBuffers.push(audioBuffer);
            this.soundsLoaded = true;
            console.log('Würfel-Sound erfolgreich geladen');
        } catch (error) {
            console.error('Fehler beim Laden des Würfel-Sounds:', error);
            
        }
    }
    
    
    /**
     * Spielt den Würfel-Sound für die angegebene Anzahl von Würfeln ab
     * @param {number} numDice - Anzahl der Würfel
     */
    playDiceSound(numDice) {
        // Überprüfen, ob die Sounds geladen sind
        if (!this.soundsLoaded) {
            console.log('Sounds werden noch geladen...');
            return;
        }
        
        // Audiokontext fortsetzen (falls pausiert)
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
        
        // Für jeden Würfel einen Sound mit zeitlicher Verzögerung abspielen
        for (let i = 0; i < numDice; i++) {
            // Zufällige Verzögerung zwischen 0 und 200ms
            const delay = Math.random() * 200;
            
            setTimeout(() => {
                // Zufällige Varianz in Geschwindigkeit, Lautstärke und Tonhöhe
                const playbackRate = 0.8 + Math.random() * 0.4; // 0.8 bis 1.2
                const volume = 0.5 + Math.random() * 0.5; // 0.5 bis 1.0
                const panPosition = Math.random() * 1.6 - 0.8; // -0.8 bis 0.8
                
                this.playSingleDiceSound(playbackRate, volume, panPosition);
            }, delay);
        }
    }
    
    /**
     * Spielt einen einzelnen Würfel-Sound ab
     * @param {number} playbackRate - Abspielgeschwindigkeit
     * @param {number} volume - Lautstärke
     * @param {number} panPosition - Position im Stereofeld
     */
    playSingleDiceSound(playbackRate, volume, panPosition) {
        // Zufälligen Sound aus den verfügbaren Sounds auswählen
        const soundBuffer = this.soundBuffers[Math.floor(Math.random() * this.soundBuffers.length)];
        
        // Sound-Quelle erstellen
        const source = this.audioContext.createBufferSource();
        source.buffer = soundBuffer;
        
        // Wiedergabegeschwindigkeit anpassen (beeinflusst auch die Tonhöhe)
        source.playbackRate.value = playbackRate;
        
        // Lautstärke-Steuerung
        const gainNode = this.audioContext.createGain();
        gainNode.gain.value = volume;
        
        // Stereo-Panning
        let panNode;
        if (this.audioContext.createStereoPanner) {
            panNode = this.audioContext.createStereoPanner();
            panNode.pan.value = panPosition;
        } else {
            // Fallback für ältere Browser
            panNode = this.audioContext.createPanner();
            panNode.panningModel = 'equalpower';
            panNode.setPosition(panPosition, 0, 1 - Math.abs(panPosition));
        }
        
        // Verbindungen herstellen
        source.connect(panNode);
        panNode.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        // Sound abspielen
        source.start();
    }
}