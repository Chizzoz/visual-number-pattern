const canvas = document.getElementById('patternCanvas');
const ctx = canvas.getContext('2d', { willReadFrequently: true }); // Optimize rendering
const keypad = document.querySelector('.keypad');
const keys = document.querySelectorAll('.key');
const points = []; // Store points with their circles and colors
const lines = []; // Store lines with their colors
const clickSequence = []; // Track the sequence of clicked numbers
const numberDisplay = document.getElementById('numberDisplay'); // Textbox to display numbers
const clearButton = document.getElementById('clearButton'); // Clear button

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

scaleCanvas(); // Initial scaling

// Function to scale the canvas for desktop and mobile zoom
function scaleCanvas() {
    const pixelRatio = window.devicePixelRatio;
    const zoomLevel = window.visualViewport.scale;
    const scale = pixelRatio * (zoomLevel > 1 ? zoomLevel : 1); // zoomLevel > 1 means mobile zoom

    canvas.width = keypad.clientWidth * scale;
    canvas.height = keypad.clientHeight * scale;
    ctx.setTransform(scale, 0, 0, scale, 0, 0);

    drawPattern();
}

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

// Event listener for desktop and mobile zoom
window.visualViewport.addEventListener('resize', () => {
    scaleCanvas();
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

const themeToggle = document.getElementById('theme-toggle');
const body = document.body;

// Check current mode in localStorage
const currentTheme = localStorage.getItem('theme');
if (currentTheme === 'dark') {
  body.setAttribute('data-theme', 'dark');
  themeToggle.textContent = 'Switch to light mode';
} else {
  body.setAttribute('data-theme', 'light');
  themeToggle.textContent = 'Switch to dark mode';
}

// Switch between modes
themeToggle.addEventListener('click', () => {
  if (body.getAttribute('data-theme') === 'dark') {
    body.setAttribute('data-theme', 'light');
    localStorage.setItem('theme', 'light');
    themeToggle.textContent = 'Switch to dark mode';
  } else {
    body.setAttribute('data-theme', 'dark');
    localStorage.setItem('theme', 'dark');
    themeToggle.textContent = 'Switch to light mode';
  }
});