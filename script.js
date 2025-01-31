const canvas = document.getElementById('patternCanvas');
const ctx = canvas.getContext('2d');
const keypad = document.querySelector('.keypad');
const keys = document.querySelectorAll('.key');
const points = [];
const clickSequence = []; // Track the sequence of clicked numbers
const numberDisplay = document.getElementById('numberDisplay'); // Textbox to display numbers

canvas.width = keypad.offsetWidth;
canvas.height = keypad.offsetHeight;

// Maximum radius for circles (should not exceed button size)
const MAX_RADIUS = 36; // Reduced to 36 pixels
const RADIUS_INCREMENT = 3; // Reduced to 3 pixels

// Function to update the pattern based on the click sequence
function updatePattern() {
    // Clear the points array and redraw based on the click sequence
    points.length = 0; // Reset points
    clickSequence.forEach(number => {
        const key = document.querySelector(`.key[data-number="${number}"]`);
        if (key) {
            const x = key.offsetLeft + (key.offsetWidth / 2);
            const y = key.offsetTop + (key.offsetHeight / 2);

            // Check if the number already exists in the points array
            const existingPointIndex = points.findIndex(point => point.number === number);

            if (existingPointIndex !== -1) {
                // If the number exists, add a new radius to its radii array
                const lastRadius = points[existingPointIndex].radii[points[existingPointIndex].radii.length - 1];
                const newRadius = lastRadius + RADIUS_INCREMENT; // Increase the radius by the increment

                // Ensure the new radius does not exceed the maximum allowed radius
                if (newRadius <= MAX_RADIUS) {
                    points[existingPointIndex].radii.push(newRadius);
                }
            } else {
                // If the number doesn't exist, add it to the points array with an initial radius
                points.push({x, y, number, radii: [10]}); // Initial radius remains 10 pixels
            }
        }
    });

    drawPattern();
}

// Event listener for keypad clicks
keys.forEach(key => (
    key.addEventListener('click', () => {
        const number = key.getAttribute('data-number');
    
        // Add the clicked number to the sequence
        clickSequence.push(number);
    
        // Update the textbox with the clicked numbers
        numberDisplay.value = clickSequence.join('');
    
        // Update the pattern
        updatePattern();
    })
));


// Event listener for textbox input
numberDisplay.addEventListener('input', (event) => {
    const inputValue = event.target.value;

    // Update the click sequence based on the textbox input
    clickSequence.length = 0; // Reset the sequence
    for (const char of inputValue) {
        if (/[0-9]/.test(char)) { // Only allow numbers
            clickSequence.push(char);
        }
    }

    // Update the pattern
    updatePattern();
});

function drawPattern() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw lines between points in the click sequence
    ctx.beginPath();

    // Move to the first point in the sequence
    const firstNumber = clickSequence[0];
    const firstPoint = points.find(point => point.number === firstNumber);
    if (firstPoint) {
        ctx.moveTo(firstPoint.x, firstPoint.y);
    }

    // Draw lines to the remaining points in the sequence
    for (let i = 1; i < clickSequence.length; i++) {
        const currentNumber = clickSequence[i];
        const currentPoint = points.find(point => point.number === currentNumber);
        if (currentPoint) {
            ctx.lineTo(currentPoint.x, currentPoint.y);
        }
    }

    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw circles and numbers
    points.forEach(point => {
        // Draw circles for each radius
        point.radii.forEach((radius) => {
            ctx.beginPath();
            ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
            ctx.fillStyle = 'transparent'; // No fill for the circles
            ctx.strokeStyle = '#000'; // Black outline
            ctx.lineWidth = 2;
            ctx.stroke();
        });

        // Draw the number
        ctx.fillStyle = '#000';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(point.number, point.x, point.y);
    });
}