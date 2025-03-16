/**
 * Würfel-Simulator: Modul für Würfellogik
 */

// Klasse für die Würfellogik
class DiceEngine {
    /**
     * Würfelt eine bestimmte Anzahl von 6-seitigen Würfeln
     * @param {number} numDice - Anzahl der zu würfelnden Würfel
     * @returns {Array} Ein Array mit den Würfelergebnissen
     */
    static rollDice(numDice) {
        const results = [];
        for (let i = 0; i < numDice; i++) {
            results.push(Math.floor(Math.random() * 6) + 1);
        }
        return results;
    }

    /**
     * Zählt die Erfolge (5 und 6) in den Würfelergebnissen
     * @param {Array} diceResults - Array mit Würfelergebnissen
     * @returns {number} Anzahl der Erfolge
     */
    static countSuccesses(diceResults) {
        return diceResults.filter(d => d >= 5).length;
    }

    /**
     * Zählt die Patzer (1) in den Würfelergebnissen
     * @param {Array} diceResults - Array mit Würfelergebnissen
     * @returns {number} Anzahl der Patzer
     */
    static countOnes(diceResults) {
        return diceResults.filter(d => d === 1).length;
    }

    /**
     * Berechnet das Nettoergebnis (Erfolge - Patzer - Forcieren-Abzug)
     * @param {number} successes - Anzahl der Erfolge
     * @param {number} ones - Anzahl der Patzer
     * @param {number} forceDeduction - Abzug durch Forcieren
     * @returns {number} Nettoergebnis
     */
    static calculateResult(successes, ones, forceDeduction = 0) {
        return successes - ones - forceDeduction;
    }

    /**
     * Berechnet die Summe aller Würfelergebnisse
     * @param {Array} diceResults - Array mit Würfelergebnissen
     * @returns {number} Summe der Würfelergebnisse
     */
    static calculateTotalSum(diceResults) {
        return diceResults.reduce((sum, die) => sum + die, 0);
    }
}