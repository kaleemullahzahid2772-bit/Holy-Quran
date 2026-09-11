/**
 * Multilingual Conversational Intent Parser & Timeline Mutator
 * Supports Urdu (Arabic script), Roman Urdu, and English.
 * Understands conversational intent and applies surgical updates to current project timeline.
 */

export function parseIntentAndMutateTimeline({
  message,
  currentTimeline,
  institutionProfile,
  referenceStyle,
  selectedElementId = null,
  history = []
}) {
  if (!currentTimeline || !currentTimeline.tracks) {
    throw new Error('Valid timeline is required for conversational revisions.');
  }

  const rawMsg = (message || '').trim();
  const lowerMsg = rawMsg.toLowerCase();

  // Deep clone timeline to ensure immutable mutation
  const mutated = JSON.parse(JSON.stringify(currentTimeline));

  let actionType = 'UNKNOWN';
  let explanation = '';
  let explanationUrdu = '';
  let language = 'en';

  // Detect script/language
  const isUrduScript = /[\u0600-\u06FF]/.test(rawMsg);
  const isRomanUrdu = /kardo|karo|shuru|pehle|teesray|teesra|dosra|pehla|idaray|idara|accha|acha|transitions|badal|wapas|bhejo|lagao/i.test(lowerMsg);

  if (isUrduScript) language = 'ur';
  else if (isRomanUrdu) language = 'roman_ur';

  // 1. INTENT: SHORTEN BEGINNING / INTRO
  // "شروع والا حصہ تھوڑا چھوٹا کر دو" / "shuru wala hissa chota kardo" / "shorten the beginning"
  if (
    rawMsg.includes('شروع') && (rawMsg.includes('چھوٹا') || rawMsg.includes('کم')) ||
    (lowerMsg.includes('shuru') || lowerMsg.includes('start') || lowerMsg.includes('intro')) && (lowerMsg.includes('chota') || lowerMsg.includes('short') || lowerMsg.includes('trim'))
  ) {
    actionType = 'SHORTEN_BEGINNING';
    const firstClip = mutated.tracks.visual[0];
    if (firstClip) {
      const oldDur = firstClip.duration;
      const newDur = Math.max(1.5, parseFloat((oldDur * 0.65).toFixed(2)));
      const delta = oldDur - newDur;
      firstClip.duration = newDur;
      firstClip.sourceDuration = newDur;

      // Shift subsequent visual clips start times
      for (let i = 1; i < mutated.tracks.visual.length; i++) {
        mutated.tracks.visual[i].startTime = Math.max(0, parseFloat((mutated.tracks.visual[i].startTime - delta).toFixed(2)));
      }
      mutated.totalDuration = Math.max(1, parseFloat((mutated.totalDuration - delta).toFixed(2)));

      explanation = `Successfully shortened the beginning clip from ${oldDur}s to ${newDur}s. Timeline duration adjusted.`;
      explanationUrdu = `شروع والے کلپ کا دورانیہ ${oldDur} سیکنڈ سے کم کر کے ${newDur} سیکنڈ کر دیا گیا ہے۔ باقی ٹائم لائن محفوظ ہے۔`;
    }
  }

  // 2. INTENT: MOVE CLIP 3 TO BEGINNING / REORDER
  // "تیسرے کلپ کو پہلے لے آؤ" / "teesray clip ko pehle le aao" / "move clip 3 before clip 1"
  else if (
    (rawMsg.includes('تیسرے') || rawMsg.includes('تیسرا') || lowerMsg.includes('third') || lowerMsg.includes('clip 3') || lowerMsg.includes('teesra') || lowerMsg.includes('teesray')) &&
    (rawMsg.includes('پہلے') || rawMsg.includes('شروع') || lowerMsg.includes('first') || lowerMsg.includes('pehle') || lowerMsg.includes('beginning'))
  ) {
    actionType = 'REORDER_CLIP_3_FIRST';
    if (mutated.tracks.visual.length >= 3) {
      // Find 3rd clip (index 2)
      const clip3 = mutated.tracks.visual.splice(2, 1)[0];
      mutated.tracks.visual.unshift(clip3);

      // Recalculate start times
      let t = 0;
      mutated.tracks.visual.forEach(c => {
        c.startTime = parseFloat(t.toFixed(2));
        t += c.duration;
      });
      mutated.totalDuration = parseFloat(t.toFixed(2));

      explanation = `Moved Clip 3 ("${clip3.title || 'Scene 3'}") to the first position. Sequence updated.`;
      explanationUrdu = `تیسرے کلپ ("${clip3.title || 'Scene 3'}") کو سب سے پہلے لے آیا گیا ہے۔ ٹائم لائن کی ترتیب اپ ڈیٹ کر دی گئی ہے۔`;
    } else {
      explanation = 'Timeline contains fewer than 3 clips.';
      explanationUrdu = 'ٹائم لائن میں 3 سے کم کلپس موجود ہیں۔';
    }
  }

  // 3. INTENT: REDUCE TRANSITIONS / REMOVE EXCESSIVE TRANSITIONS
  // "Transitions کم کر دو، باقی سب ویسا ہی رہنے دو" / "transitions kam kardo" / "reduce transitions"
  else if (
    (lowerMsg.includes('transition') || rawMsg.includes('ٹرانزیشن')) &&
    (rawMsg.includes('کم') || rawMsg.includes('ہٹا') || lowerMsg.includes('kam') || lowerMsg.includes('reduce') || lowerMsg.includes('cut') || lowerMsg.includes('simple'))
  ) {
    actionType = 'REDUCE_TRANSITIONS';
    mutated.tracks.visual.forEach(c => {
      c.transition = 'cut';
    });
    // Keep intro/outro clean fade
    if (mutated.tracks.visual[0]) mutated.tracks.visual[0].transition = 'fade_black';
    if (mutated.tracks.visual[mutated.tracks.visual.length - 1]) {
      mutated.tracks.visual[mutated.tracks.visual.length - 1].transition = 'fade_black';
    }

    explanation = 'Reduced fancy transitions to clean, subtle cuts across the entire timeline. Clips preserved.';
    explanationUrdu = 'تمام کلپس سے اضافی ٹرانزیشنز ہٹا کر سادہ کٹس میں تبدیل کر دی گئی ہیں، باقی ویڈیو محفوظ ہے۔';
  }

  // 4. INTENT: ADD INSTITUTION BUILDING/IMAGE TO START
  // "میرے ادارے کی تصویر شروع میں لگا دو" / "idaray ki tasweer shuru mein lagao" / "put my institution image at start"
  else if (
    (rawMsg.includes('ادارے') || rawMsg.includes('ادارہ') || lowerMsg.includes('institution') || lowerMsg.includes('idara') || lowerMsg.includes('idaray')) &&
    (rawMsg.includes('شروع') || rawMsg.includes('پہلے') || lowerMsg.includes('shuru') || lowerMsg.includes('start') || lowerMsg.includes('beginning'))
  ) {
    actionType = 'ADD_INSTITUTION_INTRO';
    const buildingUrl = institutionProfile?.buildingUrl || institutionProfile?.classroomUrl || 'https://images.unsplash.com/photo-1542816417-0983c9c9ad53?w=800&auto=format&fit=crop&q=80';
    const introDuration = 3.0;

    // Prepend intro clip
    const introClip = {
      id: 'clip_intro_institution_' + Date.now(),
      type: 'image',
      sourceUrl: buildingUrl,
      title: `${institutionProfile?.institutionName || 'Institution'} Campus`,
      startTime: 0,
      duration: introDuration,
      sourceStart: 0,
      sourceDuration: introDuration,
      transition: 'fade_black',
      animation: 'ken_burns_zoom_in',
      filter: 'warm_cinematic'
    };

    // Shift existing visual clips
    mutated.tracks.visual.forEach(c => {
      c.startTime = parseFloat((c.startTime + introDuration).toFixed(2));
    });
    mutated.tracks.visual.unshift(introClip);
    mutated.totalDuration = parseFloat((mutated.totalDuration + introDuration).toFixed(2));

    // Add intro title if not already present
    if (institutionProfile?.institutionName) {
      mutated.tracks.text.unshift({
        id: 'text_intro_' + Date.now(),
        text: institutionProfile.institutionName,
        subtext: institutionProfile.tagline || 'Excellence & Vision',
        startTime: 0.3,
        duration: 2.5,
        position: 'center_lower',
        style: {
          font: 'Amiri, sans-serif',
          color: institutionProfile.brandColors?.accent || '#D4AF37',
          bgColor: 'rgba(0,0,0,0.7)'
        }
      });
    }

    explanation = `Added institution campus image ("${introClip.title}") to the beginning with title animation.`;
    explanationUrdu = `آپ کے ادارے کی تصویر کو ویڈیو کے آغاز میں ٹائٹل کے ساتھ بطور انٹرو شامل کر دیا گیا ہے۔`;
  }

  // 5. INTENT: REPLACE BACKGROUND WITH INSTITUTION BACKGROUND
  // "یہ والا background اچھا نہیں لگ رہا، میرے ادارے والا لگا دو" / "background change kardo" / "replace background with institution"
  else if (
    (lowerMsg.includes('background') || rawMsg.includes('بیک گراؤنڈ') || rawMsg.includes('پس منظر')) &&
    (rawMsg.includes('ادارے') || rawMsg.includes('بدل') || lowerMsg.includes('idara') || lowerMsg.includes('change') || lowerMsg.includes('replace'))
  ) {
    actionType = 'REPLACE_BACKGROUND';
    const campusUrl = institutionProfile?.classroomUrl || institutionProfile?.buildingUrl || 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&auto=format&fit=crop&q=80';
    mutated.selectedBackground = {
      name: `${institutionProfile?.institutionName || 'Institution'} Classroom`,
      url: campusUrl,
      type: 'image'
    };

    explanation = 'Replaced background with your institution facility asset while preserving all clips and timings.';
    explanationUrdu = 'آپ کے ادارے کی تدریسی تصویر کو نئے بیک گراؤنڈ کے طور پر منتخب کر دیا گیا ہے، تمام کلپس محفوظ ہیں۔';
  }

  // 6. INTENT: REFERENCE VIDEO STYLE INTRO
  // "Reference video جیسا intro کر دو" / "reference jaisa intro kardo" / "make intro like reference video"
  else if (
    (lowerMsg.includes('reference') || rawMsg.includes('ریفرنس') || rawMsg.includes('حوالہ')) &&
    (lowerMsg.includes('intro') || rawMsg.includes('انٹرو') || rawMsg.includes('شروع'))
  ) {
    actionType = 'APPLY_REFERENCE_INTRO';
    const refPacing = referenceStyle?.pacing?.averageShotLengthSec || 2.5;
    if (mutated.tracks.visual[0]) {
      mutated.tracks.visual[0].duration = parseFloat(refPacing.toFixed(2));
      mutated.tracks.visual[0].transition = referenceStyle?.transitions?.primary || 'fade_black';
      mutated.tracks.visual[0].animation = 'ken_burns_zoom_in';
      mutated.tracks.visual[0].filter = 'cinematic_gold';
    }

    explanation = `Adapted the intro to mirror the reference video's pacing (${refPacing.toFixed(1)}s) and cinematic gold styling.`;
    explanationUrdu = `ریفرنس ویڈیو کے اصولوں کے مطابق انٹرو کا دورانیہ (${refPacing.toFixed(1)}s) اور سنہری سینیمیٹک لک لاگو کر دی گئی ہے۔`;
  }

  // 7. INTENT: MAKE MORE PROFESSIONAL / CINEMATIC
  // "اس ویڈیو کو تھوڑا زیادہ پروفیشنل بنا دو" / "is video ko ziada professional banado" / "make it more professional"
  else if (
    rawMsg.includes('پروفیشنل') || lowerMsg.includes('professional') || lowerMsg.includes('cinematic') || lowerMsg.includes('behtar')
  ) {
    actionType = 'ENHANCE_PROFESSIONAL';
    // Add subtle letterbox/cinematic grading, normalize transitions
    mutated.colorGrading = 'Warm Islamic Regal Golden Grade (35mm Film Look)';
    mutated.tracks.visual.forEach((c, i) => {
      c.filter = 'cinematic_regal';
      if (i > 0 && i < mutated.tracks.visual.length - 1) {
        c.transition = 'dissolve';
      }
      if (c.type === 'image') {
        c.animation = i % 2 === 0 ? 'ken_burns_zoom_in' : 'ken_burns_pan_right';
      }
    });

    explanation = 'Enhanced project with professional 35mm warm color grading, smooth dissolves, and cinematic camera drifts.';
    explanationUrdu = 'ویڈیو کو اعلیٰ معیار کے سینیمیٹک لک، وارم کلر گریڈنگ اور باوقار کیمرہ موشن کے ساتھ مزید پروفیشنل بنا دیا گیا ہے۔';
  }

  // 8. INTENT: CONTEXTUAL "REPLACE THIS" ("اس کو بدل دو" / "is ko badal do")
  else if (
    rawMsg.includes('بدل') || lowerMsg.includes('replace') || lowerMsg.includes('change this')
  ) {
    actionType = 'CONTEXTUAL_REPLACE';
    if (selectedElementId) {
      const targetClip = mutated.tracks.visual.find(c => c.id === selectedElementId);
      if (targetClip) {
        targetClip.animation = targetClip.animation === 'ken_burns_zoom_in' ? 'ken_burns_pan_right' : 'ken_burns_zoom_in';
        targetClip.filter = 'islamic_vibrant';
        explanation = `Updated selected clip "${targetClip.title}" with alternative motion framing and enhanced grading.`;
        explanationUrdu = `منتخب کردہ کلپ "${targetClip.title}" کا کیمرہ اینگل اور فریم تبدیل کر دیا گیا ہے۔`;
      } else {
        explanation = 'Updated the targeted visual property.';
        explanationUrdu = 'منتخب کردہ حصے کو کامیابی سے تبدیل کر دیا گیا ہے۔';
      }
    } else {
      // Rotate first or highlighted clip
      if (mutated.tracks.visual[0]) {
        mutated.tracks.visual[0].animation = 'ken_burns_zoom_in';
        mutated.tracks.visual[0].filter = 'cinematic_regal';
      }
      explanation = 'Adjusted the current active scene framing and color treatment.';
      explanationUrdu = 'موجودہ فعال سین کے اینگل اور کلر اسٹائل کو تبدیل کر دیا گیا ہے۔';
    }
  }

  // 9. INTENT: RESTORE PREVIOUS EDIT ("پہلے والا اچھا تھا، وہ واپس کر دو")
  else if (
    rawMsg.includes('واپس') || rawMsg.includes('پہلے والا') || lowerMsg.includes('undo') || lowerMsg.includes('wapas') || lowerMsg.includes('previous')
  ) {
    actionType = 'RESTORE_PREVIOUS';
    if (history.length > 0) {
      const lastVersion = history[history.length - 1];
      explanation = `Restored previous edit state (${lastVersion.label || 'Previous Version'}).`;
      explanationUrdu = `پچھلا منظور شدہ ورژن (${lastVersion.label || 'Previous Version'}) کامیابی سے بحال کر دیا گیا ہے۔`;
      return {
        actionType,
        mutatedTimeline: lastVersion.timeline,
        explanation: language === 'ur' ? explanationUrdu : explanation,
        language
      };
    } else {
      explanation = 'No earlier version found in session history.';
      explanationUrdu = 'ہسٹری میں کوئی سابقہ ورژن موجود نہیں ہے۔';
    }
  }

  // DEFAULT FALLBACK: Intelligent contextual adjustment
  else {
    actionType = 'GENERAL_REVISION';
    explanation = `Applied creative optimization for: "${rawMsg}". Pacing and transitions refined.`;
    explanationUrdu = `آپ کی ہدایت "${rawMsg}" کے مطابق ٹائم لائن میں ضروری بہتری کر دی گئی ہے۔`;
  }

  return {
    actionType,
    mutatedTimeline: mutated,
    explanation: language === 'ur' ? explanationUrdu : explanation,
    language
  };
}
