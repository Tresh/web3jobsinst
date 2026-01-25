/**
 * Canvas-based e-card generator with fixed pixel positioning
 * This creates a pixel-perfect image independent of DOM rendering
 */

interface ECardCanvasOptions {
  scholarName: string;
  programTitle: string;
  cohortYear?: string;
  photoUrl: string | null;
}

const CANVAS_WIDTH = 1080;
const CANVAS_HEIGHT = 1350;

// Colors matching the design system
const COLORS = {
  background: '#FF4D00', // Primary orange
  backgroundDark: '#E64500',
  white: '#FFFFFF',
  whiteTransparent: 'rgba(255, 255, 255, 0.15)',
  textMuted: 'rgba(255, 255, 255, 0.9)',
};

// Fixed pixel positions
const POSITIONS = {
  // Header
  headerIconY: 120,
  headerTextY: 200,
  
  // Photo
  photoY: 340,
  photoSize: 280,
  
  // Text content
  congratsY: 700,
  nameY: 780,
  programY: 870,
  
  // Footer
  cohortY: 1050,
  hashtagY: 1150,
  logoY: 1250,
};

/**
 * Load an image from URL with CORS handling
 */
async function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = url;
  });
}

/**
 * Draw a circular clipped image
 */
function drawCircularImage(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  size: number
) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();
  
  // Draw image scaled to fit the circle
  const scale = Math.max(size / img.width, size / img.height);
  const scaledWidth = img.width * scale;
  const scaledHeight = img.height * scale;
  const offsetX = x + (size - scaledWidth) / 2;
  const offsetY = y + (size - scaledHeight) / 2;
  
  ctx.drawImage(img, offsetX, offsetY, scaledWidth, scaledHeight);
  ctx.restore();
}

/**
 * Draw the grid pattern background
 */
function drawGridPattern(ctx: CanvasRenderingContext2D) {
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.lineWidth = 1;
  
  const gridSize = 40;
  
  // Vertical lines
  for (let x = 0; x <= CANVAS_WIDTH; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, CANVAS_HEIGHT);
    ctx.stroke();
  }
  
  // Horizontal lines
  for (let y = 0; y <= CANVAS_HEIGHT; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(CANVAS_WIDTH, y);
    ctx.stroke();
  }
}

/**
 * Draw centered text with automatic line wrapping
 */
function drawCenteredText(
  ctx: CanvasRenderingContext2D,
  text: string,
  y: number,
  maxWidth: number,
  fontSize: number,
  fontWeight: string = 'bold',
  color: string = COLORS.white
) {
  ctx.fillStyle = color;
  ctx.font = `${fontWeight} ${fontSize}px Inter, system-ui, -apple-system, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // Simple text truncation if too long
  let displayText = text;
  while (ctx.measureText(displayText).width > maxWidth && displayText.length > 0) {
    displayText = displayText.slice(0, -1);
  }
  if (displayText !== text) {
    displayText = displayText.slice(0, -3) + '...';
  }
  
  ctx.fillText(displayText, CANVAS_WIDTH / 2, y);
}

/**
 * Draw the award/trophy icon
 */
function drawAwardIcon(ctx: CanvasRenderingContext2D, centerX: number, centerY: number, size: number) {
  ctx.strokeStyle = COLORS.white;
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  
  const scale = size / 48; // Base icon size is 48
  
  ctx.save();
  ctx.translate(centerX - size / 2, centerY - size / 2);
  ctx.scale(scale, scale);
  
  // Trophy cup
  ctx.beginPath();
  ctx.moveTo(8, 8);
  ctx.lineTo(8, 4);
  ctx.lineTo(40, 4);
  ctx.lineTo(40, 8);
  ctx.stroke();
  
  // Trophy body
  ctx.beginPath();
  ctx.moveTo(12, 8);
  ctx.quadraticCurveTo(12, 28, 24, 32);
  ctx.quadraticCurveTo(36, 28, 36, 8);
  ctx.stroke();
  
  // Trophy stem
  ctx.beginPath();
  ctx.moveTo(24, 32);
  ctx.lineTo(24, 40);
  ctx.stroke();
  
  // Trophy base
  ctx.beginPath();
  ctx.moveTo(16, 40);
  ctx.lineTo(32, 40);
  ctx.lineTo(34, 44);
  ctx.lineTo(14, 44);
  ctx.closePath();
  ctx.stroke();
  
  // Star in trophy
  ctx.fillStyle = COLORS.white;
  ctx.beginPath();
  ctx.moveTo(24, 12);
  ctx.lineTo(26, 18);
  ctx.lineTo(32, 18);
  ctx.lineTo(27, 22);
  ctx.lineTo(29, 28);
  ctx.lineTo(24, 24);
  ctx.lineTo(19, 28);
  ctx.lineTo(21, 22);
  ctx.lineTo(16, 18);
  ctx.lineTo(22, 18);
  ctx.closePath();
  ctx.fill();
  
  ctx.restore();
}

/**
 * Generate the e-card as a canvas-based image
 */
export async function generateECardCanvas(options: ECardCanvasOptions): Promise<Blob> {
  const { scholarName, programTitle, cohortYear = '2025', photoUrl } = options;
  
  // Create canvas
  const canvas = document.createElement('canvas');
  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    throw new Error('Could not get canvas context');
  }
  
  // Background gradient
  const gradient = ctx.createLinearGradient(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  gradient.addColorStop(0, COLORS.background);
  gradient.addColorStop(1, COLORS.backgroundDark);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  
  // Add radial overlay for depth
  const radialGradient = ctx.createRadialGradient(
    CANVAS_WIDTH / 2, 0, 0,
    CANVAS_WIDTH / 2, 0, CANVAS_WIDTH
  );
  radialGradient.addColorStop(0, 'rgba(255, 255, 255, 0.1)');
  radialGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = radialGradient;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  
  // Draw grid pattern
  drawGridPattern(ctx);
  
  // Draw award icon
  drawAwardIcon(ctx, CANVAS_WIDTH / 2, POSITIONS.headerIconY, 80);
  
  // Draw "WEB3 JOBS INSTITUTE" header
  drawCenteredText(ctx, 'WEB3 JOBS INSTITUTE', POSITIONS.headerTextY, 900, 28, '600', COLORS.textMuted);
  
  // Draw photo frame
  const photoX = (CANVAS_WIDTH - POSITIONS.photoSize) / 2;
  const photoY = POSITIONS.photoY;
  
  // Photo border/frame
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.arc(
    CANVAS_WIDTH / 2,
    photoY + POSITIONS.photoSize / 2,
    POSITIONS.photoSize / 2 + 10,
    0,
    Math.PI * 2
  );
  ctx.stroke();
  
  // Draw photo or placeholder
  if (photoUrl) {
    try {
      const photo = await loadImage(photoUrl);
      drawCircularImage(ctx, photo, photoX, photoY, POSITIONS.photoSize);
    } catch (error) {
      console.error('Failed to load photo, drawing placeholder');
      // Draw placeholder circle
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.beginPath();
      ctx.arc(CANVAS_WIDTH / 2, photoY + POSITIONS.photoSize / 2, POSITIONS.photoSize / 2, 0, Math.PI * 2);
      ctx.fill();
      
      // Draw placeholder icon
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.font = 'bold 80px Inter, system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('👤', CANVAS_WIDTH / 2, photoY + POSITIONS.photoSize / 2);
    }
  } else {
    // Draw placeholder circle
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.beginPath();
    ctx.arc(CANVAS_WIDTH / 2, photoY + POSITIONS.photoSize / 2, POSITIONS.photoSize / 2, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw placeholder icon
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.font = 'bold 80px Inter, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('👤', CANVAS_WIDTH / 2, photoY + POSITIONS.photoSize / 2);
  }
  
  // Draw "CONGRATULATIONS!" text
  drawCenteredText(ctx, 'CONGRATULATIONS!', POSITIONS.congratsY, 900, 48, 'bold');
  
  // Draw scholar name
  drawCenteredText(ctx, scholarName || 'Scholar Name', POSITIONS.nameY, 900, 56, 'bold');
  
  // Draw program title
  drawCenteredText(ctx, programTitle || 'Web3 Scholarship Program', POSITIONS.programY, 900, 32, '500', COLORS.textMuted);
  
  // Draw cohort badge background
  const badgeWidth = 280;
  const badgeHeight = 60;
  const badgeX = (CANVAS_WIDTH - badgeWidth) / 2;
  const badgeY = POSITIONS.cohortY - badgeHeight / 2;
  
  ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.beginPath();
  ctx.roundRect(badgeX, badgeY, badgeWidth, badgeHeight, 30);
  ctx.fill();
  
  // Draw cohort text
  drawCenteredText(ctx, `COHORT ${cohortYear}`, POSITIONS.cohortY, 260, 24, '600');
  
  // Draw hashtags
  drawCenteredText(ctx, '#W3JI #BuildingTheFuture', POSITIONS.hashtagY, 900, 22, '500', COLORS.textMuted);
  
  // Convert canvas to blob
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error('Failed to generate image blob'));
      }
    }, 'image/png', 1.0);
  });
}

/**
 * Download the generated e-card
 */
export async function downloadECard(options: ECardCanvasOptions): Promise<void> {
  const blob = await generateECardCanvas(options);
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `scholarship-ecard-${Date.now()}.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}
