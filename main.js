/**
 * Würfel-Simulator: Hauptmodul
 */

// Hauptanwendungsklasse
class DiceSimulator {
    constructor() {
        // UI-Controller initialisieren
        this.ui = new UIController();
        
        // Zustandsvariablen
        this.forceCounter = 1;
        this.currentDiceResults = [];
        this.currentSuccesses = 0;
        this.currentOnes = 0;
        this.currentResult = 0;
        
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

    /**
     * Behandelt den Klick auf den Würfeln-Button
     */
    handleRollButtonClick() {
        // Forcieren zurücksetzen
        this.forceCounter = 1;
        
        // Würfel werfen
        const numDice = this.ui.getNumDice();
        this.currentDiceResults = DiceEngine.rollDice(numDice);
        
        // Ergebnisse berechnen
        this.currentSuccesses = DiceEngine.countSuccesses(this.currentDiceResults);
        this.currentOnes = DiceEngine.countOnes(this.currentDiceResults);
        this.currentResult = DiceEngine.calculateResult(this.currentSuccesses, this.currentOnes);
        const totalSum = DiceEngine.calculateTotalSum(this.currentDiceResults);
        
        // Ergebnisse anzeigen
        this.ui.displayResults(
            this.currentDiceResults, 
            this.currentSuccesses, 
            this.currentOnes, 
            this.currentResult, 
            totalSum, 
            0
        );
        this.ui.setResultTitle("Ergebnis des Wurfs:");
        
        // Feedback anzeigen
        const difficulty = this.ui.getDifficulty();
        this.ui.displayFeedback(this.currentResult, difficulty);

        // Force-Button zeigen oder verstecken
        this.ui.toggleForceButton(this.currentResult === 0, this.forceCounter);
    }

    /**
     * Behandelt den Klick auf den Forcieren-Button
     */
    handleForceButtonClick() {
        // Würfel werfen
        const numDice = this.ui.getNumDice();
        this.currentDiceResults = DiceEngine.rollDice(numDice);
        
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
        
        // Ergebnisse anzeigen
        this.ui.displayResults(
            this.currentDiceResults, 
            this.currentSuccesses, 
            this.currentOnes, 
            this.currentResult, 
            totalSum, 
            this.forceCounter
        );
        this.ui.setResultTitle("Ergebnis nach Forcieren:");
        
        // Feedback anzeigen
        const difficulty = this.ui.getDifficulty();
        this.ui.displayFeedback(this.currentResult, difficulty);
        
        // Force-Counter erhöhen für nächstes Forcieren
        this.forceCounter++;
        
        // Force-Button zeigen oder verstecken
        this.ui.toggleForceButton(this.currentResult === 0, this.forceCounter);
    }
}

// Anwendung initialisieren, wenn das DOM geladen ist
document.addEventListener('DOMContentLoaded', () => {
    const app = new DiceSimulator();
});