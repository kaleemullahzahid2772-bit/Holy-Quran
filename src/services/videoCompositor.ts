import { ProjectTimeline, VisualClip, OverlayClip, TextClip, AspectRatio } from '../types/editor';
import { Muxer, ArrayBufferTarget } from 'mp4-muxer';

// Image and Video Cache for smooth real-time rendering
const mediaElementCache = new Map<string, HTMLImageElement | HTMLVideoElement>();

export function getCachedMediaElement(url: string, type: 'video' | 'image'): HTMLImageElement | HTMLVideoElement {
  if (mediaElementCache.has(url)) {
    return mediaElementCache.get(url)!;
  }
  if (type === 'image') {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = url;
    mediaElementCache.set(url, img);
    return img;
  } else {
    const vid = document.createElement('video');
    vid.crossOrigin = 'anonymous';
    vid.preload = 'auto';
    vid.muted = true;
    vid.playsInline = true;
    vid.src = url;
    mediaElementCache.set(url, vid);
    return vid;
  }
}

export function getCanvasDimensions(aspectRatio: AspectRatio, targetWidth = 1080): { width: number; height: number } {
  switch (aspectRatio) {
    case '9:16':
      return { width: targetWidth, height: Math.round(targetWidth * (16 / 9)) };
    case '1:1':
      return { width: targetWidth, height: targetWidth };
    case '16:9':
    default:
      return { width: targetWidth, height: Math.round(targetWidth * (9 / 16)) };
  }
}

/**
 * Render a single frame of the timeline onto a 2D Canvas context
 */
export function renderTimelineFrame(
  ctx: CanvasRenderingContext2D,
  timeline: ProjectTimeline,
  currentTime: number,
  width: number,
  height: number
) {
  // Clear canvas
  ctx.fillStyle = '#0a0d14';
  ctx.fillRect(0, 0, width, height);

  if (!timeline || !timeline.tracks) return;

  const visualClips = timeline.tracks.visual || [];
  
  // Find current clip or transition
  let activeClip: VisualClip | null = null;
  let nextClip: VisualClip | null = null;
  let transitionProgress = 0;
  const transitionDuration = 0.5;

  for (let i = 0; i < visualClips.length; i++) {
    const c = visualClips[i];
    if (currentTime >= c.startTime && currentTime < c.startTime + c.duration) {
      activeClip = c;
      // Check if near end of clip for transition into next
      const timeLeftInClip = (c.startTime + c.duration) - currentTime;
      if (timeLeftInClip <= transitionDuration && i < visualClips.length - 1) {
        nextClip = visualClips[i + 1];
        transitionProgress = 1 - (timeLeftInClip / transitionDuration);
      }
      break;
    }
  }

  // Fallback to last clip if at end of timeline
  if (!activeClip && visualClips.length > 0 && currentTime >= timeline.totalDuration - 0.1) {
    activeClip = visualClips[visualClips.length - 1];
  }

  // Draw background if selected
  if (timeline.selectedBackground?.url) {
    const bgElem = getCachedMediaElement(timeline.selectedBackground.url, 'image') as HTMLImageElement;
    if (bgElem.complete && bgElem.naturalWidth > 0) {
      ctx.save();
      ctx.globalAlpha = 0.35;
      ctx.drawImage(bgElem, 0, 0, width, height);
      ctx.restore();
    }
  }

  // 1. Draw Active Visual Clip
  if (activeClip) {
    drawVisualClip(ctx, activeClip, currentTime, width, height, 1.0);
  }

  // 2. Blend Next Clip if in Transition
  if (activeClip && nextClip && transitionProgress > 0) {
    const transitionType = activeClip.transition || 'dissolve';
    ctx.save();

    if (transitionType === 'dissolve') {
      ctx.globalAlpha = transitionProgress;
      drawVisualClip(ctx, nextClip, nextClip.startTime, width, height, 1.0);
    } else if (transitionType === 'fade_black') {
      // Dip to black
      const blackAlpha = transitionProgress < 0.5 ? transitionProgress * 2 : (1 - transitionProgress) * 2;
      ctx.fillStyle = '#000000';
      ctx.globalAlpha = blackAlpha;
      ctx.fillRect(0, 0, width, height);
    } else if (transitionType === 'slide_left') {
      const offsetX = (1 - transitionProgress) * width;
      ctx.translate(offsetX, 0);
      drawVisualClip(ctx, nextClip, nextClip.startTime, width, height, 1.0);
    } else if (transitionType === 'zoom_in') {
      const scale = 0.8 + transitionProgress * 0.2;
      ctx.translate(width / 2, height / 2);
      ctx.scale(scale, scale);
      ctx.translate(-width / 2, -height / 2);
      ctx.globalAlpha = transitionProgress;
      drawVisualClip(ctx, nextClip, nextClip.startTime, width, height, 1.0);
    }

    ctx.restore();
  }

  // 3. Color Grading & Vignette Filter Overlay
  applyColorGrade(ctx, timeline.colorGrading, width, height);

  // 4. Draw Overlays (Logos, Watermarks)
  const overlays = timeline.tracks.overlay || [];
  overlays.forEach(overlay => {
    if (currentTime >= overlay.startTime && currentTime <= overlay.startTime + overlay.duration) {
      drawOverlay(ctx, overlay, width, height);
    }
  });

  // 5. Draw Text & Captions
  const textClips = timeline.tracks.text || [];
  textClips.forEach(tc => {
    if (currentTime >= tc.startTime && currentTime <= tc.startTime + tc.duration) {
      drawText(ctx, tc, width, height);
    }
  });
}

function drawVisualClip(
  ctx: CanvasRenderingContext2D,
  clip: VisualClip,
  currentTime: number,
  width: number,
  height: number,
  opacity: number
) {
  const elem = getCachedMediaElement(clip.sourceUrl, clip.type);

  ctx.save();
  ctx.globalAlpha = opacity;

  // Calculate Ken Burns Animation progress (0.0 to 1.0)
  const clipProgress = Math.max(0, Math.min(1, (currentTime - clip.startTime) / (clip.duration || 1)));

  let scale = 1.0;
  let transX = 0;
  let transY = 0;

  if (clip.animation === 'ken_burns_zoom_in') {
    scale = 1.0 + clipProgress * 0.12; // 12% zoom
  } else if (clip.animation === 'ken_burns_pan_right') {
    scale = 1.08;
    transX = (clipProgress - 0.5) * 40;
  } else if (clip.animation === 'subtle_punch_in') {
    scale = 1.0 + Math.sin(clipProgress * Math.PI) * 0.08;
  }

  ctx.translate(width / 2 + transX, height / 2 + transY);
  ctx.scale(scale, scale);
  ctx.translate(-width / 2, -height / 2);

  if (clip.type === 'image') {
    const img = elem as HTMLImageElement;
    if (img.complete && img.naturalWidth > 0) {
      drawImageCover(ctx, img, 0, 0, width, height);
    } else {
      // Placeholder while loading
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '20px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(clip.title || 'Loading visual...', width / 2, height / 2);
    }
  } else {
    // Video element
    const vid = elem as HTMLVideoElement;
    if (vid.readyState >= 2) {
      const sourceTime = (clip.sourceStart || 0) + (currentTime - clip.startTime);
      if (Math.abs(vid.currentTime - sourceTime) > 0.3) {
        vid.currentTime = Math.max(0, sourceTime);
      }
      drawImageCover(ctx, vid, 0, 0, width, height);
    } else {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, width, height);
    }
  }

  ctx.restore();
}

function drawImageCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement | HTMLVideoElement,
  x: number,
  y: number,
  w: number,
  h: number
) {
  const nw = (img as HTMLImageElement).naturalWidth || (img as HTMLVideoElement).videoWidth || w;
  const nh = (img as HTMLImageElement).naturalHeight || (img as HTMLVideoElement).videoHeight || h;
  const imgRatio = nw / nh;
  const canvasRatio = w / h;

  let dw = w;
  let dh = h;
  let dx = x;
  let dy = y;

  if (canvasRatio > imgRatio) {
    dh = w / imgRatio;
    dy = y - (dh - h) / 2;
  } else {
    dw = h * imgRatio;
    dx = x - (dw - w) / 2;
  }

  ctx.drawImage(img, dx, dy, dw, dh);
}

function applyColorGrade(ctx: CanvasRenderingContext2D, grade: string = '', width: number, height: number) {
  ctx.save();
  // Warm golden vignette
  const grad = ctx.createRadialGradient(width / 2, height / 2, width * 0.25, width / 2, height / 2, width * 0.75);
  grad.addColorStop(0, 'rgba(212, 175, 55, 0.04)');
  grad.addColorStop(1, 'rgba(0, 0, 0, 0.35)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);
  ctx.restore();
}

function drawOverlay(ctx: CanvasRenderingContext2D, overlay: OverlayClip, width: number, height: number) {
  const img = getCachedMediaElement(overlay.sourceUrl, 'image') as HTMLImageElement;
  if (!img.complete || img.naturalWidth === 0) return;

  ctx.save();
  ctx.globalAlpha = overlay.opacity || 0.9;

  let size = width * 0.14; // Default medium
  if (overlay.size === 'small') size = width * 0.09;
  else if (overlay.size === 'large') size = width * 0.22;

  let x = width - size - 24;
  let y = 24;

  if (overlay.position === 'top_left') {
    x = 24;
    y = 24;
  } else if (overlay.position === 'bottom_left') {
    x = 24;
    y = height - size - 40;
  } else if (overlay.position === 'bottom_right') {
    x = width - size - 24;
    y = height - size - 40;
  } else if (overlay.position === 'center') {
    x = (width - size) / 2;
    y = (height - size) / 2 - 20;
  }

  // Draw circular or rounded backdrop for logo
  ctx.shadowColor = 'rgba(0,0,0,0.5)';
  ctx.shadowBlur = 10;
  ctx.drawImage(img, x, y, size, size);
  ctx.restore();
}

function drawText(ctx: CanvasRenderingContext2D, textClip: TextClip, width: number, height: number) {
  ctx.save();
  ctx.textAlign = 'center';

  let y = height * 0.82;
  if (textClip.position === 'top') y = height * 0.14;
  else if (textClip.position === 'center') y = height * 0.5;

  const titleFontSize = Math.round(width * 0.045);
  const subFontSize = Math.round(width * 0.03);

  // Background badge
  if (textClip.style.bgColor) {
    ctx.fillStyle = textClip.style.bgColor;
    const badgeHeight = textClip.subtext ? titleFontSize + subFontSize + 32 : titleFontSize + 24;
    const badgeY = y - titleFontSize - 6;
    ctx.fillRect(width * 0.08, badgeY, width * 0.84, badgeHeight);
  }

  // Title Text
  ctx.font = `bold ${titleFontSize}px "Amiri", "Segoe UI", sans-serif`;
  ctx.fillStyle = textClip.style.color || '#FFFFFF';
  ctx.shadowColor = 'rgba(0,0,0,0.7)';
  ctx.shadowBlur = 8;
  ctx.fillText(textClip.text, width / 2, y);

  // Subtext
  if (textClip.subtext) {
    ctx.font = `normal ${subFontSize}px "Segoe UI", sans-serif`;
    ctx.fillStyle = '#E2E8F0';
    ctx.shadowBlur = 6;
    ctx.fillText(textClip.subtext, width / 2, y + subFontSize + 10);
  }

  ctx.restore();
}

export interface ExportResult {
  blob: Blob;
  mimeType: string;
  extension: 'mp4' | 'webm';
}

/**
 * Export the complete timeline as an authentic MP4 (H.264) universally compatible with Windows Media Player
 */
export async function exportVideo(
  timeline: ProjectTimeline,
  options: {
    aspectRatio: AspectRatio;
    resolution: '720p' | '1080p';
    fps?: number;
  },
  onProgress: (progressPercent: number, statusText: string) => void
): Promise<ExportResult> {
  const targetWidth = options.resolution === '1080p' ? 1080 : 720;
  let { width, height } = getCanvasDimensions(options.aspectRatio, targetWidth);
  // Ensure even dimensions required for H.264/AVC encoding
  width = width - (width % 2);
  height = height - (height % 2);

  const fps = options.fps || 30;
  const totalFrames = Math.max(1, Math.round(timeline.totalDuration * fps));

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!;

  // Primary Engine: Pure H.264 MP4 (Universal Windows Media Player, iOS, Android, QuickTime)
  if (typeof window !== 'undefined' && 'VideoEncoder' in window) {
    try {
      const muxer = new Muxer({
        target: new ArrayBufferTarget(),
        video: {
          codec: 'avc',
          width,
          height
        },
        fastStart: 'in-memory'
      });

      let encodeError: any = null;
      const videoEncoder = new VideoEncoder({
        output: (chunk, meta) => {
          muxer.addVideoChunk(chunk, meta);
        },
        error: (e) => {
          console.error('VideoEncoder error:', e);
          encodeError = e;
        }
      });

      // avc1.42001f is H.264 Baseline Profile level 3.1 - natively played by all Windows Media Player versions
      videoEncoder.configure({
        codec: 'avc1.42001f',
        width,
        height,
        bitrate: options.resolution === '1080p' ? 5_000_000 : 3_000_000
      });

      for (let f = 0; f < totalFrames; f++) {
        if (encodeError) throw encodeError;

        const currentTime = f / fps;
        renderTimelineFrame(ctx, timeline, currentTime, width, height);

        const timestampMicros = Math.round((f / fps) * 1_000_000);
        const frame = new VideoFrame(canvas, { timestamp: timestampMicros });
        const isKeyFrame = f % (fps * 2) === 0;
        videoEncoder.encode(frame, { keyFrame: isKeyFrame });
        frame.close();

        const progress = Math.round((f / totalFrames) * 92);
        onProgress(progress, `Encoding MP4 frame ${f + 1} of ${totalFrames} (${currentTime.toFixed(1)}s)...`);

        if (f % 6 === 0) {
          await new Promise((r) => setTimeout(r, 0));
        }
      }

      onProgress(96, 'Finalizing universal MP4 container...');
      await videoEncoder.flush();
      videoEncoder.close();
      muxer.finalize();

      const buffer = muxer.target.buffer;
      const blob = new Blob([buffer], { type: 'video/mp4' });
      onProgress(100, 'Universal MP4 Export Complete!');
      return {
        blob,
        mimeType: 'video/mp4',
        extension: 'mp4'
      };
    } catch (webCodecsErr) {
      console.warn('WebCodecs MP4 encoding failed, falling back to MediaRecorder:', webCodecsErr);
    }
  }

  // Fallback: MediaRecorder with prioritized MP4 codecs
  return new Promise((resolve, reject) => {
    try {
      const canvasStream = canvas.captureStream(fps);

      let chosenMime = 'video/mp4;codecs=avc1';
      let extension: 'mp4' | 'webm' = 'mp4';

      if (MediaRecorder.isTypeSupported('video/mp4;codecs=avc1')) {
        chosenMime = 'video/mp4;codecs=avc1';
        extension = 'mp4';
      } else if (MediaRecorder.isTypeSupported('video/mp4')) {
        chosenMime = 'video/mp4';
        extension = 'mp4';
      } else if (MediaRecorder.isTypeSupported('video/webm;codecs=h264')) {
        chosenMime = 'video/webm;codecs=h264';
        extension = 'webm';
      } else {
        chosenMime = 'video/webm';
        extension = 'webm';
      }

      const recorder = new MediaRecorder(canvasStream, {
        mimeType: chosenMime,
        videoBitsPerSecond: options.resolution === '1080p' ? 6000000 : 3500000
      });

      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        const finalBlob = new Blob(chunks, { type: chosenMime });
        onProgress(100, 'Video Export Complete!');
        resolve({
          blob: finalBlob,
          mimeType: chosenMime,
          extension
        });
      };

      recorder.start();

      let currentFrame = 0;
      const intervalMs = 1000 / fps;

      const renderStep = () => {
        if (currentFrame >= totalFrames) {
          onProgress(97, 'Closing video stream...');
          setTimeout(() => recorder.stop(), 300);
          return;
        }

        const currentTime = currentFrame / fps;
        renderTimelineFrame(ctx, timeline, currentTime, width, height);

        const progress = Math.round((currentFrame / totalFrames) * 95);
        onProgress(progress, `Compositing frame ${currentFrame + 1} of ${totalFrames}...`);

        currentFrame++;
        setTimeout(renderStep, intervalMs);
      };

      renderStep();
    } catch (err) {
      reject(err);
    }
  });
}
