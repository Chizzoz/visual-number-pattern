const canvas = document.getElementById('patternCanvas');
const ctx = canvas.getContext('2d', { willReadFrequently: true }); // Optimize rendering
const keypad = document.querySelector('.keypad');
const keys = document.querySelectorAll('.key');
const points = []; // Store points with their circles and colors
const lines = []; // Store lines with their colors
const clickSequence = []; // Track the sequence of clicked numbers
const numberDisplay = document.getElementById('numberDisplay'); // Textbox to display numbers
const clearButton = document.getElementById('clearButton'); // Clear button

// Set canvas dimensions to match keypad (including padding)
const scale = window.devicePixelRatio || 1; // Get device pixel ratio
canvas.width = keypad.offsetWidth * scale; // Scale canvas width
canvas.height = keypad.offsetHeight * scale; // Scale canvas height
canvas.style.width = `${keypad.offsetWidth}px`; // Set display width
canvas.style.height = `${keypad.offsetHeight}px`; // Set display height
ctx.scale(scale, scale); // Scale the context

// Maximum radius for circles (should not exceed button size)
const MAX_RADIUS = 36; // Reduced to 36 pixels
const RADIUS_INCREMENT = 3; // Reduced to 3 pixels

// Color palette
const colorPalette = [
    // 5 shades of black (light to dark)
    '#F0F0F0', // Lightest gray
    '#D3D3D3', // Light gray
    '#A9A9A9', // Dark gray
    '#808080', // Gray
    '#000000', // Black

    // 5 shades of red (light to dark)
    '#FFCCCB', // Lightest red
    '#FF6666', // Light red
    '#FF3333', // Medium red
    '#CC0000', // Dark red
    '#800000', // Darkest red

    // 5 shades of green (light to dark)
    '#CCFFCC', // Lightest green
    '#66FF66', // Light green
    '#33CC33', // Medium green
    '#009900', // Dark green
    '#006600', // Darkest green

    // 5 shades of blue (light to dark)
    '#CCE5FF', // Lightest blue
    '#66B2FF', // Light blue
    '#3399FF', // Medium blue
    '#0066CC', // Dark blue
    '#003366'  // Darkest blue
];

// Function to get the color for a specific step
function getColor(step) {
    return colorPalette[step % colorPalette.length]; // Cycle through the palette
}

// Function to update the pattern based on the click sequence
function updatePattern() {
    // Clear the points array and redraw based on the click sequence
    points.length = 0; // Reset points
    clickSequence.forEach((number, index) => {
        const key = document.querySelector(`.key[data-number="${number}"]`);
        if (key) {
            const x = Math.round(key.offsetLeft + (key.offsetWidth / 2)); // Use integer coordinates
            const y = Math.round(key.offsetTop + (key.offsetHeight / 2)); // Use integer coordinates

            // Check if the number already exists in the points array
            const existingPointIndex = points.findIndex(point => point.number === number);

            if (existingPointIndex !== -1) {
                // If the number exists, add a new circle with a unique color
                const lastRadius = points[existingPointIndex].circles[points[existingPointIndex].circles.length - 1].radius;
                const newRadius = lastRadius + RADIUS_INCREMENT; // Increase the radius by the increment

                // Ensure the new radius does not exceed the maximum allowed radius
                if (newRadius <= MAX_RADIUS) {
                    points[existingPointIndex].circles.push({ radius: newRadius, color: getColor(index) });
                }
            } else {
                // If the number doesn't exist, add it to the points array with an initial circle
                points.push({
                    x,
                    y,
                    number,
                    circles: [{ radius: 10, color: getColor(index) }] // Initial circle with radius 10
                });
            }
        }
    });

    // Update lines based on the click sequence
    lines.length = 0; // Reset lines
    for (let i = 1; i < clickSequence.length; i++) {
        const prevNumber = clickSequence[i - 1];
        const currentNumber = clickSequence[i];
        const prevPoint = points.find(point => point.number === prevNumber);
        const currentPoint = points.find(point => point.number === currentNumber);
        if (prevPoint && currentPoint) {
            lines.push({
                x1: prevPoint.x,
                y1: prevPoint.y,
                x2: currentPoint.x,
                y2: currentPoint.y,
                color: getColor(i) // Assign a color based on the step
            });
        }
    }

    drawPattern();
}

// Event listener for keypad clicks
keys.forEach(key => {
    key.addEventListener('click', () => {
        const number = key.getAttribute('data-number');

        // Add the clicked number to the sequence
        clickSequence.push(number);

        // Update the textbox with the clicked numbers
        numberDisplay.value = clickSequence.join('');

        // Update the pattern
        updatePattern();
    });
});

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

// Event listener for clear button
clearButton.addEventListener('click', () => {
    clickSequence.length = 0; // Clear the sequence
    numberDisplay.value = ''; // Clear the textbox
    updatePattern(); // Redraw the pattern
});

function drawPattern() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw lines
    lines.forEach((line) => {
        ctx.beginPath();
        ctx.moveTo(line.x1, line.y1);
        ctx.lineTo(line.x2, line.y2);
        ctx.strokeStyle = line.color; // Use the stored color for this line
        ctx.lineWidth = 2;
        ctx.stroke();
    });

    // Draw circles and numbers
    points.forEach((point) => {
        // Draw circles for each radius
        point.circles.forEach((circle) => {
            ctx.beginPath();
            ctx.arc(point.x, point.y, circle.radius, 0, Math.PI * 2);
            ctx.fillStyle = 'transparent'; // No fill for the circles
            ctx.strokeStyle = circle.color; // Use the stored color for this circle
            ctx.lineWidth = 2;
            ctx.stroke();
        });

        // Draw the number
        ctx.fillStyle = point.circles[point.circles.length - 1].color; // Use the color of the last circle
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(point.number, point.x, point.y);
    });
}

// Handle window resizing
window.addEventListener('resize', () => {
    canvas.width = keypad.offsetWidth * scale;
    canvas.height = keypad.offsetHeight * scale;
    canvas.style.width = `${keypad.offsetWidth}px`;
    canvas.style.height = `${keypad.offsetHeight}px`;
    ctx.scale(scale, scale);
    updatePattern();
});