/**
 * Würfel-Simulator: Hauptmodul
 */

// Hauptanwendungsklasse
class DiceSimulator {
    constructor() {
        // UI-Controller initialisieren
        this.ui = new UIController();
        
        // Sound-Controller initialisieren
        this.soundController = new SoundController();
        
        // Zustandsvariablen
        this.forceCounter = 1;
        this.currentDiceResults = [];
        this.currentSuccesses = 0;
        this.currentOnes = 0;
        this.currentResult = 0;
        
        // Verlaufsarray hinzufügen
        this.rollHistory = []; // Speichert die letzten 10 Würfe
        
        // Event-Listener initialisieren
        this.initEventListeners();
    }

    /**
     * Initialisiert die Event-Listener für die Hauptanwendungslogik
     */
    initEventListeners() {
        // Würfeln-Button-Listener
        this.ui.onRollButtonClick(() => this.handleRollButtonClick());
        
        // Forcieren-Button-Listener
        this.ui.onForceButtonClick(() => this.handleForceButtonClick());
    }

    handleRollButtonClick() {
        // Forcieren zurücksetzen
        this.forceCounter = 1;
        
        // Würfel werfen
        const numDice = this.ui.getNumDice();
        this.currentDiceResults = DiceEngine.rollDice(numDice);
        
        // Sound abspielen
        this.soundController.playDiceSound(numDice);
        
        // Ergebnisse berechnen
        this.currentSuccesses = DiceEngine.countSuccesses(this.currentDiceResults);
        this.currentOnes = DiceEngine.countOnes(this.currentDiceResults);
        this.currentResult = DiceEngine.calculateResult(this.currentSuccesses, this.currentOnes);
        const totalSum = DiceEngine.calculateTotalSum(this.currentDiceResults);
        
        // Ergebnisse mit Animation anzeigen
        this.ui.animateAndDisplayResults(
            this.currentDiceResults, 
            this.currentSuccesses, 
            this.currentOnes, 
            this.currentResult, 
            totalSum, 
            0
        );
        this.ui.setResultTitle("Ergebnis des Wurfs:");
        
       // Feedback bestimmen und anzeigen
       const difficulty = this.ui.getDifficulty();
       const feedbackText = this.ui.getFeedbackText(this.currentResult, difficulty);
       this.ui.displayFeedback(this.currentResult, difficulty);
       
       // Zum Verlauf hinzufügen
       this.addToHistory(this.currentResult, difficulty, feedbackText, "roll");
    }

    /**
     * Behandelt den Klick auf den Forcieren-Button
     */
    handleForceButtonClick() {
        // Würfel werfen
        const numDice = this.ui.getNumDice();
        this.currentDiceResults = DiceEngine.rollDice(numDice);
        
        // Sound abspielen
        this.soundController.playDiceSound(numDice);
        
        // Ergebnisse berechnen
        this.currentSuccesses = DiceEngine.countSuccesses(this.currentDiceResults);
        this.currentOnes = DiceEngine.countOnes(this.currentDiceResults);
        
        // Abzug durch Forcieren einkalkulieren
        this.currentResult = DiceEngine.calculateResult(
            this.currentSuccesses, 
            this.currentOnes, 
            this.forceCounter
        );
        
        const totalSum = DiceEngine.calculateTotalSum(this.currentDiceResults);
        
        // Ergebnisse mit Animation anzeigen
        this.ui.animateAndDisplayResults(
            this.currentDiceResults, 
            this.currentSuccesses, 
            this.currentOnes, 
            this.currentResult, 
            totalSum, 
            this.forceCounter
        );
        this.ui.setResultTitle("Ergebnis nach Forcieren:");
        
        // Feedback bestimmen und anzeigen
        const difficulty = this.ui.getDifficulty();
        const feedbackText = this.ui.getFeedbackText(this.currentResult, difficulty);
        this.ui.displayFeedback(this.currentResult, difficulty);
        
        // Zum Verlauf hinzufügen
        this.addToHistory(this.currentResult, difficulty, feedbackText, "force");
        
        // Force-Counter erhöhen für nächstes Forcieren
        this.forceCounter++;

        this.ui.updateForceButtonState(true, this.forceCounter);
    }

    /**
     * Fügt einen Wurf zum Verlauf hinzu
     * @param {number} result - Ergebnis des Wurfs
     * @param {number} difficulty - Schwierigkeit des Wurfs
     * @param {string} feedbackText - Feedback-Text (z.B. "Probe bestanden")
     * @param {string} type - Typ des Wurfs ("roll" oder "force")
     */
    addToHistory(result, difficulty, feedbackText, type) {
        // Neuen Verlaufseintrag erstellen
        const historyEntry = {
            result: result,
            difficulty: difficulty,
            feedback: feedbackText,
            type: type,
            timestamp: new Date()
        };
        
        // Zum Verlauf hinzufügen (am Anfang, damit die neuesten oben sind)
        this.rollHistory.unshift(historyEntry);
        
        // Auf 10 Einträge beschränken
        if (this.rollHistory.length > 10) {
            this.rollHistory.pop();
        }
        
        // Verlauf anzeigen
        this.ui.updateHistoryDisplay(this.rollHistory);
    }
}

// Anwendung initialisieren, wenn das DOM geladen ist
document.addEventListener('DOMContentLoaded', () => {
    const app = new DiceSimulator();
});