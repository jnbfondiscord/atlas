const image = document.getElementById('interactiveImage');
const cursor = document.querySelector('.custom-cursor');
const imageContainer = document.querySelector('.image-container');

let mouseX = 0;
let mouseY = 0;
let imageRect = null;

// Create cursor trails
const trails = [];
for (let i = 0; i < 5; i++) {
    const trail = document.createElement('div');
    trail.className = 'cursor-trail';
    document.body.appendChild(trail);
    trails.push({
        element: trail,
        x: 0,
        y: 0
    });
}

function updateImageRect() {
    imageRect = image.getBoundingClientRect();
}

// Update image rect on load and resize
window.addEventListener('load', updateImageRect);
window.addEventListener('resize', updateImageRect);
window.addEventListener('scroll', updateImageRect);
updateImageRect();

// Update rect continuously for better tracking
setInterval(updateImageRect, 100);

document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    // Update custom cursor
    cursor.style.left = mouseX - 10 + 'px';
    cursor.style.top = mouseY - 10 + 'px';

    // Update cursor trails with delay
    trails.forEach((trail, index) => {
        setTimeout(() => {
            trail.x += (mouseX - trail.x) * 0.1;
            trail.y += (mouseY - trail.y) * 0.1;
            trail.element.style.left = trail.x - 3 + 'px';
            trail.element.style.top = trail.y - 3 + 'px';
            trail.element.style.opacity = 1 - (index * 0.2);
        }, index * 20);
    });

    if (imageRect) {
        const padding = 10;
        const isMouseOverImage = (
            mouseX >= imageRect.left - padding &&
            mouseX <= imageRect.right + padding &&
            mouseY >= imageRect.top - padding &&
            mouseY <= imageRect.bottom + padding
        );

        if (isMouseOverImage) {
            const imageCenterX = imageRect.left + imageRect.width / 2;
            const imageCenterY = imageRect.top + imageRect.height / 2;

            const deltaX = (mouseX - imageCenterX) / (imageRect.width / 2);
            const deltaY = (mouseY - imageCenterY) / (imageRect.height / 2);

            const clampedX = Math.max(-1.2, Math.min(1.2, deltaX));
            const clampedY = Math.max(-1.2, Math.min(1.2, deltaY));

            const rotateY = clampedX * 15;
            const rotateX = -clampedY * 15;
            const scale = 1 + (Math.abs(clampedX) + Math.abs(clampedY)) * 0.03;

            image.style.transform = `
                perspective(1000px)
                rotateX(${rotateX}deg)
                rotateY(${rotateY}deg)
                scale(${scale})
                translateZ(${(Math.abs(clampedX) + Math.abs(clampedY)) * 10}px)
            `;
            const glowIntensity = (Math.abs(clampedX) + Math.abs(clampedY)) * 0.5;
            image.style.boxShadow = `
                0 0 0 1px #333,
                0 0 40px rgba(255,255,255,0.2),
                0 0 80px rgba(255,255,255,0.1),
                0 0 ${40 + glowIntensity * 20}px rgba(255,255,255,${0.15 + glowIntensity * 0.15})
            `;
        } else {
            image.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1) translateZ(0px)';
            image.style.boxShadow = `
                0 0 0 1px #333,
                0 0 30px rgba(255,255,255,0.1),
                0 0 60px rgba(255,255,255,0.05)
            `;
        }
    }
});

// Reset image when mouse leaves
document.addEventListener('mouseleave', () => {
    image.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1) translateZ(0px)';
    image.style.boxShadow = `
        0 0 0 1px #333,
        0 0 30px rgba(255,255,255,0.1),
        0 0 60px rgba(255,255,255,0.05)
    `;
});

// Add click effect
image.addEventListener('click', () => {
    image.style.transform += ' scale(0.95)';
    setTimeout(() => {
        const event = new MouseEvent('mousemove', {
            clientX: mouseX,
            clientY: mouseY
        });
        document.dispatchEvent(event);
    }, 150);
});

// Idle floating animation
let idleTimer;
let isIdle = false;
function startIdleAnimation() {
    if (!isIdle) {
        isIdle = true;
        image.style.animation = 'none';
        const floatAnimation = () => {
            if (isIdle) {
                const time = Date.now() * 0.001;
                const floatY = Math.sin(time) * 5;
                const floatX = Math.cos(time * 0.7) * 3;
                image.style.transform = `
                    perspective(1000px)
                    translateY(${floatY}px)
                    translateX(${floatX}px)
                    rotateY(${Math.sin(time * 0.5) * 5}deg)
                `;
                requestAnimationFrame(floatAnimation);
            }
        };
        floatAnimation();
    }
}
function stopIdleAnimation() {
    isIdle = false;
    clearTimeout(idleTimer);
    idleTimer = setTimeout(startIdleAnimation, 3000);
}
document.addEventListener('mousemove', stopIdleAnimation);
stopIdleAnimation();
