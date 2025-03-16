/**
 * Würfel-Simulator: UI-Controller-Modul
 */

class UIController {
    constructor() {
        // Elemente referenzieren
        this.elements = {
            numDiceSlider: document.getElementById('num-dice-slider'),
            numDiceInput: document.getElementById('num-dice-input'),
            difficultySlider: document.getElementById('difficulty-slider'),
            difficultyInput: document.getElementById('difficulty-input'),
            rollButton: document.getElementById('roll-button'),
            forceButton: document.getElementById('force-button'),
            resultsDiv: document.getElementById('results'),
            resultTitle: document.getElementById('result-title'),
            diceDisplay: document.getElementById('dice-display'),
            successesSpan: document.getElementById('successes'),
            onesSpan: document.getElementById('ones'),
            resultSpan: document.getElementById('result'),
            totalSumSpan: document.getElementById('total-sum'),
            feedbackDisplay: document.getElementById('feedback-display')
        };
        
        // Mindestabstand zwischen Würfeln (in Pixeln)
        this.wuerfelThreshold = 70;
        
        // Event-Listener initialisieren
        this.initEventListeners();
        
        // Ergebnispanel initial anzeigen, aber leer
        this.elements.resultsDiv.style.display = 'block';
    }

    /**
     * Initialisiert alle Event-Listener für die UI-Elemente
     */
    initEventListeners() {
        // Slider und Input-Felder synchronisieren
        this.elements.numDiceSlider.addEventListener('input', () => {
            this.elements.numDiceInput.value = this.elements.numDiceSlider.value;
        });
        
        this.elements.numDiceInput.addEventListener('input', () => {
            if (this.elements.numDiceInput.value < 1) this.elements.numDiceInput.value = 1;
            if (this.elements.numDiceInput.value > 100) this.elements.numDiceInput.value = 100;
            this.elements.numDiceSlider.value = this.elements.numDiceInput.value;
        });
        
        this.elements.difficultySlider.addEventListener('input', () => {
            this.elements.difficultyInput.value = this.elements.difficultySlider.value;
        });
        
        this.elements.difficultyInput.addEventListener('input', () => {
            if (this.elements.difficultyInput.value < 1) this.elements.difficultyInput.value = 1;
            if (this.elements.difficultyInput.value > 10) this.elements.difficultyInput.value = 10;
            this.elements.difficultySlider.value = this.elements.difficultyInput.value;
        });
    }

    /**
     * Gibt die aktuelle Anzahl der Würfel zurück
     * @returns {number} Anzahl der Würfel
     */
    getNumDice() {
        return parseInt(this.elements.numDiceInput.value);
    }

    /**
     * Gibt die aktuelle Schwierigkeit zurück
     * @returns {number} Schwierigkeit
     */
    getDifficulty() {
        return parseInt(this.elements.difficultyInput.value);
    }

    /**
     * Überprüft, ob die Position eines neuen Würfels weit genug von bereits platzierten Würfeln entfernt ist
     * @param {Object} newPosition - Position des neuen Würfels
     * @param {Array} existingPositions - Array mit bestehenden Würfelpositionen
     * @param {number} threshold - Mindestabstand zwischen Würfeln
     * @returns {boolean} True, wenn die Position gültig ist
     */
    isValidPosition(newPosition, existingPositions, threshold) {
        for (const existingPos of existingPositions) {
            const dx = newPosition.left - existingPos.left;
            const dy = newPosition.top - existingPos.top;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < threshold) {
                return false;
            }
        }
        return true;
    }

    /**
     * Generiert eine zufällige Position für einen Würfel
     * @param {number} containerWidth - Breite des Containers
     * @param {number} containerHeight - Höhe des Containers
     * @param {number} dieSize - Größe des Würfels
     * @returns {Object} Positionsdaten für den Würfel
     */
    getRandomPosition(containerWidth, containerHeight, dieSize) {
        const padding = 25;
        const maxX = containerWidth - dieSize - (padding * 2);
        const maxY = containerHeight - dieSize - (padding * 2);
        
        return {
            left: Math.random() * maxX + padding,
            top: Math.random() * maxY + padding,
            rotation: Math.random() * 120 - 60 // Zufällige Rotation zwischen -60 und 60 Grad
        };
    }

    /**
     * Zeigt die Ergebnisse des Würfelwurfs an
     * @param {Array} diceResults - Array mit Würfelergebnissen
     * @param {number} successes - Anzahl der Erfolge
     * @param {number} ones - Anzahl der Patzer
     * @param {number} result - Nettoergebnis
     * @param {number} totalSum - Summe aller Würfel
     * @param {number} deduction - Abzug durch Forcieren
     */
    displayResults(diceResults, successes, ones, result, totalSum, deduction) {
        // Würfel-Display leeren
        this.elements.diceDisplay.innerHTML = '';
        
        // Container-Dimensionen ermitteln
        const containerWidth = this.elements.diceDisplay.offsetWidth;
        const containerHeight = this.elements.diceDisplay.offsetHeight;
        const dieSize = 50; // Größe eines Würfels in Pixel
        
        // Array für die bereits platzierten Würfelpositionen
        const placedPositions = [];
        
        // Überprüfen, ob der Mindestabstand eingehalten werden kann
        // Ungefähre Berechnung des theoretisch verfügbaren Platzes
        const availableArea = (containerWidth - 2 * dieSize) * (containerHeight - 2 * dieSize);
        const diceArea = diceResults.length * Math.PI * (this.wuerfelThreshold / 2) * (this.wuerfelThreshold / 2);
        const useThreshold = diceArea <= availableArea * 0.7; // 70% Füllung als Schwellwert
        
        // Würfel anzeigen
        diceResults.forEach(die => {
            const dieElement = document.createElement('div');
            dieElement.className = `die die-${die}`;
            dieElement.textContent = die;
            
            // Zufällige Position und Rotation finden
            let position;
            let attempts = 0;
            const maxAttempts = 50; // Begrenze die Anzahl der Versuche
            
            do {
                position = this.getRandomPosition(containerWidth, containerHeight, dieSize);
                attempts++;
            } while (useThreshold && 
                     !this.isValidPosition(position, placedPositions, this.wuerfelThreshold) && 
                     attempts < maxAttempts);
            
            // Position anwenden und zu den platzierten Positionen hinzufügen
            dieElement.style.left = `${position.left}px`;
            dieElement.style.top = `${position.top}px`;
            dieElement.style.transform = `rotate(${position.rotation}deg)`;
            
            placedPositions.push(position);
            this.elements.diceDisplay.appendChild(dieElement);
        });
        
        // Statistiken anzeigen
        this.elements.successesSpan.textContent = successes;
        this.elements.onesSpan.textContent = ones;
        
        // Ergebnis anzeigen mit Formel in Klammern
        const rawResult = successes - ones;
        if (deduction > 0) {
            this.elements.resultSpan.textContent = `${result} (${rawResult} - ${deduction})`;
        } else {
            this.elements.resultSpan.textContent = result;
        }
        
        this.elements.totalSumSpan.textContent = totalSum;
    }

    /**
     * Setzt den Text des Ergebnistitels
     * @param {string} title - Neuer Titel
     */
    setResultTitle(title) {
        this.elements.resultTitle.textContent = title;
    }

    /**
     * Zeigt oder versteckt den Force-Button
     * @param {boolean} show - Ob der Button angezeigt werden soll
     * @param {number} counter - Aktueller Force-Counter für den Button-Text
     */
    toggleForceButton(enable, counter = 1) {
        this.elements.forceButton.disabled = !enable;
        this.elements.forceButton.classList.toggle('disabled', !enable);
        this.elements.forceButton.textContent = `Forcieren (-${counter})`;
    }

    /**
     * Fügt Event-Listener für Roll-Button hinzu
     * @param {Function} callback - Callback-Funktion für den Event
     */
    onRollButtonClick(callback) {
        this.elements.rollButton.addEventListener('click', callback);
    }

    /**
     * Fügt Event-Listener für Force-Button hinzu
     * @param {Function} callback - Callback-Funktion für den Event
     */
    onForceButtonClick(callback) {
        this.elements.forceButton.addEventListener('click', callback);
    }

    /**
     * Zeigt ein Feedback basierend auf dem Ergebnis und der Schwierigkeit an
     * @param {number} netResult - Nettoergebnis (Erfolge minus Patzer) 
     * @param {number} difficulty - Schwierigkeitswert der Probe
     */
    displayFeedback(netResult, difficulty) {
        const feedbackElement = this.elements.feedbackDisplay;
        
        // Alle Klassen entfernen
        feedbackElement.className = 'feedback-display';
        
        // Feedback basierend auf Ergebnis setzen
        if (netResult >= difficulty) {
            // Erfolgreiche Probe
            const margin = netResult - difficulty;
            
            if (margin >= 3) {
                // Kritischer Erfolg mit dynamischer Schriftgröße
                feedbackElement.textContent = 'Kritischer Erfolg!';
                feedbackElement.classList.add('critical-success');
                
                // Dynamische Größe: 120% + 20% pro Erfolgspunkt über 3
                const sizeIncrease = 100 + Math.min(80, 20 * (margin - 2)); // Limit auf 180%
                feedbackElement.style.fontSize = `${sizeIncrease}%`;
            } else {
                feedbackElement.textContent = 'Probe bestanden!';
                feedbackElement.classList.add('success');
                feedbackElement.style.fontSize = '100%';
            }
        } else if (netResult >= 0) {
            // Misserfolg aber kein Patzer
            feedbackElement.textContent = 'Nicht bestanden';
            feedbackElement.classList.add('failure');
            feedbackElement.style.fontSize = '100%';
        } else {
            // Patzer mit dynamischer Schriftgröße
            feedbackElement.textContent = 'Patzer!';
            
            // Negative Ergebnisse: je niedriger, desto größer
            const absNegative = Math.abs(netResult);
            const sizeIncrease = 100 + Math.min(80, 40 * absNegative); // Limit auf 180%
            feedbackElement.style.fontSize = `${sizeIncrease}%`;
            
            // Verschiedene Grade von Patzern
            if (netResult <= -3) {
                feedbackElement.classList.add('botch-extreme');
            } else if (netResult <= -2) {
                feedbackElement.classList.add('botch-severe');
            } else {
                feedbackElement.classList.add('botch');
            }
        }
        
        // Feedback anzeigen
        feedbackElement.style.display = 'block';
    }
}