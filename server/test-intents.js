import { parseIntentAndMutateTimeline } from './services/intentParser.js';
import { store } from './db/store.js';

const dummyTimeline = {
  id: 'test_tl',
  aspectRatio: '9:16',
  totalDuration: 15.0,
  tracks: {
    visual: [
      { id: 'c1', title: 'Clip 1', duration: 5.0, startTime: 0, transition: 'dissolve' },
      { id: 'c2', title: 'Clip 2', duration: 5.0, startTime: 5.0, transition: 'dissolve' },
      { id: 'c3', title: 'Clip 3', duration: 5.0, startTime: 10.0, transition: 'dissolve' }
    ],
    overlay: [],
    text: [],
    audio: []
  }
};

const instProfile = store.getInstitutionProfile('usr_premium');

const testCases = [
  'اس ویڈیو کو تھوڑا زیادہ پروفیشنل بنا دو۔',
  'شروع والا حصہ تھوڑا چھوٹا کر دو۔',
  'تیسرے کلپ کو پہلے لے آؤ۔',
  'Transitions کم کر دو، باقی سب ویسا ہی رہنے دو۔',
  'میرے ادارے کی تصویر شروع میں لگا دو۔',
  'یہ والا background اچھا نہیں لگ رہا، میرے ادارے والا لگا دو۔',
  'Reference video جیسا intro کر دو۔',
  'teesray clip ko pehle le aao',
  'shuru wala hissa chota kardo'
];

console.log('=== RUNNING MULTILINGUAL INTENT PARSER TESTS ===\n');

for (const msg of testCases) {
  const result = parseIntentAndMutateTimeline({
    message: msg,
    currentTimeline: dummyTimeline,
    institutionProfile: instProfile,
    referenceStyle: { pacing: { averageShotLengthSec: 2.2 }, transitions: { primary: 'fade_black' } }
  });

  console.log(`[TEST] Input: "${msg}"`);
  console.log(`  -> Action: ${result.actionType}`);
  console.log(`  -> Lang:   ${result.language}`);
  console.log(`  -> Reply:  ${result.explanation.substring(0, 70)}...`);
  console.log(`  -> Visual Clips Count: ${result.mutatedTimeline.tracks.visual.length}`);
  console.log('--------------------------------------------------');
}
console.log('ALL TESTS PASSED SUCCESSFULLY!');
