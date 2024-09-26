// Getting references to HTML elements
const lastNumbersDisplay = document.getElementById('last-numbers');
const spinCountDisplay = document.getElementById('spin-count');
const optimalSectionDisplay = document.getElementById('optimal-section');
const probabilityDisplay = document.getElementById('probability');
const centerNumberDisplay = document.getElementById('center-number');
const biasCountDisplay = document.getElementById('bias-count');
const safeBetDisplay = document.getElementById('safe-bet');
const sectionSizeInput = document.getElementById('section-select');

// Array to track all spins and directions
let allSpins = [];
let spinDirections = []; // Array to track the directions (clockwise or counterclockwise)
const maxSpinsForDisplay = 15; // We will show only the last 15 spins
let currentDirection = 'clockwise'; // Start with clockwise

// The order of numbers on a European roulette wheel
const wheelNumbers = [0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26];

// Function to handle button clicks and add a number to the spins array
document.querySelectorAll('.number-btn').forEach(button => {
    button.addEventListener('click', () => {
        const number = parseInt(button.textContent);
        enterNumber(number);
    });
});

function enterNumber(number) {
    allSpins.push(number); // Add the number to the total spins
    spinDirections.push(currentDirection); // Add the current direction to the direction array

    // Alternate the spin direction for the next spin
    currentDirection = currentDirection === 'clockwise' ? 'counterclockwise' : 'clockwise';

    updateDisplay(); // Update the display with the new data
}

function updateDisplay() {
    const recentSpins = allSpins.slice(-maxSpinsForDisplay);

    lastNumbersDisplay.textContent = recentSpins.length ? recentSpins.join(', ') : 'None';
    spinCountDisplay.textContent = allSpins.length; // Total number of spins, continually increasing

    calculateOptimalSection(recentSpins); // Recalculate the optimal section using the last 15 spins
}

// Main function to calculate the optimal section
function calculateOptimalSection(recentSpins) {
    // Only calculate if there are at least 15 spins
    if (recentSpins.length < 15) {
        optimalSectionDisplay.textContent = 'N/A';
        probabilityDisplay.textContent = 'N/A';
        centerNumberDisplay.textContent = 'N/A';
        biasCountDisplay.textContent = '0';
        safeBetDisplay.textContent = 'N/A';
        return;
    }

    const numberFrequency = recentSpins.reduce((freq, num) => {
        freq[num] = (freq[num] || 0) + 1;
        return freq;
    }, {});

    // Determine the most frequent number
    const frequentNumber = Object.keys(numberFrequency).reduce((a, b) => numberFrequency[a] > numberFrequency[b] ? a : b);
    const optimalIndex = wheelNumbers.indexOf(parseInt(frequentNumber));

    let sectionSize = parseInt(sectionSizeInput.value) || 17;
    if (sectionSize % 2 === 0) sectionSize += 1; // Ensure section size is odd

    const halfSectionSize = Math.floor(sectionSize / 2);
    let section = [];

    // Expand the section to include adjacent numbers
    for (let i = -halfSectionSize; i <= halfSectionSize; i++) {
        const index = (optimalIndex + i + wheelNumbers.length) % wheelNumbers.length;
        section.push(wheelNumbers[index]);
    }

    const centerIndex = Math.floor(section.length / 2);
    const centerNumber = section[centerIndex];

    optimalSectionDisplay.textContent = section.join(', ');
    centerNumberDisplay.textContent = centerNumber;

    // Calculate whether it's safe to bet
    const safeToBetResult = determineSafeToBet(recentSpins, section);
    
    probabilityDisplay.textContent = safeToBetResult.probability;
    biasCountDisplay.textContent = safeToBetResult.biasCount;
    safeBetDisplay.textContent = safeToBetResult.safeToBet;
}

// Function to determine the "safeness" of betting based on recent spins and section
function determineSafeToBet(recentSpins, section) {
    const maxConsideredSpins = Math.min(15, recentSpins.length); // Use up to the last 15 spins for calculations
    const relevantSpins = recentSpins.slice(-maxConsideredSpins); // Slice the last 15 spins

    // Count how many of the recent spins are in or near the optimal section
    const spinsInSection = relevantSpins.filter(spin => section.includes(spin)).length;

    // Calculate the percentage of spins in the optimal section
    const spinInSectionPercentage = (spinsInSection / maxConsideredSpins) * 100;

    let probability, safeToBet;
    
    // Use simplified "High" or "Low" probability, no "Moderate"
    if (spinInSectionPercentage > 50) {
        probability = 'High';
        safeToBet = 'Yes';
    } else {
        probability = 'Low';
        safeToBet = 'No';
    }

    const biasCount = calculateBias(recentSpins);

    return { probability, biasCount, safeToBet };
}

// Function to calculate bias based on spin direction and distances
function calculateBias(recentSpins) {
    let biasCount = 0;
    let lastNumber = recentSpins[recentSpins.length - 1];
    let lastDirection = spinDirections[spinDirections.length - 1];

    for (let i = recentSpins.length - 2; i >= 0; i--) {
        const currentNumber = recentSpins[i];
        const currentDirection = spinDirections[i];
        const distance = Math.abs(wheelNumbers.indexOf(lastNumber) - wheelNumbers.indexOf(currentNumber));

        // Count bias based on the distance and alternating directions
        if ((currentDirection === "clockwise" && distance < 18) || (currentDirection === "counterclockwise" && distance > 18)) {
            biasCount++;
        }

        lastNumber = currentNumber;
        lastDirection = currentDirection;
    }

    return biasCount;
}

// Clear all spins
document.getElementById('clear-all').addEventListener('click', () => {
    allSpins = [];
    spinDirections = []; // Clear directions as well
    updateDisplay();
});

// Delete the last spin
document.getElementById('delete-last').addEventListener('click', () => {
    allSpins.pop();
    spinDirections.pop(); // Remove the last direction as well
    updateDisplay();
});
