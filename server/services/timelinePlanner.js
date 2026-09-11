/**
 * Timeline Planner Service
 * Takes user media assets, reference style profile, institution branding,
 * and user intent to build a structured editing plan (Intermediate Representation).
 */

export function planTimeline({
  userClips = [],
  referenceStyle = null,
  institutionProfile = null,
  aspectRatio = '9:16',
  targetDuration = 0,
  userInstructions = '',
  selectedBackground = null,
  voiceAudio = null
}) {
  if (!userClips || userClips.length === 0) {
    throw new Error('At least one media clip is required to generate a timeline.');
  }

  // Pacing parameters from reference style or defaults
  const avgShotDuration = referenceStyle?.pacing?.averageShotLengthSec || 3.0;
  const primaryTransition = referenceStyle?.transitions?.primary || 'dissolve';
  const colorGrade = referenceStyle?.compositionAndColor?.colorGrade || 'Warm Golden Islamic Tone';

  const visualClips = [];
  const overlayClips = [];
  const textClips = [];
  const audioClips = [];

  let currentTime = 0;

  // 1. INTRO SCENE
  // If institution building or hero photo exists, or instructions request it, use as intro
  const hasBuilding = institutionProfile?.buildingUrl;
  const introClipNeeded = hasBuilding || userInstructions.toLowerCase().includes('ادارے') || userInstructions.toLowerCase().includes('institution');

  if (hasBuilding) {
    const introDuration = Math.min(3.0, Math.max(2.0, avgShotDuration * 0.9));
    visualClips.push({
      id: 'clip_intro_building',
      type: 'image',
      sourceUrl: institutionProfile.buildingUrl,
      title: 'Campus Introduction',
      startTime: currentTime,
      duration: introDuration,
      sourceStart: 0,
      sourceDuration: introDuration,
      transition: 'fade_black',
      animation: 'ken_burns_zoom_in',
      filter: 'warm_cinematic',
      scale: 1.05
    });

    if (institutionProfile.institutionName) {
      textClips.push({
        id: 'text_intro_title',
        text: institutionProfile.institutionName,
        subtext: institutionProfile.tagline || 'Welcome to our Journey',
        startTime: currentTime + 0.3,
        duration: introDuration - 0.5,
        position: 'center_lower',
        style: {
          font: 'Amiri, sans-serif',
          color: institutionProfile.brandColors?.accent || '#D4AF37',
          bgColor: 'rgba(0, 0, 0, 0.65)'
        }
      });
    }

    currentTime += introDuration;
  }

  // 2. MAIN STORY CLIPS (Intelligently sequenced and trimmed)
  // Classify user clips
  userClips.forEach((clip, idx) => {
    // Determine useful portion duration
    const rawDuration = clip.duration || 5.0;
    // Pacing: pick optimal segment (avoid boring/long clips, trim to reference shot length)
    const clipShotDuration = Math.min(rawDuration, Math.max(2.0, avgShotDuration * (0.85 + (idx % 3) * 0.15)));
    const sourceStart = Math.min(rawDuration - clipShotDuration, clip.sourceStart || (rawDuration > 4 ? 0.5 : 0));

    // Intelligent alternating motion / ken burns for still images & video
    const motionAnimations = ['ken_burns_zoom_in', 'ken_burns_pan_right', 'subtle_punch_in', 'slow_pan_left'];
    const animation = clip.type === 'image' ? motionAnimations[idx % motionAnimations.length] : 'none';

    // Transition choice based on reference style
    let transition = primaryTransition;
    if (idx === userClips.length - 1) {
      transition = 'fade_black';
    } else if (idx % 4 === 0) {
      transition = 'zoom_in';
    }

    visualClips.push({
      id: `clip_${idx + 1}_${clip.id || 'media'}`,
      type: clip.type || (clip.url?.endsWith('.jpg') || clip.url?.endsWith('.png') ? 'image' : 'video'),
      sourceUrl: clip.url || clip.sourceUrl,
      thumbnailUrl: clip.thumbnailUrl || clip.url,
      title: clip.title || `Scene ${idx + 1}`,
      startTime: parseFloat(currentTime.toFixed(2)),
      duration: parseFloat(clipShotDuration.toFixed(2)),
      sourceStart: parseFloat(sourceStart.toFixed(2)),
      sourceDuration: parseFloat(clipShotDuration.toFixed(2)),
      transition,
      animation,
      filter: 'islamic_warmth',
      speed: 1.0,
      volume: 1.0
    });

    currentTime += clipShotDuration;
  });

  // 3. OUTRO SCENE WITH INSTITUTION BRANDING & LOGO
  if (institutionProfile?.logoUrl) {
    const outroDuration = 3.0;
    // Add outro visual background (classroom or building or dark serene background)
    const outroBgUrl = institutionProfile.classroomUrl || institutionProfile.buildingUrl || selectedBackground?.url;
    if (outroBgUrl) {
      visualClips.push({
        id: 'clip_outro_backdrop',
        type: 'image',
        sourceUrl: outroBgUrl,
        title: 'Institutional Outro',
        startTime: parseFloat(currentTime.toFixed(2)),
        duration: outroDuration,
        sourceStart: 0,
        sourceDuration: outroDuration,
        transition: 'fade_black',
        animation: 'subtle_punch_in',
        filter: 'darkened_overlay'
      });
    }

    // Logo Overlay
    overlayClips.push({
      id: 'overlay_outro_logo',
      type: 'logo',
      sourceUrl: institutionProfile.logoUrl,
      startTime: parseFloat((currentTime + 0.4).toFixed(2)),
      duration: outroDuration - 0.4,
      position: 'center',
      size: 'medium',
      opacity: 0.95
    });

    // Contact text
    if (institutionProfile.contactInfo?.website || institutionProfile.contactInfo?.phone) {
      textClips.push({
        id: 'text_outro_contact',
        text: institutionProfile.contactInfo.website || institutionProfile.contactInfo.phone,
        subtext: institutionProfile.institutionName || '',
        startTime: parseFloat((currentTime + 0.8).toFixed(2)),
        duration: outroDuration - 1.0,
        position: 'bottom',
        style: {
          font: 'sans-serif',
          color: '#FFFFFF',
          bgColor: 'rgba(13, 92, 58, 0.85)'
        }
      });
    }

    currentTime += outroDuration;
  }

  // 4. WATERMARK LOGO (if requested and logo exists)
  if (institutionProfile?.logoUrl) {
    overlayClips.unshift({
      id: 'overlay_watermark_brand',
      type: 'watermark',
      sourceUrl: institutionProfile.logoUrl,
      startTime: 0,
      duration: parseFloat(currentTime.toFixed(2)),
      position: 'top_right',
      size: 'small',
      opacity: 0.85
    });
  }

  // 5. AUDIO COMPOSITION
  // Background music / Nasheed
  audioClips.push({
    id: 'audio_bgm_1',
    title: 'Peaceful Islamic Acoustic Ambient',
    type: 'music',
    sourceUrl: 'https://cdn.pixabay.com/download/audio/2022/05/16/audio_c16e788874.mp3?filename=peaceful-ambient-111162.mp3',
    startTime: 0,
    duration: parseFloat(currentTime.toFixed(2)),
    volume: voiceAudio ? 0.18 : 0.65, // Auto-ducking if voiceover present
    fadeIn: 1.5,
    fadeOut: 2.0
  });

  // Voiceover if provided
  if (voiceAudio) {
    audioClips.push({
      id: 'audio_voice_main',
      title: 'Narration Track',
      type: 'voice',
      sourceUrl: voiceAudio.url,
      startTime: 0.5,
      duration: Math.min(currentTime - 1.0, voiceAudio.duration || (currentTime - 1.0)),
      volume: 1.0,
      fadeIn: 0.2,
      fadeOut: 0.5
    });
  }

  const totalDuration = parseFloat(currentTime.toFixed(2));

  const plan = {
    id: 'plan_' + Date.now(),
    title: institutionProfile?.institutionName
      ? `${institutionProfile.institutionName} - Institutional Story`
      : 'AI Master Edit Project',
    aspectRatio,
    totalDuration,
    styleProfileApplied: referenceStyle?.id || 'standard_cinematic',
    colorGrading: colorGrade,
    aiReasoning: [
      `Sequenced ${userClips.length} user assets based on ${referenceStyle ? 'Reference Video pacing (~' + avgShotDuration.toFixed(1) + 's/shot)' : 'natural documentary pacing'}.`,
      hasBuilding ? 'Anchored opening with institutional campus visual to establish reverence and authority.' : 'Used dynamic establishing moment for scene 1.',
      'Calculated Ken Burns camera motion trajectories for static assets to preserve visual rhythm.',
      `Configured ${primaryTransition} transitions with ducked background acoustics.`,
      institutionProfile?.logoUrl ? 'Integrated institutional watermark and cinematic outro card.' : 'Clean outro finish.'
    ],
    tracks: {
      visual: visualClips,
      overlay: overlayClips,
      text: textClips,
      audio: audioClips
    }
  };

  return plan;
}
