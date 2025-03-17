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
            feedbackDisplay: document.getElementById('feedback-display'),
            historyList: document.getElementById('history-list')
        };
        
        // Mindestabstand zwischen Würfeln (in Pixeln)
        this.wuerfelThreshold = 70;
        
        // Neue Eigenschaften für die Animation
        this.animationDuration = 400; // 0,4 Sekunden Animation
        this.animationInProgress = false;
        
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
         * Animiert die Würfel und zeigt dann das Ergebnis an
         * @param {Array} finalDiceResults - Array mit den finalen Würfelergebnissen
         * @param {number} successes - Anzahl der Erfolge
         * @param {number} ones - Anzahl der Patzer
         * @param {number} result - Nettoergebnis
         * @param {number} totalSum - Summe aller Würfel
         * @param {number} deduction - Abzug durch Forcieren
         */
    animateAndDisplayResults(finalDiceResults, successes, ones, result, totalSum, deduction) {
        // Würfel-Display leeren
        this.elements.diceDisplay.innerHTML = '';
        
        // Container-Dimensionen ermitteln
        const containerWidth = this.elements.diceDisplay.offsetWidth;
        const containerHeight = this.elements.diceDisplay.offsetHeight;
        const dieSize = 50; // Größe eines Würfels in Pixel
        
        // Buttons während der Animation deaktivieren
        this.elements.rollButton.disabled = true;
        this.elements.forceButton.disabled = true;
        this.animationInProgress = true;
        
        // Array für die Würfel-Elemente
        const diceElements = [];
        
        // Vorläufige Würfel erstellen (mit zufälligen Werten)
        for (let i = 0; i < finalDiceResults.length; i++) {
            const dieElement = document.createElement('div');
            dieElement.className = 'die';
            
            // Zufällige Position und Rotation
            const position = this.getRandomPosition(containerWidth, containerHeight, dieSize);
            dieElement.style.left = `${position.left}px`;
            dieElement.style.top = `${position.top}px`;
            
            // Animationsstil für die Würfel
            dieElement.style.transition = `transform ${this.animationDuration}ms cubic-bezier(0.17, 0.89, 0.32, 1.25)`;
            dieElement.style.transform = `rotate(${position.rotation}deg) scale(1)`;
            
            // Würfel dem Container hinzufügen
            this.elements.diceDisplay.appendChild(dieElement);
            diceElements.push(dieElement);
        }
        
        // Animation starten
        let frameCount = 0;
        const totalFrames = Math.floor(this.animationDuration / 30); // ~30ms pro Frame
        const animationInterval = setInterval(() => {
            frameCount++;
            
            // Würfel aktualisieren
            diceElements.forEach((die, index) => {
                // Zufällige Würfelwerte während der Animation
                const randomValue = Math.floor(Math.random() * 6) + 1;
                die.textContent = randomValue;
                die.className = `die die-${randomValue}`;
                
                // Zufällige Rotation während der Animation
                const rotation = Math.random() * 360 - 180;
                die.style.transform = `rotate(${rotation}deg) scale(${1 + Math.sin(frameCount / 5) * 0.2})`;
            });
            
            // Animation beenden und finale Ergebnisse anzeigen
            if (frameCount >= totalFrames) {
                clearInterval(animationInterval);
                this.displayFinalResults(diceElements, finalDiceResults, successes, ones, result, totalSum, deduction);
            }
        }, 30);
    }

     /**
     * Generiert das HTML für die Würfel-Augenzahl anstelle von arabischen Zahlen
     * @param {number} value - Würfelwert (1-6)
     * @returns {string} HTML für die Würfelaugen
     */
     getDiceEyesHTML(value) {
        const dotPositions = {
            1: ['middle'],
            2: ['top-left', 'bottom-right'],
            3: ['top-left', 'middle', 'bottom-right'],
            4: ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
            5: ['top-left', 'top-right', 'middle', 'bottom-left', 'bottom-right'],
            6: ['top-left', 'top-right', 'middle-left', 'middle-right', 'bottom-left', 'bottom-right']
        };
        
        let eyesHTML = '<div class="dice-eyes">';
        for (const position of dotPositions[value]) {
            eyesHTML += `<div class="dot ${position}"></div>`;
        }
        eyesHTML += '</div>';
        
        return eyesHTML;
    }

    /**
     * Animiert die Würfel und zeigt dann das Ergebnis an
     * @param {Array} finalDiceResults - Array mit den finalen Würfelergebnissen
     * @param {number} successes - Anzahl der Erfolge
     * @param {number} ones - Anzahl der Patzer
     * @param {number} result - Nettoergebnis
     * @param {number} totalSum - Summe aller Würfel
     * @param {number} deduction - Abzug durch Forcieren
     */
    animateAndDisplayResults(finalDiceResults, successes, ones, result, totalSum, deduction) {
        // Würfel-Display leeren
        this.elements.diceDisplay.innerHTML = '';
        
        // Container-Dimensionen ermitteln
        const containerWidth = this.elements.diceDisplay.offsetWidth;
        const containerHeight = this.elements.diceDisplay.offsetHeight;
        const dieSize = 50; // Größe eines Würfels in Pixel
        
        // Buttons während der Animation deaktivieren
        this.elements.rollButton.disabled = true;
        this.elements.forceButton.disabled = true;
        this.animationInProgress = true;
        
        // Array für die Würfel-Elemente und deren Positionen
        const diceElements = [];
        const dicePositions = [];
        
        // Positionen vorberechnen, die für die Animation und das Endergebnis verwendet werden
        for (let i = 0; i < finalDiceResults.length; i++) {
            let position;
            let attempts = 0;
            const maxAttempts = 50;
            
            do {
                position = this.getRandomPosition(containerWidth, containerHeight, dieSize);
                attempts++;
            } while (attempts < maxAttempts && 
                     !this.isValidPosition(position, dicePositions, this.wuerfelThreshold));
            
            dicePositions.push(position);
        }
        
        // Würfel erstellen und an den berechneten Positionen platzieren
        for (let i = 0; i < finalDiceResults.length; i++) {
            const dieElement = document.createElement('div');
            dieElement.className = 'die die-rolling';
            
            // Graue Grundfarbe für alle Würfel während der Animation
            dieElement.style.backgroundColor = '#aaaaaa';
            
            // Initiale Position
            dieElement.style.left = `${dicePositions[i].left}px`;
            dieElement.style.top = `${dicePositions[i].top}px`;
            
            // Zufällige Augen für den Anfang
            dieElement.innerHTML = this.getDiceEyesHTML(Math.floor(Math.random() * 6) + 1);
            
            // Würfel dem Container hinzufügen
            this.elements.diceDisplay.appendChild(dieElement);
            diceElements.push(dieElement);
        }
        
        // Animation starten
        let frameCount = 0;
        const totalFrames = Math.floor(this.animationDuration / 50); // ~50ms pro Frame
        const animationInterval = setInterval(() => {
            frameCount++;
            
            // Würfel während der Animation aktualisieren
            diceElements.forEach((die, index) => {
                // Zufällige Würfelwerte während der Animation
                const randomValue = Math.floor(Math.random() * 6) + 1;
                die.innerHTML = this.getDiceEyesHTML(randomValue);
                
                // Leichte Bewegung und Rotation
                const positionNoise = 5; // Maximale Bewegung in Pixel
                const basePosition = dicePositions[index];
                const noiseX = Math.random() * positionNoise * 2 - positionNoise;
                const noiseY = Math.random() * positionNoise * 2 - positionNoise;
                
                die.style.left = `${basePosition.left + noiseX}px`;
                die.style.top = `${basePosition.top + noiseY}px`;
                
                // Rotation und Skalierung
                const rotation = Math.random() * 30 - 15;
                die.style.transform = `rotate(${rotation}deg) scale(${1 + Math.sin(frameCount / 5) * 0.1})`;
            });
            
            // Animation beenden und finale Ergebnisse anzeigen
            if (frameCount >= totalFrames) {
                clearInterval(animationInterval);
                this.displayFinalResults(diceElements, dicePositions, finalDiceResults, successes, ones, result, totalSum, deduction);
            }
        }, 50);
    }
    
    /**
     * Zeigt die finalen Ergebnisse nach der Animation an
     * @param {Array} diceElements - Array mit den Würfel-DOM-Elementen
     * @param {Array} dicePositions - Array mit den Positionen der Würfel
     * @param {Array} finalDiceResults - Array mit den finalen Würfelergebnissen
     * @param {number} successes - Anzahl der Erfolge
     * @param {number} ones - Anzahl der Patzer
     * @param {number} result - Nettoergebnis
     * @param {number} totalSum - Summe aller Würfel
     * @param {number} deduction - Abzug durch Forcieren
     */
    displayFinalResults(diceElements, dicePositions, finalDiceResults, successes, ones, result, totalSum, deduction) {
        // Finale Würfelwerte und Formatierung setzen
        diceElements.forEach((dieElement, index) => {
            const dieValue = finalDiceResults[index];
            
            // Animationsklasse entfernen
            dieElement.classList.remove('die-rolling');
            
            // Richtige Farbe entsprechend des Würfelwertes setzen
            if (dieValue === 1) {
                dieElement.className = 'die die-1';
            } else if (dieValue >= 5) {
                dieElement.className = 'die die-' + dieValue;
            } else {
                dieElement.className = 'die die-' + dieValue;
            }
            
            // Würfelaugen anzeigen
            dieElement.innerHTML = this.getDiceEyesHTML(dieValue);
            
            // Finale Position und Rotation
            const position = dicePositions[index];
            dieElement.style.left = `${position.left}px`;
            dieElement.style.top = `${position.top}px`;
            dieElement.style.transform = `rotate(${position.rotation}deg)`;
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
        
        // Buttons wieder aktivieren
        this.animationInProgress = false;
        this.elements.rollButton.disabled = false;
        this.updateForceButtonState(result === 0);

        // Stelle sicher, dass das Feedback nach der Animation noch sichtbar ist
        const difficulty = this.getDifficulty(); // Schwierigkeit abrufen
        this.displayFeedback(result, difficulty); // Feedback erneut anzeigen
    }
    
    /**
     * Aktualisiert den Zustand des Force-Buttons
     * @param {boolean} enable - Ob der Button aktiviert werden soll
     * @param {number} counter - Aktueller Force-Counter für den Button-Text
     */
    updateForceButtonState(enable, counter = 1) {
        if (!this.animationInProgress) {
            this.elements.forceButton.disabled = !enable;
            this.elements.forceButton.classList.toggle('disabled', !enable);
            this.elements.forceButton.textContent = `Forcieren (-${counter})`;
        }
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
        
        // Feedback anzeigen - stelle sicher, dass es wirklich sichtbar ist
        feedbackElement.style.display = 'block';
        feedbackElement.style.visibility = 'visible'; // Zusätzliche Sicherheit
        feedbackElement.style.opacity = '1'; // Stelle sicher, dass es nicht transparent ist
        
        // Sicherstellen, dass auch der Feedback-Platzhalter sichtbar ist
        const feedbackPlaceholder = feedbackElement.parentElement;
        if (feedbackPlaceholder) {
            feedbackPlaceholder.style.display = 'block';
            feedbackPlaceholder.style.visibility = 'visible';
        }
        
        // Gib eine Meldung in der Konsole aus für Debugging-Zwecke
        console.log("Feedback angezeigt:", feedbackElement.textContent);
    }

    /**
     * Aktualisiert die Anzeige des Verlaufs
     * @param {Array} historyEntries - Array mit Verlaufseinträgen
     */
    updateHistoryDisplay(historyEntries) {
        // Verlaufsliste leeren
        this.elements.historyList.innerHTML = '';
        
        // Verlaufseinträge hinzufügen
        historyEntries.forEach((entry, index) => {
            const historyItem = document.createElement('div');
            
            // CSS-Klasse basierend auf Ergebnis und Schwierigkeit
            let resultClass = '';
            if (entry.result >= entry.difficulty) {
                // Erfolgreiche Probe
                const margin = entry.result - entry.difficulty;
                if (margin >= 3) {
                    resultClass = 'history-item-critical';
                } else {
                    resultClass = 'history-item-success';
                }
            } else if (entry.result >= 0) {
                resultClass = 'history-item-failure';
            } else {
                // Patzer
                if (entry.result <= -3) {
                    resultClass = 'history-item-botch-extreme';
                } else if (entry.result <= -2) {
                    resultClass = 'history-item-botch-severe';
                } else {
                    resultClass = 'history-item-botch';
                }
            }
            
            // CSS-Klassen setzen
            historyItem.className = `history-item ${resultClass}`;
            
            // Wenn es der neueste Eintrag ist, Animation hinzufügen
            if (index === 0) {
                historyItem.classList.add('history-item-new');
            }
            
            // Text für den Eintrag erstellen
            const typeText = entry.type === 'force' ? '[F]' : '';
            historyItem.innerHTML = `
                <div>${typeText} ${entry.result}/${entry.difficulty}</div>
                <div class="history-item-result">${entry.feedback}</div>
            `;
            
            // Eintrag zur Liste hinzufügen
            this.elements.historyList.appendChild(historyItem);
        });
    }
    /**
     * Gibt den Feedback-Text basierend auf dem Ergebnis zurück
     * @param {number} netResult - Nettoergebnis
     * @param {number} difficulty - Schwierigkeit
     * @returns {string} Feedback-Text
     */
    getFeedbackText(netResult, difficulty) {
        if (netResult >= difficulty) {
            // Erfolgreiche Probe
            const margin = netResult - difficulty;
            if (margin >= 3) {
                return 'Kritischer Erfolg!';
            } else {
                return 'Probe bestanden!';
            }
        } else if (netResult >= 0) {
            return 'Nicht bestanden';
        } else {
            // Patzer
            if (netResult <= -3) {
                return 'Extremer Patzer!';
            } else if (netResult <= -2) {
                return 'Schwerer Patzer!';
            } else {
                return 'Patzer!';
            }
        }
    }
    
    /**
     * Setzt den Titel des Ergebnisbereichs
     * @param {string} title - Neuer Titel
     */
    setResultTitle(title) {
        this.elements.resultTitle.textContent = title;
    }
}