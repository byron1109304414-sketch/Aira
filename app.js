/* ====================================================
   AIRA TRAINING TRACKER V4 — APP.JS
   Controlled rebuild. Modular domains.
   ==================================================== */
;(()=>{
'use strict';

// ================================================================
// 1. CONSTANTS
// ================================================================
const APP_VERSION='4.0.0';
const APP_KEY='aira_tracker_v4';
const DRAFT_KEY='aira_tracker_v4_draft';
const V3_APP_KEY='aira_tracker_v3';
const V3_DRAFT_KEY='aira_tracker_v3_draft_workout';
// --- Client Coaching Module v1 (Step 1: data layer skeleton) — fully isolated from personal domain ---
const COACH_KEY='aira_coaching_v1';
const COACH_DRAFT_KEY='aira_coaching_v1_draft';
const CDB_VERSION='1.0.0';
const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>[...r.querySelectorAll(s)];

// ================================================================
// 2. UTILS
// ================================================================
const Utils={
  uid(p='id'){return p+'_'+Math.random().toString(36).slice(2,9)+Date.now().toString(36).slice(-4)},
  today(offset=0){const d=new Date();d.setDate(d.getDate()+offset);return d.toISOString().slice(0,10)},
  formatDate(s){if(!s)return'—';const d=new Date(s+'T00:00:00');if(isNaN(d))return s;return new Intl.DateTimeFormat('zh-Hant-TW',{month:'short',day:'numeric',weekday:'short'}).format(d)},
  formatDateTime(ts){const d=new Date(ts);if(isNaN(d))return'—';return new Intl.DateTimeFormat('zh-Hant-TW',{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'}).format(d)},
  formatDuration(sec){sec=Math.max(0,Math.round(sec||0));const h=Math.floor(sec/3600),m=Math.floor((sec%3600)/60),s=sec%60;return h>0?`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`:`${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`},
  clamp(n,min,max){return Math.min(max,Math.max(min,n))},
  text(s=''){return String(s??'').trim()},
  copy(o){return JSON.parse(JSON.stringify(o))},
  escape(s=''){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))},
  download(fn,txt,type='application/json'){const b=new Blob([txt],{type});const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=fn;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),1200)},
  weekStart(ds){const d=new Date(ds+'T00:00:00');const day=d.getDay();const diff=d.getDate()-day+(day===0?-6:1);d.setDate(diff);return d.toISOString().slice(0,10)},
  weekEnd(s){const d=new Date(s+'T00:00:00');d.setDate(d.getDate()+6);return d.toISOString().slice(0,10)},
  dateFromTs(ts){return new Date(ts).toISOString().slice(0,10)},
  copyText(text){if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(text).then(()=>Toast.show('已複製到剪貼簿')).catch(()=>Toast.show('複製失敗'))}else{const t=document.createElement('textarea');t.value=text;t.style.cssText='position:fixed;opacity:0';document.body.appendChild(t);t.select();try{document.execCommand('copy');Toast.show('已複製到剪貼簿')}catch{Toast.show('複製失敗')}t.remove()}}
};

// ================================================================
// 3. EXERCISE REGISTRY (canonical keys)
// ================================================================
const EXERCISE_REGISTRY=[
  // === PUSH ===
  {key:'barbell_bench_press',labelEn:'Barbell Bench Press',labelZh:'槓鈴臥推',category:'Push',equipment:'Barbell',classKey:'compound_upper'},
  {key:'incline_dumbbell_press',labelEn:'Incline Dumbbell Press',labelZh:'上斜啞鈴臥推',category:'Push',equipment:'Dumbbell',classKey:'compound_upper'},
  {key:'flat_dumbbell_press',labelEn:'Flat Dumbbell Press',labelZh:'啞鈴臥推',category:'Push',equipment:'Dumbbell',classKey:'compound_upper'},
  {key:'machine_chest_press',labelEn:'Machine Chest Press',labelZh:'器械胸推',category:'Push',equipment:'Machine',classKey:'compound_upper'},
  {key:'incline_machine_press',labelEn:'Incline Machine Press',labelZh:'上斜器械胸推',category:'Push',equipment:'Machine',classKey:'compound_upper'},
  {key:'smith_bench_press',labelEn:'Smith Bench Press',labelZh:'史密斯臥推',category:'Push',equipment:'Machine',classKey:'compound_upper'},
  {key:'smith_incline_press',labelEn:'Smith Incline Press',labelZh:'史密斯上斜胸推',category:'Push',equipment:'Machine',classKey:'compound_upper'},
  {key:'chest_press_neutral',labelEn:'Chest Press Machine Neutral Grip',labelZh:'中立握器械胸推',category:'Push',equipment:'Machine',classKey:'compound_upper'},
  {key:'cable_fly',labelEn:'Cable Fly',labelZh:'滑輪夾胸',category:'Push',equipment:'Cable',classKey:'accessory'},
  {key:'machine_fly',labelEn:'Machine Fly',labelZh:'飛鳥機',category:'Push',equipment:'Machine',classKey:'accessory'},
  {key:'pec_deck_fly',labelEn:'Pec Deck Fly',labelZh:'夾胸機飛鳥',category:'Push',equipment:'Machine',classKey:'accessory'},
  {key:'overhead_press',labelEn:'Overhead Press',labelZh:'槓鈴肩推',category:'Push',equipment:'Barbell',classKey:'compound_upper'},
  {key:'machine_shoulder_press',labelEn:'Machine Shoulder Press',labelZh:'器械肩推',category:'Push',equipment:'Machine',classKey:'compound_upper'},
  {key:'dumbbell_shoulder_press',labelEn:'Dumbbell Shoulder Press',labelZh:'啞鈴肩推',category:'Push',equipment:'Dumbbell',classKey:'compound_upper'},
  {key:'seated_dumbbell_shoulder_press',labelEn:'Seated Dumbbell Shoulder Press',labelZh:'坐姿啞鈴肩推',category:'Push',equipment:'Dumbbell',classKey:'compound_upper'},
  {key:'seated_machine_shoulder_press',labelEn:'Seated Machine Shoulder Press',labelZh:'坐姿器械肩推',category:'Push',equipment:'Machine',classKey:'compound_upper'},
  {key:'smith_shoulder_press',labelEn:'Smith Shoulder Press',labelZh:'史密斯肩推',category:'Push',equipment:'Machine',classKey:'compound_upper'},
  {key:'lateral_raise',labelEn:'Lateral Raise',labelZh:'側平舉',category:'Push',equipment:'Dumbbell',classKey:'accessory'},
  {key:'cable_lateral_raise',labelEn:'Cable Lateral Raise',labelZh:'滑輪側平舉',category:'Push',equipment:'Cable',classKey:'accessory'},
  {key:'front_raise',labelEn:'Front Raise',labelZh:'前平舉',category:'Push',equipment:'Dumbbell',classKey:'accessory'},
  {key:'triceps_pushdown',labelEn:'Triceps Pushdown',labelZh:'滑輪三頭下壓',category:'Push',equipment:'Cable',classKey:'accessory'},
  {key:'rope_pushdown',labelEn:'Rope Pushdown',labelZh:'繩索下壓',category:'Push',equipment:'Cable',classKey:'accessory'},
  {key:'straight_bar_pushdown',labelEn:'Straight Bar Pushdown',labelZh:'直槓下壓',category:'Push',equipment:'Cable',classKey:'accessory'},
  {key:'overhead_triceps_extension',labelEn:'Overhead Triceps Extension',labelZh:'過頭三頭伸展',category:'Push',equipment:'Cable',classKey:'accessory'},
  {key:'lying_triceps_extension',labelEn:'Lying Triceps Extension',labelZh:'仰臥三頭伸展',category:'Push',equipment:'Barbell',classKey:'accessory'},
  {key:'weighted_dip',labelEn:'Weighted Dip',labelZh:'負重雙槓撐體',category:'Push',equipment:'Bodyweight',classKey:'compound_upper'},
  {key:'assisted_dip',labelEn:'Assisted Dip',labelZh:'輔助雙槓撐體',category:'Push',equipment:'Machine',classKey:'compound_upper'},
  {key:'push_up',labelEn:'Push Up',labelZh:'伏地挺身',category:'Push',equipment:'Bodyweight',classKey:'compound_upper'},
  {key:'decline_push_up',labelEn:'Decline Push Up',labelZh:'下斜伏地挺身',category:'Push',equipment:'Bodyweight',classKey:'compound_upper'},
  // === PULL ===
  {key:'pull_up',labelEn:'Pull Up',labelZh:'引體向上',category:'Pull',equipment:'Bodyweight',classKey:'compound_upper'},
  {key:'assisted_pull_up',labelEn:'Assisted Pull Up',labelZh:'輔助引體向上',category:'Pull',equipment:'Machine',classKey:'compound_upper'},
  {key:'lat_pulldown',labelEn:'Lat Pulldown',labelZh:'高位下拉',category:'Pull',equipment:'Cable',classKey:'compound_upper'},
  {key:'wide_grip_lat_pulldown',labelEn:'Wide Grip Lat Pulldown',labelZh:'寬握下拉',category:'Pull',equipment:'Cable',classKey:'compound_upper'},
  {key:'close_grip_lat_pulldown',labelEn:'Close Grip Lat Pulldown',labelZh:'窄握下拉',category:'Pull',equipment:'Cable',classKey:'compound_upper'},
  {key:'reverse_grip_lat_pulldown',labelEn:'Reverse Grip Lat Pulldown',labelZh:'反握下拉',category:'Pull',equipment:'Cable',classKey:'compound_upper'},
  {key:'straight_arm_pulldown',labelEn:'Straight Arm Pulldown',labelZh:'直臂下拉',category:'Pull',equipment:'Cable',classKey:'accessory'},
  {key:'chest_supported_row',labelEn:'Chest Supported Row',labelZh:'胸托划船',category:'Pull',equipment:'Machine',classKey:'compound_upper'},
  {key:'seated_cable_row',labelEn:'Seated Cable Row',labelZh:'坐姿划船',category:'Pull',equipment:'Cable',classKey:'compound_upper'},
  {key:'cable_row',labelEn:'Cable Row',labelZh:'滑輪划船',category:'Pull',equipment:'Cable',classKey:'compound_upper'},
  {key:'barbell_row',labelEn:'Barbell Row',labelZh:'槓鈴划船',category:'Pull',equipment:'Barbell',classKey:'compound_upper'},
  {key:'t_bar_row',labelEn:'T-Bar Row',labelZh:'T槓划船',category:'Pull',equipment:'Barbell',classKey:'compound_upper'},
  {key:'single_arm_dumbbell_row',labelEn:'Single Arm Dumbbell Row',labelZh:'單臂啞鈴划船',category:'Pull',equipment:'Dumbbell',classKey:'compound_upper'},
  {key:'machine_row',labelEn:'Machine Row',labelZh:'器械划船',category:'Pull',equipment:'Machine',classKey:'compound_upper'},
  {key:'face_pull',labelEn:'Face Pull',labelZh:'面拉',category:'Pull',equipment:'Cable',classKey:'accessory'},
  {key:'rear_delt_fly',labelEn:'Rear Delt Fly',labelZh:'反向飛鳥',category:'Pull',equipment:'Machine',classKey:'accessory'},
  {key:'reverse_pec_deck',labelEn:'Reverse Pec Deck',labelZh:'反向夾胸機',category:'Pull',equipment:'Machine',classKey:'accessory'},
  {key:'barbell_curl',labelEn:'Barbell Curl',labelZh:'槓鈴彎舉',category:'Pull',equipment:'Barbell',classKey:'accessory'},
  {key:'ez_bar_curl',labelEn:'EZ Bar Curl',labelZh:'EZ槓彎舉',category:'Pull',equipment:'Barbell',classKey:'accessory'},
  {key:'cable_curl',labelEn:'Cable Curl',labelZh:'滑輪彎舉',category:'Pull',equipment:'Cable',classKey:'accessory'},
  {key:'preacher_curl',labelEn:'Preacher Curl',labelZh:'牧師椅彎舉',category:'Pull',equipment:'Machine',classKey:'accessory'},
  {key:'concentration_curl',labelEn:'Concentration Curl',labelZh:'集中彎舉',category:'Pull',equipment:'Dumbbell',classKey:'accessory'},
  {key:'incline_dumbbell_curl',labelEn:'Incline Dumbbell Curl',labelZh:'上斜啞鈴彎舉',category:'Pull',equipment:'Dumbbell',classKey:'accessory'},
  {key:'hammer_curl',labelEn:'Hammer Curl',labelZh:'槌式彎舉',category:'Pull',equipment:'Dumbbell',classKey:'accessory'},
  {key:'conventional_deadlift',labelEn:'Conventional Deadlift',labelZh:'傳統硬舉',category:'Pull',equipment:'Barbell',classKey:'compound_lower'},
  {key:'sumo_deadlift',labelEn:'Sumo Deadlift',labelZh:'相撲硬舉',category:'Pull',equipment:'Barbell',classKey:'compound_lower'},
  // === LEGS ===
  {key:'back_squat',labelEn:'Back Squat',labelZh:'槓鈴深蹲',category:'Legs',equipment:'Barbell',classKey:'compound_lower'},
  {key:'front_squat',labelEn:'Front Squat',labelZh:'槓鈴前蹲',category:'Legs',equipment:'Barbell',classKey:'compound_lower'},
  {key:'smith_squat',labelEn:'Smith Squat',labelZh:'史密斯深蹲',category:'Legs',equipment:'Machine',classKey:'compound_lower'},
  {key:'hack_squat',labelEn:'Hack Squat',labelZh:'駭客深蹲',category:'Legs',equipment:'Machine',classKey:'compound_lower'},
  {key:'leg_press',labelEn:'Leg Press',labelZh:'腿推',category:'Legs',equipment:'Machine',classKey:'compound_lower'},
  {key:'romanian_deadlift',labelEn:'Romanian Deadlift',labelZh:'羅馬尼亞硬舉',category:'Legs',equipment:'Barbell',classKey:'compound_lower'},
  {key:'bulgarian_split_squat',labelEn:'Bulgarian Split Squat',labelZh:'保加利亞分腿蹲',category:'Legs',equipment:'Dumbbell',classKey:'compound_lower'},
  {key:'smith_split_squat',labelEn:'Smith Split Squat',labelZh:'史密斯分腿蹲',category:'Legs',equipment:'Machine',classKey:'compound_lower'},
  {key:'split_squat',labelEn:'Split Squat',labelZh:'分腿蹲',category:'Legs',equipment:'Bodyweight',classKey:'compound_lower'},
  {key:'walking_lunge',labelEn:'Walking Lunge',labelZh:'行走弓箭步',category:'Legs',equipment:'Dumbbell',classKey:'compound_lower'},
  {key:'walking_db_lunge',labelEn:'Walking Dumbbell Lunge',labelZh:'啞鈴行走弓箭步',category:'Legs',equipment:'Dumbbell',classKey:'compound_lower'},
  {key:'reverse_lunge',labelEn:'Reverse Lunge',labelZh:'反向弓箭步',category:'Legs',equipment:'Dumbbell',classKey:'compound_lower'},
  {key:'step_up',labelEn:'Step Up',labelZh:'箱上登階',category:'Legs',equipment:'Dumbbell',classKey:'compound_lower'},
  {key:'hip_thrust',labelEn:'Hip Thrust',labelZh:'臀推',category:'Legs',equipment:'Barbell',classKey:'compound_lower'},
  {key:'smith_hip_thrust',labelEn:'Smith Hip Thrust',labelZh:'史密斯臀推',category:'Legs',equipment:'Machine',classKey:'compound_lower'},
  {key:'glute_bridge',labelEn:'Glute Bridge',labelZh:'臀橋',category:'Legs',equipment:'Bodyweight',classKey:'compound_lower'},
  {key:'leg_extension',labelEn:'Leg Extension',labelZh:'腿伸展',category:'Legs',equipment:'Machine',classKey:'accessory'},
  {key:'leg_curl',labelEn:'Leg Curl',labelZh:'腿後勾',category:'Legs',equipment:'Machine',classKey:'accessory'},
  {key:'hip_abduction_machine',labelEn:'Hip Abduction Machine',labelZh:'髖外展機',category:'Legs',equipment:'Machine',classKey:'accessory'},
  {key:'hip_adduction_machine',labelEn:'Hip Adduction Machine',labelZh:'髖內收機',category:'Legs',equipment:'Machine',classKey:'accessory'},
  {key:'calf_raise',labelEn:'Calf Raise',labelZh:'提踵',category:'Legs',equipment:'Machine',classKey:'accessory'},
  {key:'seated_calf_raise',labelEn:'Seated Calf Raise',labelZh:'坐姿提踵',category:'Legs',equipment:'Machine',classKey:'accessory'},
  {key:'standing_calf_raise',labelEn:'Standing Calf Raise',labelZh:'站姿提踵',category:'Legs',equipment:'Machine',classKey:'accessory'},
  {key:'back_extension',labelEn:'Back Extension',labelZh:'背部伸展',category:'Legs',equipment:'Bodyweight',classKey:'accessory'},
  // === CORE ===
  {key:'cable_crunch',labelEn:'Cable Crunch',labelZh:'滑輪捲腹',category:'Core',equipment:'Cable',classKey:'core'},
  {key:'crunch',labelEn:'Crunch',labelZh:'捲腹',category:'Core',equipment:'Bodyweight',classKey:'core'},
  {key:'hanging_leg_raise',labelEn:'Hanging Leg Raise',labelZh:'懸垂抬腿',category:'Core',equipment:'Bodyweight',classKey:'core'},
  {key:'lying_leg_raise',labelEn:'Lying Leg Raise',labelZh:'仰臥抬腿',category:'Core',equipment:'Bodyweight',classKey:'core'},
  {key:'plank',labelEn:'Plank',labelZh:'平板撐',category:'Core',equipment:'Bodyweight',classKey:'core'},
  {key:'side_plank',labelEn:'Side Plank',labelZh:'側平板撐',category:'Core',equipment:'Bodyweight',classKey:'core'},
  {key:'russian_twist',labelEn:'Russian Twist',labelZh:'俄羅斯轉體',category:'Core',equipment:'Bodyweight',classKey:'core'},
  {key:'dead_bug',labelEn:'Dead Bug',labelZh:'死蟲',category:'Core',equipment:'Bodyweight',classKey:'core'},
  // === FULL BODY ===
  {key:'farmer_carry',labelEn:'Farmer Carry',labelZh:'農夫走路',category:'Full Body',equipment:'Dumbbell',classKey:'full_body'},
  {key:'trap_bar_deadlift',labelEn:'Trap Bar Deadlift',labelZh:'六角槓硬舉',category:'Full Body',equipment:'Barbell',classKey:'compound_lower'},
  {key:'goblet_squat',labelEn:'Goblet Squat',labelZh:'高腳杯深蹲',category:'Full Body',equipment:'Dumbbell',classKey:'compound_lower'},
  // === CARDIO ===
  {key:'stepper',labelEn:'Stepper',labelZh:'登階機',category:'Cardio',equipment:'Machine',classKey:'cardio'},
  {key:'stair_climber',labelEn:'Stair Climber',labelZh:'Stair Climber',category:'Cardio',equipment:'Machine',classKey:'cardio'},
  {key:'treadmill_run',labelEn:'Treadmill Run',labelZh:'跑步機跑步',category:'Cardio',equipment:'Machine',classKey:'cardio'},
  {key:'treadmill_walk',labelEn:'Treadmill Walk',labelZh:'跑步機快走',category:'Cardio',equipment:'Machine',classKey:'cardio'},
  {key:'treadmill_jog',labelEn:'Treadmill Jog',labelZh:'跑步機慢跑',category:'Cardio',equipment:'Machine',classKey:'cardio'},
  {key:'outdoor_run',labelEn:'Outdoor Run',labelZh:'室外跑步',category:'Cardio',equipment:'Bodyweight',classKey:'cardio'},
  {key:'outdoor_walk',labelEn:'Outdoor Walk',labelZh:'室外快走',category:'Cardio',equipment:'Bodyweight',classKey:'cardio'},
  {key:'bike',labelEn:'Bike',labelZh:'健身車',category:'Cardio',equipment:'Machine',classKey:'cardio'},
  {key:'elliptical',labelEn:'Elliptical',labelZh:'橢圓機',category:'Cardio',equipment:'Machine',classKey:'cardio'},
  {key:'rower',labelEn:'Rower',labelZh:'划船機',category:'Cardio',equipment:'Machine',classKey:'cardio'},
  {key:'walking',labelEn:'Walking',labelZh:'步行',category:'Cardio',equipment:'Bodyweight',classKey:'cardio'},
  // === LIBRARY EXPANSION v1 ===
  {key:'decline_barbell_bench_press',labelEn:'Decline Barbell Bench Press',labelZh:'下斜槓鈴臥推',category:'Push',equipment:'Barbell',classKey:'compound_upper',aliases:['decline bench','下斜臥推','下胸','lower chest']},
  {key:'decline_dumbbell_press',labelEn:'Decline Dumbbell Press',labelZh:'下斜啞鈴臥推',category:'Push',equipment:'Dumbbell',classKey:'compound_upper',aliases:['decline db press','下斜啞鈴','lower chest db']},
  {key:'decline_smith_press',labelEn:'Decline Smith Press',labelZh:'下斜史密斯臥推',category:'Push',equipment:'Machine',classKey:'compound_upper',aliases:['decline smith','下斜史密斯']},
  {key:'decline_machine_press',labelEn:'Decline Machine Chest Press',labelZh:'下斜器械胸推',category:'Push',equipment:'Machine',classKey:'compound_upper',aliases:['decline machine','下斜器械','下胸器械']},
  {key:'high_to_low_cable_fly',labelEn:'High to Low Cable Fly',labelZh:'高往低滑輪夾胸',category:'Push',equipment:'Cable',classKey:'accessory',aliases:['high-to-low fly','高拉低夾胸','下胸夾胸']},
  {key:'single_arm_high_to_low_cable_fly',labelEn:'Single Arm High to Low Cable Fly',labelZh:'單臂高往低滑輪夾胸',category:'Push',equipment:'Cable',classKey:'accessory',aliases:['single arm cable fly','單臂夾胸','單手夾胸']},
  {key:'chest_dip',labelEn:'Chest Dip',labelZh:'胸部雙槓撐體',category:'Push',equipment:'Bodyweight',classKey:'compound_upper',aliases:['dip','chest-focused dip','下胸撐體','雙槓']},
  {key:'assisted_chest_dip',labelEn:'Assisted Chest Dip',labelZh:'輔助胸部雙槓撐體',category:'Push',equipment:'Machine',classKey:'compound_upper',aliases:['assisted dip','輔助雙槓','輔助胸撐']},
  {key:'pendlay_row',labelEn:'Pendlay Row',labelZh:'Pendlay 划船',category:'Pull',equipment:'Barbell',classKey:'compound_upper',aliases:['pendlay','explosive row','爆發划船','從地板划船']},
  {key:'meadows_row',labelEn:'Meadows Row',labelZh:'Meadows 划船',category:'Pull',equipment:'Barbell',classKey:'compound_upper',aliases:['meadows','single arm t-bar','梅鐸划船']},
  {key:'inverted_row',labelEn:'Inverted Row',labelZh:'反向划船',category:'Pull',equipment:'Bodyweight',classKey:'compound_upper',aliases:['body row','horizontal pull up','TRX row','倒立划船']},
  {key:'arnold_press',labelEn:'Arnold Press',labelZh:'阿諾肩推',category:'Push',equipment:'Dumbbell',classKey:'compound_upper',aliases:['arnold','阿諾推舉','旋轉肩推']},
  {key:'upright_row',labelEn:'Upright Row',labelZh:'直立划船',category:'Push',equipment:'Barbell',classKey:'accessory',aliases:['前平拉','直立拉','upright pull']},
  {key:'reverse_cable_fly',labelEn:'Reverse Cable Fly',labelZh:'反向滑輪飛鳥',category:'Pull',equipment:'Cable',classKey:'accessory',aliases:['cable rear delt fly','反飛鳥','滑輪反向飛鳥']},
  {key:'nordic_curl',labelEn:'Nordic Curl',labelZh:'北歐腿彎舉',category:'Legs',equipment:'Bodyweight',classKey:'accessory',aliases:['nordic hamstring curl','北歐勾腿','腿後北歐']},
  {key:'single_leg_press',labelEn:'Single Leg Press',labelZh:'單腿推',category:'Legs',equipment:'Machine',classKey:'compound_lower',aliases:['one leg press','unilateral leg press','單腳腿推']},
  {key:'cossack_squat',labelEn:'Cossack Squat',labelZh:'哥薩克蹲',category:'Legs',equipment:'Bodyweight',classKey:'compound_lower',aliases:['cossack','側蹲','lateral squat']},
  {key:'skull_crusher',labelEn:'Skull Crusher',labelZh:'顱骨粉碎者',category:'Push',equipment:'Barbell',classKey:'accessory',aliases:['lying triceps extension','french press','骷髏碎','三頭碎']},
  {key:'spider_curl',labelEn:'Spider Curl',labelZh:'蜘蛛彎舉',category:'Pull',equipment:'Dumbbell',classKey:'accessory',aliases:['spider','prone curl','趴姿彎舉']},
  {key:'reverse_curl',labelEn:'Reverse Curl',labelZh:'反握彎舉',category:'Pull',equipment:'Barbell',classKey:'accessory',aliases:['reverse grip curl','overhand curl','正握彎舉','前臂彎舉']},
  {key:'pallof_press',labelEn:'Pallof Press',labelZh:'Pallof 推',category:'Core',equipment:'Cable',classKey:'core',aliases:['pallof','抗旋轉','anti-rotation','抗旋推']},
  {key:'ab_wheel',labelEn:'Ab Wheel Rollout',labelZh:'健腹輪',category:'Core',equipment:'Bodyweight',classKey:'core',aliases:['ab rollout','滾輪','rollout','腹輪']},
  {key:'hollow_hold',labelEn:'Hollow Hold',labelZh:'空心撐',category:'Core',equipment:'Bodyweight',classKey:'core',aliases:['hollow body','hollow position','空心棒','空心姿']}
];
const EX_BY_KEY={},EX_BY_NAME={};
EXERCISE_REGISTRY.forEach(e=>{EX_BY_KEY[e.key]=e;EX_BY_NAME[e.labelEn]=e});

function resolveKey(nameOrKey){
  if(EX_BY_KEY[nameOrKey])return nameOrKey;
  const bn=EX_BY_NAME[nameOrKey];if(bn)return bn.key;
  return String(nameOrKey).toLowerCase().replace(/[^a-z0-9]+/g,'_').replace(/^_|_$/g,'')||nameOrKey;
}
function exLabel(k){const d=EX_BY_KEY[k];if(d)return`${d.labelEn}｜${d.labelZh}`;const bn=EX_BY_NAME[k];if(bn)return`${bn.labelEn}｜${bn.labelZh}`;return k}
function exDef(k){return EX_BY_KEY[k]||EX_BY_NAME[k]||null}
function exDisplayName(ex){const k=ex.exerciseKey||resolveKey(ex.name||'');const lb=exLabel(k);if(lb!==k)return lb;return ex._v3Name||ex.name||k}
// NOTE: MOVEMENT_PATTERN_MAP is defined later in the file. It's referenced
// here safely because exMatchesQuery is only called at runtime (never at
// module init).
const EX_SEARCH_SYNONYMS={
  '上半身':['push','pull','upper'],'下半身':['squat','hinge','legs','lower'],
  '推':['push'],'拉':['pull'],'腿':['legs'],'胸':['push','chest'],
  '背':['pull','back'],'肩':['shoulder','vertical_push'],'臀':['hinge','glute'],
  '腿後側':['leg_curl','hinge'],'腿前側':['leg_extension','squat'],
  '核心':['core','anti_extension','anti_rotation'],'恢復':['recovery','cardio']
};
function exMatchesQuery(x,q){
  if(!q)return true;
  const pat=(typeof MOVEMENT_PATTERN_MAP!=='undefined'&&MOVEMENT_PATTERN_MAP[x.key])||'';
  const blob=[x.labelEn,x.labelZh,x.key,(x.aliases||[]).join(' '),x.category,x.equipment,pat].join(' ').toLowerCase();
  if(blob.includes(q))return true;
  const syn=EX_SEARCH_SYNONYMS[q];
  if(syn&&syn.some(s=>blob.includes(s)))return true;
  return false;
}
// ================================================================
// SWAP SYSTEM — Phase 1: metadata + Phase 2: scoring engine
// ================================================================
const SWAP_META={
  barbell_bench_press:{mp:'horizontal_push',pmg:'chest',er:'compound',tier:'primary_lift',ef:'barbell'},
  incline_dumbbell_press:{mp:'horizontal_push',pmg:'chest',er:'compound',tier:'secondary_compound',ef:'dumbbell'},
  flat_dumbbell_press:{mp:'horizontal_push',pmg:'chest',er:'compound',tier:'secondary_compound',ef:'dumbbell'},
  machine_chest_press:{mp:'horizontal_push',pmg:'chest',er:'compound',tier:'secondary_compound',ef:'machine'},
  incline_machine_press:{mp:'horizontal_push',pmg:'chest',er:'compound',tier:'secondary_compound',ef:'machine'},
  smith_bench_press:{mp:'horizontal_push',pmg:'chest',er:'compound',tier:'secondary_compound',ef:'smith'},
  smith_incline_press:{mp:'horizontal_push',pmg:'chest',er:'compound',tier:'secondary_compound',ef:'smith'},
  chest_press_neutral:{mp:'horizontal_push',pmg:'chest',er:'compound',tier:'secondary_compound',ef:'machine'},
  cable_fly:{mp:'horizontal_push',pmg:'chest',er:'accessory',tier:'accessory',ef:'cable'},
  machine_fly:{mp:'horizontal_push',pmg:'chest',er:'accessory',tier:'accessory',ef:'machine'},
  pec_deck_fly:{mp:'horizontal_push',pmg:'chest',er:'accessory',tier:'accessory',ef:'machine'},
  weighted_dip:{mp:'horizontal_push',pmg:'chest',er:'compound',tier:'secondary_compound',ef:'bodyweight'},
  assisted_dip:{mp:'horizontal_push',pmg:'chest',er:'compound',tier:'secondary_compound',ef:'machine'},
  push_up:{mp:'horizontal_push',pmg:'chest',er:'compound',tier:'secondary_compound',ef:'bodyweight'},
  decline_push_up:{mp:'horizontal_push',pmg:'chest',er:'compound',tier:'secondary_compound',ef:'bodyweight'},
  overhead_press:{mp:'vertical_push',pmg:'shoulders',er:'compound',tier:'primary_lift',ef:'barbell'},
  machine_shoulder_press:{mp:'vertical_push',pmg:'shoulders',er:'compound',tier:'secondary_compound',ef:'machine'},
  dumbbell_shoulder_press:{mp:'vertical_push',pmg:'shoulders',er:'compound',tier:'secondary_compound',ef:'dumbbell'},
  seated_dumbbell_shoulder_press:{mp:'vertical_push',pmg:'shoulders',er:'compound',tier:'secondary_compound',ef:'dumbbell'},
  seated_machine_shoulder_press:{mp:'vertical_push',pmg:'shoulders',er:'compound',tier:'secondary_compound',ef:'machine'},
  smith_shoulder_press:{mp:'vertical_push',pmg:'shoulders',er:'compound',tier:'secondary_compound',ef:'smith'},
  lateral_raise:{mp:'shoulder_abduction',pmg:'shoulders',er:'accessory',tier:'accessory',ef:'dumbbell'},
  cable_lateral_raise:{mp:'shoulder_abduction',pmg:'shoulders',er:'accessory',tier:'accessory',ef:'cable'},
  front_raise:{mp:'shoulder_flexion',pmg:'shoulders',er:'accessory',tier:'accessory',ef:'dumbbell'},
  triceps_pushdown:{mp:'elbow_extension',pmg:'triceps',er:'accessory',tier:'accessory',ef:'cable'},
  rope_pushdown:{mp:'elbow_extension',pmg:'triceps',er:'accessory',tier:'accessory',ef:'cable'},
  straight_bar_pushdown:{mp:'elbow_extension',pmg:'triceps',er:'accessory',tier:'accessory',ef:'cable'},
  overhead_triceps_extension:{mp:'elbow_extension',pmg:'triceps',er:'accessory',tier:'accessory',ef:'cable'},
  lying_triceps_extension:{mp:'elbow_extension',pmg:'triceps',er:'accessory',tier:'accessory',ef:'barbell'},
  pull_up:{mp:'vertical_pull',pmg:'back',er:'compound',tier:'primary_lift',ef:'bodyweight'},
  assisted_pull_up:{mp:'vertical_pull',pmg:'back',er:'compound',tier:'secondary_compound',ef:'machine'},
  lat_pulldown:{mp:'vertical_pull',pmg:'back',er:'compound',tier:'secondary_compound',ef:'cable'},
  wide_grip_lat_pulldown:{mp:'vertical_pull',pmg:'back',er:'compound',tier:'secondary_compound',ef:'cable'},
  close_grip_lat_pulldown:{mp:'vertical_pull',pmg:'back',er:'compound',tier:'secondary_compound',ef:'cable'},
  reverse_grip_lat_pulldown:{mp:'vertical_pull',pmg:'back',er:'compound',tier:'secondary_compound',ef:'cable'},
  straight_arm_pulldown:{mp:'vertical_pull',pmg:'back',er:'accessory',tier:'accessory',ef:'cable'},
  chest_supported_row:{mp:'horizontal_pull',pmg:'back',er:'compound',tier:'secondary_compound',ef:'machine'},
  seated_cable_row:{mp:'horizontal_pull',pmg:'back',er:'compound',tier:'secondary_compound',ef:'cable'},
  cable_row:{mp:'horizontal_pull',pmg:'back',er:'compound',tier:'secondary_compound',ef:'cable'},
  barbell_row:{mp:'horizontal_pull',pmg:'back',er:'compound',tier:'primary_lift',ef:'barbell'},
  t_bar_row:{mp:'horizontal_pull',pmg:'back',er:'compound',tier:'secondary_compound',ef:'barbell'},
  single_arm_dumbbell_row:{mp:'horizontal_pull',pmg:'back',er:'compound',tier:'secondary_compound',ef:'dumbbell'},
  machine_row:{mp:'horizontal_pull',pmg:'back',er:'compound',tier:'secondary_compound',ef:'machine'},
  face_pull:{mp:'rear_delt',pmg:'shoulders',er:'accessory',tier:'accessory',ef:'cable'},
  rear_delt_fly:{mp:'rear_delt',pmg:'shoulders',er:'accessory',tier:'accessory',ef:'machine'},
  reverse_pec_deck:{mp:'rear_delt',pmg:'shoulders',er:'accessory',tier:'accessory',ef:'machine'},
  barbell_curl:{mp:'elbow_flexion',pmg:'biceps',er:'accessory',tier:'accessory',ef:'barbell'},
  ez_bar_curl:{mp:'elbow_flexion',pmg:'biceps',er:'accessory',tier:'accessory',ef:'barbell'},
  cable_curl:{mp:'elbow_flexion',pmg:'biceps',er:'accessory',tier:'accessory',ef:'cable'},
  preacher_curl:{mp:'elbow_flexion',pmg:'biceps',er:'accessory',tier:'accessory',ef:'machine'},
  concentration_curl:{mp:'elbow_flexion',pmg:'biceps',er:'accessory',tier:'accessory',ef:'dumbbell'},
  incline_dumbbell_curl:{mp:'elbow_flexion',pmg:'biceps',er:'accessory',tier:'accessory',ef:'dumbbell'},
  hammer_curl:{mp:'elbow_flexion',pmg:'biceps',er:'accessory',tier:'accessory',ef:'dumbbell'},
  conventional_deadlift:{mp:'hip_hinge',pmg:'hamstrings',er:'compound',tier:'primary_lift',ef:'barbell'},
  sumo_deadlift:{mp:'hip_hinge',pmg:'hamstrings',er:'compound',tier:'primary_lift',ef:'barbell'},
  trap_bar_deadlift:{mp:'hip_hinge',pmg:'hamstrings',er:'compound',tier:'secondary_compound',ef:'barbell'},
  romanian_deadlift:{mp:'hip_hinge',pmg:'hamstrings',er:'compound',tier:'secondary_compound',ef:'barbell'},
  back_extension:{mp:'hip_hinge',pmg:'hamstrings',er:'accessory',tier:'accessory',ef:'bodyweight'},
  back_squat:{mp:'squat',pmg:'quads',er:'compound',tier:'primary_lift',ef:'barbell'},
  front_squat:{mp:'squat',pmg:'quads',er:'compound',tier:'primary_lift',ef:'barbell'},
  smith_squat:{mp:'squat',pmg:'quads',er:'compound',tier:'secondary_compound',ef:'smith'},
  hack_squat:{mp:'squat',pmg:'quads',er:'compound',tier:'secondary_compound',ef:'machine'},
  leg_press:{mp:'squat',pmg:'quads',er:'compound',tier:'secondary_compound',ef:'machine'},
  goblet_squat:{mp:'squat',pmg:'quads',er:'compound',tier:'secondary_compound',ef:'dumbbell'},
  bulgarian_split_squat:{mp:'lunge',pmg:'quads',er:'compound',tier:'secondary_compound',ef:'dumbbell'},
  smith_split_squat:{mp:'lunge',pmg:'quads',er:'compound',tier:'secondary_compound',ef:'smith'},
  split_squat:{mp:'lunge',pmg:'quads',er:'compound',tier:'secondary_compound',ef:'bodyweight'},
  walking_lunge:{mp:'lunge',pmg:'quads',er:'compound',tier:'secondary_compound',ef:'dumbbell'},
  walking_db_lunge:{mp:'lunge',pmg:'quads',er:'compound',tier:'secondary_compound',ef:'dumbbell'},
  reverse_lunge:{mp:'lunge',pmg:'quads',er:'compound',tier:'secondary_compound',ef:'dumbbell'},
  step_up:{mp:'lunge',pmg:'quads',er:'compound',tier:'secondary_compound',ef:'dumbbell'},
  hip_thrust:{mp:'hip_thrust',pmg:'glutes',er:'compound',tier:'secondary_compound',ef:'barbell'},
  smith_hip_thrust:{mp:'hip_thrust',pmg:'glutes',er:'compound',tier:'secondary_compound',ef:'smith'},
  glute_bridge:{mp:'hip_thrust',pmg:'glutes',er:'compound',tier:'secondary_compound',ef:'bodyweight'},
  leg_extension:{mp:'knee_extension',pmg:'quads',er:'accessory',tier:'accessory',ef:'machine'},
  leg_curl:{mp:'knee_flexion',pmg:'hamstrings',er:'accessory',tier:'accessory',ef:'machine'},
  hip_abduction_machine:{mp:'hip_abduction',pmg:'glutes',er:'accessory',tier:'accessory',ef:'machine'},
  hip_adduction_machine:{mp:'hip_adduction',pmg:'glutes',er:'accessory',tier:'accessory',ef:'machine'},
  calf_raise:{mp:'calf',pmg:'calves',er:'accessory',tier:'accessory',ef:'machine'},
  seated_calf_raise:{mp:'calf',pmg:'calves',er:'accessory',tier:'accessory',ef:'machine'},
  standing_calf_raise:{mp:'calf',pmg:'calves',er:'accessory',tier:'accessory',ef:'machine'},
  farmer_carry:{mp:'carry',pmg:'core',er:'compound',tier:'secondary_compound',ef:'dumbbell'},
  cable_crunch:{mp:'core_flexion',pmg:'core',er:'core',tier:'core',ef:'cable'},
  crunch:{mp:'core_flexion',pmg:'core',er:'core',tier:'core',ef:'bodyweight'},
  hanging_leg_raise:{mp:'core_flexion',pmg:'core',er:'core',tier:'core',ef:'bodyweight'},
  lying_leg_raise:{mp:'core_flexion',pmg:'core',er:'core',tier:'core',ef:'bodyweight'},
  plank:{mp:'anti_extension',pmg:'core',er:'core',tier:'core',ef:'bodyweight'},
  side_plank:{mp:'anti_lateral_flexion',pmg:'core',er:'core',tier:'core',ef:'bodyweight'},
  russian_twist:{mp:'rotation',pmg:'core',er:'core',tier:'core',ef:'bodyweight'},
  dead_bug:{mp:'anti_extension',pmg:'core',er:'core',tier:'core',ef:'bodyweight'},
  stepper:{mp:'cardio',pmg:'cardio',er:'cardio',tier:'cardio',ef:'machine'},
  stair_climber:{mp:'cardio',pmg:'cardio',er:'cardio',tier:'cardio',ef:'machine'},
  treadmill_run:{mp:'cardio',pmg:'cardio',er:'cardio',tier:'cardio',ef:'machine'},
  treadmill_walk:{mp:'cardio',pmg:'cardio',er:'cardio',tier:'cardio',ef:'machine'},
  treadmill_jog:{mp:'cardio',pmg:'cardio',er:'cardio',tier:'cardio',ef:'machine'},
  outdoor_run:{mp:'cardio',pmg:'cardio',er:'cardio',tier:'cardio',ef:'bodyweight'},
  outdoor_walk:{mp:'cardio',pmg:'cardio',er:'cardio',tier:'cardio',ef:'bodyweight'},
  bike:{mp:'cardio',pmg:'cardio',er:'cardio',tier:'cardio',ef:'machine'},
  elliptical:{mp:'cardio',pmg:'cardio',er:'cardio',tier:'cardio',ef:'machine'},
  rower:{mp:'cardio',pmg:'cardio',er:'cardio',tier:'cardio',ef:'machine'},
  walking:{mp:'cardio',pmg:'cardio',er:'cardio',tier:'cardio',ef:'bodyweight'},
  // === LIBRARY EXPANSION v1 ===
  decline_barbell_bench_press:{mp:'horizontal_push',pmg:'chest',er:'compound',tier:'primary_lift',ef:'barbell'},
  decline_dumbbell_press:{mp:'horizontal_push',pmg:'chest',er:'compound',tier:'secondary_compound',ef:'dumbbell'},
  decline_smith_press:{mp:'horizontal_push',pmg:'chest',er:'compound',tier:'secondary_compound',ef:'smith'},
  decline_machine_press:{mp:'horizontal_push',pmg:'chest',er:'compound',tier:'secondary_compound',ef:'machine'},
  high_to_low_cable_fly:{mp:'horizontal_push',pmg:'chest',er:'accessory',tier:'accessory',ef:'cable'},
  single_arm_high_to_low_cable_fly:{mp:'horizontal_push',pmg:'chest',er:'accessory',tier:'accessory',ef:'cable'},
  chest_dip:{mp:'horizontal_push',pmg:'chest',er:'compound',tier:'secondary_compound',ef:'bodyweight'},
  assisted_chest_dip:{mp:'horizontal_push',pmg:'chest',er:'compound',tier:'secondary_compound',ef:'machine'},
  pendlay_row:{mp:'horizontal_pull',pmg:'back',er:'compound',tier:'primary_lift',ef:'barbell'},
  meadows_row:{mp:'horizontal_pull',pmg:'back',er:'compound',tier:'secondary_compound',ef:'barbell'},
  inverted_row:{mp:'horizontal_pull',pmg:'back',er:'compound',tier:'secondary_compound',ef:'bodyweight'},
  arnold_press:{mp:'vertical_push',pmg:'shoulders',er:'compound',tier:'secondary_compound',ef:'dumbbell'},
  upright_row:{mp:'shoulder_abduction',pmg:'shoulders',er:'accessory',tier:'accessory',ef:'barbell'},
  reverse_cable_fly:{mp:'rear_delt',pmg:'shoulders',er:'accessory',tier:'accessory',ef:'cable'},
  nordic_curl:{mp:'knee_flexion',pmg:'hamstrings',er:'accessory',tier:'accessory',ef:'bodyweight'},
  single_leg_press:{mp:'squat',pmg:'quads',er:'compound',tier:'secondary_compound',ef:'machine'},
  cossack_squat:{mp:'lunge',pmg:'quads',er:'compound',tier:'secondary_compound',ef:'bodyweight'},
  skull_crusher:{mp:'elbow_extension',pmg:'triceps',er:'accessory',tier:'accessory',ef:'barbell'},
  spider_curl:{mp:'elbow_flexion',pmg:'biceps',er:'accessory',tier:'accessory',ef:'dumbbell'},
  reverse_curl:{mp:'elbow_flexion',pmg:'biceps',er:'accessory',tier:'accessory',ef:'barbell'},
  pallof_press:{mp:'anti_rotation',pmg:'core',er:'core',tier:'core',ef:'cable'},
  ab_wheel:{mp:'anti_extension',pmg:'core',er:'core',tier:'core',ef:'bodyweight'},
  hollow_hold:{mp:'anti_extension',pmg:'core',er:'core',tier:'core',ef:'bodyweight'}
};
const EF_COMPAT={
  barbell:['barbell','smith','dumbbell','machine','cable','bodyweight'],
  dumbbell:['dumbbell','barbell','cable','machine','smith','bodyweight'],
  machine:['machine','smith','cable','dumbbell','barbell','bodyweight'],
  cable:['cable','machine','dumbbell','barbell','bodyweight','smith'],
  bodyweight:['bodyweight','machine','cable','dumbbell','barbell','smith'],
  smith:['smith','barbell','machine','dumbbell','cable','bodyweight']
};
function getSwapMeta(key){return SWAP_META[key]||null}
function scoreSwapCandidate(baseKey,candidateKey){
  if(baseKey===candidateKey)return-999;
  const bm=SWAP_META[baseKey];const cm=SWAP_META[candidateKey];
  if(!bm||!cm)return 0;
  if((bm.er==='cardio')!==(cm.er==='cardio'))return-999;
  let s=0;
  if((bm.er==='core')!==(cm.er==='core'))s-=4;
  if(bm.mp===cm.mp)s+=6;
  if(bm.pmg===cm.pmg)s+=5;
  if(bm.er===cm.er)s+=3;
  const bd=EX_BY_KEY[baseKey];const cd=EX_BY_KEY[candidateKey];
  if(bd&&cd&&bd.category===cd.category)s+=2;
  const compat=EF_COMPAT[bm.ef]||[];
  if(cm.ef===bm.ef)s+=1;
  if(compat.includes(cm.ef))s+=2;
  if(bm.er==='compound'&&cm.er==='compound'&&bm.pmg!==cm.pmg)s-=4;
  return s;
}
function getSwapCandidates(baseKey,limit=10){
  return EXERCISE_REGISTRY.map(e=>e.key).filter(k=>k!==baseKey)
    .map(k=>({key:k,score:scoreSwapCandidate(baseKey,k)}))
    .filter(x=>x.score>0).sort((a,b)=>b.score-a.score).slice(0,limit).map(x=>x.key);
}


// ================================================================
// 4. ANATOMY LIBRARY (keyed by canonical key)
// ================================================================
const ANATOMY={
  barbell_bench_press:{primary:['胸大肌'],secondary:['三角肌前束','肱三頭肌'],joints:'肩水平內收、肘伸展',cues:['肩胛先收緊再下槓','前臂盡量維持垂直','腳跟穩定踩地建立張力'],mistakes:['手肘過度外張','下槓點過高或過低','手腕過度後折'],risk:'肩前側不舒服時先調整握距與手肘角度，再考慮降重。',acsmRole:'compound',programUse:['strength','hypertrophy'],regression:'machine_chest_press',progression:'加重 / 暫停式臥推'},
  incline_dumbbell_press:{primary:['上胸','胸大肌'],secondary:['三角肌前束','肱三頭肌'],joints:'肩水平內收、肘伸展',cues:['上背穩定貼椅','啞鈴下放到可控制的最深位置','頂端不要撞啞鈴'],mistakes:['肩膀聳起','肘部路徑亂跑','下放速度太快'],risk:'肩夾擠感增加時先減少椅角或縮短活動範圍。',acsmRole:'compound',programUse:['hypertrophy','general_health'],regression:'incline_machine_press',progression:'加重 / 增加椅角'},
  flat_dumbbell_press:{primary:['胸大肌'],secondary:['三角肌前束','肱三頭肌'],joints:'肩水平內收、肘伸展',cues:['啞鈴下放至胸側','肩胛全程收緊','推起時手臂微內旋'],mistakes:['肩膀聳起','啞鈴碰撞','失去肩胛穩定'],risk:'肩前側不適時先縮短下放幅度。',acsmRole:'compound',programUse:['hypertrophy','general_health'],regression:'machine_chest_press',progression:'加重'},
  machine_chest_press:{primary:['胸大肌'],secondary:['三角肌前束','肱三頭肌'],joints:'肩水平內收、肘伸展',cues:['坐墊高度讓把手接近中胸','推起時維持胸椎穩定','回程不要鬆掉'],mistakes:['把手抓太高','肩膀往前滾','借腰發力'],risk:'若肩不適可調整握距或改中立握。',acsmRole:'compound',programUse:['general_health','rehab'],regression:'push_up',progression:'barbell_bench_press'},
  incline_machine_press:{primary:['上胸','胸大肌'],secondary:['三角肌前束','肱三頭肌'],joints:'肩水平內收、肘伸展',cues:['坐墊高度對齊上胸','推起不聳肩','回程慢放感受拉伸'],mistakes:['肩膀聳起','腰椎代償','握把位置過高'],risk:'肩夾擠時先減少重量。',acsmRole:'compound',programUse:['general_health','hypertrophy'],regression:'machine_chest_press',progression:'incline_dumbbell_press'},
  smith_bench_press:{primary:['胸大肌'],secondary:['三角肌前束','肱三頭肌'],joints:'肩水平內收、肘伸展',cues:['找到合適下槓位置','肩胛收緊','回程控制速度'],mistakes:['槓路不在中胸','手腕後折','拱腰過度'],risk:'肩不適時調整躺椅位置。',acsmRole:'compound',programUse:['hypertrophy','general_health'],regression:'machine_chest_press',progression:'barbell_bench_press'},
  smith_incline_press:{primary:['上胸','胸大肌'],secondary:['三角肌前束','肱三頭肌'],joints:'肩水平內收、肘伸展',cues:['椅角約30–45度','下槓到上胸','回程控制'],mistakes:['椅角過大變肩推','肩胛沒收緊','槓路偏移'],risk:'肩前側不舒服時先調低椅角。',acsmRole:'compound',programUse:['hypertrophy','general_health'],regression:'incline_machine_press',progression:'incline_dumbbell_press'},
  chest_press_neutral:{primary:['胸大肌'],secondary:['三角肌前束','肱三頭肌'],joints:'肩水平內收、肘伸展',cues:['中立握減少肩前側壓力','推起時維持胸椎穩定','回程控制'],mistakes:['聳肩','腰椎代償','握把位置過高'],risk:'肩前側較友善的替代選項。',acsmRole:'compound',programUse:['general_health','rehab']},
  cable_fly:{primary:['胸大肌'],secondary:['前三角','前鋸肌'],joints:'肩水平內收',cues:['手肘微彎固定','夾胸時想像抱大樹','回程感受胸部被拉長'],mistakes:['變成前推','手肘角度一直變','動作幅度過大失控'],risk:'肩前側拉扯感過強時，縮小最低點。',acsmRole:'accessory',programUse:['hypertrophy']},
  machine_fly:{primary:['胸大肌'],secondary:['前三角','前鋸肌'],joints:'肩水平內收',cues:['坐墊高度對齊中胸','夾合時想像雙手靠近','回程控制離心'],mistakes:['聳肩','身體前傾','速度太快'],risk:'肩前側拉扯時先縮小起始開度。',acsmRole:'accessory',programUse:['hypertrophy','general_health']},
  pec_deck_fly:{primary:['胸大肌'],secondary:['前三角','前鋸肌'],joints:'肩水平內收',cues:['前臂貼墊，手肘微低於肩','夾合時頂端稍停','回程慢放'],mistakes:['肩膀聳起','借力甩','開度過大'],risk:'肩前側緊繃時縮小活動範圍。',acsmRole:'accessory',programUse:['hypertrophy','general_health']},
  overhead_press:{primary:['三角肌'],secondary:['肱三頭肌','上斜方肌','上胸'],joints:'肩上舉、肘伸展',cues:['肋骨收住、臀部夾緊','槓鈴貼近臉部路徑上推','頭穿過手臂中間'],mistakes:['下背過度拱起','槓路前飄','手肘在槓後方太多'],risk:'肩活動受限或下背不適時，可改坐姿或啞鈴版本。',acsmRole:'compound',programUse:['strength','hypertrophy'],regression:'seated_machine_shoulder_press',progression:'加重 / push press'},
  machine_shoulder_press:{primary:['三角肌前中束'],secondary:['肱三頭肌','上胸'],joints:'肩上舉、肘伸展',cues:['坐墊調到手把略低於下巴','推起時避免聳肩','回程到可控制範圍'],mistakes:['頭往前頂','腰椎過拱','下降太快'],risk:'頸部緊張時先降低重量。',acsmRole:'compound',programUse:['general_health','rehab']},
  dumbbell_shoulder_press:{primary:['三角肌前中束'],secondary:['肱三頭肌','上胸'],joints:'肩上舉、肘伸展',cues:['前臂垂直、核心收緊','雙腳穩定支撐','下降時保持手腕疊在肘上'],mistakes:['啞鈴路徑不對稱','借腰反彈','下放失控'],risk:'肩不穩時先改單臂或坐姿版本。',acsmRole:'compound',programUse:['hypertrophy','general_health']},
  seated_dumbbell_shoulder_press:{primary:['三角肌前中束'],secondary:['肱三頭肌','上胸'],joints:'肩上舉、肘伸展',cues:['背部靠墊穩定','前臂保持垂直','下放至耳朵兩側'],mistakes:['拱腰','啞鈴路徑不對稱','下放太快'],risk:'肩不適時先降低重量並控制幅度。',acsmRole:'compound',programUse:['hypertrophy','general_health'],regression:'machine_shoulder_press',progression:'overhead_press'},
  seated_machine_shoulder_press:{primary:['三角肌前中束'],secondary:['肱三頭肌'],joints:'肩上舉、肘伸展',cues:['坐穩、腳踩平','推起不聳肩','回程控制'],mistakes:['頭前伸','拱腰','速度太快'],risk:'頸部緊張時降低重量。',acsmRole:'compound',programUse:['general_health','rehab']},
  smith_shoulder_press:{primary:['三角肌前中束'],secondary:['肱三頭肌','上胸'],joints:'肩上舉、肘伸展',cues:['找合適坐位讓槓路自然','推起不聳肩','回程至耳朵高度'],mistakes:['身體位置不對','拱腰','鎖死手肘'],risk:'肩活動受限時先降低重量。',acsmRole:'compound',programUse:['hypertrophy','general_health']},
  lateral_raise:{primary:['三角肌中束'],secondary:['上斜方肌','棘上肌'],joints:'肩外展',cues:['手肘帶動啞鈴外展','最高約到肩高','上半身保持安靜'],mistakes:['聳肩','甩重量','抬過肩高太多'],risk:'肩峰夾擠感時先降低角度並轉為滑輪版本。',acsmRole:'accessory',programUse:['hypertrophy']},
  cable_lateral_raise:{primary:['三角肌中束'],secondary:['上斜方肌'],joints:'肩外展',cues:['滑輪從對側拉出','手肘微彎固定','全程張力均勻'],mistakes:['聳肩','身體側彎','速度太快'],risk:'肩峰夾擠時先降低角度。',acsmRole:'accessory',programUse:['hypertrophy']},
  front_raise:{primary:['三角肌前束'],secondary:['上胸','前鋸肌'],joints:'肩屈曲',cues:['手臂微彎固定','舉到肩高即可','身體不晃動'],mistakes:['聳肩','借力甩','過高導致夾擠'],risk:'肩前側不適時降低重量或改滑輪版本。',acsmRole:'accessory',programUse:['hypertrophy']},
  triceps_pushdown:{primary:['肱三頭肌'],secondary:['前臂','背部穩定肌'],joints:'肘伸展',cues:['上臂固定貼身','底部把手往下外分開','回程不要完全放掉'],mistakes:['肩膀前移','身體大幅前傾','手腕亂甩'],risk:'肘部痠痛時降低重量並檢查把手選擇。',acsmRole:'accessory',programUse:['hypertrophy','general_health']},
  rope_pushdown:{primary:['肱三頭肌'],secondary:['前臂'],joints:'肘伸展',cues:['繩索底端分開外旋','上臂穩定','回程控制'],mistakes:['身體前傾','肩膀前移','速度太快'],risk:'肘部不適時改換把手。',acsmRole:'accessory',programUse:['hypertrophy']},
  straight_bar_pushdown:{primary:['肱三頭肌'],secondary:['前臂'],joints:'肘伸展',cues:['直槓穩定下壓','上臂固定','底端短停'],mistakes:['身體前傾','手腕後折','聳肩'],risk:'手腕不適時改用EZ把或繩索。',acsmRole:'accessory',programUse:['hypertrophy']},
  overhead_triceps_extension:{primary:['肱三頭肌長頭'],secondary:['前臂','肩穩定肌'],joints:'肘伸展',cues:['上臂固定在耳朵兩側','肘伸直時停一下','回程慢放'],mistakes:['手肘外張','下背拱起','速度太快'],risk:'肘部不適時先降低重量。',acsmRole:'accessory',programUse:['hypertrophy']},
  lying_triceps_extension:{primary:['肱三頭肌'],secondary:['前臂'],joints:'肘伸展',cues:['上臂穩定指向天花板','下放至額頭附近','伸直時短停'],mistakes:['上臂亂動','下放過深','速度太快'],risk:'肘痛時先降重或改繩索版本。',acsmRole:'accessory',programUse:['hypertrophy']},
  weighted_dip:{primary:['胸大肌下部','肱三頭肌'],secondary:['三角肌前束'],joints:'肩伸展、肘伸展',cues:['身體微前傾強化胸部參與','下降到可控制的最深處','鎖定時不過度前傾'],mistakes:['肩前側壓力過大','下降太深','速度失控'],risk:'肩前側不適時先改輔助版或胸推。',acsmRole:'compound',programUse:['strength','hypertrophy'],regression:'assisted_dip',progression:'加重'},
  assisted_dip:{primary:['胸大肌下部','肱三頭肌'],secondary:['三角肌前束'],joints:'肩伸展、肘伸展',cues:['輔助量只用到維持好路徑','身體微前傾','回程控制'],mistakes:['完全依賴輔助','聳肩','速度太快'],risk:'肩前側不適時縮小活動範圍。',acsmRole:'compound',programUse:['general_health','hypertrophy'],regression:'push_up',progression:'weighted_dip'},
  push_up:{primary:['胸大肌','肱三頭肌'],secondary:['三角肌前束','核心'],joints:'肩水平內收、肘伸展',cues:['手掌略寬於肩','身體成一直線','胸口接近地面'],mistakes:['塌腰','聳肩','只做半程'],risk:'肩或手腕不適時先調整手位。',acsmRole:'compound',programUse:['general_health','rehab']},
  decline_push_up:{primary:['上胸','肱三頭肌'],secondary:['三角肌前束','核心'],joints:'肩水平內收、肘伸展',cues:['腳放高處（椅子或箱子）','身體維持一直線','下降控制'],mistakes:['塌腰','肩前側壓力','速度太快'],risk:'肩不適時降低高度差或改平地版。',acsmRole:'compound',programUse:['general_health']},
  pull_up:{primary:['背闊肌'],secondary:['肱二頭肌','菱形肌','下斜方肌'],joints:'肩內收、肘屈曲',cues:['先做肩胛下壓再拉','胸口往槓靠近','下降到底保持控制'],mistakes:['全程聳肩','腿部亂擺','只做半程'],risk:'肩前側不適時先改輔助引體或下拉。',acsmRole:'compound',programUse:['strength','hypertrophy'],regression:'assisted_pull_up',progression:'加重引體'},
  assisted_pull_up:{primary:['背闊肌'],secondary:['肱二頭肌','菱形肌'],joints:'肩內收、肘屈曲',cues:['輔助量只用到能維持完整路徑','先穩住肩胛','全程控制下降'],mistakes:['依賴反彈','聳肩','速度過快'],risk:'先把動作做漂亮，再逐步減少輔助。',acsmRole:'compound',programUse:['general_health','rehab'],regression:'lat_pulldown',progression:'pull_up'},
  lat_pulldown:{primary:['背闊肌'],secondary:['肱二頭肌','菱形肌','後三角'],joints:'肩內收、肘屈曲',cues:['拉向上胸或鎖骨附近','胸口抬起但肋骨別外翻','回程讓背闊被拉長'],mistakes:['身體後仰太多','把槓拉到肚子','只用手臂拉'],risk:'肩活動受限時改中立握或窄握。',acsmRole:'compound',programUse:['hypertrophy','general_health'],regression:'assisted_pull_up',progression:'pull_up'},
  wide_grip_lat_pulldown:{primary:['背闊肌上部'],secondary:['大圓肌','肱二頭肌'],joints:'肩內收、肘屈曲',cues:['寬握拉向鎖骨','胸口打開','回程完全伸展'],mistakes:['後仰太多','拉到脖子後方','只用手臂'],risk:'肩活動受限時改標準握距。',acsmRole:'compound',programUse:['hypertrophy']},
  close_grip_lat_pulldown:{primary:['背闘肌下部'],secondary:['菱形肌','肱二頭肌'],joints:'肩內收、肘屈曲',cues:['窄握V把拉向胸口','肩胛下壓夾緊','回程慢放'],mistakes:['身體後仰過多','只用二頭拉','速度太快'],risk:'前臂疲勞時降低重量。',acsmRole:'compound',programUse:['hypertrophy','general_health']},
  reverse_grip_lat_pulldown:{primary:['背闊肌','肱二頭肌'],secondary:['菱形肌','下斜方肌'],joints:'肩伸展、肘屈曲',cues:['反握略窄於肩','拉向下胸','感受背闊拉伸'],mistakes:['後仰太多','手腕不適','借力甩'],risk:'手腕不適時改正握。',acsmRole:'compound',programUse:['hypertrophy']},
  straight_arm_pulldown:{primary:['背闊肌'],secondary:['大圓肌','後三角','前鋸肌'],joints:'肩伸展',cues:['手臂微彎固定','從上往下劃弧','底端短停感受背闊收縮'],mistakes:['彎肘太多變划船','身體前傾過度','速度太快'],risk:'肩不適時縮小活動範圍。',acsmRole:'accessory',programUse:['hypertrophy']},
  chest_supported_row:{primary:['中背','背闊肌'],secondary:['後三角','肱二頭肌'],joints:'肩伸展、肩胛後收、肘屈曲',cues:['胸口穩定貼墊','手肘往髖方向拉','頂端停半拍感受夾背'],mistakes:['聳肩','下背亂用力','頂端縮得不夠'],risk:'頸部緊張時先降低重量並放慢節奏。',acsmRole:'compound',programUse:['hypertrophy','general_health']},
  seated_cable_row:{primary:['背闊肌','菱形肌'],secondary:['肱二頭肌','後三角'],joints:'肩伸展、肘屈曲',cues:['先挺胸再拉','把手拉向下胸或肚臍上緣','回程肩胛前伸但不駝背'],mistakes:['身體前後甩動','聳肩','用腰代替背'],risk:'下背不舒服時先減少前後晃動幅度。',acsmRole:'compound',programUse:['hypertrophy','general_health']},
  cable_row:{primary:['背闊肌','菱形肌'],secondary:['肱二頭肌','後三角'],joints:'肩伸展、肘屈曲',cues:['站姿或坐姿皆可','拉向腹部','頂端夾背停頓'],mistakes:['身體晃動','聳肩','只用手臂'],risk:'下背疲勞時改坐姿版本。',acsmRole:'compound',programUse:['hypertrophy','general_health']},
  barbell_row:{primary:['背闊肌','中背'],secondary:['後三角','肱二頭肌','豎脊肌'],joints:'肩伸展、肘屈曲',cues:['髖折維持固定角度','槓路貼近身體','拉起時胸骨向前'],mistakes:['下背圓背','身體越拉越直','用反彈借力'],risk:'下背疲勞高時可改胸托划船。',acsmRole:'compound',programUse:['strength','hypertrophy'],regression:'chest_supported_row',progression:'加重'},
  t_bar_row:{primary:['中背','背闊肌'],secondary:['後三角','肱二頭肌','豎脊肌'],joints:'肩伸展、肘屈曲',cues:['胸口微抬、髖折穩定','拉向腹部','頂端夾背'],mistakes:['下背圓背','身體晃動','用慣性'],risk:'下背疲勞時改胸托划船。',acsmRole:'compound',programUse:['strength','hypertrophy']},
  single_arm_dumbbell_row:{primary:['背闊肌'],secondary:['菱形肌','肱二頭肌','後三角'],joints:'肩伸展、肘屈曲',cues:['非工作手支撐穩定','拉向髖部','頂端短停'],mistakes:['身體旋轉','聳肩','速度太快'],risk:'下背不適時確保支撐手位置正確。',acsmRole:'compound',programUse:['hypertrophy','general_health']},
  machine_row:{primary:['中背','背闊肌'],secondary:['肱二頭肌','後三角'],joints:'肩伸展、肘屈曲',cues:['胸口穩住、手肘往後下拉','頂端停一下感受夾背','回程慢放'],mistakes:['聳肩','用身體前後甩','只拉手不拉背'],risk:'頸部緊繃時先降低重量。',acsmRole:'compound',programUse:['general_health','rehab']},
  face_pull:{primary:['後三角','菱形肌'],secondary:['外旋肌群','中下斜方肌'],joints:'肩水平外展、外旋',cues:['拉向臉部兩側','手肘高於手腕','頂端外旋停頓'],mistakes:['拉太低','聳肩','速度太快'],risk:'肩不適時降低重量並確認角度。',acsmRole:'accessory',programUse:['general_health','rehab']},
  rear_delt_fly:{primary:['後三角'],secondary:['菱形肌','中斜方肌'],joints:'肩水平外展',cues:['胸口貼墊穩定','手肘微彎外展','頂端短停'],mistakes:['聳肩','借力甩','手肘角度變化'],risk:'肩不適時降低重量。',acsmRole:'accessory',programUse:['hypertrophy','general_health']},
  reverse_pec_deck:{primary:['後三角'],secondary:['菱形肌','中斜方肌'],joints:'肩水平外展',cues:['握把調到最窄設定','手肘微彎穩定','回程慢放'],mistakes:['聳肩','身體前傾','速度太快'],risk:'肩不適時降低重量或調整座椅。',acsmRole:'accessory',programUse:['hypertrophy','general_health']},
  barbell_curl:{primary:['肱二頭肌'],secondary:['肱肌','前臂屈肌'],joints:'肘屈曲',cues:['肘固定在身側','向上時掌心穩定朝前','回程慢放'],mistakes:['身體後仰甩起','手肘往前跑','頂端過度縮短休息'],risk:'手腕或肘不適時可改啞鈴或槌式。',acsmRole:'accessory',programUse:['hypertrophy']},
  ez_bar_curl:{primary:['肱二頭肌'],secondary:['肱肌','前臂屈肌'],joints:'肘屈曲',cues:['EZ槓減少手腕壓力','肘固定身側','回程控制'],mistakes:['身體後仰','手肘前移','速度太快'],risk:'手腕仍不適時改槌式彎舉。',acsmRole:'accessory',programUse:['hypertrophy']},
  cable_curl:{primary:['肱二頭肌'],secondary:['肱肌'],joints:'肘屈曲',cues:['全程張力均勻','肘固定身側','頂端短停'],mistakes:['身體後仰','手肘前移','借力甩'],risk:'肘不適時降低重量。',acsmRole:'accessory',programUse:['hypertrophy']},
  preacher_curl:{primary:['肱二頭肌'],secondary:['肱肌'],joints:'肘屈曲',cues:['上臂完全貼墊','下放到手臂接近伸直','回程不甩'],mistakes:['上臂離墊','下放太快','借肩發力'],risk:'肘或手腕不適時先降重。',acsmRole:'accessory',programUse:['hypertrophy']},
  concentration_curl:{primary:['肱二頭肌'],secondary:['肱肌'],joints:'肘屈曲',cues:['肘固定在大腿內側','專注收縮','回程慢放'],mistakes:['借肩甩起','身體晃動','速度太快'],risk:'前臂緊繃時降低重量。',acsmRole:'accessory',programUse:['hypertrophy']},
  incline_dumbbell_curl:{primary:['肱二頭肌長頭'],secondary:['肱肌'],joints:'肘屈曲',cues:['上背貼椅、手臂自然下垂','彎舉時手肘不前移','回程完全伸展'],mistakes:['肘往前跑','速度太快','椅角太直'],risk:'肩前側拉扯時先減少椅角。',acsmRole:'accessory',programUse:['hypertrophy']},
  hammer_curl:{primary:['肱肌','肱橈肌'],secondary:['肱二頭肌'],joints:'肘屈曲',cues:['中立握維持到底','手肘貼近身側','上放下放速度一致'],mistakes:['借肩前抬','前臂亂轉','下放直接掉下去'],risk:'前臂緊繃時先降低次數目標。',acsmRole:'accessory',programUse:['hypertrophy','general_health']},
  conventional_deadlift:{primary:['臀大肌','腘繩肌','股四頭肌'],secondary:['豎脊肌','斜方肌','前臂'],joints:'髖伸展、膝伸展',cues:['先把身體拉緊再離地','槓貼脛骨到大腿','上鎖時夾臀不是後仰'],mistakes:['背部鬆掉','起槓太快','鎖定時過度後仰'],risk:'下背或腿後側拉扯感異常時立即減重。',acsmRole:'compound',programUse:['strength'],regression:'trap_bar_deadlift',progression:'加重'},
  sumo_deadlift:{primary:['臀大肌','股四頭肌','內收肌'],secondary:['腘繩肌','豎脊肌','前臂'],joints:'髖伸展、膝伸展',cues:['寬站距、腳尖外轉','膝蓋追腳尖','槓貼身上升'],mistakes:['膝內扣','髖先鎖定','下背圓背'],risk:'髖或膝不適時調整站距。',acsmRole:'compound',programUse:['strength','hypertrophy']},
  back_squat:{primary:['臀大肌','股四頭肌'],secondary:['腘繩肌','核心','豎脊肌'],joints:'髖伸展、膝伸展、踝背屈',cues:['吸氣撐腹後再下蹲','膝蓋跟著腳尖方向走','起身時腳掌平均發力'],mistakes:['膝蓋內扣','下背圓背','重心過度前移'],risk:'膝或下背不適增加時，先降重並調整深度。',acsmRole:'compound',programUse:['strength','hypertrophy'],regression:'goblet_squat',progression:'加重 / 暫停式深蹲'},
  front_squat:{primary:['股四頭肌'],secondary:['臀大肌','核心','上背'],joints:'髖伸展、膝伸展、踝背屈',cues:['手肘抬高、胸口保持打開','核心撐住避免前倒','蹲下時想把身體夾在兩腿中間'],mistakes:['手肘掉下來','腰背彎曲','腳跟離地'],risk:'手腕或胸椎活動受限時先降低重量。',acsmRole:'compound',programUse:['strength','hypertrophy']},
  smith_squat:{primary:['股四頭肌','臀大肌'],secondary:['腘繩肌','核心'],joints:'髖伸展、膝伸展',cues:['腳位稍前讓軌跡自然','下蹲到可控制深度','起身平均推蹬'],mistakes:['腳位太後','膝內扣','下背代償'],risk:'膝不適時調整腳位或縮小深度。',acsmRole:'compound',programUse:['general_health','hypertrophy'],regression:'leg_press',progression:'back_squat'},
  hack_squat:{primary:['股四頭肌'],secondary:['臀大肌','腘繩肌'],joints:'髖膝伸展',cues:['背部完整貼墊','下去時膝蓋追腳尖','起身時腳掌平均出力'],mistakes:['膝內扣','屁股離墊','底部反彈'],risk:'膝敏感時先縮小深度並控制速度。',acsmRole:'compound',programUse:['hypertrophy']},
  leg_press:{primary:['股四頭肌','臀大肌'],secondary:['腘繩肌','小腿'],joints:'髖膝伸展',cues:['下放到骨盆仍穩定的位置','膝蓋順著腳尖方向','整個腳掌平均出力'],mistakes:['膝蓋內扣','屁股離墊','鎖死膝蓋'],risk:'膝蓋不適時先提高腳位或縮小深度。',acsmRole:'compound',programUse:['hypertrophy','general_health'],regression:'goblet_squat',progression:'back_squat'},
  romanian_deadlift:{primary:['腘繩肌','臀大肌'],secondary:['豎脊肌','上背穩定肌'],joints:'髖折、髖伸展',cues:['屁股往後推而不是往下蹲','槓鈴貼腿滑行','全程保持脊柱中立'],mistakes:['把它做成深蹲','槓離腿太遠','下背代償'],risk:'下背疲勞時先減少下降深度。',acsmRole:'compound',programUse:['hypertrophy','strength']},
  bulgarian_split_squat:{primary:['股四頭肌','臀大肌'],secondary:['臀中肌','腘繩肌','核心'],joints:'單側髖膝屈伸',cues:['前腳踩穩、軀幹略前傾','下去時膝蓋追腳尖','起身想把地板踩開'],mistakes:['重心太後','前膝亂跑','上身左右晃'],risk:'膝部敏感時先縮小步距與深度。',acsmRole:'compound',programUse:['hypertrophy','functional']},
  smith_split_squat:{primary:['股四頭肌','臀大肌'],secondary:['臀中肌','核心'],joints:'單側髖膝屈伸',cues:['找穩定腳位','前腳踩穩後下沉','起身平穩'],mistakes:['腳位太前或太後','膝內扣','速度太快'],risk:'膝不適時縮小深度。',acsmRole:'compound',programUse:['hypertrophy','general_health']},
  split_squat:{primary:['股四頭肌','臀大肌'],secondary:['臀中肌','核心'],joints:'單側髖膝屈伸',cues:['前後腳都穩定踩地','往下沉不是往前衝','骨盆保持正對前方'],mistakes:['前腳跟離地','膝蓋內扣','步距過短'],risk:'用自體重先把路徑做穩，再加負重。',acsmRole:'compound',programUse:['general_health','rehab']},
  walking_lunge:{primary:['臀大肌','股四頭肌'],secondary:['臀中肌','腘繩肌','核心'],joints:'單側髖膝屈伸',cues:['每一步都重新站穩','上身保持堆疊','前腳整掌踩穩再推進'],mistakes:['步伐過短','膝蓋內扣','重心左右晃動'],risk:'膝部負擔高時先改原地弓箭步。',acsmRole:'compound',programUse:['hypertrophy','functional']},
  walking_db_lunge:{primary:['臀大肌','股四頭肌'],secondary:['臀中肌','腘繩肌','核心'],joints:'單側髖膝屈伸',cues:['雙手持啞鈴、每步站穩','上身堆疊','前腳整掌踩穩'],mistakes:['步伐過短','膝蓋內扣','重心左右晃'],risk:'膝部負擔高時改原地弓箭步。',acsmRole:'compound',programUse:['hypertrophy','functional']},
  reverse_lunge:{primary:['臀大肌','股四頭肌'],secondary:['臀中肌','核心'],joints:'單側髖膝屈伸',cues:['後腳往後踩穩','前膝追腳尖','起身時前腳發力'],mistakes:['重心不穩','膝內扣','速度太快'],risk:'對膝蓋較友善的弓箭步變化。',acsmRole:'compound',programUse:['general_health','functional']},
  step_up:{primary:['臀大肌','股四頭肌'],secondary:['臀中肌','核心'],joints:'單側髖膝伸展',cues:['前腳完整踩在箱上','用前腳發力站上','下降時控制'],mistakes:['用後腳蹬地借力','膝內扣','速度太快'],risk:'膝不適時降低箱高。',acsmRole:'compound',programUse:['functional','general_health']},
  hip_thrust:{primary:['臀大肌'],secondary:['腘繩肌','臀中肌','核心'],joints:'髖伸展',cues:['下巴微收、肋骨收住','頂端夾臀而非拱腰','小腿接近垂直'],mistakes:['用下背頂起','腳站太遠','頂端停不住'],risk:'下背不適時先減少頂端高度。',acsmRole:'compound',programUse:['hypertrophy','general_health'],regression:'glute_bridge',progression:'加重'},
  smith_hip_thrust:{primary:['臀大肌'],secondary:['腘繩肌','臀中肌'],joints:'髖伸展',cues:['槓路固定更容易設定','頂端夾臀','回程控制'],mistakes:['用下背頂起','腳位不對','速度太快'],risk:'下背不適時降低重量。',acsmRole:'compound',programUse:['hypertrophy','general_health']},
  glute_bridge:{primary:['臀大肌'],secondary:['腘繩肌','核心'],joints:'髖伸展',cues:['平躺、腳踩地','頂端夾臀','下背不拱起'],mistakes:['用下背代償','腳太遠','速度太快'],risk:'較低風險的臀部啟動動作。',acsmRole:'compound',programUse:['general_health','rehab']},
  leg_extension:{primary:['股四頭肌'],secondary:['髖屈肌穩定肌'],joints:'膝伸展',cues:['頂端短停感受大腿前側','回程不要直接掉下','坐墊與膝軸對齊'],mistakes:['借身體後仰','下放太快','腳背亂甩'],risk:'膝前側壓力高時縮小最頂端停留時間。',acsmRole:'accessory',programUse:['hypertrophy','rehab']},
  leg_curl:{primary:['腘繩肌'],secondary:['臀大肌','小腿後側'],joints:'膝屈曲',cues:['骨盆穩定貼墊','捲起時想把腳跟帶向臀部','回程慢放'],mistakes:['翹臀','甩重量','活動範圍不足'],risk:'腿後側抽筋傾向時先降重並延長熱身。',acsmRole:'accessory',programUse:['hypertrophy','rehab']},
  hip_abduction_machine:{primary:['臀中肌','臀小肌'],secondary:['闊筋膜張肌'],joints:'髖外展',cues:['坐穩、慢慢外展','頂端短停','回程控制'],mistakes:['借腰晃動','速度太快','活動範圍不足'],risk:'髖不適時降低重量。',acsmRole:'accessory',programUse:['general_health','rehab']},
  hip_adduction_machine:{primary:['內收肌群'],secondary:['股薄肌'],joints:'髖內收',cues:['坐穩、慢慢內收','頂端短停','回程控制'],mistakes:['借腰','速度太快','重量過大'],risk:'內收肌拉傷風險時先降重並暖身充分。',acsmRole:'accessory',programUse:['general_health','rehab']},
  calf_raise:{primary:['腓腸肌','比目魚肌'],secondary:['足部穩定肌'],joints:'踝蹠屈',cues:['底部完整延展','頂端停一下再下放','大拇趾球保持壓地'],mistakes:['彈震反彈','只做半程','腳踝往外倒'],risk:'阿基里斯腱緊繃時先降低節奏與重量。',acsmRole:'accessory',programUse:['hypertrophy','general_health']},
  seated_calf_raise:{primary:['比目魚肌'],secondary:['腓腸肌'],joints:'踝蹠屈',cues:['膝蓋穩定在墊下','底部充分拉伸','頂端短停'],mistakes:['彈震反彈','速度太快','活動範圍不足'],risk:'阿基里斯腱緊繃時先降低重量。',acsmRole:'accessory',programUse:['hypertrophy']},
  standing_calf_raise:{primary:['腓腸肌'],secondary:['比目魚肌'],joints:'踝蹠屈',cues:['站穩後緩慢上升','頂端短停','底部充分拉伸'],mistakes:['彈震反彈','膝蓋彎曲','速度太快'],risk:'腱緊繃時先降低節奏。',acsmRole:'accessory',programUse:['hypertrophy']},
  back_extension:{primary:['豎脊肌','臀大肌'],secondary:['腘繩肌'],joints:'髖伸展',cues:['頂端不過度後仰','下放到自然延展','核心參與控制'],mistakes:['過度後仰','速度太快','用慣性'],risk:'下背敏感時縮小活動範圍。',acsmRole:'accessory',programUse:['general_health','rehab']},
  cable_crunch:{primary:['腹直肌'],secondary:['腹外斜肌','腹橫肌'],joints:'軀幹屈曲',cues:['想把胸骨帶向骨盆','臀部穩定別往後坐','每下都吐氣收腹'],mistakes:['只用手拉繩','變成髖折','速度太快'],risk:'下背不舒服時先減少活動範圍。',acsmRole:'core',programUse:['hypertrophy','general_health']},
  crunch:{primary:['腹直肌'],secondary:['腹外斜肌'],joints:'軀幹屈曲',cues:['肩胛離地即可','吐氣收腹','手輕放耳旁不拉頭'],mistakes:['拉頸部','速度太快','腳浮起'],risk:'頸部不適時改死蟲。',acsmRole:'core',programUse:['general_health']},
  hanging_leg_raise:{primary:['腹直肌','髖屈肌'],secondary:['前臂','背闊肌穩定'],joints:'髖屈曲、軀幹穩定',cues:['先穩定肩胛再抬腿','避免身體大幅擺盪','下放控制不要掉'],mistakes:['用慣性甩腿','下背過度拱','抓握鬆掉'],risk:'下背不適時先改屈膝版本。',acsmRole:'core',programUse:['hypertrophy']},
  lying_leg_raise:{primary:['腹直肌下部','髖屈肌'],secondary:['腹橫肌'],joints:'髖屈曲',cues:['下背貼地','腿緩慢下放','吐氣抬腿'],mistakes:['下背離地','速度太快','用慣性'],risk:'下背不適時屈膝進行。',acsmRole:'core',programUse:['general_health']},
  plank:{primary:['腹直肌','腹橫肌'],secondary:['臀大肌','前鋸肌','肩穩定肌'],joints:'脊柱中立穩定',cues:['肋骨收住、臀部微夾','頭到腳跟成一直線','持續鼻吸口吐'],mistakes:['臀部太高或太低','聳肩','憋氣'],risk:'肩膀不舒服時先縮短時間或改高位版本。',acsmRole:'core',programUse:['general_health','rehab']},
  side_plank:{primary:['腹外斜肌','腹橫肌'],secondary:['臀中肌','肩穩定肌'],joints:'脊柱側向穩定',cues:['身體成一直線','上手可叉腰或朝上','持續呼吸'],mistakes:['臀部下沉','身體前傾或後倒','憋氣'],risk:'肩不適時改屈肘版本。',acsmRole:'core',programUse:['functional','general_health']},
  russian_twist:{primary:['腹外斜肌','腹內斜肌'],secondary:['腹直肌','髖屈肌'],joints:'軀幹旋轉',cues:['腳可離地或踩地','旋轉帶動手臂','速度可控'],mistakes:['只動手臂','下背圓背','速度太快'],risk:'下背不適時腳踩地進行。',acsmRole:'core',programUse:['functional']},
  dead_bug:{primary:['腹橫肌','腹直肌'],secondary:['髖屈肌控制','前鋸肌'],joints:'脊柱抗伸展、四肢分離控制',cues:['下背輕貼地面','手腳慢慢伸遠','吐氣時維持核心張力'],mistakes:['下背離地','手腳太快','只顧移動不顧穩定'],risk:'先從單手單腳版本開始也可以。',acsmRole:'core',programUse:['rehab','general_health']},
  farmer_carry:{primary:['斜方肌','前臂','核心'],secondary:['臀中肌','小腿'],joints:'握力與步態穩定',cues:['站高、肋骨收住','走路步幅自然','不要讓重量把你拉歪'],mistakes:['聳肩','身體側彎','步伐過大'],risk:'下背容易緊時先縮短距離。',acsmRole:'compound',programUse:['functional','strength']},
  trap_bar_deadlift:{primary:['臀大肌','股四頭肌'],secondary:['腘繩肌','斜方肌','前臂'],joints:'髖膝伸展',cues:['把地板踩開同時站起','握把貼身上升','頂端夾臀收住'],mistakes:['起槓瞬間鬆掉','膝內扣','鎖定後仰'],risk:'通常比傳統硬舉友善，但仍要維持中立脊柱。',acsmRole:'compound',programUse:['strength','general_health']},
  goblet_squat:{primary:['股四頭肌','臀大肌'],secondary:['核心','上背'],joints:'髖膝踝屈伸',cues:['啞鈴貼近胸口','下去時肘往腿內側找空間','胸口保持打開'],mistakes:['胸口下塌','腳跟浮起','膝蓋內扣'],risk:'是很好的回歸版本，先求路徑穩定。',acsmRole:'compound',programUse:['general_health','rehab']},
  // === LIBRARY EXPANSION v1 ===
  decline_barbell_bench_press:{primary:['下胸','胸大肌'],secondary:['肱三頭肌','三角肌前束'],joints:'肩水平內收、肘伸展',cues:['椅角下斜 15–30 度','下槓到下胸','推起時夾胸不聳肩'],mistakes:['拱腰過度','肩胛鬆掉','下放太快'],risk:'下斜角度過大時頭部充血明顯，若不適立即停止。',acsmRole:'compound',programUse:['hypertrophy','strength'],regression:'decline_machine_press',progression:'加重'},
  decline_dumbbell_press:{primary:['下胸','胸大肌'],secondary:['肱三頭肌','三角肌前束'],joints:'肩水平內收、肘伸展',cues:['啞鈴下放至下胸側','肩胛收緊不亂動','推起微內旋'],mistakes:['啞鈴碰撞','拱腰','下降失控'],risk:'肩不適時先改平板啞鈴推。',acsmRole:'compound',programUse:['hypertrophy']},
  decline_smith_press:{primary:['下胸','胸大肌'],secondary:['肱三頭肌','三角肌前束'],joints:'肩水平內收、肘伸展',cues:['椅位對齊讓槓路落在下胸','肩胛收緊','回程控制'],mistakes:['拱腰','槓路偏移','鎖死手肘'],risk:'頭部充血不適時立即停止。',acsmRole:'compound',programUse:['hypertrophy','general_health']},
  decline_machine_press:{primary:['下胸','胸大肌'],secondary:['肱三頭肌','三角肌前束'],joints:'肩水平內收、肘伸展',cues:['握把對齊下胸','推起時維持胸椎穩定','回程不鬆掉'],mistakes:['聳肩','借腰','速度太快'],risk:'較低風險的下胸替代選項。',acsmRole:'compound',programUse:['general_health','hypertrophy']},
  high_to_low_cable_fly:{primary:['下胸','胸大肌'],secondary:['前三角','前鋸肌'],joints:'肩水平內收',cues:['從高滑輪往下往內夾','手肘角度固定','底端短停感受下胸'],mistakes:['拉太直像下壓','聳肩','速度太快'],risk:'肩前側拉扯時縮小起始幅度。',acsmRole:'accessory',programUse:['hypertrophy']},
  single_arm_high_to_low_cable_fly:{primary:['下胸','胸大肌'],secondary:['前三角','核心'],joints:'肩水平內收、軀幹抗旋轉',cues:['單側站穩、核心收緊','從高往低夾向對側髖','頂端短停'],mistakes:['軀幹大幅旋轉','聳肩','借腰'],risk:'核心不穩時先降重。',acsmRole:'accessory',programUse:['hypertrophy','functional']},
  chest_dip:{primary:['下胸','胸大肌'],secondary:['肱三頭肌','三角肌前束'],joints:'肩伸展、肘伸展',cues:['身體明顯前傾','雙槓略寬比肩','下沉感受胸部拉伸'],mistakes:['身體太直變三頭撐體','下降過深','肩前側壓力'],risk:'肩前側不適時改輔助版或縮小幅度。',acsmRole:'compound',programUse:['hypertrophy','strength'],regression:'assisted_chest_dip',progression:'加重'},
  assisted_chest_dip:{primary:['下胸','胸大肌'],secondary:['肱三頭肌'],joints:'肩伸展、肘伸展',cues:['輔助量只用來維持完整路徑','身體明顯前傾','控制下降'],mistakes:['完全靠輔助','肩前側壓力過大','速度太快'],risk:'先練好路徑再逐步減少輔助。',acsmRole:'compound',programUse:['general_health','hypertrophy'],regression:'push_up',progression:'chest_dip'},
  pendlay_row:{primary:['上背','背闊肌'],secondary:['後三角','肱二頭肌','豎脊肌'],joints:'肩伸展、肘屈曲',cues:['每下都從地板重新開始','髖折維持水平','爆發拉向下胸'],mistakes:['下背圓背','身體上抬','失去脊柱中立'],risk:'下背疲勞時改 barbell_row 或 chest_supported_row。',acsmRole:'compound',programUse:['strength','hypertrophy']},
  meadows_row:{primary:['背闊肌','中背'],secondary:['後三角','肱二頭肌'],joints:'肩伸展、肘屈曲',cues:['側身握住單邊槓','髖折穩定','拉向髖外側'],mistakes:['身體旋轉失控','聳肩','借力甩'],risk:'下背不適時降低重量。',acsmRole:'compound',programUse:['hypertrophy']},
  inverted_row:{primary:['中背','背闊肌'],secondary:['後三角','肱二頭肌','核心'],joints:'肩伸展、肘屈曲',cues:['身體成一直線拉向槓','肩胛先下壓再拉','底端不鬆掉'],mistakes:['屁股下沉','聳肩','只動手臂'],risk:'下背容易緊時先把核心夾緊。',acsmRole:'compound',programUse:['general_health','rehab']},
  arnold_press:{primary:['三角肌'],secondary:['肱三頭肌','上胸'],joints:'肩上舉、肘伸展、前臂旋轉',cues:['起始掌心向自己','推起過程旋轉到掌心向前','頂端不鎖死'],mistakes:['旋轉太早或太晚','借腰甩','下放失控'],risk:'肩不適時改普通啞鈴肩推。',acsmRole:'compound',programUse:['hypertrophy']},
  upright_row:{primary:['三角肌中束','上斜方肌'],secondary:['肱二頭肌','前臂'],joints:'肩外展、肘屈曲',cues:['握距略寬於肩','手肘帶動槓上提','上升不超過肩高'],mistakes:['窄握肩內旋','上升過高','聳肩'],risk:'肩夾擠時用寬握或改側平舉。',acsmRole:'accessory',programUse:['hypertrophy']},
  reverse_cable_fly:{primary:['後三角','菱形肌'],secondary:['中斜方肌'],joints:'肩水平外展',cues:['滑輪交叉站位','手肘微彎穩定','頂端夾背停頓'],mistakes:['聳肩','身體前傾','速度太快'],risk:'肩不適時降低重量。',acsmRole:'accessory',programUse:['hypertrophy','general_health']},
  nordic_curl:{primary:['腘繩肌'],secondary:['臀大肌','核心'],joints:'膝屈曲',cues:['固定腳踝','緩慢離心下降','能拉回就拉、不能就用手撐'],mistakes:['下放太快','髖折代償','撐地失控'],risk:'腿後側拉傷風險較高，先從短幅度練起。',acsmRole:'accessory',programUse:['hypertrophy','functional']},
  single_leg_press:{primary:['股四頭肌','臀大肌'],secondary:['腘繩肌','臀中肌'],joints:'髖膝伸展',cues:['單腳踩穩在板中偏上','下放到骨盆穩定處','推蹬平均'],mistakes:['膝內扣','屁股離墊','用非工作腿借力'],risk:'膝不適時縮小幅度或降重。',acsmRole:'compound',programUse:['hypertrophy','rehab']},
  cossack_squat:{primary:['股四頭肌','內收肌'],secondary:['臀大肌','髖活動度'],joints:'髖膝踝屈伸、髖內收',cues:['寬站、重心移向一側','另一腳伸直','胸口保持打開'],mistakes:['膝內扣','腳跟離地','胸口下塌'],risk:'髖活動度不足時先減少深度。',acsmRole:'compound',programUse:['functional','rehab']},
  skull_crusher:{primary:['肱三頭肌'],secondary:['前臂'],joints:'肘伸展',cues:['上臂指向天花板','下放至額頭附近','伸直時短停'],mistakes:['上臂亂動','手肘外張','速度太快'],risk:'肘不適時改啞鈴或繩索。',acsmRole:'accessory',programUse:['hypertrophy']},
  spider_curl:{primary:['肱二頭肌'],secondary:['肱肌'],joints:'肘屈曲',cues:['趴在上斜椅上','手臂垂直下垂','彎舉到頂端短停'],mistakes:['借肩','下放太快','椅角太平'],risk:'肘不適時降重。',acsmRole:'accessory',programUse:['hypertrophy']},
  reverse_curl:{primary:['肱橈肌','肱肌'],secondary:['前臂伸肌','肱二頭肌'],joints:'肘屈曲',cues:['正握（掌心向下）','肘固定身側','向上時前臂延長感'],mistakes:['手腕後折','借肩','速度太快'],risk:'手腕不適時改 EZ 槓或繩索。',acsmRole:'accessory',programUse:['hypertrophy','general_health']},
  pallof_press:{primary:['腹外斜肌','腹橫肌'],secondary:['臀中肌','肩穩定肌'],joints:'軀幹抗旋轉',cues:['側身站穩面向滑輪垂直方向','雙手推離胸口不被拉走','呼吸不憋氣'],mistakes:['身體被滑輪拉歪','憋氣','推太快'],risk:'抗旋轉核心的友善入門。',acsmRole:'core',programUse:['rehab','functional']},
  ab_wheel:{primary:['腹直肌','腹橫肌'],secondary:['背闊肌','髖屈肌'],joints:'抗脊柱伸展',cues:['從跪姿開始','滾出時不讓下背掉下去','滾回維持核心張力'],mistakes:['下背塌','滾太遠失控','憋氣'],risk:'下背不穩時先從牆壁或縮短距離開始。',acsmRole:'core',programUse:['hypertrophy','functional']},
  hollow_hold:{primary:['腹直肌','腹橫肌'],secondary:['髖屈肌','前鋸肌'],joints:'脊柱抗伸展',cues:['下背貼地','手腳抬離地面','維持張力持續呼吸'],mistakes:['下背離地','憋氣','手腳太高'],risk:'下背易緊時先縮短持續時間。',acsmRole:'core',programUse:['rehab','functional']}
};
function getEdu(key){const e=ANATOMY[key];if(e)return e;const d=EX_BY_KEY[key];const c=d?.classKey||'';if(c==='cardio')return{primary:['心肺系統'],secondary:['下肢耐力'],joints:'依器材型態而異',cues:['先求節奏穩定','逐步增加時間','保持能長時間維持的呼吸'],mistakes:['一開始強度過高','忽略暖身','沒有逐週累積總量'],risk:'若胸悶、暈眩，立即停止。'};if(c==='core')return{primary:['核心穩定肌群'],secondary:['臀肌','肩穩定肌'],joints:'脊柱穩定、呼吸控制',cues:['先把呼吸與核心張力做好','以控制為主','每一下都維持骨盆與肋骨位置'],mistakes:['憋氣','只追求次數忽略品質','腰椎代償'],risk:'疼痛高於可接受範圍時先回退版本。'};return{primary:['主要目標肌群'],secondary:['穩定肌與協同肌'],joints:'依動作型態而異',cues:['先把路徑做穩再加重','保持可控制的離心','讓目標肌群真的出力'],mistakes:['用慣性補動作','忽略核心與呼吸','重量超出控制能力'],risk:'任何尖銳痛感都應先停止並調整。'}}

// ================================================================
// 5. SCIENCE DOMAIN
// ================================================================
const SCI_DEFAULT={goal:'general_health',level:'intermediate',sessionMin:60,equipment:'full_gym',knee:false,shoulder:false,lowBack:false};
const GOALS={
  general_health:{label:'一般健康',weekly:'每週 150–300 分中等強度有氧，並至少 2 天肌力訓練',badge:'基礎健康',compound:{rep:[6,12],rest:[60,120]},accessory:{rep:[8,15],rest:[45,90]},core:{rep:[8,15],rest:[30,60]},cardio:{minutes:'150–300 分／週',note:'中等強度為主'},resistanceDays:'2–3',cardioDays:'3–5',weeklyVolumeTarget:'每主要肌群 6–10 組',intensityGuideline:'中等負荷、RPE 5–7',sessionPriority:['compound_lower','compound_upper','core','cardio'],acsmSummary:'ACSM 建議健康成人每週至少 150 分鐘中等強度有氧及 2 天阻力訓練，涵蓋主要肌群。重點在規律、可持續、完整覆蓋。'},
  muscle_gain:{label:'增肌',weekly:'以每肌群每週約 10 組以上為目標',badge:'肌肥大',compound:{rep:[6,12],rest:[60,120]},accessory:{rep:[8,15],rest:[45,90]},core:{rep:[8,15],rest:[30,60]},cardio:{minutes:'60–150 分／週',note:'輕中度有氧'},resistanceDays:'3–5',cardioDays:'2–3',weeklyVolumeTarget:'每主要肌群 10–20 組',intensityGuideline:'中等至高負荷、RIR 1–3',sessionPriority:['compound_upper','compound_lower','accessory','core'],acsmSummary:'肌肥大以總訓練量為驅動，主要落在 6–12 次範圍，強調漸進超負荷。有氧不可過多以免影響恢復，但仍需維持基本心肺。'},
  strength:{label:'力量',weekly:'複合動作優先，重點放在高品質組與足夠休息',badge:'力量導向',compound:{rep:[3,6],rest:[120,180]},accessory:{rep:[6,10],rest:[60,120]},core:{rep:[6,12],rest:[45,75]},cardio:{minutes:'90–150 分／週',note:'保留心肺健康'},resistanceDays:'3–4',cardioDays:'2–3',weeklyVolumeTarget:'主動作每週 5–10 重組',intensityGuideline:'高負荷、RPE 8–9.5、充足休息',sessionPriority:['compound_lower','compound_upper','accessory'],acsmSummary:'力量發展以高負荷、低次數、長休息為核心。主動作品質優先，輔助動作支持弱環節。ACSM 建議力量目標使用 ≥60% 1RM 並逐步增加。'},
  fat_loss:{label:'減脂',weekly:'阻力訓練保留肌肉，有氧總量朝 150–300 分鐘前進',badge:'體脂控制',compound:{rep:[6,12],rest:[60,120]},accessory:{rep:[8,15],rest:[45,75]},core:{rep:[8,15],rest:[30,60]},cardio:{minutes:'150–300 分／週',note:'先求總量'},resistanceDays:'3–4',cardioDays:'3–5',weeklyVolumeTarget:'每主要肌群 8–12 組',intensityGuideline:'中等負荷、阻力訓練優先保留肌肉',sessionPriority:['compound_upper','compound_lower','cardio','core'],acsmSummary:'減脂期間阻力訓練的目標是保留肌肉量。有氧累積足夠總量以增加能量消耗。ACSM 建議配合營養管理，優先維持阻力訓練頻率。'},
  cardio_endurance:{label:'心肺耐力',weekly:'有氧達 150–300 分／週，並維持每週至少 2 天阻力訓練',badge:'耐力優先',compound:{rep:[6,12],rest:[60,90]},accessory:{rep:[10,15],rest:[45,75]},core:{rep:[10,15],rest:[30,60]},cardio:{minutes:'150–300 分／週',note:'以穩定節奏為主'},resistanceDays:'2–3',cardioDays:'3–5',weeklyVolumeTarget:'每主要肌群 6–10 組',intensityGuideline:'有氧 RPE 4–7、阻力中等負荷',sessionPriority:['cardio','compound_lower','compound_upper','core'],acsmSummary:'心肺耐力以有氧總量為優先，同時維持至少 2 天阻力訓練防止肌肉流失。ACSM 建議逐週增加有氧時間不超過 10%。'},
  functional:{label:'功能性',weekly:'多關節、單側、核心抗旋轉與穩定控制優先',badge:'功能導向',compound:{rep:[6,12],rest:[60,120]},accessory:{rep:[8,15],rest:[45,75]},core:{rep:[8,15],rest:[30,60]},cardio:{minutes:'90–180 分／週',note:'搭配全身型態'},resistanceDays:'3–4',cardioDays:'2–3',weeklyVolumeTarget:'每主要動作模式 6–12 組',intensityGuideline:'中等負荷、強調動作控制與穩定',sessionPriority:['compound_lower','core','compound_upper','cardio'],acsmSummary:'功能性訓練強調多關節、多平面、單側與核心穩定。以動作品質為優先，適合需要日常功能表現的族群。'},
  rehab:{label:'復健 / 重返訓練',weekly:'低到中強度、疼痛可接受範圍、逐步增加訓練量',badge:'漸進恢復',compound:{rep:[8,15],rest:[60,120]},accessory:{rep:[10,15],rest:[45,90]},core:{rep:[8,15],rest:[30,60]},cardio:{minutes:'依耐受度漸進',note:'以恢復節奏為優先'},resistanceDays:'2–3',cardioDays:'2–3',weeklyVolumeTarget:'每主要肌群 4–8 組、漸進增加',intensityGuideline:'低至中等負荷、RPE 3–6、技術優先',sessionPriority:['core','compound_lower','compound_upper'],acsmSummary:'復健階段以漸進恢復為原則，在疼痛可接受範圍內逐步增加訓練量。技術品質優先於負荷。ACSM 建議個別化處方並配合專業評估。'}
};
const Sci={
  profile(){return{...Utils.copy(SCI_DEFAULT),...((DB.data.settings||{}).scienceProfile||{})}},
  save(n){DB.data.settings.scienceProfile={...Utils.copy(SCI_DEFAULT),...n};DB.save()},
  goal(g){return GOALS[g]||GOALS.general_health},
  levelLabel(l){return({beginner:'初學',intermediate:'中階',advanced:'進階'}[l])||'中階'},
  equipLabel(e){return({full_gym:'完整健身房',dumbbell_only:'啞鈴 / 簡易器材',home:'居家 / 自體重'}[e])||'完整健身房'},
  weeklyTargets(p){p=p||this.profile();const g=this.goal(p.goal);return[{key:'目前目標',value:g.label},{key:'阻力訓練',value:`每週 ${g.resistanceDays||'2–3'} 天`},{key:'有氧目標',value:g.cardio.minutes},{key:'單次時間',value:`${p.sessionMin} 分鐘`},{key:'每肌群週量',value:g.weeklyVolumeTarget||'—'},{key:'強度指引',value:g.intensityGuideline||'—'}]},
  classKey(ex){const k=ex.exerciseKey||resolveKey(ex.name||'');const d=EX_BY_KEY[k];const c=d?.classKey||'';if('compound_upper compound_lower full_body'.includes(c))return'compound';if(c==='cardio')return'cardio';if(c==='core')return'core';return'accessory'},
  injuryWarn(ex,p){p=p||this.profile();const k=ex.exerciseKey||resolveKey(ex.name||'');const a=[];if(p.knee&&'back_squat front_squat leg_press bulgarian_split_squat split_squat hack_squat walking_lunge smith_squat smith_split_squat walking_db_lunge reverse_lunge step_up single_leg_press cossack_squat'.split(' ').includes(k))a.push('膝蓋追蹤腳尖、疼痛控制在可接受範圍。');if(p.shoulder&&'barbell_bench_press incline_dumbbell_press flat_dumbbell_press overhead_press machine_shoulder_press dumbbell_shoulder_press seated_dumbbell_shoulder_press smith_shoulder_press cable_fly lateral_raise pull_up lat_pulldown wide_grip_lat_pulldown weighted_dip smith_bench_press smith_incline_press decline_push_up front_raise decline_barbell_bench_press decline_dumbbell_press decline_smith_press decline_machine_press high_to_low_cable_fly single_arm_high_to_low_cable_fly chest_dip assisted_chest_dip arnold_press upright_row skull_crusher'.split(' ').includes(k))a.push('肩部敏感時先縮小幅度，優先穩定肩胛。');if(p.lowBack&&'conventional_deadlift sumo_deadlift romanian_deadlift back_squat barbell_row t_bar_row trap_bar_deadlift back_extension pendlay_row meadows_row'.split(' ').includes(k))a.push('先把腹壓與脊柱中立做好，必要時先降重。');return a.join(' ')},
  prescription(ex,p){p=p||this.profile();const g=this.goal(p.goal);const ck=this.classKey(ex);if(ck==='cardio')return{title:`${g.label} 有氧處方`,body:`${g.acsmSummary||g.weekly}。有氧建議 ${g.cardio.minutes}；${g.cardio.note}。強度指引：${g.intensityGuideline||'中等'}。`,tone:'ok'};const t=g[ck]||g.compound;const[rMin,rMax]=t.rep;const[rsMin,rsMax]=t.rest;const cL=Number(ex.repMin),cH=Number(ex.repMax),cR=Number(ex.restSec);let rm,tn='ok';if(cH<rMin){rm=`目前 ${cL}-${cH} 次偏低於${g.label}建議的 ${rMin}-${rMax} 次；若以${g.label}為主，可考慮調高。`;tn='adjust'}else if(cL>rMax){rm=`目前 ${cL}-${cH} 次偏高於${g.label}建議的 ${rMin}-${rMax} 次；若以${g.label}為主，可考慮調低次數並增加負荷。`;tn='adjust'}else{rm=`${cL}-${cH} 次落在${g.label}建議的 ${rMin}-${rMax} 次範圍。`}let rs;if(cR<rsMin){rs=`休息 ${cR}s 略短於建議的 ${rsMin}-${rsMax}s；${ck==='compound'?'複合動作建議充足休息以維持動作品質。':'可視疲勞感適度延長。'}`;tn='adjust'}else if(cR>rsMax){rs=`休息 ${cR}s 略長於建議的 ${rsMin}-${rsMax}s；${p.goal==='strength'?'力量取向可接受較長休息。':'可嘗試壓縮以提升訓練密度。'}`;if(p.goal!=='strength')tn='adjust'}else{rs=`休息 ${cR}s 在合理範圍。`}const w=this.injuryWarn(ex,p);const roleNote=ck==='compound'?'此為複合動作，建議安排在課表前段。':'';return{title:`${g.label} 訓練處方`,body:`${rm} ${rs}${roleNote?' '+roleNote:''}${w?' '+w:''}`,tone:tn}},
  programScore(prog,p){p=p||this.profile();let s=0;const g=this.goal(p.goal);const ks=(prog.exercises||[]).map(e=>e.exerciseKey||resolveKey(e.name||''));const meta=prog.goal||prog.acsmFocus||'';const ep=prog.equipmentProfile||'';const hasBW=ks.some(k=>'push_up walking dead_bug plank split_squat assisted_pull_up glute_bridge side_plank decline_push_up crunch inverted_row ab_wheel hollow_hold nordic_curl cossack_squat'.split(' ').includes(k));const hasDB=ks.some(k=>'goblet_squat incline_dumbbell_press flat_dumbbell_press single_arm_dumbbell_row walking_lunge walking_db_lunge hammer_curl dumbbell_shoulder_press bulgarian_split_squat reverse_lunge step_up seated_dumbbell_shoulder_press concentration_curl decline_dumbbell_press arnold_press spider_curl'.split(' ').includes(k));const hasMachine=ks.some(k=>'machine_chest_press machine_shoulder_press lat_pulldown leg_press leg_extension leg_curl machine_row chest_supported_row hack_squat smith_squat hip_abduction_machine hip_adduction_machine machine_fly pec_deck_fly incline_machine_press seated_machine_shoulder_press smith_shoulder_press decline_smith_press decline_machine_press single_leg_press assisted_chest_dip'.split(' ').includes(k));const hasHeavy=ks.some(k=>'back_squat conventional_deadlift sumo_deadlift trap_bar_deadlift barbell_bench_press overhead_press front_squat decline_barbell_bench_press pendlay_row'.split(' ').includes(k));if(p.equipment==='home'&&hasBW)s+=5;if(p.equipment==='dumbbell_only'&&hasDB)s+=5;if(p.equipment==='dumbbell_only'&&!hasMachine&&!hasHeavy)s+=3;if(p.equipment==='full_gym')s+=3;if(ep&&p.equipment==='dumbbell_only'&&ep==='dumbbell')s+=4;if(ep&&p.equipment==='full_gym'&&(ep==='full_gym'||ep==='machine'))s+=2;if(meta===p.goal||prog.goal===p.goal)s+=4;if(p.goal==='muscle_gain'){if(/Hypertrophy|Push|Pull|Legs/i.test(prog.name))s+=4;if((prog.exercises||[]).length>=5)s+=2;if(prog.acsmFocus==='hypertrophy')s+=3}if(p.goal==='strength'){if(/Strength|Push|Pull|Legs/i.test(prog.name))s+=4;if(hasHeavy)s+=3;if(prog.acsmFocus==='strength')s+=3}if(p.goal==='fat_loss'){if(/General Strength|Home|Upper|Push|Pull|Legs|Fat Loss/i.test(prog.name))s+=3;if(prog.acsmFocus==='fat_loss')s+=3}if(p.goal==='cardio_endurance'){if(/General Strength|Home|Cardio/i.test(prog.name))s+=3;if(prog.acsmFocus==='cardio_support')s+=4}if(p.goal==='functional'){if(/Home|General Strength|Functional/i.test(prog.name))s+=3;if(ks.some(k=>'farmer_carry goblet_squat walking_lunge dead_bug side_plank step_up reverse_lunge'.split(' ').includes(k)))s+=3}if(p.goal==='rehab'){if(/Home|General Strength|ACSM/i.test(prog.name))s+=4;if(prog.acsmFocus==='general_health')s+=2}if(p.goal==='general_health'&&prog.acsmFocus==='general_health')s+=4;if(p.knee&&ks.some(k=>'back_squat hack_squat bulgarian_split_squat leg_press smith_squat'.split(' ').includes(k)))s-=2;if(p.shoulder&&ks.some(k=>'overhead_press machine_shoulder_press dumbbell_shoulder_press barbell_bench_press smith_shoulder_press weighted_dip'.split(' ').includes(k)))s-=2;if(p.lowBack&&ks.some(k=>'conventional_deadlift sumo_deadlift romanian_deadlift barbell_row back_squat t_bar_row'.split(' ').includes(k)))s-=2;if(p.sessionMin<=45&&(prog.exercises||[]).length>5)s-=1;if(p.sessionMin>=60&&(prog.exercises||[]).length>=5)s+=1;if(prog.durationMin&&p.sessionMin){if(Math.abs(prog.durationMin-p.sessionMin)<=15)s+=2;else if(prog.durationMin>p.sessionMin+20)s-=1}if(prog.builtIn)s+=0.5;if(prog.levelTag){if(prog.levelTag===p.level)s+=2;else if((prog.levelTag==='beginner'&&p.level==='intermediate')||(prog.levelTag==='intermediate'&&p.level==='advanced'))s+=1}return s},
  topPrograms(n=3){return PS.getAll().map(p=>({program:p,score:this.programScore(p)})).sort((a,b)=>b.score-a.score).slice(0,n)},
  isRec(id){return this.topPrograms(3).some(i=>i.program.id===id)},
  badge(p){p=p||this.profile();return`${this.goal(p.goal).label} · ${this.levelLabel(p.level)}`},
  rules(p){p=p||this.profile();const g=this.goal(p.goal);return[`目前設定以「${g.label}」為訓練主軸（ACSM 處方邏輯）。`,`阻力訓練建議每週 ${g.resistanceDays||'2–3'} 天，有氧目標 ${g.cardio.minutes}。`,`${g.acsmSummary||g.weekly}`,`每個動作提供 ACSM 對齊的次數 / 休息建議、解剖重點與安全提醒。`,'課表頁標示推薦課表，注意部位動作會額外顯示保守提醒。']}
};

// --- ACSM guidance strip (display-only, derived from goal) ---
const ACSM_GUIDE={
  general_health:{label:'一般健康',repRange:'6–12',rir:'2–3',restSec:'60–120',intensity:'中等負荷 · RPE 5–7',tip:'穩定規律比單次強度更重要，讓訓練能持續累積。'},
  muscle_gain:{label:'增肌',repRange:'6–12',rir:'1–3',restSec:'60–120',intensity:'中高負荷 · 追求漸進超負荷',tip:'把總訓練量當主軸，最後兩組接近力竭但維持品質。'},
  strength:{label:'力量',repRange:'3–6',rir:'1–2',restSec:'120–180',intensity:'高負荷 · RPE 8–9.5',tip:'主動作每組都要像認真的一組；休息不夠就寧願延長。'},
  fat_loss:{label:'減脂',repRange:'6–12',rir:'1–3',restSec:'60–120',intensity:'中等負荷 · 保留肌肉',tip:'阻力訓練是主軸，用來保留肌肉；有氧是輔助，別削弱恢復。'},
  cardio_endurance:{label:'心肺耐力',repRange:'8–15',rir:'2–3',restSec:'45–90',intensity:'中等負荷 · 有氧為主',tip:'有氧總量優先，阻力訓練用來保護肌肉與關節。'},
  functional:{label:'功能性',repRange:'6–12',rir:'2–3',restSec:'60–120',intensity:'中等負荷 · 動作品質優先',tip:'單側、抗旋轉、多平面動作優先；重量服務於動作。'},
  rehab:{label:'復健 / 重返訓練',repRange:'8–15',rir:'3–4',restSec:'60–120',intensity:'低中負荷 · RPE 3–6',tip:'疼痛可接受範圍內漸進加量；技術比負荷更重要。'}
};
function renderAcsmStrip(el,src){
  if(!el)return;
  let goalKey='general_health';
  if(src){
    if(src.goal)goalKey=src.goal;
    else if(src.programId){const p=PS.byId(src.programId);if(p&&p.goal)goalKey=p.goal}
  }
  const g=ACSM_GUIDE[goalKey]||ACSM_GUIDE.general_health;
  el.innerHTML=`<div class="gs-label">ACSM</div><div class="gs-body"><div class="gs-title">${Utils.escape(g.label)} · ${Utils.escape(g.intensity)}</div><div class="gs-meta">目標 ${Utils.escape(g.repRange)} reps · RIR ${Utils.escape(g.rir)} · 休息 ${Utils.escape(g.restSec)}s</div><div class="gs-tips">${Utils.escape(g.tip)}</div></div>`;
  el.hidden=false;
}

// ================================================================
// 6. BUILT-IN PROGRAMS
// ================================================================
const BUILT_IN=[
  // === PPL A ===
  {id:'builtin_push_a',builtIn:true,name:'Push A',note:'胸推主軸 + 肩推 + 三頭',category:'PPL',goal:'muscle_gain',frequencyRecommendation:'每週 1–2 次',durationMin:55,equipmentProfile:'full_gym',acsmFocus:'hypertrophy',cardioRecommendation:'課後可加 10–15 分低強度有氧',levelTag:'intermediate',prescriptionNote:'以槓鈴臥推為主動作，漸進超負荷驅動胸部肌肥大。',exercises:[{exerciseKey:'barbell_bench_press',sets:4,repMin:6,repMax:8,rir:2,restSec:120,notes:'ACSM：複合力量動作可用較長休息。'},{exerciseKey:'incline_dumbbell_press',sets:3,repMin:8,repMax:10,rir:2,restSec:90,notes:''},{exerciseKey:'machine_shoulder_press',sets:3,repMin:8,repMax:10,rir:2,restSec:90,notes:''},{exerciseKey:'lateral_raise',sets:3,repMin:12,repMax:15,rir:2,restSec:60,notes:''},{exerciseKey:'triceps_pushdown',sets:3,repMin:10,repMax:12,rir:1,restSec:60,notes:''}]},
  {id:'builtin_pull_a',builtIn:true,name:'Pull A',note:'垂直拉 + 划船 + 二頭',category:'PPL',goal:'muscle_gain',frequencyRecommendation:'每週 1–2 次',durationMin:55,equipmentProfile:'full_gym',acsmFocus:'hypertrophy',cardioRecommendation:'課後可加 10–15 分低強度有氧',levelTag:'intermediate',prescriptionNote:'以引體向上為主動作，搭配划船平衡上背。',exercises:[{exerciseKey:'pull_up',sets:4,repMin:5,repMax:8,rir:2,restSec:120,notes:''},{exerciseKey:'chest_supported_row',sets:3,repMin:8,repMax:10,rir:2,restSec:90,notes:''},{exerciseKey:'lat_pulldown',sets:3,repMin:10,repMax:12,rir:2,restSec:75,notes:''},{exerciseKey:'face_pull',sets:3,repMin:12,repMax:15,rir:2,restSec:60,notes:''},{exerciseKey:'hammer_curl',sets:3,repMin:10,repMax:12,rir:1,restSec:60,notes:''}]},
  {id:'builtin_legs_a',builtIn:true,name:'Legs A',note:'深蹲主軸 + 後鏈',category:'PPL',goal:'muscle_gain',frequencyRecommendation:'每週 1–2 次',durationMin:60,equipmentProfile:'full_gym',acsmFocus:'hypertrophy',cardioRecommendation:'腿日有氧可安排在非腿日',levelTag:'intermediate',prescriptionNote:'以槓鈴深蹲為主動作，RDL 強化後鏈。',exercises:[{exerciseKey:'back_squat',sets:4,repMin:6,repMax:8,rir:2,restSec:150,notes:'ACSM：大肌群複合動作可優先安排。'},{exerciseKey:'romanian_deadlift',sets:3,repMin:8,repMax:10,rir:2,restSec:90,notes:''},{exerciseKey:'leg_press',sets:3,repMin:10,repMax:12,rir:2,restSec:90,notes:''},{exerciseKey:'leg_curl',sets:3,repMin:10,repMax:12,rir:1,restSec:60,notes:''},{exerciseKey:'calf_raise',sets:4,repMin:10,repMax:15,rir:1,restSec:45,notes:''}]},
  // === PPL B ===
  {id:'builtin_push_b',builtIn:true,name:'Push B',note:'啞鈴主軸 + 肩推 + 三頭變化',category:'PPL',goal:'muscle_gain',frequencyRecommendation:'每週 1–2 次',durationMin:55,equipmentProfile:'full_gym',acsmFocus:'hypertrophy',cardioRecommendation:'課後可加 10–15 分低強度有氧',levelTag:'intermediate',prescriptionNote:'以啞鈴臥推為主動作，與 Push A 輪替增加動作變化。',exercises:[{exerciseKey:'flat_dumbbell_press',sets:4,repMin:8,repMax:10,rir:2,restSec:90,notes:''},{exerciseKey:'smith_incline_press',sets:3,repMin:8,repMax:12,rir:2,restSec:90,notes:''},{exerciseKey:'seated_dumbbell_shoulder_press',sets:3,repMin:8,repMax:10,rir:2,restSec:90,notes:''},{exerciseKey:'cable_lateral_raise',sets:3,repMin:12,repMax:15,rir:1,restSec:60,notes:''},{exerciseKey:'overhead_triceps_extension',sets:3,repMin:10,repMax:12,rir:1,restSec:60,notes:''},{exerciseKey:'pec_deck_fly',sets:2,repMin:12,repMax:15,rir:1,restSec:60,notes:''}]},
  {id:'builtin_pull_b',builtIn:true,name:'Pull B',note:'划船主軸 + 下拉變化 + 二頭',category:'PPL',goal:'muscle_gain',frequencyRecommendation:'每週 1–2 次',durationMin:55,equipmentProfile:'full_gym',acsmFocus:'hypertrophy',cardioRecommendation:'課後可加 10–15 分低強度有氧',levelTag:'intermediate',prescriptionNote:'以划船為主動作，與 Pull A 輪替增加變化。',exercises:[{exerciseKey:'barbell_row',sets:4,repMin:6,repMax:8,rir:2,restSec:120,notes:''},{exerciseKey:'wide_grip_lat_pulldown',sets:3,repMin:10,repMax:12,rir:2,restSec:75,notes:''},{exerciseKey:'cable_row',sets:3,repMin:10,repMax:12,rir:2,restSec:75,notes:''},{exerciseKey:'reverse_pec_deck',sets:3,repMin:12,repMax:15,rir:1,restSec:60,notes:''},{exerciseKey:'ez_bar_curl',sets:3,repMin:10,repMax:12,rir:1,restSec:60,notes:''},{exerciseKey:'incline_dumbbell_curl',sets:2,repMin:10,repMax:12,rir:1,restSec:60,notes:''}]},
  {id:'builtin_legs_b',builtIn:true,name:'Legs B',note:'腿推主軸 + 單腿 + 臀部',category:'PPL',goal:'muscle_gain',frequencyRecommendation:'每週 1–2 次',durationMin:55,equipmentProfile:'full_gym',acsmFocus:'hypertrophy',cardioRecommendation:'腿日有氧可安排在非腿日',levelTag:'intermediate',prescriptionNote:'以腿推為主動作，搭配單腿與臀部訓練增加變化。',exercises:[{exerciseKey:'leg_press',sets:4,repMin:8,repMax:12,rir:2,restSec:120,notes:''},{exerciseKey:'bulgarian_split_squat',sets:3,repMin:8,repMax:10,rir:2,restSec:90,notes:''},{exerciseKey:'hip_thrust',sets:3,repMin:8,repMax:12,rir:2,restSec:90,notes:''},{exerciseKey:'leg_extension',sets:3,repMin:12,repMax:15,rir:1,restSec:60,notes:''},{exerciseKey:'leg_curl',sets:3,repMin:10,repMax:12,rir:1,restSec:60,notes:''},{exerciseKey:'seated_calf_raise',sets:3,repMin:12,repMax:15,rir:1,restSec:45,notes:''}]},
  // === 30-min ===
  {id:'builtin_push_30',builtIn:true,name:'Push 30',note:'30 分鐘高效推系',category:'Quick',goal:'muscle_gain',frequencyRecommendation:'每週 1–2 次',durationMin:30,equipmentProfile:'full_gym',acsmFocus:'hypertrophy',cardioRecommendation:'可獨立排有氧日',levelTag:'intermediate',prescriptionNote:'保留主動作與高價值輔助，壓縮休息時間。',exercises:[{exerciseKey:'barbell_bench_press',sets:3,repMin:6,repMax:8,rir:2,restSec:90,notes:''},{exerciseKey:'machine_shoulder_press',sets:3,repMin:8,repMax:10,rir:2,restSec:75,notes:''},{exerciseKey:'lateral_raise',sets:3,repMin:12,repMax:15,rir:1,restSec:45,notes:''},{exerciseKey:'triceps_pushdown',sets:2,repMin:10,repMax:12,rir:1,restSec:45,notes:''}]},
  {id:'builtin_pull_30',builtIn:true,name:'Pull 30',note:'30 分鐘高效拉系',category:'Quick',goal:'muscle_gain',frequencyRecommendation:'每週 1–2 次',durationMin:30,equipmentProfile:'full_gym',acsmFocus:'hypertrophy',cardioRecommendation:'可獨立排有氧日',levelTag:'intermediate',prescriptionNote:'保留垂直拉與划船核心，壓縮輔助動作。',exercises:[{exerciseKey:'lat_pulldown',sets:3,repMin:8,repMax:10,rir:2,restSec:90,notes:''},{exerciseKey:'chest_supported_row',sets:3,repMin:8,repMax:10,rir:2,restSec:75,notes:''},{exerciseKey:'face_pull',sets:2,repMin:12,repMax:15,rir:1,restSec:45,notes:''},{exerciseKey:'barbell_curl',sets:2,repMin:10,repMax:12,rir:1,restSec:45,notes:''}]},
  {id:'builtin_legs_30',builtIn:true,name:'Legs 30',note:'30 分鐘高效腿系',category:'Quick',goal:'muscle_gain',frequencyRecommendation:'每週 1–2 次',durationMin:30,equipmentProfile:'full_gym',acsmFocus:'hypertrophy',cardioRecommendation:'可獨立排有氧日',levelTag:'intermediate',prescriptionNote:'保留下肢主動作與後鏈，壓縮輔助。',exercises:[{exerciseKey:'back_squat',sets:3,repMin:6,repMax:8,rir:2,restSec:120,notes:''},{exerciseKey:'leg_curl',sets:3,repMin:10,repMax:12,rir:1,restSec:60,notes:''},{exerciseKey:'leg_press',sets:3,repMin:10,repMax:12,rir:2,restSec:75,notes:''},{exerciseKey:'calf_raise',sets:3,repMin:12,repMax:15,rir:1,restSec:45,notes:''}]},
  // === Machine ===
  {id:'builtin_machine_push',builtIn:true,name:'Machine Push',note:'全器械推系課表',category:'Machine',goal:'general_health',frequencyRecommendation:'每週 1–2 次',durationMin:45,equipmentProfile:'machine',acsmFocus:'general_health',cardioRecommendation:'課後可加 15–20 分有氧',levelTag:'beginner',prescriptionNote:'適合器材受限或初學者，全器械降低技術門檻。',exercises:[{exerciseKey:'machine_chest_press',sets:3,repMin:8,repMax:12,rir:2,restSec:90,notes:''},{exerciseKey:'incline_machine_press',sets:3,repMin:8,repMax:12,rir:2,restSec:75,notes:''},{exerciseKey:'seated_machine_shoulder_press',sets:3,repMin:8,repMax:12,rir:2,restSec:75,notes:''},{exerciseKey:'machine_fly',sets:2,repMin:12,repMax:15,rir:1,restSec:60,notes:''},{exerciseKey:'triceps_pushdown',sets:3,repMin:10,repMax:12,rir:1,restSec:60,notes:''}]},
  {id:'builtin_machine_pull',builtIn:true,name:'Machine Pull',note:'全器械拉系課表',category:'Machine',goal:'general_health',frequencyRecommendation:'每週 1–2 次',durationMin:45,equipmentProfile:'machine',acsmFocus:'general_health',cardioRecommendation:'課後可加 15–20 分有氧',levelTag:'beginner',prescriptionNote:'全器械拉系，適合無自由重量經驗者。',exercises:[{exerciseKey:'lat_pulldown',sets:3,repMin:8,repMax:12,rir:2,restSec:90,notes:''},{exerciseKey:'machine_row',sets:3,repMin:8,repMax:12,rir:2,restSec:75,notes:''},{exerciseKey:'chest_supported_row',sets:3,repMin:10,repMax:12,rir:2,restSec:75,notes:''},{exerciseKey:'reverse_pec_deck',sets:2,repMin:12,repMax:15,rir:1,restSec:60,notes:''},{exerciseKey:'cable_curl',sets:3,repMin:10,repMax:12,rir:1,restSec:60,notes:''}]},
  {id:'builtin_machine_legs',builtIn:true,name:'Machine Legs',note:'全器械腿系課表',category:'Machine',goal:'general_health',frequencyRecommendation:'每週 1–2 次',durationMin:45,equipmentProfile:'machine',acsmFocus:'general_health',cardioRecommendation:'腿日有氧可安排在非腿日',levelTag:'beginner',prescriptionNote:'全器械下肢，適合膝 / 下背敏感或初學者。',exercises:[{exerciseKey:'leg_press',sets:4,repMin:8,repMax:12,rir:2,restSec:90,notes:''},{exerciseKey:'smith_squat',sets:3,repMin:8,repMax:12,rir:2,restSec:90,notes:''},{exerciseKey:'leg_extension',sets:3,repMin:10,repMax:12,rir:1,restSec:60,notes:''},{exerciseKey:'leg_curl',sets:3,repMin:10,repMax:12,rir:1,restSec:60,notes:''},{exerciseKey:'hip_abduction_machine',sets:2,repMin:12,repMax:15,rir:1,restSec:60,notes:''},{exerciseKey:'calf_raise',sets:3,repMin:12,repMax:15,rir:1,restSec:45,notes:''}]},
  // === Dumbbell ===
  {id:'builtin_dumbbell_push',builtIn:true,name:'Dumbbell Push',note:'純啞鈴推系課表',category:'DB Only',goal:'general_health',frequencyRecommendation:'每週 1–2 次',durationMin:45,equipmentProfile:'dumbbell',acsmFocus:'general_health',cardioRecommendation:'課後步行 15–20 分即可',levelTag:'beginner',prescriptionNote:'只需啞鈴與可調椅。',exercises:[{exerciseKey:'flat_dumbbell_press',sets:4,repMin:8,repMax:12,rir:2,restSec:90,notes:''},{exerciseKey:'incline_dumbbell_press',sets:3,repMin:8,repMax:10,rir:2,restSec:90,notes:''},{exerciseKey:'seated_dumbbell_shoulder_press',sets:3,repMin:8,repMax:10,rir:2,restSec:75,notes:''},{exerciseKey:'lateral_raise',sets:3,repMin:12,repMax:15,rir:1,restSec:60,notes:''}]},
  {id:'builtin_dumbbell_pull',builtIn:true,name:'Dumbbell Pull',note:'純啞鈴拉系課表',category:'DB Only',goal:'general_health',frequencyRecommendation:'每週 1–2 次',durationMin:45,equipmentProfile:'dumbbell',acsmFocus:'general_health',cardioRecommendation:'課後步行 15–20 分即可',levelTag:'beginner',prescriptionNote:'只需啞鈴與可調椅。',exercises:[{exerciseKey:'single_arm_dumbbell_row',sets:4,repMin:8,repMax:12,rir:2,restSec:90,notes:''},{exerciseKey:'incline_dumbbell_curl',sets:3,repMin:10,repMax:12,rir:1,restSec:60,notes:''},{exerciseKey:'hammer_curl',sets:3,repMin:10,repMax:12,rir:1,restSec:60,notes:''},{exerciseKey:'concentration_curl',sets:2,repMin:10,repMax:12,rir:1,restSec:60,notes:''}]},
  {id:'builtin_dumbbell_legs',builtIn:true,name:'Dumbbell Legs',note:'純啞鈴腿系課表',category:'DB Only',goal:'general_health',frequencyRecommendation:'每週 1–2 次',durationMin:45,equipmentProfile:'dumbbell',acsmFocus:'general_health',cardioRecommendation:'課後步行即可',levelTag:'beginner',prescriptionNote:'只需啞鈴。',exercises:[{exerciseKey:'goblet_squat',sets:4,repMin:8,repMax:12,rir:2,restSec:90,notes:''},{exerciseKey:'walking_db_lunge',sets:3,repMin:10,repMax:12,rir:2,restSec:75,notes:''},{exerciseKey:'romanian_deadlift',sets:3,repMin:8,repMax:10,rir:2,restSec:90,notes:'啞鈴版 RDL'},{exerciseKey:'glute_bridge',sets:3,repMin:12,repMax:15,rir:1,restSec:60,notes:''},{exerciseKey:'step_up',sets:3,repMin:10,repMax:12,rir:2,restSec:60,notes:''}]},
  // === Common splits ===
  {id:'builtin_chest_shoulder_tri',builtIn:true,name:'Chest Shoulder Triceps',note:'胸肩三頭日',category:'Split',goal:'muscle_gain',frequencyRecommendation:'每週 1 次',durationMin:60,equipmentProfile:'full_gym',acsmFocus:'hypertrophy',cardioRecommendation:'非訓練日安排有氧',levelTag:'intermediate',prescriptionNote:'經典推系分化，適合胸肩三頭集中訓練。',exercises:[{exerciseKey:'barbell_bench_press',sets:4,repMin:6,repMax:8,rir:2,restSec:120,notes:''},{exerciseKey:'incline_dumbbell_press',sets:3,repMin:8,repMax:10,rir:2,restSec:90,notes:''},{exerciseKey:'cable_fly',sets:3,repMin:12,repMax:15,rir:1,restSec:60,notes:''},{exerciseKey:'overhead_press',sets:3,repMin:6,repMax:8,rir:2,restSec:120,notes:''},{exerciseKey:'lateral_raise',sets:3,repMin:12,repMax:15,rir:1,restSec:60,notes:''},{exerciseKey:'rope_pushdown',sets:3,repMin:10,repMax:12,rir:1,restSec:60,notes:''},{exerciseKey:'overhead_triceps_extension',sets:2,repMin:10,repMax:12,rir:1,restSec:60,notes:''}]},
  {id:'builtin_back_biceps',builtIn:true,name:'Back Biceps',note:'背二頭日',category:'Split',goal:'muscle_gain',frequencyRecommendation:'每週 1 次',durationMin:55,equipmentProfile:'full_gym',acsmFocus:'hypertrophy',cardioRecommendation:'非訓練日安排有氧',levelTag:'intermediate',prescriptionNote:'經典拉系分化，適合背部與二頭集中訓練。',exercises:[{exerciseKey:'pull_up',sets:4,repMin:5,repMax:8,rir:2,restSec:120,notes:''},{exerciseKey:'barbell_row',sets:4,repMin:6,repMax:8,rir:2,restSec:120,notes:''},{exerciseKey:'lat_pulldown',sets:3,repMin:10,repMax:12,rir:2,restSec:75,notes:''},{exerciseKey:'face_pull',sets:3,repMin:12,repMax:15,rir:1,restSec:60,notes:''},{exerciseKey:'ez_bar_curl',sets:3,repMin:10,repMax:12,rir:1,restSec:60,notes:''},{exerciseKey:'hammer_curl',sets:2,repMin:10,repMax:12,rir:1,restSec:60,notes:''}]},
  {id:'builtin_lower_body',builtIn:true,name:'Lower Body',note:'綜合下肢日',category:'Split',goal:'muscle_gain',frequencyRecommendation:'每週 1–2 次',durationMin:60,equipmentProfile:'full_gym',acsmFocus:'hypertrophy',cardioRecommendation:'腿日有氧可安排在非腿日',levelTag:'intermediate',prescriptionNote:'股四頭、後鏈、臀部、小腿完整覆蓋。',exercises:[{exerciseKey:'back_squat',sets:4,repMin:6,repMax:8,rir:2,restSec:150,notes:''},{exerciseKey:'romanian_deadlift',sets:3,repMin:8,repMax:10,rir:2,restSec:90,notes:''},{exerciseKey:'bulgarian_split_squat',sets:3,repMin:8,repMax:10,rir:2,restSec:75,notes:''},{exerciseKey:'leg_curl',sets:3,repMin:10,repMax:12,rir:1,restSec:60,notes:''},{exerciseKey:'hip_thrust',sets:3,repMin:8,repMax:12,rir:2,restSec:75,notes:''},{exerciseKey:'calf_raise',sets:4,repMin:10,repMax:15,rir:1,restSec:45,notes:''}]},
  {id:'builtin_upper_body',builtIn:true,name:'Upper Body',note:'綜合上肢日',category:'Split',goal:'muscle_gain',frequencyRecommendation:'每週 1–2 次',durationMin:60,equipmentProfile:'full_gym',acsmFocus:'hypertrophy',cardioRecommendation:'非訓練日安排有氧',levelTag:'intermediate',prescriptionNote:'推拉並行的上肢課表。',exercises:[{exerciseKey:'barbell_bench_press',sets:4,repMin:6,repMax:8,rir:2,restSec:120,notes:''},{exerciseKey:'pull_up',sets:4,repMin:5,repMax:8,rir:2,restSec:120,notes:''},{exerciseKey:'machine_shoulder_press',sets:3,repMin:8,repMax:10,rir:2,restSec:90,notes:''},{exerciseKey:'chest_supported_row',sets:3,repMin:8,repMax:10,rir:2,restSec:75,notes:''},{exerciseKey:'lateral_raise',sets:3,repMin:12,repMax:15,rir:1,restSec:60,notes:''},{exerciseKey:'triceps_pushdown',sets:2,repMin:10,repMax:12,rir:1,restSec:60,notes:''},{exerciseKey:'barbell_curl',sets:2,repMin:10,repMax:12,rir:1,restSec:60,notes:''}]},
  {id:'builtin_lower_hypertrophy',builtIn:true,name:'Lower Body Hypertrophy',note:'下肢肌肥大專攻',category:'Split',goal:'muscle_gain',frequencyRecommendation:'每週 1 次',durationMin:60,equipmentProfile:'full_gym',acsmFocus:'hypertrophy',cardioRecommendation:'腿日有氧可安排在非腿日',levelTag:'intermediate',prescriptionNote:'以高訓練量驅動下肢肌肥大。',exercises:[{exerciseKey:'hack_squat',sets:4,repMin:8,repMax:12,rir:2,restSec:120,notes:''},{exerciseKey:'romanian_deadlift',sets:3,repMin:8,repMax:10,rir:2,restSec:90,notes:''},{exerciseKey:'walking_lunge',sets:3,repMin:10,repMax:12,rir:2,restSec:75,notes:''},{exerciseKey:'leg_extension',sets:3,repMin:12,repMax:15,rir:1,restSec:60,notes:''},{exerciseKey:'leg_curl',sets:3,repMin:10,repMax:12,rir:1,restSec:60,notes:''},{exerciseKey:'hip_thrust',sets:3,repMin:10,repMax:12,rir:2,restSec:75,notes:''},{exerciseKey:'seated_calf_raise',sets:3,repMin:12,repMax:15,rir:1,restSec:45,notes:''}]},
  // === Existing upgraded ===
  {id:'builtin_upper_hypertrophy',builtIn:true,name:'Upper Hypertrophy',note:'ACSM 肌肥大取向，上肢總量優先',category:'Upper',goal:'muscle_gain',frequencyRecommendation:'每週 1–2 次',durationMin:60,equipmentProfile:'full_gym',acsmFocus:'hypertrophy',cardioRecommendation:'非訓練日安排有氧',levelTag:'intermediate',prescriptionNote:'以訓練量驅動上肢肌肥大。',exercises:[{exerciseKey:'incline_dumbbell_press',sets:4,repMin:8,repMax:12,rir:2,restSec:90,notes:''},{exerciseKey:'chest_supported_row',sets:4,repMin:8,repMax:12,rir:2,restSec:90,notes:''},{exerciseKey:'machine_shoulder_press',sets:3,repMin:8,repMax:12,rir:2,restSec:75,notes:''},{exerciseKey:'lat_pulldown',sets:3,repMin:10,repMax:12,rir:2,restSec:75,notes:''},{exerciseKey:'cable_fly',sets:2,repMin:12,repMax:15,rir:2,restSec:60,notes:''},{exerciseKey:'barbell_curl',sets:2,repMin:10,repMax:12,rir:1,restSec:60,notes:''},{exerciseKey:'triceps_pushdown',sets:2,repMin:10,repMax:12,rir:1,restSec:60,notes:''}]},
  {id:'builtin_lower_strength',builtIn:true,name:'Lower Strength',note:'ACSM 力量取向，下肢複合動作優先',category:'Lower',goal:'strength',frequencyRecommendation:'每週 1–2 次',durationMin:60,equipmentProfile:'full_gym',acsmFocus:'strength',cardioRecommendation:'非腿日安排低強度有氧',levelTag:'intermediate',prescriptionNote:'以高負荷複合動作驅動力量發展。',exercises:[{exerciseKey:'back_squat',sets:4,repMin:4,repMax:6,rir:2,restSec:150,notes:''},{exerciseKey:'trap_bar_deadlift',sets:3,repMin:4,repMax:6,rir:2,restSec:150,notes:''},{exerciseKey:'bulgarian_split_squat',sets:3,repMin:8,repMax:10,rir:2,restSec:75,notes:''},{exerciseKey:'leg_curl',sets:3,repMin:10,repMax:12,rir:1,restSec:60,notes:''},{exerciseKey:'calf_raise',sets:3,repMin:12,repMax:15,rir:1,restSec:45,notes:''}]},
  // === ACSM Templates ===
  {id:'builtin_acsm_general_strength',builtIn:true,name:'ACSM General Strength',note:'依 ACSM 健康成人建議',category:'ACSM',goal:'general_health',frequencyRecommendation:'每週 2–3 天',durationMin:45,equipmentProfile:'full_gym',acsmFocus:'general_health',cardioRecommendation:'每週累積 150–300 分中等強度有氧',levelTag:'beginner',prescriptionNote:'ACSM 基礎建議：涵蓋主要肌群、中等負荷、可持續。',exercises:[{exerciseKey:'goblet_squat',sets:3,repMin:8,repMax:12,rir:2,restSec:75,notes:''},{exerciseKey:'machine_chest_press',sets:3,repMin:8,repMax:12,rir:2,restSec:75,notes:''},{exerciseKey:'lat_pulldown',sets:3,repMin:8,repMax:12,rir:2,restSec:75,notes:''},{exerciseKey:'hip_thrust',sets:3,repMin:8,repMax:12,rir:2,restSec:75,notes:''},{exerciseKey:'plank',sets:3,repMin:20,repMax:40,rir:2,restSec:45,notes:''}]},
  {id:'builtin_acsm_general_2a',builtIn:true,name:'ACSM General Strength 2-Day A',note:'ACSM 一般健康 2 日 A',category:'ACSM',goal:'general_health',frequencyRecommendation:'每週 2 天（搭配 B）',durationMin:45,equipmentProfile:'full_gym',acsmFocus:'general_health',cardioRecommendation:'非訓練日累積有氧至 150 分／週',levelTag:'beginner',prescriptionNote:'2 日全身分化 A 日：推系 + 下肢 + 核心。',exercises:[{exerciseKey:'machine_chest_press',sets:3,repMin:8,repMax:12,rir:2,restSec:75,notes:''},{exerciseKey:'machine_shoulder_press',sets:3,repMin:8,repMax:12,rir:2,restSec:75,notes:''},{exerciseKey:'leg_press',sets:3,repMin:8,repMax:12,rir:2,restSec:90,notes:''},{exerciseKey:'leg_curl',sets:3,repMin:10,repMax:12,rir:1,restSec:60,notes:''},{exerciseKey:'plank',sets:3,repMin:20,repMax:40,rir:2,restSec:45,notes:''}]},
  {id:'builtin_acsm_general_2b',builtIn:true,name:'ACSM General Strength 2-Day B',note:'ACSM 一般健康 2 日 B',category:'ACSM',goal:'general_health',frequencyRecommendation:'每週 2 天（搭配 A）',durationMin:45,equipmentProfile:'full_gym',acsmFocus:'general_health',cardioRecommendation:'非訓練日累積有氧至 150 分／週',levelTag:'beginner',prescriptionNote:'2 日全身分化 B 日：拉系 + 下肢 + 核心。',exercises:[{exerciseKey:'lat_pulldown',sets:3,repMin:8,repMax:12,rir:2,restSec:75,notes:''},{exerciseKey:'chest_supported_row',sets:3,repMin:8,repMax:12,rir:2,restSec:75,notes:''},{exerciseKey:'goblet_squat',sets:3,repMin:8,repMax:12,rir:2,restSec:75,notes:''},{exerciseKey:'hip_thrust',sets:3,repMin:8,repMax:12,rir:2,restSec:75,notes:''},{exerciseKey:'dead_bug',sets:3,repMin:8,repMax:12,rir:2,restSec:45,notes:''}]},
  {id:'builtin_acsm_hypertrophy_fb',builtIn:true,name:'ACSM Hypertrophy Full Body',note:'ACSM 肌肥大全身',category:'ACSM',goal:'muscle_gain',frequencyRecommendation:'每週 3 天',durationMin:60,equipmentProfile:'full_gym',acsmFocus:'hypertrophy',cardioRecommendation:'每週累積 60–150 分輕中度有氧',levelTag:'intermediate',prescriptionNote:'以全身訓練累積肌肥大所需總量。',exercises:[{exerciseKey:'barbell_bench_press',sets:3,repMin:8,repMax:10,rir:2,restSec:90,notes:''},{exerciseKey:'barbell_row',sets:3,repMin:8,repMax:10,rir:2,restSec:90,notes:''},{exerciseKey:'back_squat',sets:3,repMin:8,repMax:10,rir:2,restSec:120,notes:''},{exerciseKey:'machine_shoulder_press',sets:3,repMin:8,repMax:12,rir:2,restSec:75,notes:''},{exerciseKey:'hip_thrust',sets:3,repMin:8,repMax:12,rir:2,restSec:75,notes:''},{exerciseKey:'cable_fly',sets:2,repMin:12,repMax:15,rir:1,restSec:60,notes:''},{exerciseKey:'cable_crunch',sets:2,repMin:12,repMax:15,rir:1,restSec:45,notes:''}]},
  {id:'builtin_acsm_strength_base',builtIn:true,name:'ACSM Strength Base',note:'ACSM 力量基礎',category:'ACSM',goal:'strength',frequencyRecommendation:'每週 3 天',durationMin:60,equipmentProfile:'full_gym',acsmFocus:'strength',cardioRecommendation:'每週累積 90–150 分中等有氧',levelTag:'intermediate',prescriptionNote:'以高負荷複合動作建立力量基礎。ACSM 建議 ≥60% 1RM。',exercises:[{exerciseKey:'back_squat',sets:4,repMin:4,repMax:6,rir:2,restSec:180,notes:''},{exerciseKey:'barbell_bench_press',sets:4,repMin:4,repMax:6,rir:2,restSec:180,notes:''},{exerciseKey:'conventional_deadlift',sets:3,repMin:3,repMax:5,rir:2,restSec:180,notes:''},{exerciseKey:'overhead_press',sets:3,repMin:5,repMax:7,rir:2,restSec:120,notes:''},{exerciseKey:'plank',sets:3,repMin:20,repMax:40,rir:2,restSec:60,notes:''}]},
  {id:'builtin_acsm_fat_loss_fb',builtIn:true,name:'ACSM Fat Loss Full Body',note:'ACSM 減脂全身',category:'ACSM',goal:'fat_loss',frequencyRecommendation:'每週 3–4 天',durationMin:50,equipmentProfile:'full_gym',acsmFocus:'fat_loss',cardioRecommendation:'每週累積 150–300 分中等有氧（優先）',levelTag:'intermediate',prescriptionNote:'阻力訓練保留肌肉量，搭配足量有氧達成能量赤字。',exercises:[{exerciseKey:'goblet_squat',sets:3,repMin:8,repMax:12,rir:2,restSec:75,notes:''},{exerciseKey:'machine_chest_press',sets:3,repMin:8,repMax:12,rir:2,restSec:75,notes:''},{exerciseKey:'lat_pulldown',sets:3,repMin:8,repMax:12,rir:2,restSec:75,notes:''},{exerciseKey:'hip_thrust',sets:3,repMin:8,repMax:12,rir:2,restSec:75,notes:''},{exerciseKey:'face_pull',sets:2,repMin:12,repMax:15,rir:1,restSec:60,notes:''},{exerciseKey:'plank',sets:3,repMin:20,repMax:40,rir:2,restSec:45,notes:''}]},
  {id:'builtin_acsm_cardio_support',builtIn:true,name:'ACSM Cardio Support Day',note:'有氧支持日（搭配阻力日使用）',category:'ACSM',goal:'cardio_endurance',frequencyRecommendation:'每週 2–3 天',durationMin:45,equipmentProfile:'full_gym',acsmFocus:'cardio_support',cardioRecommendation:'本課表本身以有氧為主',levelTag:'beginner',prescriptionNote:'以有氧為主、搭配簡單核心維持阻力訓練基礎。ACSM 建議有氧日仍可安排少量肌力。',exercises:[{exerciseKey:'treadmill_walk',sets:1,repMin:20,repMax:30,rir:2,restSec:0,notes:'中等強度快走 20–30 分'},{exerciseKey:'bike',sets:1,repMin:10,repMax:15,rir:2,restSec:0,notes:'低至中等強度 10–15 分'},{exerciseKey:'plank',sets:3,repMin:20,repMax:40,rir:2,restSec:45,notes:''},{exerciseKey:'dead_bug',sets:3,repMin:8,repMax:12,rir:2,restSec:45,notes:''}]},
  // === Existing ===
  {id:'builtin_dumbbell_only',builtIn:true,name:'Dumbbell Only',note:'器材受限時的全身啞鈴課表',category:'DB Only',goal:'general_health',frequencyRecommendation:'每週 2–3 天',durationMin:50,equipmentProfile:'dumbbell',acsmFocus:'general_health',cardioRecommendation:'課後步行 15–20 分',levelTag:'beginner',prescriptionNote:'只需一對啞鈴，適合居家或簡易健身房。',exercises:[{exerciseKey:'goblet_squat',sets:4,repMin:8,repMax:12,rir:2,restSec:75,notes:''},{exerciseKey:'incline_dumbbell_press',sets:4,repMin:8,repMax:12,rir:2,restSec:75,notes:''},{exerciseKey:'single_arm_dumbbell_row',sets:4,repMin:8,repMax:12,rir:2,restSec:75,notes:''},{exerciseKey:'dumbbell_shoulder_press',sets:3,repMin:8,repMax:10,rir:2,restSec:75,notes:''},{exerciseKey:'walking_lunge',sets:3,repMin:10,repMax:12,rir:2,restSec:60,notes:''},{exerciseKey:'hammer_curl',sets:2,repMin:10,repMax:12,rir:1,restSec:45,notes:''}]},
  {id:'builtin_home_strength',builtIn:true,name:'Home Strength',note:'居家／低器材版',category:'Home',goal:'general_health',frequencyRecommendation:'每週 2–3 天',durationMin:40,equipmentProfile:'bodyweight',acsmFocus:'general_health',cardioRecommendation:'ACSM：有氧可累積每週總量',levelTag:'beginner',prescriptionNote:'無器材或極低器材情境，適合在家訓練。',exercises:[{exerciseKey:'push_up',sets:4,repMin:8,repMax:15,rir:2,restSec:60,notes:''},{exerciseKey:'assisted_pull_up',sets:3,repMin:6,repMax:10,rir:2,restSec:75,notes:''},{exerciseKey:'split_squat',sets:3,repMin:10,repMax:12,rir:2,restSec:60,notes:''},{exerciseKey:'hip_thrust',sets:3,repMin:10,repMax:15,rir:2,restSec:60,notes:''},{exerciseKey:'dead_bug',sets:3,repMin:10,repMax:14,rir:2,restSec:45,notes:''},{exerciseKey:'walking',sets:1,repMin:20,repMax:30,rir:2,restSec:0,notes:'ACSM：有氧可累積每週總量。'}]},
  // === ACSM EXPANSION v1 ===
  {id:'builtin_acsm_beginner_intro',builtIn:true,name:'ACSM Beginner Intro',note:'初學者 30 分入門（全器械）',category:'ACSM',goal:'general_health',frequencyRecommendation:'每週 2 天',durationMin:30,equipmentProfile:'machine',acsmFocus:'general_health',cardioRecommendation:'非訓練日步行 20–30 分，每週累積 150 分',levelTag:'beginner',prescriptionNote:'30 分鐘入門課表，全器械降低技術門檻。',exercises:[{exerciseKey:'machine_chest_press',sets:2,repMin:10,repMax:12,rir:2,restSec:60,notes:''},{exerciseKey:'lat_pulldown',sets:2,repMin:10,repMax:12,rir:2,restSec:60,notes:''},{exerciseKey:'leg_press',sets:2,repMin:10,repMax:12,rir:2,restSec:75,notes:''},{exerciseKey:'seated_machine_shoulder_press',sets:2,repMin:10,repMax:12,rir:2,restSec:60,notes:''},{exerciseKey:'plank',sets:2,repMin:20,repMax:30,rir:2,restSec:45,notes:''}]},
  {id:'builtin_acsm_home_full_body',builtIn:true,name:'ACSM Home Full Body',note:'居家自體重全身 30 分',category:'ACSM',goal:'general_health',frequencyRecommendation:'每週 2–3 天',durationMin:30,equipmentProfile:'bodyweight',acsmFocus:'general_health',cardioRecommendation:'每週累積快走 150 分鐘',levelTag:'beginner',prescriptionNote:'零器材全身課表，適合居家維持。',exercises:[{exerciseKey:'push_up',sets:3,repMin:8,repMax:15,rir:2,restSec:60,notes:''},{exerciseKey:'inverted_row',sets:3,repMin:8,repMax:12,rir:2,restSec:60,notes:''},{exerciseKey:'split_squat',sets:3,repMin:8,repMax:12,rir:2,restSec:60,notes:''},{exerciseKey:'glute_bridge',sets:3,repMin:10,repMax:15,rir:2,restSec:45,notes:''},{exerciseKey:'hollow_hold',sets:3,repMin:15,repMax:30,rir:2,restSec:45,notes:''},{exerciseKey:'dead_bug',sets:3,repMin:8,repMax:12,rir:2,restSec:45,notes:''}]},
  {id:'builtin_acsm_dumbbell_fullbody_45',builtIn:true,name:'ACSM Dumbbell Full Body 45',note:'純啞鈴全身 45 分',category:'ACSM',goal:'muscle_gain',frequencyRecommendation:'每週 2–3 天',durationMin:45,equipmentProfile:'dumbbell',acsmFocus:'hypertrophy',cardioRecommendation:'非訓練日累積有氧 60–150 分',levelTag:'intermediate',prescriptionNote:'只用啞鈴覆蓋上下肢與核心。',exercises:[{exerciseKey:'flat_dumbbell_press',sets:3,repMin:8,repMax:12,rir:2,restSec:75,notes:''},{exerciseKey:'single_arm_dumbbell_row',sets:3,repMin:8,repMax:12,rir:2,restSec:75,notes:''},{exerciseKey:'goblet_squat',sets:3,repMin:8,repMax:12,rir:2,restSec:75,notes:''},{exerciseKey:'romanian_deadlift',sets:3,repMin:8,repMax:10,rir:2,restSec:90,notes:'啞鈴版 RDL'},{exerciseKey:'arnold_press',sets:3,repMin:8,repMax:12,rir:2,restSec:75,notes:''},{exerciseKey:'hammer_curl',sets:2,repMin:10,repMax:12,rir:1,restSec:45,notes:''},{exerciseKey:'plank',sets:2,repMin:20,repMax:40,rir:2,restSec:45,notes:''}]},
  {id:'builtin_acsm_fat_loss_30',builtIn:true,name:'ACSM Fat Loss 30',note:'減脂 30 分高效全身',category:'ACSM',goal:'fat_loss',frequencyRecommendation:'每週 3–4 天',durationMin:30,equipmentProfile:'full_gym',acsmFocus:'fat_loss',cardioRecommendation:'另外每週累積 150–300 分中等有氧',levelTag:'beginner',prescriptionNote:'壓縮休息時間、保留主要肌群刺激。',exercises:[{exerciseKey:'goblet_squat',sets:3,repMin:10,repMax:12,rir:2,restSec:45,notes:''},{exerciseKey:'machine_chest_press',sets:3,repMin:10,repMax:12,rir:2,restSec:45,notes:''},{exerciseKey:'cable_row',sets:3,repMin:10,repMax:12,rir:2,restSec:45,notes:''},{exerciseKey:'hip_thrust',sets:3,repMin:10,repMax:12,rir:2,restSec:45,notes:''},{exerciseKey:'plank',sets:3,repMin:20,repMax:40,rir:2,restSec:30,notes:''}]},
  {id:'builtin_acsm_fat_loss_circuit',builtIn:true,name:'ACSM Fat Loss Circuit 45',note:'減脂循環 45 分',category:'ACSM',goal:'fat_loss',frequencyRecommendation:'每週 3 天',durationMin:45,equipmentProfile:'full_gym',acsmFocus:'fat_loss',cardioRecommendation:'另排每週 150–300 分中等有氧',levelTag:'intermediate',prescriptionNote:'阻力循環為主，節奏緊湊保留肌肉量。',exercises:[{exerciseKey:'back_squat',sets:3,repMin:8,repMax:10,rir:2,restSec:60,notes:''},{exerciseKey:'incline_dumbbell_press',sets:3,repMin:8,repMax:10,rir:2,restSec:60,notes:''},{exerciseKey:'chest_supported_row',sets:3,repMin:8,repMax:10,rir:2,restSec:60,notes:''},{exerciseKey:'walking_db_lunge',sets:3,repMin:10,repMax:12,rir:2,restSec:60,notes:''},{exerciseKey:'face_pull',sets:3,repMin:12,repMax:15,rir:1,restSec:45,notes:''},{exerciseKey:'ab_wheel',sets:3,repMin:8,repMax:12,rir:2,restSec:45,notes:''}]},
  {id:'builtin_acsm_strength_fullbody_45',builtIn:true,name:'ACSM Strength Full Body 45',note:'力量全身 45 分',category:'ACSM',goal:'strength',frequencyRecommendation:'每週 2–3 天',durationMin:45,equipmentProfile:'full_gym',acsmFocus:'strength',cardioRecommendation:'另排每週 90–150 分有氧',levelTag:'intermediate',prescriptionNote:'三大複合動作 + 核心。',exercises:[{exerciseKey:'back_squat',sets:4,repMin:5,repMax:6,rir:2,restSec:150,notes:''},{exerciseKey:'barbell_bench_press',sets:4,repMin:5,repMax:6,rir:2,restSec:150,notes:''},{exerciseKey:'pendlay_row',sets:3,repMin:5,repMax:7,rir:2,restSec:120,notes:''},{exerciseKey:'plank',sets:3,repMin:20,repMax:40,rir:2,restSec:60,notes:''}]},
  {id:'builtin_acsm_strength_advanced',builtIn:true,name:'ACSM Strength Advanced',note:'進階力量 60 分',category:'ACSM',goal:'strength',frequencyRecommendation:'每週 3 天',durationMin:60,equipmentProfile:'full_gym',acsmFocus:'strength',cardioRecommendation:'另排每週 90 分低強度有氧',levelTag:'advanced',prescriptionNote:'高負荷、低次數、長休息，主動作優先。',exercises:[{exerciseKey:'back_squat',sets:5,repMin:3,repMax:5,rir:1,restSec:180,notes:''},{exerciseKey:'conventional_deadlift',sets:4,repMin:3,repMax:5,rir:1,restSec:180,notes:''},{exerciseKey:'barbell_bench_press',sets:5,repMin:3,repMax:5,rir:1,restSec:180,notes:''},{exerciseKey:'overhead_press',sets:4,repMin:4,repMax:6,rir:1,restSec:150,notes:''},{exerciseKey:'pendlay_row',sets:3,repMin:5,repMax:6,rir:2,restSec:120,notes:''},{exerciseKey:'pallof_press',sets:3,repMin:8,repMax:12,rir:2,restSec:45,notes:''}]},
  {id:'builtin_acsm_hypertrophy_advanced',builtIn:true,name:'ACSM Hypertrophy Advanced',note:'進階肌肥大 60 分',category:'ACSM',goal:'muscle_gain',frequencyRecommendation:'每週 4 天',durationMin:60,equipmentProfile:'full_gym',acsmFocus:'hypertrophy',cardioRecommendation:'非訓練日累積有氧 60–150 分',levelTag:'advanced',prescriptionNote:'高訓練量搭配下斜與雙槓變化。',exercises:[{exerciseKey:'decline_barbell_bench_press',sets:4,repMin:6,repMax:8,rir:1,restSec:120,notes:''},{exerciseKey:'chest_dip',sets:3,repMin:8,repMax:12,rir:1,restSec:90,notes:''},{exerciseKey:'chest_supported_row',sets:4,repMin:8,repMax:10,rir:2,restSec:90,notes:''},{exerciseKey:'arnold_press',sets:3,repMin:8,repMax:12,rir:2,restSec:75,notes:''},{exerciseKey:'reverse_cable_fly',sets:3,repMin:12,repMax:15,rir:1,restSec:60,notes:''},{exerciseKey:'skull_crusher',sets:3,repMin:8,repMax:12,rir:1,restSec:60,notes:''},{exerciseKey:'spider_curl',sets:3,repMin:10,repMax:12,rir:1,restSec:60,notes:''}]},
  {id:'builtin_acsm_cardio_endurance_45',builtIn:true,name:'ACSM Cardio Endurance 45',note:'心肺耐力 45 分',category:'ACSM',goal:'cardio_endurance',frequencyRecommendation:'每週 3–4 天',durationMin:45,equipmentProfile:'full_gym',acsmFocus:'cardio_support',cardioRecommendation:'本課表以有氧為主',levelTag:'intermediate',prescriptionNote:'穩定節奏累積有氧總量 + 核心。',exercises:[{exerciseKey:'treadmill_jog',sets:1,repMin:20,repMax:30,rir:2,restSec:0,notes:'穩定節奏 RPE 5–7'},{exerciseKey:'rower',sets:1,repMin:10,repMax:15,rir:2,restSec:0,notes:'持續划船 10–15 分'},{exerciseKey:'plank',sets:3,repMin:30,repMax:60,rir:2,restSec:45,notes:''},{exerciseKey:'pallof_press',sets:3,repMin:8,repMax:12,rir:2,restSec:45,notes:''}]}
];

// ================================================================
// 6.5 PROGRAM CLASSIFICATION (data layer — non-destructive extension)
// Purpose: add splitType / daySlot / bodyRegion / movementBias / pairedNext
// etc. so search + recommended-next can operate without rewriting BUILT_IN.
// ================================================================

// Exercise key -> movement pattern (ACSM-aligned, minimum set).
// Used by search and by inferPlanClassification() fallback logic.
const MOVEMENT_PATTERN_MAP={
  // horizontal push
  barbell_bench_press:'horizontal_push',flat_dumbbell_press:'horizontal_push',machine_chest_press:'horizontal_push',smith_bench_press:'horizontal_push',chest_press_neutral:'horizontal_push',push_up:'horizontal_push',weighted_dip:'horizontal_push',assisted_dip:'horizontal_push',chest_dip:'horizontal_push',assisted_chest_dip:'horizontal_push',decline_barbell_bench_press:'horizontal_push',decline_dumbbell_press:'horizontal_push',decline_smith_press:'horizontal_push',decline_machine_press:'horizontal_push',decline_push_up:'horizontal_push',
  // incline push
  incline_dumbbell_press:'incline_push',incline_machine_press:'incline_push',smith_incline_press:'incline_push',
  // vertical push
  overhead_press:'vertical_push',machine_shoulder_press:'vertical_push',dumbbell_shoulder_press:'vertical_push',seated_dumbbell_shoulder_press:'vertical_push',seated_machine_shoulder_press:'vertical_push',smith_shoulder_press:'vertical_push',arnold_press:'vertical_push',
  // chest fly
  cable_fly:'chest_fly',machine_fly:'chest_fly',pec_deck_fly:'chest_fly',high_to_low_cable_fly:'chest_fly',single_arm_high_to_low_cable_fly:'chest_fly',
  // lateral / front raise
  lateral_raise:'lateral_raise',cable_lateral_raise:'lateral_raise',front_raise:'lateral_raise',upright_row:'lateral_raise',
  // triceps isolation
  triceps_pushdown:'triceps_isolation',rope_pushdown:'triceps_isolation',straight_bar_pushdown:'triceps_isolation',overhead_triceps_extension:'triceps_isolation',lying_triceps_extension:'triceps_isolation',skull_crusher:'triceps_isolation',
  // horizontal pull
  chest_supported_row:'horizontal_pull',seated_cable_row:'horizontal_pull',cable_row:'horizontal_pull',barbell_row:'horizontal_pull',t_bar_row:'horizontal_pull',single_arm_dumbbell_row:'horizontal_pull',machine_row:'horizontal_pull',pendlay_row:'horizontal_pull',meadows_row:'horizontal_pull',inverted_row:'horizontal_pull',
  // vertical pull
  pull_up:'vertical_pull',assisted_pull_up:'vertical_pull',lat_pulldown:'vertical_pull',wide_grip_lat_pulldown:'vertical_pull',close_grip_lat_pulldown:'vertical_pull',reverse_grip_lat_pulldown:'vertical_pull',straight_arm_pulldown:'vertical_pull',
  // rear delt / scap
  face_pull:'rear_delt_scap',rear_delt_fly:'rear_delt_scap',reverse_pec_deck:'rear_delt_scap',reverse_cable_fly:'rear_delt_scap',
  // biceps isolation
  barbell_curl:'biceps_isolation',ez_bar_curl:'biceps_isolation',cable_curl:'biceps_isolation',preacher_curl:'biceps_isolation',concentration_curl:'biceps_isolation',incline_dumbbell_curl:'biceps_isolation',hammer_curl:'biceps_isolation',spider_curl:'biceps_isolation',reverse_curl:'biceps_isolation',
  // hinge
  conventional_deadlift:'hinge',sumo_deadlift:'hinge',romanian_deadlift:'hinge',trap_bar_deadlift:'hinge',hip_thrust:'hinge',smith_hip_thrust:'hinge',glute_bridge:'hinge',back_extension:'hinge',
  // squat
  back_squat:'squat',front_squat:'squat',smith_squat:'squat',hack_squat:'squat',leg_press:'squat',goblet_squat:'squat',single_leg_press:'squat',cossack_squat:'squat',
  // lunge / single leg
  bulgarian_split_squat:'lunge_single_leg',smith_split_squat:'lunge_single_leg',split_squat:'lunge_single_leg',walking_lunge:'lunge_single_leg',walking_db_lunge:'lunge_single_leg',reverse_lunge:'lunge_single_leg',step_up:'lunge_single_leg',
  // leg extension / curl
  leg_extension:'leg_extension',leg_curl:'leg_curl',nordic_curl:'leg_curl',
  // calf
  calf_raise:'calf',seated_calf_raise:'calf',standing_calf_raise:'calf',
  // hip abduction / adduction
  hip_abduction_machine:'hip_abduction_adduction',hip_adduction_machine:'hip_abduction_adduction',
  // core
  plank:'anti_extension',ab_wheel:'anti_extension',dead_bug:'anti_extension',hollow_hold:'anti_extension',
  pallof_press:'anti_rotation',
  side_plank:'anti_lateral_flexion',
  crunch:'trunk_flexion',cable_crunch:'trunk_flexion',hanging_leg_raise:'trunk_flexion',lying_leg_raise:'trunk_flexion',russian_twist:'trunk_flexion',
  // carry / conditioning
  farmer_carry:'carry',
  stepper:'conditioning',stair_climber:'conditioning',treadmill_run:'conditioning',treadmill_walk:'conditioning',treadmill_jog:'conditioning',outdoor_run:'conditioning',outdoor_walk:'conditioning',bike:'conditioning',elliptical:'conditioning',rower:'conditioning',walking:'conditioning'
};
function movementPatternOf(exKey){return MOVEMENT_PATTERN_MAP[exKey]||'mixed'}

// Category (registry.category) -> body region.
const CATEGORY_REGION_MAP={Push:'upper',Pull:'upper',Legs:'lower',Core:'core','Full Body':'full',Cardio:'full'};

// Per-id overrides for built-in programs. Only id present here gets overridden;
// everything else falls back to inferPlanClassification().
const BUILT_IN_CLASSIFICATION={
  builtin_push_a:{splitType:'ppl',daySlot:'A',bodyRegion:'upper',movementBias:'push',goalBias:'hypertrophy',pairGroup:'ppl_AB_cycle',pairedNext:['builtin_pull_a'],primaryPatterns:['horizontal_push','vertical_push','triceps_isolation'],secondaryPatterns:['chest_fly','lateral_raise'],searchTags:['推日','push day','胸推','上半身','upper','PPL','A','胸肩三頭']},
  builtin_pull_a:{splitType:'ppl',daySlot:'A',bodyRegion:'upper',movementBias:'pull',goalBias:'hypertrophy',pairGroup:'ppl_AB_cycle',pairedNext:['builtin_legs_a'],primaryPatterns:['vertical_pull','horizontal_pull','biceps_isolation'],secondaryPatterns:['rear_delt_scap'],searchTags:['拉日','pull day','背','二頭','上半身','upper','PPL','A']},
  builtin_legs_a:{splitType:'ppl',daySlot:'A',bodyRegion:'lower',movementBias:'squat',goalBias:'hypertrophy',pairGroup:'ppl_AB_cycle',pairedNext:['builtin_push_b'],primaryPatterns:['squat','hinge','leg_curl'],secondaryPatterns:['calf'],searchTags:['腿日','legs day','深蹲','下半身','lower','PPL','A']},
  builtin_push_b:{splitType:'ppl',daySlot:'B',bodyRegion:'upper',movementBias:'push',goalBias:'hypertrophy',pairGroup:'ppl_AB_cycle',pairedNext:['builtin_pull_b'],primaryPatterns:['horizontal_push','incline_push','vertical_push','triceps_isolation'],secondaryPatterns:['chest_fly','lateral_raise'],searchTags:['推日','push day','胸推','上半身','upper','PPL','B']},
  builtin_pull_b:{splitType:'ppl',daySlot:'B',bodyRegion:'upper',movementBias:'pull',goalBias:'hypertrophy',pairGroup:'ppl_AB_cycle',pairedNext:['builtin_legs_b'],primaryPatterns:['horizontal_pull','vertical_pull','biceps_isolation'],secondaryPatterns:['rear_delt_scap'],searchTags:['拉日','pull day','背','二頭','上半身','upper','PPL','B']},
  builtin_legs_b:{splitType:'ppl',daySlot:'B',bodyRegion:'lower',movementBias:'hinge',goalBias:'hypertrophy',pairGroup:'ppl_AB_cycle',pairedNext:['builtin_push_a'],primaryPatterns:['squat','lunge_single_leg','hinge','leg_extension','leg_curl'],secondaryPatterns:['calf'],searchTags:['腿日','legs day','臀','下半身','lower','PPL','B']},
  builtin_push_30:{splitType:'ppl',daySlot:'A',bodyRegion:'upper',movementBias:'push',goalBias:'hypertrophy',pairGroup:'ppl_30_cycle',pairedNext:['builtin_pull_30'],primaryPatterns:['horizontal_push','vertical_push','triceps_isolation'],secondaryPatterns:['lateral_raise'],recoveryCost:'low',searchTags:['推日','30分','快速','quick','short','push']},
  builtin_pull_30:{splitType:'ppl',daySlot:'A',bodyRegion:'upper',movementBias:'pull',goalBias:'hypertrophy',pairGroup:'ppl_30_cycle',pairedNext:['builtin_legs_30'],primaryPatterns:['vertical_pull','horizontal_pull','biceps_isolation'],recoveryCost:'low',searchTags:['拉日','30分','快速','quick','pull']},
  builtin_legs_30:{splitType:'ppl',daySlot:'A',bodyRegion:'lower',movementBias:'squat',goalBias:'hypertrophy',pairGroup:'ppl_30_cycle',pairedNext:['builtin_push_30'],primaryPatterns:['squat','leg_curl'],secondaryPatterns:['calf'],recoveryCost:'low',searchTags:['腿日','30分','快速','quick','legs']},
  builtin_machine_push:{splitType:'ppl',daySlot:'A',bodyRegion:'upper',movementBias:'push',goalBias:'general_fitness',pairGroup:'ppl_machine_cycle',pairedNext:['builtin_machine_pull'],primaryPatterns:['horizontal_push','vertical_push','chest_fly','triceps_isolation'],searchTags:['器械','machine','推日','初學','beginner']},
  builtin_machine_pull:{splitType:'ppl',daySlot:'A',bodyRegion:'upper',movementBias:'pull',goalBias:'general_fitness',pairGroup:'ppl_machine_cycle',pairedNext:['builtin_machine_legs'],primaryPatterns:['vertical_pull','horizontal_pull','rear_delt_scap','biceps_isolation'],searchTags:['器械','machine','拉日','初學','beginner']},
  builtin_machine_legs:{splitType:'ppl',daySlot:'A',bodyRegion:'lower',movementBias:'squat',goalBias:'general_fitness',pairGroup:'ppl_machine_cycle',pairedNext:['builtin_machine_push'],primaryPatterns:['squat','leg_extension','leg_curl','hip_abduction_adduction'],secondaryPatterns:['calf'],searchTags:['器械','machine','腿日','初學','beginner']},
  builtin_dumbbell_push:{splitType:'ppl',daySlot:'A',bodyRegion:'upper',movementBias:'push',goalBias:'general_fitness',pairGroup:'ppl_dumbbell_cycle',pairedNext:['builtin_dumbbell_pull'],primaryPatterns:['horizontal_push','vertical_push','incline_push'],secondaryPatterns:['lateral_raise'],searchTags:['啞鈴','dumbbell','推日','home','居家']},
  builtin_dumbbell_pull:{splitType:'ppl',daySlot:'A',bodyRegion:'upper',movementBias:'pull',goalBias:'general_fitness',pairGroup:'ppl_dumbbell_cycle',pairedNext:['builtin_dumbbell_legs'],primaryPatterns:['horizontal_pull','biceps_isolation'],incompletePair:true,searchTags:['啞鈴','dumbbell','拉日','home','居家']},
  builtin_dumbbell_legs:{splitType:'ppl',daySlot:'A',bodyRegion:'lower',movementBias:'squat',goalBias:'general_fitness',pairGroup:'ppl_dumbbell_cycle',pairedNext:['builtin_dumbbell_push'],primaryPatterns:['squat','lunge_single_leg','hinge'],searchTags:['啞鈴','dumbbell','腿日','home','居家']},
  builtin_chest_shoulder_tri:{splitType:'specialization',daySlot:'accessory',bodyRegion:'upper',movementBias:'push',goalBias:'hypertrophy',pairGroup:'bro_split_cycle',pairedNext:['builtin_back_biceps'],primaryPatterns:['horizontal_push','vertical_push','chest_fly','lateral_raise','triceps_isolation'],searchTags:['胸肩加強','胸肩三頭','bro split','specialization','加強','推']},
  builtin_back_biceps:{splitType:'specialization',daySlot:'accessory',bodyRegion:'upper',movementBias:'pull',goalBias:'hypertrophy',pairGroup:'bro_split_cycle',pairedNext:['builtin_chest_shoulder_tri'],primaryPatterns:['vertical_pull','horizontal_pull','rear_delt_scap','biceps_isolation'],searchTags:['背部厚度加強','背部寬度加強','背二頭','bro split','specialization','加強','拉']},
  builtin_upper_body:{splitType:'upper_lower',daySlot:'A',bodyRegion:'upper',movementBias:'mixed',goalBias:'hypertrophy',pairGroup:'upper_lower_cycle',pairedNext:['builtin_lower_body'],primaryPatterns:['horizontal_push','vertical_push','vertical_pull','horizontal_pull'],secondaryPatterns:['lateral_raise','biceps_isolation','triceps_isolation'],searchTags:['上半身','upper','upper body','A','推拉']},
  builtin_lower_body:{splitType:'upper_lower',daySlot:'A',bodyRegion:'lower',movementBias:'squat',goalBias:'hypertrophy',pairGroup:'upper_lower_cycle',pairedNext:['builtin_upper_hypertrophy'],primaryPatterns:['squat','hinge','lunge_single_leg'],secondaryPatterns:['leg_curl','calf'],searchTags:['下半身','lower','lower body','腿','A']},
  builtin_upper_hypertrophy:{splitType:'upper_lower',daySlot:'B',bodyRegion:'upper',movementBias:'mixed',goalBias:'hypertrophy',pairGroup:'upper_lower_cycle',pairedNext:['builtin_lower_hypertrophy'],primaryPatterns:['incline_push','horizontal_pull','vertical_push','vertical_pull'],secondaryPatterns:['chest_fly','biceps_isolation','triceps_isolation'],searchTags:['上半身','upper','肌肥大','B','hypertrophy']},
  builtin_lower_hypertrophy:{splitType:'upper_lower',daySlot:'B',bodyRegion:'lower',movementBias:'mixed',goalBias:'hypertrophy',pairGroup:'upper_lower_cycle',pairedNext:['builtin_upper_body'],primaryPatterns:['squat','hinge','lunge_single_leg','leg_extension','leg_curl'],secondaryPatterns:['calf'],searchTags:['下半身','lower','肌肥大','B','hypertrophy']},
  builtin_lower_strength:{splitType:'upper_lower',daySlot:'B',bodyRegion:'lower',movementBias:'squat',goalBias:'strength',pairGroup:'upper_lower_strength',pairedNext:['builtin_upper_hypertrophy'],primaryPatterns:['squat','hinge','lunge_single_leg'],secondaryPatterns:['leg_curl','calf'],incompletePair:true,searchTags:['下半身','lower','力量','strength','B']},
  builtin_acsm_general_strength:{splitType:'full_body',daySlot:'A',bodyRegion:'full',movementBias:'mixed',goalBias:'general_fitness',primaryPatterns:['squat','horizontal_push','vertical_pull','hinge','anti_extension'],incompletePair:true,searchTags:['全身','full body','ACSM','一般健康','general']},
  builtin_acsm_general_2a:{splitType:'full_body',daySlot:'A',bodyRegion:'full',movementBias:'push',goalBias:'general_fitness',pairGroup:'acsm_general_2day',pairedNext:['builtin_acsm_general_2b'],primaryPatterns:['horizontal_push','vertical_push','squat','leg_curl','anti_extension'],searchTags:['全身','ACSM','2day','2日','A']},
  builtin_acsm_general_2b:{splitType:'full_body',daySlot:'B',bodyRegion:'full',movementBias:'pull',goalBias:'general_fitness',pairGroup:'acsm_general_2day',pairedNext:['builtin_acsm_general_2a'],primaryPatterns:['vertical_pull','horizontal_pull','squat','hinge','anti_extension'],searchTags:['全身','ACSM','2day','2日','B']},
  builtin_acsm_hypertrophy_fb:{splitType:'full_body',daySlot:'A',bodyRegion:'full',movementBias:'mixed',goalBias:'hypertrophy',primaryPatterns:['horizontal_push','horizontal_pull','squat','vertical_push','hinge'],incompletePair:true,searchTags:['全身','ACSM','肌肥大','full body','hypertrophy']},
  builtin_acsm_strength_base:{splitType:'full_body',daySlot:'A',bodyRegion:'full',movementBias:'mixed',goalBias:'strength',primaryPatterns:['squat','horizontal_push','hinge','vertical_push'],incompletePair:true,searchTags:['全身','ACSM','力量','strength']},
  builtin_acsm_fat_loss_fb:{splitType:'full_body',daySlot:'A',bodyRegion:'full',movementBias:'mixed',goalBias:'fat_loss',primaryPatterns:['squat','horizontal_push','vertical_pull','hinge','rear_delt_scap'],incompletePair:true,searchTags:['全身','ACSM','減脂','fat loss']},
  builtin_acsm_cardio_support:{splitType:'specialization',daySlot:'accessory',bodyRegion:'full',movementBias:'recovery',goalBias:'endurance',primaryPatterns:['conditioning','anti_extension','anti_rotation'],recoveryCost:'low',searchTags:['恢復','cardio','有氧','recovery','low fatigue']},
  builtin_dumbbell_only:{splitType:'full_body',daySlot:'A',bodyRegion:'full',movementBias:'mixed',goalBias:'general_fitness',primaryPatterns:['squat','horizontal_push','horizontal_pull','vertical_push'],incompletePair:true,searchTags:['全身','啞鈴','dumbbell','居家','home']},
  builtin_home_strength:{splitType:'full_body',daySlot:'A',bodyRegion:'full',movementBias:'mixed',goalBias:'general_fitness',primaryPatterns:['horizontal_push','vertical_pull','lunge_single_leg','hinge','anti_extension'],incompletePair:true,searchTags:['全身','居家','home','自體重','bodyweight']},
  builtin_acsm_beginner_intro:{splitType:'full_body',daySlot:'A',bodyRegion:'full',movementBias:'mixed',goalBias:'general_fitness',primaryPatterns:['horizontal_push','vertical_pull','squat','vertical_push','anti_extension'],incompletePair:true,searchTags:['全身','初學','beginner','入門','ACSM']},
  builtin_acsm_home_full_body:{splitType:'full_body',daySlot:'A',bodyRegion:'full',movementBias:'mixed',goalBias:'general_fitness',primaryPatterns:['horizontal_push','horizontal_pull','lunge_single_leg','anti_extension'],incompletePair:true,searchTags:['全身','居家','home','自體重','bodyweight','ACSM']},
  builtin_acsm_dumbbell_fullbody_45:{splitType:'full_body',daySlot:'A',bodyRegion:'full',movementBias:'mixed',goalBias:'hypertrophy',primaryPatterns:['horizontal_push','horizontal_pull','squat','hinge','vertical_push'],incompletePair:true,searchTags:['全身','啞鈴','dumbbell','45分','ACSM']},
  builtin_acsm_fat_loss_30:{splitType:'full_body',daySlot:'A',bodyRegion:'full',movementBias:'mixed',goalBias:'fat_loss',primaryPatterns:['squat','horizontal_push','horizontal_pull','hinge','anti_extension'],incompletePair:true,recoveryCost:'low',searchTags:['全身','減脂','fat loss','30分','ACSM']},
  builtin_acsm_fat_loss_circuit:{splitType:'full_body',daySlot:'A',bodyRegion:'full',movementBias:'mixed',goalBias:'fat_loss',primaryPatterns:['squat','incline_push','horizontal_pull','lunge_single_leg','rear_delt_scap'],incompletePair:true,searchTags:['全身','減脂','fat loss','循環','circuit','ACSM']},
  builtin_acsm_strength_fullbody_45:{splitType:'full_body',daySlot:'A',bodyRegion:'full',movementBias:'mixed',goalBias:'strength',primaryPatterns:['squat','horizontal_push','horizontal_pull','anti_extension'],incompletePair:true,searchTags:['全身','力量','strength','45分','ACSM']},
  builtin_acsm_strength_advanced:{splitType:'full_body',daySlot:'A',bodyRegion:'full',movementBias:'mixed',goalBias:'strength',primaryPatterns:['squat','hinge','horizontal_push','vertical_push','horizontal_pull','anti_rotation'],incompletePair:true,recoveryCost:'high',searchTags:['全身','力量','strength','進階','advanced','ACSM']},
  builtin_acsm_hypertrophy_advanced:{splitType:'ppl',daySlot:'A',bodyRegion:'upper',movementBias:'push',goalBias:'hypertrophy',primaryPatterns:['horizontal_push','horizontal_pull','vertical_push','rear_delt_scap','triceps_isolation','biceps_isolation'],incompletePair:true,searchTags:['進階','肌肥大','advanced','hypertrophy','推','pull','ACSM']},
  builtin_acsm_cardio_endurance_45:{splitType:'specialization',daySlot:'accessory',bodyRegion:'full',movementBias:'recovery',goalBias:'endurance',primaryPatterns:['conditioning','anti_extension','anti_rotation'],recoveryCost:'low',searchTags:['有氧','cardio','耐力','endurance','45分','ACSM','恢復']}
};

// Infer classification from a plan's name + exercise composition when no
// override exists. Conservative: always returns a safe record, never crashes.
function inferPlanClassification(plan){
  const out={splitType:'misc',daySlot:'A',bodyRegion:'full',movementBias:'mixed',goalBias:'general_fitness',pairGroup:'',pairedNext:[],primaryPatterns:[],secondaryPatterns:[],incompletePair:false,searchTags:[],recoveryCost:'medium'};
  if(!plan||typeof plan!=='object')return out;
  const name=String(plan.name||'').toLowerCase();
  const note=String(plan.note||'').toLowerCase();
  const cat=String(plan.category||'').toLowerCase();
  const blob=[name,note,cat].join(' ');
  // splitType from name / category
  if(/full[\s-]?body|全身/.test(blob)||cat==='acsm'){out.splitType='full_body'}
  else if(/\bpush\b|\bpull\b|\blegs?\b|推日|拉日|腿日/.test(blob)){out.splitType='ppl'}
  else if(/upper|lower|上半身|下半身/.test(blob)){out.splitType='upper_lower'}
  else if(/加強|補強|恢復|accessory|specialization/.test(blob)){out.splitType='specialization'}
  // movementBias + bodyRegion
  if(/push|推|胸|肩推/.test(blob)){out.movementBias='push';out.bodyRegion='upper'}
  else if(/pull|拉|背|划船/.test(blob)){out.movementBias='pull';out.bodyRegion='upper'}
  else if(/squat|深蹲|腿|lower|下半身/.test(blob)){out.movementBias='squat';out.bodyRegion='lower'}
  else if(/hinge|硬舉|臀|rdl|posterior/.test(blob)){out.movementBias='hinge';out.bodyRegion='lower'}
  else if(/upper|上半身/.test(blob)){out.movementBias='mixed';out.bodyRegion='upper'}
  else if(/recovery|恢復|cardio|有氧/.test(blob)){out.movementBias='recovery';out.bodyRegion='full'}
  // daySlot from trailing letter
  if(/\bb\b|\sb\b|2$|二$/.test(name))out.daySlot='B';
  else if(/\bc\b|\sc\b|3$|三$/.test(name))out.daySlot='C';
  // goalBias from plan.goal / acsmFocus
  const goalMap={muscle_gain:'hypertrophy',hypertrophy:'hypertrophy',strength:'strength',fat_loss:'fat_loss',cardio_endurance:'endurance',cardio_support:'endurance',general_health:'general_fitness',functional:'general_fitness',rehab:'recovery'};
  out.goalBias=goalMap[plan.goal]||goalMap[plan.acsmFocus]||'general_fitness';
  // Pattern counts from exercises
  const pats={};
  (plan.exercises||[]).forEach(ex=>{const k=ex.exerciseKey||resolveKey(ex.name||'');const p=movementPatternOf(k);if(p&&p!=='mixed')pats[p]=(pats[p]||0)+1});
  const sortedPats=Object.entries(pats).sort((a,b)=>b[1]-a[1]);
  out.primaryPatterns=sortedPats.slice(0,4).map(e=>e[0]);
  out.secondaryPatterns=sortedPats.slice(4,8).map(e=>e[0]);
  // Refine splitType if still misc by pattern spread
  if(out.splitType==='misc'){
    const up=['horizontal_push','incline_push','vertical_push','chest_fly','lateral_raise','triceps_isolation','horizontal_pull','vertical_pull','rear_delt_scap','biceps_isolation'];
    const lo=['squat','hinge','lunge_single_leg','leg_extension','leg_curl','calf','hip_abduction_adduction'];
    const upHits=up.filter(p=>pats[p]).length,loHits=lo.filter(p=>pats[p]).length;
    if(upHits>0&&loHits>0)out.splitType='full_body';
    else if(upHits>0&&loHits===0){out.splitType='upper_lower';out.bodyRegion='upper'}
    else if(loHits>0&&upHits===0){out.splitType='upper_lower';out.bodyRegion='lower'}
  }
  if(!out.pairedNext.length)out.incompletePair=true;
  return out;
}

// Non-destructive normalize: add classification fields if missing.
// Idempotent — re-running on a normalized plan is a no-op for set fields.
function normalizeWorkoutPlan(plan){
  if(!plan||typeof plan!=='object')return plan;
  const override=plan.builtIn?BUILT_IN_CLASSIFICATION[plan.id]:null;
  const inferred=inferPlanClassification(plan);
  const merged={...inferred,...(override||{})};
  if(!plan.splitType)plan.splitType=merged.splitType||'misc';
  if(!plan.daySlot)plan.daySlot=merged.daySlot||'A';
  if(!plan.bodyRegion)plan.bodyRegion=merged.bodyRegion||'full';
  if(!plan.movementBias)plan.movementBias=merged.movementBias||'mixed';
  if(!plan.goalBias)plan.goalBias=merged.goalBias||'general_fitness';
  if(!plan.experienceLevel)plan.experienceLevel=plan.levelTag||'intermediate';
  if(!plan.recoveryCost)plan.recoveryCost=merged.recoveryCost||'medium';
  if(!Array.isArray(plan.primaryPatterns)||!plan.primaryPatterns.length)plan.primaryPatterns=merged.primaryPatterns||[];
  if(!Array.isArray(plan.secondaryPatterns))plan.secondaryPatterns=merged.secondaryPatterns||[];
  if(!Array.isArray(plan.pairedNext))plan.pairedNext=merged.pairedNext||[];
  if(typeof plan.pairGroup!=='string')plan.pairGroup=merged.pairGroup||'';
  if(typeof plan.incompletePair!=='boolean')plan.incompletePair=!!merged.incompletePair;
  if(!plan.displayName)plan.displayName=plan.name||'Untitled';
  if(!Array.isArray(plan.searchTags))plan.searchTags=merged.searchTags||[];
  if(!plan.status)plan.status='active';
  return plan;
}

// Labels for display — keep short to fit a pill on a mobile card.
const SPLIT_TYPE_LABEL={full_body:'全身',upper_lower:'上下半身',ppl:'PPL',specialization:'加強',misc:'綜合'};
const MOVEMENT_BIAS_LABEL={push:'推',pull:'拉',squat:'深蹲',hinge:'硬舉',single_leg:'單側',lunge_single_leg:'單側',mixed:'混合',recovery:'恢復'};
const BODY_REGION_LABEL={upper:'上肢',lower:'下肢',full:'全身',accessory:'輔助',core:'核心'};
function planShortLabel(p){
  if(!p)return'';
  const st=SPLIT_TYPE_LABEL[p.splitType]||'';
  const daySuffix=p.daySlot&&p.daySlot!=='accessory'?` ${p.daySlot}`:'';
  if(p.splitType==='ppl'){
    const bias=MOVEMENT_BIAS_LABEL[p.movementBias]||'';
    return`${bias?bias:'PPL'}${daySuffix}`.trim();
  }
  if(p.splitType==='upper_lower'){
    const region=BODY_REGION_LABEL[p.bodyRegion]||'';
    return`${region}${daySuffix}`.trim();
  }
  if(p.splitType==='full_body'){
    return`全身${daySuffix}`.trim();
  }
  if(p.splitType==='specialization'){
    return'加強／恢復';
  }
  return st||'綜合';
}

// Completeness validator. Returns { complete, issues[] }. Conservative — does
// not flag programs that are intentionally short (e.g. 30-min quick).
function validatePlanCompleteness(plan){
  const issues=[];
  if(!plan||!Array.isArray(plan.exercises)||!plan.exercises.length){return{complete:false,issues:['no exercises']}}
  const pats=new Set((plan.exercises||[]).map(ex=>movementPatternOf(ex.exerciseKey||resolveKey(ex.name||''))));
  const has=p=>pats.has(p);
  const needs=[];
  if(plan.splitType==='ppl'){
    if(plan.movementBias==='push'){
      if(!(has('horizontal_push')||has('incline_push')))needs.push('主力胸推');
      if(!(has('vertical_push')||has('lateral_raise')))needs.push('肩部動作');
      if(!has('triceps_isolation'))needs.push('三頭動作');
    }else if(plan.movementBias==='pull'){
      if(!(has('vertical_pull')||has('horizontal_pull')))needs.push('主力拉');
      if(!has('biceps_isolation'))needs.push('二頭動作');
    }else if(plan.movementBias==='squat'||plan.movementBias==='hinge'){
      if(!has('squat'))needs.push('squat 類');
      if(!(has('hinge')||has('leg_curl')))needs.push('後鏈動作');
    }
  }else if(plan.splitType==='upper_lower'){
    if(plan.bodyRegion==='upper'){
      if(!(has('horizontal_push')||has('incline_push')||has('vertical_push')))needs.push('上肢推');
      if(!(has('horizontal_pull')||has('vertical_pull')))needs.push('上肢拉');
    }else if(plan.bodyRegion==='lower'){
      if(!has('squat'))needs.push('主要 squat');
      if(!(has('hinge')||has('leg_curl')))needs.push('後鏈');
    }
  }
  if(plan.incompletePair)issues.push('缺配對');
  if(needs.length)issues.push(...needs.map(n=>`缺 ${n}`));
  return{complete:issues.length===0,issues};
}

// Given current plan id, return { primary, secondary[] }.
// primary is a full plan object (or null). secondary is 0–2 accessory suggestions.
// Never throws; safe to call with unknown ids.
function getRecommendedNextPlan(planId){
  const empty={primary:null,secondary:[]};
  try{
    const all=PS.getAll();
    const cur=all.find(p=>p.id===planId);
    if(!cur)return empty;
    let primary=null;
    if(Array.isArray(cur.pairedNext)&&cur.pairedNext.length){
      for(const id of cur.pairedNext){const hit=all.find(p=>p.id===id);if(hit){primary=hit;break}}
    }
    if(!primary){
      // Fallback: same pairGroup, different daySlot or movementBias
      primary=all.find(p=>p.id!==cur.id&&p.pairGroup&&p.pairGroup===cur.pairGroup)||null;
    }
    if(!primary){
      // Fallback: same splitType, different movementBias, not specialization
      primary=all.find(p=>p.id!==cur.id&&p.splitType===cur.splitType&&p.splitType!=='specialization'&&p.movementBias!==cur.movementBias)||null;
    }
    if(!primary){
      // Last fallback: same splitType, any other plan
      primary=all.find(p=>p.id!==cur.id&&p.splitType===cur.splitType)||null;
    }
    // Secondary: 0–2 specialization / accessory suggestions aligned to goal
    const secondary=all.filter(p=>p.id!==cur.id&&p.splitType==='specialization'&&(p.goalBias===cur.goalBias||p.movementBias==='recovery')).slice(0,2);
    return{primary,secondary};
  }catch(e){console.error('getRecommendedNextPlan',e);return empty}
}

// Search across name + classification + tags + contained exercise names/aliases.
// Query is case-insensitive, supports CN/EN. Sort: active → incomplete → draft.
const PLAN_SEARCH_SYNONYMS={
  '上半身':['upper'],'下半身':['lower'],'全身':['full'],
  '推日':['push'],'拉日':['pull'],'腿日':['legs'],
  '恢復':['recovery','cardio'],'臀腿':['hinge','lower','legs'],
  '拉背':['pull','vertical_pull','horizontal_pull'],
  '胸推':['horizontal_push','push'],
  '腿後側':['leg_curl','hinge'],'臀':['hinge','hip_thrust']
};
function planMatchesQuery(plan,q){
  if(!q)return true;
  const exBlob=(plan.exercises||[]).map(ex=>{const d=EX_BY_KEY[ex.exerciseKey||resolveKey(ex.name||'')];if(!d)return ex.exerciseKey||'';return[d.labelEn,d.labelZh,d.key,(d.aliases||[]).join(' ')].join(' ')}).join(' ');
  const blob=[plan.name,plan.displayName,plan.note,plan.category,plan.splitType,plan.daySlot,plan.bodyRegion,plan.movementBias,plan.goalBias,plan.equipmentProfile,plan.goal,plan.acsmFocus,plan.levelTag,(plan.primaryPatterns||[]).join(' '),(plan.secondaryPatterns||[]).join(' '),(plan.searchTags||[]).join(' '),exBlob].join(' ').toLowerCase();
  if(blob.includes(q))return true;
  const syn=PLAN_SEARCH_SYNONYMS[q];
  if(syn&&syn.some(s=>blob.includes(s)))return true;
  return false;
}
function searchPlans(query,plans){
  const list=plans||PS.getAll();
  const q=String(query||'').trim().toLowerCase();
  if(!q)return list;
  const statusOrder={active:0,incomplete:1,draft:2};
  return list.filter(p=>planMatchesQuery(p,q))
    .sort((a,b)=>(statusOrder[a.status]??0)-(statusOrder[b.status]??0));
}

// ================================================================
// 7. STORAGE (with v3 migration)
// ================================================================
const DEF_DB={version:APP_VERSION,programs:[],selectedProgramId:'builtin_push_a',workouts:[],weightEntries:[],cardioEntries:[],settings:{historyFilter:'all',scienceProfile:Utils.copy(SCI_DEFAULT)},dailyReports:[],weeklyReports:[]};

const DB={
  data:null,
  load(){
    try{
      let raw=localStorage.getItem(APP_KEY);
      let parsed=raw?JSON.parse(raw):null;
      if(!parsed){
        const v3=localStorage.getItem(V3_APP_KEY);
        if(v3){try{parsed=this.migrateV3(JSON.parse(v3))}catch(e){console.error('v3 migration error',e)}}
      }
      this.data=this.migrate(parsed||Utils.copy(DEF_DB));
    }catch(e){console.error(e);this.data=this.migrate(Utils.copy(DEF_DB))}
    return this.data;
  },
  migrateV3(v3){
    const m={...Utils.copy(DEF_DB),...v3};
    m.programs=(v3.programs||[]).map(p=>{const mp=Utils.copy(p);mp.exercises=(mp.exercises||[]).map(ex=>({exerciseKey:resolveKey(ex.name||''),_v3Name:ex.name,sets:ex.sets||3,repMin:ex.repMin||6,repMax:ex.repMax||8,rir:ex.rir??2,restSec:ex.restSec||60,notes:ex.notes||''}));return mp});
    m.workouts=(v3.workouts||[]).map(w=>{const mw=Utils.copy(w);mw.exercises=(mw.exercises||[]).map(ex=>({...ex,exerciseKey:resolveKey(ex.name||''),_v3Name:ex.name}));if(mw.prs)(mw.prs||[]).forEach(pr=>{pr.exerciseKey=resolveKey(pr.name||'');pr._v3Name=pr.name});if(mw.recommendations)(mw.recommendations||[]).forEach(r=>{r.exerciseKey=resolveKey(r.name||'');r._v3Name=r.name});return mw});
    m.settings={...Utils.copy(DEF_DB.settings),...(v3.settings||{})};
    m.settings.scienceProfile={...Utils.copy(SCI_DEFAULT),...(m.settings.scienceProfile||{})};
    m.dailyReports=[];m.weeklyReports=[];m.version=APP_VERSION;
    return m;
  },
  migrate(d){
    const m={...Utils.copy(DEF_DB),...(d||{})};
    m.settings={...Utils.copy(DEF_DB.settings),...((d||{}).settings||{})};
    m.settings.scienceProfile={...Utils.copy(SCI_DEFAULT),...(m.settings.scienceProfile||{})};
    ['programs','workouts','weightEntries','cardioEntries','dailyReports','weeklyReports'].forEach(k=>{if(!Array.isArray(m[k]))m[k]=[]});
    m.workouts.forEach(w=>{(w.exercises||[]).forEach(ex=>{if(!ex.exerciseKey)ex.exerciseKey=resolveKey(ex.name||'')})});
    m.programs.forEach(p=>{(p.exercises||[]).forEach(ex=>{if(!ex.exerciseKey)ex.exerciseKey=resolveKey(ex.name||'')});normalizeWorkoutPlan(p)});
    m.version=APP_VERSION;return m;
  },
  save(){localStorage.setItem(APP_KEY,JSON.stringify(this.data))},
  reset(){this.data=this.migrate(Utils.copy(DEF_DB));this.save()}
};

// ================================================================
// 8. PROGRAM SERVICE
// ================================================================
const PS={
  bi:Utils.copy(BUILT_IN).map(p=>normalizeWorkoutPlan(p)),
  getAll(){return[...this.bi,...DB.data.programs]},
  byId(id){return this.getAll().find(p=>p.id===id)||null},
  selected(){return this.byId(DB.data.selectedProgramId)||this.getAll()[0]||null},
  select(id){const i=this.byId(id);if(!i)return false;DB.data.selectedProgramId=i.id;DB.save();return true},
  // [PATCH-2] createBlank now includes all metadata defaults
  createBlank(){return{
    id:Utils.uid('prog'),builtIn:false,name:'New Custom Program',note:'',category:'Custom',
    goal:'general_health',frequencyRecommendation:'每週 2–3 次',durationMin:45,
    equipmentProfile:'full_gym',acsmFocus:'general_health',cardioRecommendation:'',
    levelTag:'beginner',prescriptionNote:'',
    exercises:[
      {exerciseKey:'barbell_bench_press',sets:3,repMin:6,repMax:8,rir:2,restSec:90,notes:''},
      {exerciseKey:'chest_supported_row',sets:3,repMin:8,repMax:10,rir:2,restSec:75,notes:''},
      {exerciseKey:'leg_press',sets:3,repMin:10,repMax:12,rir:2,restSec:75,notes:''}
    ]
  }},
  copy(id){const s=this.byId(id);if(!s)return null;const c=Utils.copy(s);c.id=Utils.uid('prog');c.builtIn=false;c.name=s.name+' Copy';DB.data.programs.unshift(c);DB.save();return c},
  save(prog){if(prog.builtIn){const c=Utils.copy(prog);c.id=Utils.uid('prog');c.builtIn=false;DB.data.programs.unshift(c);DB.save();return c}const i=DB.data.programs.findIndex(p=>p.id===prog.id);if(i>=0)DB.data.programs[i]=Utils.copy(prog);else DB.data.programs.unshift(Utils.copy(prog));DB.save();return prog},
  del(id){const i=DB.data.programs.findIndex(p=>p.id===id);if(i<0)return false;DB.data.programs.splice(i,1);if(DB.data.selectedProgramId===id)DB.data.selectedProgramId=this.bi[0]?.id||'';DB.save();return true},
  // [PATCH-1] sanitize now preserves all ACSM / program metadata fields
  sanitize(prog){
    const c=Utils.copy(prog);
    c.name=Utils.text(c.name)||'Untitled';
    c.note=Utils.text(c.note);
    c.category=Utils.text(c.category)||'Custom';
    // Preserve ACSM / program metadata
    c.goal=Utils.text(c.goal)||'general_health';
    c.frequencyRecommendation=Utils.text(c.frequencyRecommendation)||'每週 2–3 次';
    c.durationMin=Utils.clamp(parseInt(c.durationMin||45,10),10,300);
    c.equipmentProfile=Utils.text(c.equipmentProfile)||'full_gym';
    c.acsmFocus=Utils.text(c.acsmFocus)||'general_health';
    c.cardioRecommendation=Utils.text(c.cardioRecommendation);
    c.levelTag=Utils.text(c.levelTag)||'beginner';
    c.prescriptionNote=Utils.text(c.prescriptionNote);
    c.exercises=(c.exercises||[]).map(ex=>({
      exerciseKey:ex.exerciseKey||resolveKey(ex.name||''),
      sets:Utils.clamp(parseInt(ex.sets||3,10),1,12),
      repMin:Utils.clamp(parseInt(ex.repMin||6,10),1,50),
      repMax:Utils.clamp(parseInt(ex.repMax||ex.repMin||8,10),1,60),
      rir:Utils.clamp(parseInt(ex.rir??2,10),0,5),
      restSec:Utils.clamp(parseInt(ex.restSec||60,10),15,600),
      notes:Utils.text(ex.notes)
    })).filter(Boolean);
    c.exercises.forEach(ex=>{if(ex.repMax<ex.repMin)ex.repMax=ex.repMin});
    // Fill classification fields (idempotent) so editor + list always have them.
    normalizeWorkoutPlan(c);
    return c;
  }
};

// ================================================================
// 9. EXERCISE LIBRARY (sheet)
// ================================================================
const EL={
  src:EXERCISE_REGISTRY.slice().sort((a,b)=>a.labelEn.localeCompare(b.labelEn)),
  mode:'workout',targetId:null,isOpen:false,swapTargetId:null,swapBaseKey:null,
  open(mode='workout',tid=null){
    this.mode=mode;this.targetId=tid;this.isOpen=true;this.swapTargetId=null;this.swapBaseKey=null;
    $('#library-sheet').classList.add('open');$('#library-sheet').setAttribute('aria-hidden','false');
    if(mode==='swap'){
      this.swapTargetId=tid;
      const ex=WK.session?.exercises.find(e=>e.id===tid);
      this.swapBaseKey=ex?.exerciseKey||null;
      $('#library-title').textContent='替換動作';$('#library-sub').textContent='選擇替代動作';
    }else if(mode==='editor-replace'){
      $('#library-title').textContent='選擇動作';$('#library-sub').textContent='選擇後會更換此動作';
    }else{
      $('#library-title').textContent='動作庫';
      $('#library-sub').textContent=mode==='editor'?'加入到課表編輯器':'加入到目前訓練';
    }
    $('#library-search').value='';this.render();setTimeout(()=>$('#library-search').focus(),30);
  },
  close(){
    this.isOpen=false;$('#library-sheet').classList.remove('open');$('#library-sheet').setAttribute('aria-hidden','true');
    $('#library-title').textContent='動作庫';$('#library-sub').textContent='點選動作加入';
  },
  q(){return Utils.text($('#library-search').value).toLowerCase()},
  filtered(){const q=this.q();if(!q)return this.src;return this.src.filter(x=>exMatchesQuery(x,q))},
  render(){
    const l=$('#library-list');
    if(this.mode==='swap'&&this.swapBaseKey){
      const q=this.q();
      if(!q){
        const recommended=getSwapCandidates(this.swapBaseKey,10);
        const baseDef=EX_BY_KEY[this.swapBaseKey];
        const alreadyShown=new Set([this.swapBaseKey,...recommended]);
        const sameCategory=this.src.filter(x=>!alreadyShown.has(x.key)&&x.category===(baseDef?.category||'')).slice(0,8).map(x=>x.key);
        const mkItem=k=>{const d=EX_BY_KEY[k];if(!d)return'';return`<button class="select-option" data-library-key="${k}"><strong>${Utils.escape(d.labelEn)}｜${Utils.escape(d.labelZh)}</strong><small>${Utils.escape(d.category)} · ${Utils.escape(d.equipment)}</small></button>`};
        let html='';
        if(recommended.length)html+=`<div class="swap-section-title">推薦替換</div>`+recommended.map(mkItem).join('');
        if(sameCategory.length)html+=`<div class="swap-section-title">同分類動作</div>`+sameCategory.map(mkItem).join('');
        l.innerHTML=html||'<div class="empty">沒有找到可推薦的替換動作</div>';
      }else{
        const items=this.filtered().filter(x=>x.key!==this.swapBaseKey);
        if(!items.length){l.innerHTML='<div class="empty">找不到符合的動作</div>';return}
        l.innerHTML=`<div class="swap-section-title">搜尋結果</div>`+items.map(i=>`<button class="select-option" data-library-key="${i.key}"><strong>${Utils.escape(i.labelEn)}｜${Utils.escape(i.labelZh)}</strong><small>${Utils.escape(i.category)} · ${Utils.escape(i.equipment)}</small></button>`).join('');
      }
    }else{
      const items=this.filtered();
      if(!items.length){l.innerHTML='<div class="empty">找不到符合的動作</div>';return}
      l.innerHTML=items.map(i=>`<button class="select-option" data-library-key="${i.key}"><strong>${Utils.escape(i.labelEn)}｜${Utils.escape(i.labelZh)}</strong><small>${Utils.escape(i.category)} · ${Utils.escape(i.equipment)}</small></button>`).join('');
    }
  },
  select(key){
    if(this.mode==='editor')SC.addEditorEx(key,this.targetId);
    else if(this.mode==='editor-replace'){const ex=SC.edProg?.exercises.find(x=>x._id===this.targetId);if(ex){ex.exerciseKey=key;SC.renderEditorEx()}}
    else if(this.mode==='swap')WK.swapExercise(this.swapTargetId,key);
    else WK.addExercise(key);
    this.close();
  }
};

// ================================================================
// 10. NUMPAD
// ================================================================
const Numpad={
  sanitize(input,opts={}){if(!input)return;const{min:mn=null,max:mx=null,integer:int=false,fallback:fb=''}=opts;let v=input.value===''?'':Number(input.value);if(input.value!==''&&!Number.isFinite(v)){input.value=fb;return}if(v==='')return;if(int)v=Math.round(v);if(mn!==null)v=Math.max(mn,v);if(mx!==null)v=Math.min(mx,v);input.value=v}
};

// ================================================================
// 11. TIMER
// ================================================================
const Timer={
  eT:null,rT:null,
  startE(){this.stopE();this.eT=setInterval(()=>{if(!WK.session)return;WK.renderTopBar()},1000)},
  stopE(){if(this.eT){clearInterval(this.eT);this.eT=null}},
  startR(sec){this.stopR();if(!sec)return;let rem=sec;const tick=()=>{const l=rem>0?`休息 ${rem}s`:'休息結束';WK.setLabel(l);rem--;if(rem<-1){this.stopR();WK.setLabel('')}};tick();this.rT=setInterval(tick,1000)},
  stopR(){if(this.rT){clearInterval(this.rT);this.rT=null}}
};

// ================================================================
// 12. WORKOUT DOMAIN
// ================================================================
const WK={
  session:null,summary:null,rtLabel:'',
  loadDraft(){
    try{
      let raw=localStorage.getItem(DRAFT_KEY);
      if(!raw)raw=localStorage.getItem(V3_DRAFT_KEY);
      if(!raw)return;
      const p=JSON.parse(raw);
      if(p&&(p.programId||p.programName)){
        if(p.exercises)(p.exercises).forEach(ex=>{if(!ex.exerciseKey)ex.exerciseKey=resolveKey(ex.name||'')});
        this.session=p;
      }
    }catch(e){console.error(e)}
  },
  saveDraft(){if(this.session)localStorage.setItem(DRAFT_KEY,JSON.stringify(this.session));else localStorage.removeItem(DRAFT_KEY)},
  clearDraft(){localStorage.removeItem(DRAFT_KEY);localStorage.removeItem(V3_DRAFT_KEY)},
  ensureUi(){if(!this.session)return;if(!this.session.ui)this.session.ui={};if(!this.session.ui.collapsed)this.session.ui.collapsed={};this.session.exercises.forEach((ex,i)=>{if(typeof this.session.ui.collapsed[ex.id]!=='boolean')this.session.ui.collapsed[ex.id]=i!==this.session.currentExerciseIndex})},
  isCol(id){this.ensureUi();return!!this.session?.ui?.collapsed?.[id]},
  setCol(id,v){this.ensureUi();this.session.ui.collapsed[id]=!!v},
  collapseOthers(id){if(!this.session)return;this.ensureUi();this.session.exercises.forEach(e=>{this.session.ui.collapsed[e.id]=e.id!==id})},
  toggle(id){if(!this.session)return;const i=this.session.exercises.findIndex(x=>x.id===id);if(i<0)return;if(this.isCol(id)){this.session.currentExerciseIndex=i;this.collapseOthers(id)}else this.setCol(id,true);this.saveDraft();this.render()},
  start(progId){
    const prog=PS.byId(progId||DB.data.selectedProgramId);if(!prog)return Toast.show('找不到課表');
    this.summary=null;
    this.session={id:Utils.uid('wk'),programId:prog.id,programName:prog.name,startedAt:Date.now(),currentExerciseIndex:0,ui:{collapsed:{}},sessionNote:'',
      exercises:prog.exercises.map(ex=>({id:Utils.uid('ex'),exerciseKey:ex.exerciseKey,repMin:ex.repMin,repMax:ex.repMax,rir:ex.rir,restSec:ex.restSec,notes:ex.notes||'',suggestedWeight:this.suggestW(ex.exerciseKey),sets:Array.from({length:ex.sets},()=>({weight:'',reps:'',done:false}))}))};
    this.ensureUi();this.saveDraft();Timer.startE();this.setLabel('');SC.renderWorkout();Nav.go('screen-workout');
  },
  restoreIfNeeded(){if(this.session&&(this.session.programName||this.session.programId)){this.ensureUi();Timer.startE()}},
  suggestW(ek){const last=[...DB.data.workouts].reverse().find(w=>(w.exercises||[]).some(ex=>(ex.exerciseKey||resolveKey(ex.name||''))===ek&&ex.sets?.some(s=>Number(s.weight)>0)));if(!last)return'';const ex=last.exercises.find(x=>(x.exerciseKey||resolveKey(x.name||''))===ek);const ds=ex.sets.filter(s=>Number(s.weight)>0);if(!ds.length)return'';return Number(ds.reduce((a,b)=>Number(b.weight)>Number(a.weight)?b:a,ds[0]).weight)},
  addExercise(ek){if(!this.session)return;this.session.exercises.push({id:Utils.uid('ex'),exerciseKey:ek,repMin:8,repMax:12,rir:2,restSec:60,notes:'',suggestedWeight:this.suggestW(ek),sets:Array.from({length:3},()=>({weight:'',reps:'',done:false}))});this.ensureUi();this.session.currentExerciseIndex=this.session.exercises.length-1;this.session.exercises.forEach(e=>this.setCol(e.id,true));this.collapseOthers(this.session.exercises[this.session.currentExerciseIndex].id);this.saveDraft();this.render();Toast.show('已新增動作')},
  removeEx(id){if(!this.session)return;const i=this.session.exercises.findIndex(e=>e.id===id);if(i<0)return;const rm=this.session.exercises.splice(i,1)[0];this.ensureUi();if(rm?.id&&this.session.ui?.collapsed)delete this.session.ui.collapsed[rm.id];this.session.currentExerciseIndex=Utils.clamp(this.session.currentExerciseIndex,0,Math.max(0,this.session.exercises.length-1));if(this.session.exercises[this.session.currentExerciseIndex])this.collapseOthers(this.session.exercises[this.session.currentExerciseIndex].id);this.saveDraft();this.render();Toast.show('已移除動作')},
  moveEx(id,dir){if(!this.session)return false;const list=this.session.exercises;const i=list.findIndex(e=>e.id===id);if(i<0)return false;const ni=Utils.clamp(i+dir,0,list.length-1);if(ni===i)return false;const cid=list[this.session.currentExerciseIndex]?.id||id;const[item]=list.splice(i,1);list.splice(ni,0,item);this.session.currentExerciseIndex=list.findIndex(e=>e.id===cid);this.saveDraft();this.render();requestAnimationFrame(()=>{const c=document.querySelector(`#workout-exercises [data-ex-id="${id}"]`);if(c)c.scrollIntoView({block:'nearest',behavior:'smooth'})});return true},
  addSet(id){const ex=this.session?.exercises.find(x=>x.id===id);if(!ex)return;ex.sets.push({weight:'',reps:'',done:false});this.saveDraft();this.render()},
  updateExField(id,f,v){const ex=this.session?.exercises.find(x=>x.id===id);if(!ex)return;if('repMin repMax rir restSec'.split(' ').includes(f)){ex[f]=parseInt(v||ex[f],10);if(f==='repMin'&&ex.repMax<ex.repMin)ex.repMax=ex.repMin;if(f==='repMax'&&ex.repMax<ex.repMin)ex.repMin=ex.repMax}else if(f==='notes')ex[f]=v;this.saveDraft();this.render(false)},
  updateSet(id,si,f,v){const ex=this.session?.exercises.find(x=>x.id===id);if(!ex||!ex.sets[si])return;ex.sets[si][f]=v;this.saveDraft();this.render(false)},
  toggleDone(id,si){
    const ex=this.session?.exercises.find(x=>x.id===id);if(!ex||!ex.sets[si])return;
    const set=ex.sets[si];set.done=!set.done;let scrollI=null;
    if(set.done){
      if(set.weight===''&&ex.suggestedWeight!=='')set.weight=String(ex.suggestedWeight);
      Timer.startR(ex.restSec);const ci=this.session.exercises.findIndex(x=>x.id===id);
      this.session.currentExerciseIndex=ci;this.collapseOthers(id);
      if(ex.sets.every(s=>s.done)){const ni=this.nextPending(ci);if(ni>=0){this.session.currentExerciseIndex=ni;this.collapseOthers(this.session.exercises[ni].id);scrollI=ni}}
    }
    this.saveDraft();this.render();
    if(scrollI!==null)requestAnimationFrame(()=>{const c=$('#workout-exercises')?.children?.[scrollI];if(c)c.scrollIntoView({block:'start',behavior:'smooth'})})
  },
  setCurrent(i){if(!this.session)return;this.session.currentExerciseIndex=Utils.clamp(i,0,Math.max(0,this.session.exercises.length-1));if(this.session.exercises[this.session.currentExerciseIndex])this.collapseOthers(this.session.exercises[this.session.currentExerciseIndex].id);this.saveDraft();this.render();const c=$('#workout-exercises').children[this.session.currentExerciseIndex];if(c)c.scrollIntoView({block:'start',behavior:'smooth'})},
  setLabel(t){this.rtLabel=t;$('#workout-program-sub').textContent=t||'訓練進行中'},
  progress(){if(!this.session)return{done:0,total:0};let d=0,t=0;this.session.exercises.forEach(e=>{e.sets.forEach(s=>{t++;if(s.done)d++})});return{done:d,total:t}},
  nextPending(from){if(!this.session)return-1;for(let i=from+1;i<this.session.exercises.length;i++)if(this.session.exercises[i].sets.some(s=>!s.done))return i;return-1},
  fillW(id){const ex=this.session?.exercises.find(x=>x.id===id);if(!ex)return;if(ex.suggestedWeight===''||ex.suggestedWeight==null){Toast.show('目前沒有可套用的建議重量');return}let c=0;ex.sets.forEach(s=>{if(!s.done&&(s.weight===''||s.weight==null)){s.weight=String(ex.suggestedWeight);c++}});this.saveDraft();this.render();Toast.show(c?`已填入 ${c} 組建議重量`:'空白組已經沒有可填的重量')},
  clearUnfinished(id){const ex=this.session?.exercises.find(x=>x.id===id);if(!ex)return;ex.sets.forEach(s=>{if(!s.done){s.weight='';s.reps=''}});this.saveDraft();this.render();Toast.show('已清空未完成組')},
  openSwapExercise(id){
    if(!this.session)return;
    const ex=this.session.exercises.find(x=>x.id===id);if(!ex)return;
    if(ex.sets.some(s=>s.done)){Toast.show('此動作已有完成組數，無法直接替換。請先清空完成組，或使用「從動作庫新增」。');return}
    EL.open('swap',id);
  },
  swapExercise(id,newKey){
    if(!this.session)return;
    const ex=this.session.exercises.find(x=>x.id===id);if(!ex)return;
    if(ex.sets.some(s=>s.done)){Toast.show('此動作已有完成組數，無法替換。');return}
    ex.exerciseKey=newKey;
    ex.sets.forEach(s=>{if(!s.done){s.weight='';s.reps=''}});
    ex.suggestedWeight=this.suggestW(newKey);
    this.saveDraft();this.render();Toast.show(`已替換為 ${exDisplayName(ex)}`);
  },
  finish(){
    if(!this.session)return;Timer.stopE();Timer.stopR();
    const end=Date.now();
    const wk={id:this.session.id,programId:this.session.programId,programName:this.session.programName,startedAt:this.session.startedAt,endedAt:end,durationSec:Math.round((end-this.session.startedAt)/1000),sessionNote:this.session.sessionNote||'',
      exercises:this.session.exercises.map(ex=>({exerciseKey:ex.exerciseKey,repMin:ex.repMin,repMax:ex.repMax,rir:ex.rir,restSec:ex.restSec,notes:ex.notes,suggestedWeight:ex.suggestedWeight,sets:ex.sets.map(s=>({weight:s.weight===''?'':Number(s.weight),reps:s.reps===''?'':Number(s.reps),done:!!s.done}))}))};
    wk.prs=this.computePRs(wk);wk.recommendations=this.computeRecs(wk);
    DB.data.workouts.unshift(wk);DB.save();this.summary=wk;this.session=null;this.clearDraft();SC.renderSummary();Nav.go('screen-summary')
  },
  computePRs(wk){const prs=[];wk.exercises.forEach(ex=>{const bc=this.e1rm(ex);if(!bc)return;const prev=DB.data.workouts.flatMap(w=>(w.exercises||[]).filter(i=>(i.exerciseKey||resolveKey(i.name||''))===ex.exerciseKey)).map(i=>this.e1rm(i)).filter(Boolean);const pb=prev.length?Math.max(...prev):0;if(bc>pb)prs.push({exerciseKey:ex.exerciseKey,e1rm:bc,delta:bc-pb})});return prs},
  computeRecs(wk){return wk.exercises.map(ex=>{const ds=ex.sets.filter(s=>s.done&&Number(s.weight)>0&&Number(s.reps)>0);const ls=ds[ds.length-1];let sug='';if(ls){const at=ds.every(s=>Number(s.reps)>=ex.repMax);const ct=ds.every(s=>Number(s.reps)>=Math.max(ex.repMin,ex.repMax-1));if(at)sug=(Number(ls.weight)+2.5).toFixed(1).replace('.0','');else if(ct)sug=Number(ls.weight).toFixed(1).replace('.0','');else sug=Math.max(0,Number(ls.weight)-2.5).toFixed(1).replace('.0','')}return{exerciseKey:ex.exerciseKey,suggestion:sug,reps:`${ex.repMin}-${ex.repMax}`,rir:ex.rir}})},
  e1rm(ex){const c=(ex.sets||[]).filter(s=>Number(s.weight)>0&&Number(s.reps)>0).map(s=>Number(s.weight)*(1+Number(s.reps)/30));return c.length?Math.max(...c):0},
  render(full=true){if(full)SC.renderWorkout();else{this.renderTopBar();this.renderSteps()}},
  renderTopBar(){if(!this.session)return;$('#workout-program-title').textContent=this.session.programName;if(!this.rtLabel)$('#workout-program-sub').textContent='訓練進行中';$('#elapsed-label').textContent=Utils.formatDuration((Date.now()-this.session.startedAt)/1000);const{done:d,total:t}=this.progress();$('#progress-label').textContent=`${d} / ${t} sets`;$('#workout-progress-fill').style.width=t?`${(d/t)*100}%`:'0%'},
  renderSteps(){if(!this.session)return;$('#step-scroll').innerHTML=this.session.exercises.map((ex,i)=>{const d=ex.sets.filter(s=>s.done).length;const c=i===this.session.currentExerciseIndex?'step-chip active':'step-chip';return`<button class="${c}" data-action="goto-exercise" data-index="${i}"><span>${i+1}</span><span>${Utils.escape(exDisplayName(ex))}</span><span>${d}/${ex.sets.length}</span></button>`}).join('')}
};

// ================================================================
// 13. REPORTS DOMAIN
// ================================================================
const Reports={
  daily(dateStr){
    const date=dateStr||Utils.today();
    const wks=DB.data.workouts.filter(w=>Utils.dateFromTs(w.startedAt)===date||Utils.dateFromTs(w.endedAt)===date);
    if(!wks.length)return null;
    const dur=wks.reduce((n,w)=>n+w.durationSec,0);const exC=wks.reduce((n,w)=>n+w.exercises.length,0);
    const setC=wks.reduce((n,w)=>n+w.exercises.reduce((m,e)=>m+e.sets.filter(s=>s.done).length,0),0);
    const prs=wks.flatMap(w=>w.prs||[]);const bw=DB.data.weightEntries.find(e=>e.date===date);
    const cardio=DB.data.cardioEntries.filter(e=>e.date===date);
    let txt=`📅 日期：${date}\n`;
    wks.forEach(w=>{txt+=`\n🏋️ 課表：${w.programName}\n⏱ 時間：${Utils.formatDuration(w.durationSec)}\n📊 動作：${w.exercises.length}，完成組：${w.exercises.reduce((n,e)=>n+e.sets.filter(s=>s.done).length,0)}\n`;if(w.sessionNote)txt+=`📝 備註：${w.sessionNote}\n`;w.exercises.forEach(e=>{const ds=e.sets.filter(s=>s.done);txt+=`  • ${exDisplayName(e)}: ${ds.map((s,i)=>`Set${i+1}: ${s.weight}kg×${s.reps}`).join(', ')} (${e.repMin}-${e.repMax}r, RIR${e.rir})\n`});(w.prs||[]).forEach(pr=>txt+=`  🏆 PR: ${exLabel(pr.exerciseKey)} e1RM ${pr.e1rm.toFixed(1)}kg\n`);(w.recommendations||[]).forEach(r=>{if(r.suggestion)txt+=`  💡 ${exLabel(r.exerciseKey)}: 下次 ${r.suggestion}kg\n`})});
    if(bw)txt+=`\n⚖️ 體重：${bw.weight}kg\n`;
    if(cardio.length){txt+=`\n🏃 有氧：\n`;cardio.forEach(c=>txt+=`  ${c.type}: ${c.minutes||'?'}分 ${c.distance?c.distance+'km ':''}\n`)}
    const ai=`以下是我的訓練日報（基於 ACSM 運動處方原則），請幫我分析並給出建議：\n\n${txt}\n\n我的科學設定：目標=${Sci.goal(Sci.profile().goal).label}，等級=${Sci.levelLabel(Sci.profile().level)}，器材=${Sci.equipLabel(Sci.profile().equipment)}\n\n請分析：\n1. 今日訓練量是否足夠（ACSM 建議每主要肌群至少 2 組、每週 2 天阻力訓練）？\n2. 重量/次數進步情況與漸進超負荷方向\n3. 動作選擇是否覆蓋主要肌群\n4. 恢復與營養建議（依我的目標）`;
    const dBestSeen={};wks.forEach(w=>w.exercises.forEach(e=>{const v=WK.e1rm(e);if(v>0&&(!dBestSeen[e.exerciseKey]||v>dBestSeen[e.exerciseKey]))dBestSeen[e.exerciseKey]=v}));
    const dailyBests=Object.entries(dBestSeen).map(([exerciseKey,e1rm])=>({exerciseKey,e1rm}));
    const dailyCS={totalMinutes:cardio.reduce((n,c)=>n+(Number(c.minutes)||0),0),totalDistance:cardio.reduce((n,c)=>n+(Number(c.distance)||0),0),entries:cardio};
    const sessionSummaries=wks.map(w=>({workoutId:w.id,programName:w.programName,durationSec:w.durationSec,completedSets:w.exercises.reduce((n,e)=>n+e.sets.filter(s=>s.done).length,0),sessionNote:w.sessionNote||'',exerciseSummaries:w.exercises.map(e=>({exerciseKey:e.exerciseKey,displayName:exDisplayName(e),completedSets:e.sets.filter(s=>s.done).map((s,i)=>({setIndex:i,weight:s.weight,reps:s.reps}))}))}));
    const r={id:Utils.uid('dr'),date,workoutIds:wks.map(w=>w.id),totalDurationSec:dur,totalExercises:exC,totalCompletedSets:setC,prs,bodyweight:bw?.weight,bestLifts:dailyBests,cardioSummary:dailyCS,sessionSummaries,reportText:txt,aiPromptText:ai,markdownText:`# 日報 ${date}\n\n${txt}`};
    DB.data.dailyReports=DB.data.dailyReports.filter(x=>x.date!==date);DB.data.dailyReports.unshift(r);DB.save();return r
  },
  weekly(startDate){
    const start=startDate||Utils.weekStart(Utils.today());const end=Utils.weekEnd(start);
    const sTs=new Date(start+'T00:00:00').getTime();const eTs=new Date(end+'T23:59:59').getTime();
    const wks=DB.data.workouts.filter(w=>w.startedAt>=sTs&&w.startedAt<=eTs);
    const tS=wks.length;const tD=wks.reduce((n,w)=>n+w.durationSec,0);
    const tSets=wks.reduce((n,w)=>n+w.exercises.reduce((m,e)=>m+e.sets.filter(s=>s.done).length,0),0);
    const cat={push:0,pull:0,legs:0,cardio:0,other:0};
    wks.forEach(w=>w.exercises.forEach(e=>{const d=EX_BY_KEY[e.exerciseKey];const c=(d?.category||'').toLowerCase();if(c==='push')cat.push++;else if(c==='pull')cat.pull++;else if(c==='legs'||c==='lower')cat.legs++;else if(c==='cardio')cat.cardio++;else cat.other++}));
    const prs=wks.flatMap(w=>w.prs||[]);
    const seen={};
    wks.forEach(w=>w.exercises.forEach(e=>{const v=WK.e1rm(e);if(v>0&&(!seen[e.exerciseKey]||v>seen[e.exerciseKey]))seen[e.exerciseKey]=v}));
    const bests=Object.entries(seen).map(([exerciseKey,e1rm])=>({exerciseKey,e1rm}));
    const ww=DB.data.weightEntries.filter(e=>e.date>=start&&e.date<=end).sort((a,b)=>a.date.localeCompare(b.date));
    const wc=ww.length>=2?{start:ww[0].weight,end:ww[ww.length-1].weight,delta:ww[ww.length-1].weight-ww[0].weight}:null;
    const wCard=DB.data.cardioEntries.filter(e=>e.date>=start&&e.date<=end);
    const cs={totalMinutes:wCard.reduce((n,c)=>n+(Number(c.minutes)||0),0),totalDistance:wCard.reduce((n,c)=>n+(Number(c.distance)||0),0)};
    let txt=`📅 週報：${start} ~ ${end}\n📊 本週 ${tS} 次，總計 ${Utils.formatDuration(tD)}\n💪 完成組數：${tSets}\n📈 分類：Push ${cat.push} / Pull ${cat.pull} / Legs ${cat.legs} / Cardio ${cat.cardio} / Other ${cat.other}\n`;
    if(prs.length){txt+=`\n🏆 本週 PR：\n`;prs.forEach(p=>txt+=`  ${exLabel(p.exerciseKey)}: e1RM ${p.e1rm.toFixed(1)}kg\n`)}
    if(bests.length){txt+=`\n🔝 本週最佳：\n`;bests.sort((a,b)=>b.e1rm-a.e1rm).slice(0,5).forEach(b=>txt+=`  ${exLabel(b.exerciseKey)}: e1RM ${b.e1rm.toFixed(1)}kg\n`)}
    if(cs.totalMinutes)txt+=`\n🏃 有氧：${cs.totalMinutes} 分鐘，${cs.totalDistance.toFixed(1)} km\n`;
    if(wc)txt+=`\n⚖️ 體重：${wc.start}kg → ${wc.end}kg (${wc.delta>0?'+':''}${wc.delta.toFixed(1)}kg)\n`;
    const pg=Sci.profile();const gg=Sci.goal(pg.goal);
    txt+=`\n📋 ACSM 對照：\n`;
    txt+=`  目標：${gg.label}｜建議阻力 ${gg.resistanceDays||'2–3'} 天/週，有氧 ${gg.cardio.minutes}\n`;
    txt+=`  本週阻力：${tS} 次${tS>=2?' ✓ 達到 ACSM 最低建議':' ⚠ 低於建議的每週 2 天'}\n`;
    if(cs.totalMinutes){const minTarget=pg.goal==='cardio_endurance'||pg.goal==='fat_loss'||pg.goal==='general_health'?150:60;txt+=`  有氧總量：${cs.totalMinutes} 分鐘${cs.totalMinutes>=minTarget?' ✓ 接近或達到目標':' ⚠ 可考慮增加有氧累積'}\n`}
    const ai=`以下是我的訓練週報（基於 ACSM 運動處方原則），請幫我做週度分析：\n\n${txt}\n\n我的科學設定：目標=${gg.label}，等級=${Sci.levelLabel(pg.level)}，器材=${Sci.equipLabel(pg.equipment)}，${gg.acsmSummary||''}\n\n請分析：\n1. 訓練量與頻率是否達到 ACSM 基本建議\n2. 肌群分配是否平衡（推/拉/腿比例）\n3. 力量進步趨勢與漸進超負荷方向\n4. 有氧總量是否接近目標\n5. 下週建議方向\n6. 恢復與營養提醒`;
    const r={id:Utils.uid('wr'),weekKey:start,workoutIds:wks.map(w=>w.id),totalSessions:tS,totalDurationSec:tD,totalSetCount:tSets,categoryBreakdown:cat,prs,bestLifts:bests,weightChange:wc,cardioSummary:cs,reportText:txt,aiPromptText:ai,markdownText:`# 週報 ${start} ~ ${end}\n\n${txt}`};
    DB.data.weeklyReports=DB.data.weeklyReports.filter(x=>x.weekKey!==start);DB.data.weeklyReports.unshift(r);DB.save();return r
  }
};

// ================================================================
// 14. CHART HELPERS
// ================================================================
function drawChart(canvas,pts,opts={}){const ctx=canvas.getContext('2d');const dpr=window.devicePixelRatio||1;const cw=canvas.clientWidth||canvas.width;const ch=canvas.clientHeight||canvas.height;const w=Math.round(cw*dpr);const h=Math.round(ch*dpr);if(canvas.width!==w)canvas.width=w;if(canvas.height!==h)canvas.height=h;ctx.setTransform(1,0,0,1,0,0);ctx.scale(dpr,dpr);ctx.clearRect(0,0,cw,ch);ctx.fillStyle='rgba(255,255,255,.02)';ctx.fillRect(0,0,cw,ch);const p={t:18,r:16,b:28,l:16};const cW=cw-p.l-p.r;const cH=ch-p.t-p.b;ctx.strokeStyle='rgba(255,255,255,.08)';ctx.lineWidth=1;for(let i=0;i<4;i++){const y=p.t+(cH/3)*i;ctx.beginPath();ctx.moveTo(p.l,y);ctx.lineTo(cw-p.r,y);ctx.stroke()}if(!pts||!pts.length){ctx.fillStyle='rgba(158,173,199,.85)';ctx.font='13px -apple-system,sans-serif';ctx.fillText('No data',p.l,p.t+18);return}const ys=pts.map(v=>Number(v.y)).filter(Number.isFinite);const mn=Math.min(...ys);const mx=Math.max(...ys);const rng=Math.max(1,mx-mn);const xs=pts.length===1?0:cW/(pts.length-1);const coords=pts.map((v,i)=>({x:p.l+i*xs,y:p.t+cH-((Number(v.y)-mn)/rng)*cH,raw:v}));ctx.lineWidth=3;const gr=ctx.createLinearGradient(0,p.t,0,p.t+cH);gr.addColorStop(0,'rgba(105,183,255,.96)');gr.addColorStop(1,'rgba(140,240,217,.96)');ctx.strokeStyle=gr;ctx.beginPath();coords.forEach((v,i)=>i?ctx.lineTo(v.x,v.y):ctx.moveTo(v.x,v.y));ctx.stroke();ctx.fillStyle='rgba(105,183,255,.16)';ctx.beginPath();coords.forEach((v,i)=>i?ctx.lineTo(v.x,v.y):ctx.moveTo(v.x,v.y));ctx.lineTo(coords[coords.length-1].x,p.t+cH);ctx.lineTo(coords[0].x,p.t+cH);ctx.closePath();ctx.fill();coords.forEach((v,i)=>{ctx.fillStyle='rgba(239,248,255,.95)';ctx.beginPath();ctx.arc(v.x,v.y,3.4,0,Math.PI*2);ctx.fill();if(i===coords.length-1){ctx.font='12px -apple-system,sans-serif';ctx.fillText(`${Number(v.raw.y).toFixed(1).replace('.0','')}${opts.suffix||''}`,Math.max(p.l,v.x-18),Math.max(14,v.y-10))}});ctx.fillStyle='rgba(158,173,199,.9)';ctx.font='11px -apple-system,sans-serif';const fl=v=>v?.slice?v.slice(5):new Date(v).toISOString().slice(5,10);ctx.fillText(fl(pts[0].x),p.l,ch-8);const ll=fl(pts[pts.length-1].x);ctx.fillText(ll,cw-p.r-ctx.measureText(ll).width,ch-8)}

// ================================================================
// 15. TOAST
// ================================================================
const Toast={t:null,show(m){const e=$('#toast');e.textContent=m;e.classList.add('show');clearTimeout(this.t);this.t=setTimeout(()=>e.classList.remove('show'),1800)}};

// ================================================================
// 16. NAVIGATION
// ================================================================
const Nav={
  cur:'screen-home',
  go(id){$$('.screen').forEach(e=>e.classList.toggle('active',e.id===id));this.cur=id;window.scrollTo({top:0,behavior:'instant' in window?'instant':'auto'});
  if(id==='screen-home')SC.renderHome();if(id==='screen-programs')SC.renderPrograms();if(id==='screen-history')SC.renderHistory();if(id==='screen-strength')SC.renderStrength();if(id==='screen-weight')SC.renderWeight();if(id==='screen-cardio')SC.renderCardio();if(id==='screen-science')SC.renderScience();if(id==='screen-settings')SC.renderSettings();if(id==='screen-reports')SC.renderReports();if(id==='screen-coach-clients')SC.renderCoachClients();if(id==='screen-coach-programs')SC.renderCoachPrograms();if(id==='screen-coach-program-editor')SC.renderCoachProgramEditor();if(id==='screen-coach-workout')SC.renderCoachWorkout();if(id==='screen-coach-reports')SC.renderCoachReports()}
};

// ================================================================
// 17. SCREENS
// ================================================================
const SC={
  edProg:null,hFilter:'all',strEx:'barbell_bench_press',detId:null,curDaily:null,curWeekly:null,
  init(){$('#home-version-pill').textContent=`v${APP_VERSION}`;$('#weight-date').value=Utils.today();$('#cardio-date').value=Utils.today();$('#report-daily-date').value=Utils.today();$('#report-weekly-date').value=Utils.weekStart(Utils.today());this.renderHome()},
  renderHome(){const s=PS.selected();$('#home-date-label').textContent=Utils.formatDate(Utils.today());$('#home-program-name').textContent=s?s.name:'尚未選擇課表';$('#home-program-meta').textContent=s?`${s.category||'Program'} · ${(s.exercises||[]).length} 個動作`:'請先選擇今天要使用的課表。';
    const weekStartTs=new Date(Utils.weekStart(Utils.today())+'T00:00:00').getTime();$('#home-week-count').textContent=String(DB.data.workouts.filter(w=>w.startedAt>=weekStartTs).length);const dc=$('#home-draft-card');const pr=WK.progress();const cb=$('[data-action="start-workout"]',$('#screen-home'));if(cb)cb.textContent=WK.session?'繼續訓練':'開始訓練';if(WK.session){dc.classList.remove('hidden');$('#home-draft-title').textContent=`未完成訓練｜${WK.session.programName}`;$('#home-draft-meta').textContent=`${Utils.formatDateTime(WK.session.startedAt)} · ${pr.done}/${pr.total||0} sets`}else{dc.classList.add('hidden')}},
  programSearchQ:'',
  programFilter:'all',
  renderPrograms(){
    const s=PS.selected();
    $('#selected-program-name').textContent=s?.name||'—';
    $('#selected-program-meta').textContent=s?`${s.category||'Program'} · ${(s.exercises||[]).length} 個動作`:'尚未選擇';
    const all=PS.getAll();
    const cats=Array.from(new Set(all.map(p=>String(p.category||'').trim()).filter(Boolean))).sort();
    const chips=[['all','全部'],...cats.map(c=>[c,c])];
    if(!chips.find(([k])=>k===this.programFilter))this.programFilter='all';
    const fEl=$('#program-filters');
    if(fEl)fEl.innerHTML=chips.map(([k,l])=>`<button class="chip ${this.programFilter===k?'active':''}" data-action="program-filter" data-filter="${Utils.escape(k)}">${Utils.escape(l)}</button>`).join('');
    const byCat=this.programFilter==='all'?all:all.filter(p=>String(p.category||'').trim()===this.programFilter);
    const q=this.programSearchQ||'';
    const list=q?searchPlans(q,byCat):byCat;
    const empty=!list.length?'<div class="empty">找不到符合的課表</div>':'';
    $('#program-list').innerHTML=empty||list.map(p=>{
      const iS=p.id===DB.data.selectedProgramId;
      const rec=Sci.isRec(p.id);
      const sc=Sci.programScore(p);
      const tier=sc>=12?'推薦':sc>=6?'適合':'普通';
      const tierKey=sc>=12?'high':sc>=6?'mid':'low';
      const shortLabel=planShortLabel(p);
      const nextPair=getRecommendedNextPlan(p.id);
      const nextHint=nextPair.primary?`<div class="subtle" style="margin-top:6px">下一張推薦 → ${Utils.escape(nextPair.primary.name)}</div>`:'';
      const incompleteTag=p.incompletePair?'<span class="pill" style="opacity:0.75">待補配對</span>':'';
      const splitPill=shortLabel?`<span class="pill">${Utils.escape(shortLabel)}</span>`:'';
      return`<div class="item"><div class="row between wrap"><div style="min-width:0"><h3>${Utils.escape(p.name)}</h3><div class="meta"><span>${Utils.escape(p.category||'Program')} · ${(p.exercises||[]).length} 個動作${p.builtIn?' · 內建':' · 自訂'}</span>${splitPill}${iS?'<span class="pill">使用中</span>':''}${rec?'<span class="pill">推薦</span>':''}${incompleteTag}</div>${p.note?`<div class="subtle" style="margin-top:8px">${Utils.escape(p.note)}</div>`:''}${nextHint}<div class="recommendation-score rec-score-badge" data-tier="${tierKey}" style="margin-top:8px"><span class="rec-tier">${tier}</span><span class="rec-dot">·</span><span class="rec-num">${sc.toFixed(1)}</span></div></div></div><div class="item-actions"><button class="btn ${iS?'strong':'primary'}" data-action="select-program" data-id="${p.id}">${iS?'已選擇':'設為今日'}</button><button class="btn btn-sub" data-action="edit-program" data-id="${p.id}">編輯</button><button class="btn btn-sub" data-action="copy-program" data-id="${p.id}">複製</button>${p.builtIn?'':`<button class="btn btn-sub btn-sub-danger" data-action="delete-program" data-id="${p.id}">刪除</button>`}</div></div>`
    }).join('');
  },
  openEditor(prog){this.edProg=PS.sanitize(Utils.copy(prog));$('#editor-title').textContent=prog.builtIn?'複製內建課表':'編輯自訂課表';$('#editor-program-name').value=this.edProg.name;$('#editor-program-note').value=this.edProg.note||'';this.renderEditorEx();renderAcsmStrip($('#editor-guidance-strip'),this.edProg);Nav.go('screen-editor')},
  addEditorEx(ek,afterId=null){if(!this.edProg)return;const item={exerciseKey:ek,sets:3,repMin:8,repMax:12,rir:2,restSec:60,notes:''};if(afterId){const i=this.edProg.exercises.findIndex(e=>e._id===afterId);if(i>=0)this.edProg.exercises.splice(i+1,0,item);else this.edProg.exercises.push(item)}else this.edProg.exercises.push(item);this.edProg.exercises.forEach(e=>{if(!e._id)e._id=Utils.uid('ee')});this.renderEditorEx()},
  moveEditorEx(id,dir){if(!this.edProg)return false;const l=this.edProg.exercises;const i=l.findIndex(e=>e._id===id);if(i<0)return false;const ni=Utils.clamp(i+dir,0,l.length-1);if(ni===i)return false;const[item]=l.splice(i,1);l.splice(ni,0,item);this.renderEditorEx();requestAnimationFrame(()=>{const c=document.querySelector(`[data-editor-ex="${id}"]`);if(c)c.scrollIntoView({block:'nearest',behavior:'smooth'})});return true},
  renderEditorEx(){if(!this.edProg)return;const l=$('#editor-exercise-list');this.edProg.exercises.forEach(e=>{if(!e._id)e._id=Utils.uid('ee')});l.innerHTML=this.edProg.exercises.map((ex,i)=>`<div class="editor-card" data-editor-ex="${ex._id}"><div class="editor-top"><div class="exercise-select"><button class="select-trigger" data-action="editor-pick-exercise" data-id="${ex._id}"><span>${Utils.escape(exDisplayName(ex))}</span><strong>▾</strong></button></div><div class="editor-top-actions"><button class="order-btn" data-action="editor-move-up" data-id="${ex._id}" ${i===0?'disabled':''}>↑</button><button class="order-btn" data-action="editor-move-down" data-id="${ex._id}" ${i===this.edProg.exercises.length-1?'disabled':''}>↓</button><button class="icon-btn" data-action="remove-editor-exercise" data-id="${ex._id}">×</button></div></div><div class="fine-grid"><div class="field"><label>組數</label><input type="number" inputmode="numeric" min="1" max="12" value="${ex.sets}" data-action="editor-field" data-id="${ex._id}" data-field="sets"></div><div class="field"><label>Rep Min</label><input type="number" inputmode="numeric" min="1" max="50" value="${ex.repMin}" data-action="editor-field" data-id="${ex._id}" data-field="repMin"></div><div class="field"><label>Rep Max</label><input type="number" inputmode="numeric" min="1" max="60" value="${ex.repMax}" data-action="editor-field" data-id="${ex._id}" data-field="repMax"></div></div><details class="editor-advanced"><summary>進階設定 / 備註</summary><div class="editor-advanced-body"><div class="inline-grid"><div class="field"><label>RIR</label><input type="number" inputmode="numeric" min="0" max="5" value="${ex.rir}" data-action="editor-field" data-id="${ex._id}" data-field="rir"></div><div class="field"><label>休息（秒）</label><input type="number" inputmode="numeric" min="15" max="600" value="${ex.restSec}" data-action="editor-field" data-id="${ex._id}" data-field="restSec"></div></div><div class="field"><label>備註</label><textarea class="notes" data-action="editor-field" data-id="${ex._id}" data-field="notes" placeholder="動作目標、線索、風險提醒...">${Utils.escape(ex.notes||'')}</textarea></div></div></details></div>`).join('');this.closeDD()},
  closeDD(){$$('.dropdown').forEach(d=>d.classList.remove('open'))},
  filterDD(id,kw=''){const l=$(`[data-role="dropdown-list"][data-id="${id}"]`);if(!l)return;const q=Utils.text(kw).toLowerCase();const items=EL.src.filter(x=>exMatchesQuery(x,q));l.innerHTML=items.map(i=>`<button class="select-option" data-dropdown-key="${i.key}" data-id="${id}"><strong>${Utils.escape(i.labelEn)}｜${Utils.escape(i.labelZh)}</strong><small>${Utils.escape(i.category)} · ${Utils.escape(i.equipment)}</small></button>`).join('')||'<div class="empty">找不到動作</div>'},
  renderWorkout(){if(!WK.session){Nav.go('screen-home');return}WK.renderTopBar();WK.renderSteps();WK.ensureUi();renderAcsmStrip($('#workout-guidance-strip'),WK.session);const h=$('#workout-exercises');const p=Sci.profile();h.innerHTML=WK.session.exercises.map((ex,ei)=>{const isA=ei===WK.session.currentExerciseIndex;const isC=WK.isCol(ex.id);const dc=ex.sets.filter(s=>s.done).length;const st=[isA?'目前步驟':'',`${dc}/${ex.sets.length}`,`${ex.repMin}-${ex.repMax}r`,`RIR${ex.rir}`].filter(Boolean);const edu=getEdu(ex.exerciseKey);const sci=Sci.prescription(ex,p);const pm=(edu.primary||[]).map(i=>`<span class="edu-chip">${Utils.escape(i)}</span>`).join('');const sm=(edu.secondary||[]).map(i=>`<span class="edu-chip">${Utils.escape(i)}</span>`).join('');const cu=(edu.cues||[]).map(i=>`<div class="edu-item">${Utils.escape(i)}</div>`).join('');const mk=(edu.mistakes||[]).map(i=>`<div class="edu-item">${Utils.escape(i)}</div>`).join('');const _dn=exDisplayName(ex);const _enName=_dn.includes('｜')?_dn.split('｜')[0]:_dn;const _zhName=_dn.includes('｜')?_dn.split('｜').slice(1).join('｜'):'';return`<section class="exercise-card ${isC?'collapsed':''} ${isA?'active':''}" data-ex-id="${ex.id}"><button class="exercise-summary" data-action="toggle-exercise-collapse" data-id="${ex.id}" data-index="${ei}"><div class="exercise-title"><h2 class="exercise-name">${Utils.escape(_enName)}${_zhName?`<span class="exercise-name-zh">${Utils.escape(_zhName)}</span>`:''}</h2><div class="exercise-state">${Utils.escape(st.join(' · '))}</div></div><span class="exercise-chevron">⌄</span></button><div class="exercise-body" id="exercise-panel-${ex.id}"><div class="exercise-sub"><span class="pill">${ex.sets.length} sets</span><span class="pill">${ex.repMin}-${ex.repMax} reps</span><span class="pill">RIR ${ex.rir}</span><span class="pill">${ex.restSec}s 休息</span></div><div class="set-list">${ex.sets.map((s,si)=>`<div class="set-row ${s.done?'done':''}"><div class="set-index">${si+1}</div><div class="field"><label>重量</label><input type="number" step="0.5" inputmode="decimal" value="${s.weight}" placeholder="${ex.suggestedWeight||''}" data-action="set-input" data-id="${ex.id}" data-set="${si}" data-field="weight"></div><div class="field"><label>次數</label><input type="number" inputmode="numeric" value="${s.reps}" placeholder="${ex.repMin}" data-action="set-input" data-id="${ex.id}" data-set="${si}" data-field="reps"></div><button class="done-mark" data-action="toggle-set" data-id="${ex.id}" data-set="${si}">${s.done?'✓':'○'}</button></div>`).join('')}</div><div class="workout-quick-actions workout-quick-tools"><button class="btn btn-sub" data-action="fill-suggested-weight" data-id="${ex.id}">套用建議重量</button><button class="btn btn-sub" data-action="add-set" data-id="${ex.id}">加組</button><button class="btn btn-sub" data-action="swap-exercise" data-id="${ex.id}">替換動作</button></div><details class="workout-secondary-details"><summary>進階設定 / 教學 / 其他操作</summary><div class="workout-secondary-content"><div class="target-box"><div class="mini"><div class="k">建議重量</div><div class="v">${ex.suggestedWeight===''?'—':ex.suggestedWeight}</div></div><div class="mini"><div class="k">目標 reps</div><div class="v">${ex.repMin}-${ex.repMax}</div></div><div class="mini"><div class="k">目前完成</div><div class="v">${dc}/${ex.sets.length}</div></div></div><div class="workout-quick-actions"><button class="btn ghost" data-action="clear-unfinished-sets" data-id="${ex.id}">清空未完成組</button><button class="btn ghost" data-action="remove-workout-exercise" data-id="${ex.id}">移除動作</button></div><div class="exercise-order-actions"><button class="btn ghost" data-action="workout-move-up" data-id="${ex.id}" ${ei===0?'disabled':''}>上移動作</button><button class="btn ghost" data-action="workout-move-down" data-id="${ex.id}" ${ei===WK.session.exercises.length-1?'disabled':''}>下移動作</button></div><div class="muted-box science-callout ${sci.tone==='adjust'?'science-warning':''}"><strong>${Utils.escape(sci.title)}</strong><div class="subtle" style="margin-top:6px">${Utils.escape(sci.body)}</div></div><div class="inline-grid"><div class="field"><label>休息（秒）</label><input type="number" inputmode="numeric" min="15" max="600" value="${ex.restSec}" data-action="exercise-field" data-id="${ex.id}" data-field="restSec"></div><div class="field"><label>RIR</label><input type="number" inputmode="numeric" min="0" max="5" value="${ex.rir}" data-action="exercise-field" data-id="${ex.id}" data-field="rir"></div></div><div class="inline-grid"><div class="field"><label>Rep Min</label><input type="number" inputmode="numeric" min="1" max="50" value="${ex.repMin}" data-action="exercise-field" data-id="${ex.id}" data-field="repMin"></div><div class="field"><label>Rep Max</label><input type="number" inputmode="numeric" min="1" max="60" value="${ex.repMax}" data-action="exercise-field" data-id="${ex.id}" data-field="repMax"></div></div><div class="field"><label>備註</label><textarea class="notes" data-action="exercise-field" data-id="${ex.id}" data-field="notes">${Utils.escape(ex.notes||'')}</textarea></div><div class="edu-detail-stack"><details class="edu-details"><summary>解剖重點</summary><div class="edu-content"><div class="science-kv"><div class="label">主要肌群</div><div class="edu-chip-row">${pm||'<span class="edu-chip">—</span>'}</div></div><div class="science-kv"><div class="label">次要肌群</div><div class="edu-chip-row">${sm||'<span class="edu-chip">—</span>'}</div></div><div class="science-kv"><div class="label">關節動作</div><div class="value" style="font-size:14px;font-weight:700">${Utils.escape(edu.joints||'—')}</div></div></div></details><details class="edu-details"><summary>教練提示</summary><div class="edu-content"><div class="edu-list">${cu||'<div class="edu-item">先把動作品質放在重量之前。</div>'}</div></div></details><details class="edu-details"><summary>常見錯誤 / 風險</summary><div class="edu-content"><div class="edu-list">${mk||'<div class="edu-item">避免用慣性補動作。</div>'}</div><div class="muted-box"><strong>注意</strong><div class="subtle" style="margin-top:6px">${Utils.escape(edu.risk||'')}</div></div></div></details></div></div></details></div></section>`}).join('')},
  renderSummary(){const s=WK.summary;if(!s)return;$('#summary-date-label').textContent=Utils.formatDateTime(s.endedAt);$('#summary-top').innerHTML=`<div class="summary-card"><div class="k">訓練時間</div><div class="v">${Utils.formatDuration(s.durationSec)}</div></div><div class="summary-card"><div class="k">完成動作</div><div class="v">${s.exercises.length}</div></div><div class="summary-card"><div class="k">PR</div><div class="v">${s.prs.length}</div></div><div class="summary-card"><div class="k">完成組數</div><div class="v">${s.exercises.reduce((n,e)=>n+e.sets.filter(x=>x.done).length,0)}</div></div>`;$('#summary-list').innerHTML=s.exercises.map(ex=>{const r=s.recommendations.find(x=>x.exerciseKey===ex.exerciseKey);const p=s.prs.find(x=>x.exerciseKey===ex.exerciseKey);return`<div class="item"><h3>${Utils.escape(exDisplayName(ex))}</h3><div class="meta"><span>${ex.repMin}-${ex.repMax} reps</span><span>RIR ${ex.rir}</span>${p?`<span class="pill">PR ${p.e1rm.toFixed(1)}</span>`:''}</div><div class="subtle" style="margin-top:8px">建議下次：${r?.suggestion||'—'} ${r?.suggestion?'kg':''}</div></div>`}).join('');$('#summary-session-note').value=s.sessionNote||''},
  renderHistory(){const w=$('#history-filters');const fs=[['all','全部'],['7d','7 天'],['30d','30 天'],['pr','有 PR']];w.innerHTML=fs.map(([k,l])=>`<button class="chip ${this.hFilter===k?'active':''}" data-action="history-filter" data-filter="${k}">${l}</button>`).join('');const now=Date.now();let items=DB.data.workouts.slice();if(this.hFilter==='7d')items=items.filter(w=>now-w.startedAt<=7*864e5);if(this.hFilter==='30d')items=items.filter(w=>now-w.startedAt<=30*864e5);if(this.hFilter==='pr')items=items.filter(w=>(w.prs||[]).length>0);const l=$('#history-list');if(!items.length){l.innerHTML='<div class="empty">還沒有訓練記錄</div>';return}l.innerHTML=items.map(w=>`<div class="item"><div class="row between wrap"><div><h3>${Utils.escape(w.programName||'Workout')}</h3><div class="meta"><span>${Utils.formatDateTime(w.startedAt)}</span><span>${Utils.formatDuration(w.durationSec)}</span><span>${w.exercises.length} 個動作</span>${(w.prs||[]).length?`<span class="pill">${w.prs.length} PR</span>`:''}</div></div><button class="btn" data-action="open-detail" data-id="${w.id}">詳情</button></div></div>`).join('')},
  openDetail(id){this.detId=id;const w=DB.data.workouts.find(x=>x.id===id);if(!w)return;$('#detail-meta').textContent=Utils.formatDateTime(w.startedAt);$('#detail-head').innerHTML=`<div class="row between wrap"><div class="kv"><div class="k">課表</div><div class="v">${Utils.escape(w.programName)}</div></div><div class="pill">${Utils.formatDuration(w.durationSec)}</div></div><div class="row wrap"><div class="pill">${w.exercises.length} 個動作</div><div class="pill">${w.exercises.reduce((n,e)=>n+e.sets.filter(s=>s.done).length,0)} 完成組</div>${(w.prs||[]).length?`<div class="pill">${w.prs.length} PR</div>`:''}</div>${w.sessionNote?`<div class="subtle" style="margin-top:8px">${Utils.escape(w.sessionNote)}</div>`:''}`;$('#detail-exercises').innerHTML=w.exercises.map(ex=>`<div class="detail-ex"><div class="row between wrap"><strong>${Utils.escape(exDisplayName(ex))}</strong><span class="pill">${ex.repMin}-${ex.repMax}r · RIR${ex.rir}</span></div><div class="subtle">${ex.notes?Utils.escape(ex.notes):'—'}</div><div class="list">${ex.sets.map((s,i)=>`<div class="muted-box">Set ${i+1} · ${s.weight||'—'}kg · ${s.reps||'—'}reps ${s.done?'· ✓':''}</div>`).join('')}</div></div>`).join('');Nav.go('screen-detail')},
  renderStrength(){const exs=Array.from(new Set(DB.data.workouts.flatMap(w=>(w.exercises||[]).map(e=>e.exerciseKey||resolveKey(e.name||''))))).sort();const defs=['barbell_bench_press','back_squat','conventional_deadlift','romanian_deadlift','pull_up'];const opts=exs.length?exs:defs;if(!opts.includes(this.strEx))this.strEx=opts[0];$('#strength-selector').innerHTML=opts.map(k=>`<button class="chip ${k===this.strEx?'active':''}" data-action="select-strength" data-name="${k}">${Utils.escape(exLabel(k))}</button>`).join('');$('#strength-chart-title').textContent=exLabel(this.strEx);const pts=DB.data.workouts.map(w=>{const e=(w.exercises||[]).find(x=>(x.exerciseKey||resolveKey(x.name||''))===this.strEx);if(!e)return null;const v=WK.e1rm(e);if(!v)return null;return{x:w.startedAt,y:v}}).filter(Boolean).reverse();drawChart($('#strength-canvas'),pts,{suffix:' kg'});$('#strength-footnote').textContent=pts.length?`共 ${pts.length} 筆資料。`:'尚無資料。'},
  renderWeight(){const l=$('#weight-list');const items=DB.data.weightEntries.slice().sort((a,b)=>b.date.localeCompare(a.date));$('#weight-count').textContent=`${items.length} 筆`;if(!items.length)l.innerHTML='<div class="empty">尚未記錄體重</div>';else l.innerHTML=items.map(i=>`<div class="item"><div class="row between wrap"><div><h3>${i.weight} kg</h3><div class="meta"><span>${Utils.formatDate(i.date)}</span></div></div><button class="btn danger" data-action="delete-weight" data-date="${i.date}">刪除</button></div></div>`).join('');drawChart($('#weight-canvas'),items.slice().reverse().map(i=>({x:i.date,y:Number(i.weight)})),{suffix:' kg'})},
  renderCardio(){const items=DB.data.cardioEntries.slice().sort((a,b)=>b.date.localeCompare(a.date));const l=$('#cardio-list');if(!items.length){l.innerHTML='<div class="empty">尚未記錄有氧</div>';return}l.innerHTML=items.map(i=>`<div class="item"><div class="row between wrap"><div><h3>${Utils.escape(i.type||'Cardio')}</h3><div class="meta"><span>${Utils.formatDate(i.date)}</span>${i.minutes?`<span>${i.minutes} 分鐘</span>`:''}${i.distance?`<span>${i.distance} km</span>`:''}${i.calories?`<span>${i.calories} kcal</span>`:''}</div>${i.note?`<div class="subtle" style="margin-top:8px">${Utils.escape(i.note)}</div>`:''}</div><button class="btn danger" data-action="delete-cardio" data-id="${i.id}">刪除</button></div></div>`).join('')},
  renderScience(){const p=Sci.profile();const g=Sci.goal(p.goal);$('#science-profile-badge').textContent=Sci.badge(p);$('#science-top').innerHTML=Sci.weeklyTargets(p).map(i=>`<div class="summary-card"><div class="k">${Utils.escape(i.key)}</div><div class="v" style="font-size:18px">${Utils.escape(i.value)}</div></div>`).join('');$('#science-goal').value=p.goal;$('#science-level').value=p.level;$('#science-session-min').value=p.sessionMin;$('#science-equipment').value=p.equipment;$('#science-knee').checked=!!p.knee;$('#science-shoulder').checked=!!p.shoulder;$('#science-lowback').checked=!!p.lowBack;const recs=Sci.topPrograms(3);$('#science-recommendation-label').textContent=g.badge;$('#science-recommendations').innerHTML=recs.map(({program:pr,score:sc},i)=>`<div class="item"><div class="row between wrap"><div style="min-width:0"><h3>${i+1}. ${Utils.escape(pr.name)}</h3><div class="meta"><span>${Utils.escape(pr.category||'Program')}</span><span>${(pr.exercises||[]).length} 動作</span><span>適配 ${sc.toFixed(1)}</span></div><div class="subtle" style="margin-top:8px">${Utils.escape(pr.note||'符合目前目標。')}</div></div><button class="btn primary" data-action="apply-recommended-program" data-id="${pr.id}">套用</button></div></div>`).join('');$('#science-rules-list').innerHTML=Sci.rules(p).map(r=>`<div class="muted-box science-note">${Utils.escape(r)}</div>`).join('')},
  renderReports(){if(!$('#report-daily-date').value)$('#report-daily-date').value=Utils.today();if(!$('#report-weekly-date').value)$('#report-weekly-date').value=Utils.weekStart(Utils.today())},
  showDaily(r){if(!r){Toast.show('該日無訓練記錄');return}this.curDaily=r;$('#daily-report-card').classList.remove('hidden');$('#daily-report-date-badge').textContent=r.date;$('#daily-report-content').textContent=r.reportText},
  showWeekly(r){if(!r){Toast.show('該週無訓練記錄');return}this.curWeekly=r;$('#weekly-report-card').classList.remove('hidden');$('#weekly-report-range-badge').textContent=r.weekKey;$('#weekly-report-content').textContent=r.reportText},
  renderSettings(){$('#settings-version-value').textContent=APP_VERSION;$('#settings-data-stats').textContent=`課表 ${PS.getAll().length} · 訓練 ${DB.data.workouts.length} · 體重 ${DB.data.weightEntries.length} · 有氧 ${DB.data.cardioEntries.length}`}
};

// ================================================================
// 18. EVENT ROUTING
// ================================================================
function attachListGesture(container,selector,onSelect){
  let st={startX:0,startY:0,moved:false,active:null};
  container.addEventListener('pointerdown',e=>{const i=e.target.closest(selector);if(!i)return;st.active=i;st.startX=e.clientX;st.startY=e.clientY;st.moved=false},{passive:true});
  container.addEventListener('pointermove',e=>{if(!st.active)return;if(Math.abs(e.clientX-st.startX)>8||Math.abs(e.clientY-st.startY)>8)st.moved=true},{passive:true});
  container.addEventListener('pointerup',e=>{const i=e.target.closest(selector);if(!st.active||!i||i!==st.active){st.active=null;return}if(!st.moved)onSelect(i,e);st.active=null},{passive:true});
  container.addEventListener('pointercancel',()=>st.active=null,{passive:true});
}

function bindEvents(){
  document.addEventListener('click',e=>{const el=e.target.closest('[data-action]');if(el)handleAction(el.dataset.action,el)});
  document.addEventListener('input',e=>{const t=e.target;
    if(t.matches('[data-action="editor-field"]'))handleEditorField(t);
    if(t.matches('[data-action="set-input"]'))WK.updateSet(t.dataset.id,Number(t.dataset.set),t.dataset.field,t.value);
    if(t.matches('[data-action="exercise-field"]'))WK.updateExField(t.dataset.id,t.dataset.field,t.value);
    if(t.matches('#library-search'))EL.render();
    if(t.matches('#program-search')){SC.programSearchQ=String(t.value||'').trim().toLowerCase();SC.renderPrograms()}
    if(t.matches('[data-role="dropdown-search"]'))SC.filterDD(t.dataset.id,t.value);
    if(t.matches('[data-action="coach-editor-field"]'))SC.handleCoachProgramEditorField(t);
    if(t.matches('#coach-program-picker-search'))SC.filterCoachPicker(t.value);
    if(t.matches('[data-action="coach-set-weight"]'))SC.updateCoachSetValue(Number(t.dataset.exerciseIndex),Number(t.dataset.setIndex),'weight',t.value);
    if(t.matches('[data-action="coach-set-reps"]'))SC.updateCoachSetValue(Number(t.dataset.exerciseIndex),Number(t.dataset.setIndex),'reps',t.value);
    if(t.matches('#coach-workout-picker-search'))SC.filterCoachWorkoutPicker(t.value);
    if(t.matches('#coach-client-search')){SC.coachClientSearch=t.value||'';SC.renderCoachClients()}
  });
  document.addEventListener('change',e=>{const t=e.target;
    if(t.matches('input[type="number"]'))Numpad.sanitize(t);
    if(t.matches('#import-file')){importFile(t.files?.[0]);t.value=''}
    if(t.matches('#weight-date,#weight-value,#cardio-date,#cardio-minutes,#cardio-distance,#cardio-calories'))Numpad.sanitize(t);
  });
  document.addEventListener('keydown',e=>{const t=e.target;if(e.key==='Enter'&&t.matches('[data-action="set-input"][data-field="reps"]')){e.preventDefault();WK.toggleDone(t.dataset.id,Number(t.dataset.set))}});
  $('#library-sheet').addEventListener('click',e=>{if(e.target===$('#library-sheet'))EL.close()});
  {const cs=$('#coach-client-sheet');if(cs)cs.addEventListener('click',e=>{if(e.target===cs)SC.closeCoachClientSheet()})}
  {const cp=$('#coach-exercise-picker');if(cp)cp.addEventListener('click',e=>{if(e.target===cp)SC.closeCoachProgramPicker()})}
  {const wp=$('#coach-workout-picker');if(wp)wp.addEventListener('click',e=>{if(e.target===wp)SC.closeCoachWorkoutPicker()})}
  {const ex=$('#coach-program-export-sheet');if(ex)ex.addEventListener('click',e=>{if(e.target===ex)SC.closeCoachProgramExport()})}
  {const sr=$('#coach-session-report-sheet');if(sr)sr.addEventListener('click',e=>{if(e.target===sr)SC.closeCoachSessionReport()})}
  {const fs=$('#coach-finish-sync-sheet');if(fs)fs.addEventListener('click',e=>{if(e.target===fs)SC.closeCoachFinishSyncSheet()})}
  attachListGesture($('#library-list'),'.select-option',item=>{const k=item.dataset.libraryKey;if(k)EL.select(k)});
  bindDropdownGestures();
}

function handleEditorField(input){
  if(!SC.edProg)return;const ex=SC.edProg.exercises.find(x=>x._id===input.dataset.id);if(!ex)return;
  const f=input.dataset.field;if('sets repMin repMax rir restSec'.split(' ').includes(f)){ex[f]=parseInt(input.value||ex[f],10);if(f==='repMin'&&ex.repMax<ex.repMin)ex.repMax=ex.repMin;if(f==='repMax'&&ex.repMax<ex.repMin)ex.repMin=ex.repMax}else ex[f]=input.value;
}

function handleAction(action,el){
  switch(action){
    case 'back-home':Nav.go('screen-home');break;
    case 'back-programs':Nav.go('screen-programs');break;
    case 'back-history':Nav.go('screen-history');break;
    case 'open-programs':Nav.go('screen-programs');break;
    case 'open-history':Nav.go('screen-history');break;
    case 'open-strength':Nav.go('screen-strength');break;
    case 'open-weight':Nav.go('screen-weight');break;
    case 'open-cardio':Nav.go('screen-cardio');break;
    case 'open-science':Nav.go('screen-science');break;
    case 'open-settings':Nav.go('screen-settings');break;
    case 'open-reports':Nav.go('screen-reports');break;
    case 'select-program':PS.select(el.dataset.id);SC.renderPrograms();SC.renderHome();Toast.show('已切換今日課表');break;
    case 'edit-program':{const p=PS.byId(el.dataset.id);if(p)SC.openEditor(p);break}
    case 'copy-program':PS.copy(el.dataset.id);SC.renderPrograms();Toast.show('已複製課表');break;
    case 'delete-program':if(confirm('刪除此自訂課表？')){PS.del(el.dataset.id);SC.renderPrograms();SC.renderHome();Toast.show('已刪除課表')}break;
    case 'create-custom-program':SC.openEditor(PS.createBlank());break;
    case 'save-program':if(!SC.edProg)return;SC.edProg.name=$('#editor-program-name').value;SC.edProg.note=$('#editor-program-note').value;SC.edProg.exercises=SC.edProg.exercises.map(({_id,...r})=>r);PS.save(PS.sanitize(SC.edProg));SC.renderPrograms();SC.renderHome();Nav.go('screen-programs');Toast.show(SC.edProg.builtIn?'已複製為新課表':'已儲存課表');break;
    case 'editor-add-exercise':EL.open('editor');break;
    case 'editor-copy-template':if(!SC.edProg)return;SC.edProg.id=Utils.uid('prog');SC.edProg.builtIn=false;$('#editor-title').textContent='編輯自訂課表';Toast.show('已轉為新課表');break;
    case 'editor-move-up':if(SC.moveEditorEx(el.dataset.id,-1))Toast.show('已上移動作');break;
    case 'editor-move-down':if(SC.moveEditorEx(el.dataset.id,1))Toast.show('已下移動作');break;
    case 'remove-editor-exercise':if(!SC.edProg)return;SC.edProg.exercises=SC.edProg.exercises.filter(e=>e._id!==el.dataset.id);SC.renderEditorEx();break;
    case 'editor-pick-exercise':EL.open('editor-replace',el.dataset.id);break;
    case 'start-workout':if(WK.session){Timer.startE();SC.renderWorkout();Nav.go('screen-workout');Toast.show('已回到未完成訓練');break}{const sel=PS.selected();if(!sel)return Toast.show('請先選擇課表');WK.start(sel.id)}break;
    case 'resume-workout':if(!WK.session)return Toast.show('目前沒有訓練草稿');Timer.startE();SC.renderWorkout();Nav.go('screen-workout');break;
    case 'discard-workout-draft':if(!WK.session)return Toast.show('目前沒有訓練草稿');if(confirm('捨棄目前未完成訓練？這會清除本次草稿。')){Timer.stopE();Timer.stopR();WK.session=null;WK.clearDraft();SC.renderHome();Toast.show('已捨棄草稿')}break;
    case 'leave-workout':if(confirm('離開訓練畫面？未完成內容會保留在草稿。')){Timer.stopE();Timer.stopR();Nav.go('screen-home');SC.renderHome()}break;
    case 'finish-workout':if(!WK.session)return;{const pr=WK.progress();if(pr.done===0&&!confirm('目前還沒有完成任何組，仍要直接結束訓練嗎？'))break}WK.finish();Toast.show('已完成訓練');break;
    case 'workout-open-library':EL.open('workout');break;
    case 'close-library':EL.close();break;
    case 'goto-exercise':WK.setCurrent(Number(el.dataset.index));break;
    case 'toggle-exercise-collapse':WK.toggle(el.dataset.id);break;
    case 'toggle-set':WK.toggleDone(el.dataset.id,Number(el.dataset.set));break;
    case 'add-set':WK.addSet(el.dataset.id);break;
    case 'fill-suggested-weight':WK.fillW(el.dataset.id);break;
    case 'clear-unfinished-sets':WK.clearUnfinished(el.dataset.id);break;
    case 'remove-workout-exercise':WK.removeEx(el.dataset.id);break;
    case 'workout-move-up':WK.moveEx(el.dataset.id,-1);break;
    case 'workout-move-down':WK.moveEx(el.dataset.id,1);break;
    case 'swap-exercise':WK.openSwapExercise(el.dataset.id);break;
    case 'save-weight':saveWeight();break;
    case 'delete-weight':DB.data.weightEntries=DB.data.weightEntries.filter(x=>x.date!==el.dataset.date);DB.save();SC.renderWeight();Toast.show('已刪除');break;
    case 'save-cardio':saveCardio();break;
    case 'delete-cardio':DB.data.cardioEntries=DB.data.cardioEntries.filter(x=>x.id!==el.dataset.id);DB.save();SC.renderCardio();Toast.show('已刪除');break;
    case 'save-science-profile':saveSciProfile();break;
    case 'apply-recommended-program':PS.select(el.dataset.id);SC.renderPrograms();SC.renderScience();SC.renderHome();Toast.show('已套用推薦課表');break;
    case 'history-filter':SC.hFilter=el.dataset.filter;SC.renderHistory();break;
    case 'program-filter':SC.programFilter=el.dataset.filter||'all';SC.renderPrograms();break;
    case 'open-detail':SC.openDetail(el.dataset.id);break;
    case 'select-strength':SC.strEx=el.dataset.name;SC.renderStrength();break;
    case 'export-data':Utils.download(`aira-tracker-v4-${Utils.today()}.json`,JSON.stringify(DB.data,null,2));Toast.show('已匯出資料');break;
    case 'wipe-data':if(confirm('確定要清空所有資料？這個動作無法復原。')){localStorage.removeItem(APP_KEY);localStorage.removeItem(DRAFT_KEY);DB.reset();WK.session=null;WK.summary=null;SC.renderHome();Nav.go('screen-home');Toast.show('已清空資料')}break;
    case 'save-session-note':{const n=Utils.text($('#summary-session-note').value);if(WK.summary){WK.summary.sessionNote=n;const w=DB.data.workouts.find(x=>x.id===WK.summary.id);if(w){w.sessionNote=n;DB.save()}Toast.show('已儲存備註')}}break;
    case 'generate-daily-report':{const d=WK.summary?Utils.dateFromTs(WK.summary.endedAt):Utils.today();const r=Reports.daily(d);Nav.go('screen-reports');SC.showDaily(r);break}
    case 'generate-daily-report-page':{const d=$('#report-daily-date').value||Utils.today();SC.showDaily(Reports.daily(d));break}
    case 'generate-weekly-report':{const d=$('#report-weekly-date').value||Utils.weekStart(Utils.today());SC.showWeekly(Reports.weekly(d));break}
    case 'copy-daily-summary':if(SC.curDaily)Utils.copyText(SC.curDaily.reportText);break;
    case 'copy-daily-ai-prompt':if(SC.curDaily)Utils.copyText(SC.curDaily.aiPromptText);break;
    case 'export-daily-md':if(SC.curDaily)Utils.download(`daily-${SC.curDaily.date}.md`,SC.curDaily.markdownText,'text/markdown');break;
    case 'export-daily-json':if(SC.curDaily)Utils.download(`daily-${SC.curDaily.date}.json`,JSON.stringify(SC.curDaily,null,2));break;
    case 'copy-weekly-summary':if(SC.curWeekly)Utils.copyText(SC.curWeekly.reportText);break;
    case 'copy-weekly-ai-prompt':if(SC.curWeekly)Utils.copyText(SC.curWeekly.aiPromptText);break;
    case 'export-weekly-md':if(SC.curWeekly)Utils.download(`weekly-${SC.curWeekly.weekKey}.md`,SC.curWeekly.markdownText,'text/markdown');break;
    case 'export-weekly-json':if(SC.curWeekly)Utils.download(`weekly-${SC.curWeekly.weekKey}.json`,JSON.stringify(SC.curWeekly,null,2));break;
    case 'export-full-json':Utils.download(`aira-full-${Utils.today()}.json`,JSON.stringify(DB.data,null,2));Toast.show('已匯出');break;
    case 'export-full-md':{let md=`# Aira Export ${Utils.today()}\n\n`;md+=`## Workouts (${DB.data.workouts.length})\n\n`;DB.data.workouts.forEach(w=>{md+=`### ${w.programName} — ${Utils.formatDateTime(w.startedAt)}\n`;w.exercises.forEach(e=>{md+=`- ${exDisplayName(e)}: ${e.sets.filter(s=>s.done).map(s=>`${s.weight}kg×${s.reps}`).join(', ')}\n`});md+='\n'});Utils.download(`aira-full-${Utils.today()}.md`,md,'text/markdown');Toast.show('已匯出');break}
    case 'open-coach-clients':Nav.go('screen-coach-clients');break;
    case 'back-coach-clients':Nav.go('screen-settings');break;
    case 'coach-toggle-archived':SC.coachShowArchived=!SC.coachShowArchived;SC.renderCoachClients();break;
    case 'coach-new-client':SC.openCoachClientSheet('');break;
    case 'coach-edit-client':SC.openCoachClientSheet(el.dataset.id);break;
    case 'coach-close-client-sheet':SC.closeCoachClientSheet();break;
    case 'coach-save-client':SC.saveCoachClientFromForm();break;
    case 'coach-set-default-client':{if(!CDB.data)CDB.load();const id=el.dataset.id;const cur=CDB.data.settings.defaultClientId;CDB.data.settings.defaultClientId=(cur===id)?'':id;CDB.save();SC.renderCoachClients();Toast.show(CDB.data.settings.defaultClientId?'已設為預設學員':'已取消預設');break}
    case 'coach-archive-client':if(Clients.archive(el.dataset.id)){SC.renderCoachClients();Toast.show('已封存學員')}break;
    case 'coach-unarchive-client':if(Clients.unarchive(el.dataset.id)){SC.renderCoachClients();Toast.show('已取消封存')}break;
    case 'coach-delete-client':{const c=Clients.byId(el.dataset.id);if(!c)break;if(!confirm(`刪除學員「${c.name||'Unnamed Client'}」？其課表、課程與報告也會一併移除，且無法復原。`))break;if(Clients.delete(el.dataset.id)){SC.renderCoachClients();Toast.show('已刪除學員')}break}
    case 'open-coach-programs':SC.coachCurrentClientId=el.dataset.id||'';Nav.go('screen-coach-programs');break;
    case 'back-coach-programs':Nav.go('screen-coach-clients');break;
    case 'coach-new-program':SC.openCoachProgramEditor(null);break;
    case 'coach-edit-program':SC.openCoachProgramEditor(el.dataset.id);break;
    case 'coach-save-program':SC.saveCoachProgramFromEditor();break;
    case 'coach-copy-program':{const nid=SC.cloneCoachProgram(el.dataset.id);if(nid){SC.renderCoachPrograms();Toast.show('已複製課表')}break}
    case 'coach-delete-program':{const p=CPS.byId(el.dataset.id);if(!p)break;if(!confirm(`刪除課表「${p.name||'Untitled Client Program'}」？此動作無法復原。`))break;if(CPS.delete(el.dataset.id)){SC.renderCoachPrograms();Toast.show('已刪除課表')}break}
    case 'coach-set-active-program':if(SC.setCoachActiveProgram(el.dataset.id)){SC.renderCoachPrograms();Toast.show('已切換為使用中課表')}break;
    case 'back-coach-program-editor':Nav.go('screen-coach-programs');break;
    case 'coach-editor-add-exercise':SC.openCoachProgramPicker();break;
    case 'coach-editor-remove-exercise':SC.removeCoachProgramExercise(el.dataset.id);break;
    case 'coach-editor-move-exercise-up':SC.moveCoachProgramExercise(el.dataset.id,-1);break;
    case 'coach-editor-move-exercise-down':SC.moveCoachProgramExercise(el.dataset.id,1);break;
    case 'coach-open-program-picker':SC.openCoachProgramPicker();break;
    case 'coach-close-program-picker':SC.closeCoachProgramPicker();break;
    case 'coach-picker-add-exercise':SC.pickerAddExercise(el.dataset.exerciseKey);break;
    case 'start-coach-workout':{
      const clientId=el.dataset.clientId||SC.coachCurrentClientId;
      if(!clientId){Toast.show('請先選擇學員');break}
      const active=SC.getCoachActiveProgram(clientId);
      if(!active){Toast.show('此學員尚未設定使用中課表');break}
      if(CWK.session){
        const sameClient=CWK.session.clientId===clientId;
        const sameProgram=CWK.session.programId===active.id;
        if(!sameClient||!sameProgram){
          if(!confirm('目前已有其他未完成的教練訓練，繼續將捨棄現有草稿。要開始新的訓練嗎？'))break;
          CWK.discard();
          CWK.start(clientId,{programId:active.id});
        }
      }else{
        CWK.start(clientId,{programId:active.id});
      }
      Nav.go('screen-coach-workout');
      break;
    }
    case 'leave-coach-workout':SC.leaveCoachWorkout();break;
    case 'finish-coach-workout':SC.finishCoachWorkout();break;
    case 'coach-finish-save-only':SC.finishCoachWorkoutSaveOnly();break;
    case 'coach-finish-sync-program':SC.finishCoachWorkoutAndSyncProgram();break;
    case 'coach-finish-cancel':SC.closeCoachFinishSyncSheet();break;
    case 'coach-toggle-set-done':SC.toggleCoachSetDone(Number(el.dataset.exerciseIndex),Number(el.dataset.setIndex));break;
    case 'coach-toggle-exercise-collapse':{
      const id=el.dataset.id;if(!id)break;
      if(!SC.coachWorkoutCollapsed)SC.coachWorkoutCollapsed=new Set();
      if(SC.coachWorkoutCollapsed.has(id))SC.coachWorkoutCollapsed.delete(id);
      else SC.coachWorkoutCollapsed.add(id);
      SC.renderCoachWorkoutExercises();
      break;
    }
    case 'coach-workout-open-add-picker':SC.openCoachWorkoutAddPicker();break;
    case 'coach-workout-open-swap-picker':SC.openCoachWorkoutSwapPicker(Number(el.dataset.exerciseIndex));break;
    case 'coach-workout-close-picker':SC.closeCoachWorkoutPicker();break;
    case 'coach-workout-picker-select':SC.handleCoachWorkoutPickerSelect(el.dataset.exerciseKey);break;
    case 'coach-workout-remove-added-exercise':SC.removeCoachWorkoutExercise(Number(el.dataset.exerciseIndex));break;
    case 'coach-open-program-export':SC.openCoachProgramExport(el.dataset.id);break;
    case 'coach-open-active-program-export':SC.openCoachActiveProgramExport();break;
    case 'coach-close-program-export':SC.closeCoachProgramExport();break;
    case 'coach-copy-program-text':SC.copyCoachProgramText();break;
    case 'coach-copy-program-ai-prompt':SC.copyCoachProgramAiPrompt();break;
    case 'coach-export-program-md':SC.exportCoachProgramMarkdown();break;
    case 'coach-export-program-json':SC.exportCoachProgramJson();break;
    case 'open-coach-reports':SC.openCoachReports(el.dataset.id);break;
    case 'back-coach-reports':Nav.go('screen-coach-clients');break;
    case 'coach-open-session-report':SC.openCoachSessionReport(el.dataset.id);break;
    case 'coach-close-session-report':SC.closeCoachSessionReport();break;
    case 'coach-report-preview-coach':SC.setCoachSessionReportPreviewMode('coach');break;
    case 'coach-report-preview-client':SC.setCoachSessionReportPreviewMode('client');break;
    case 'coach-report-preview-ai':SC.setCoachSessionReportPreviewMode('ai');break;
    case 'coach-copy-session-coach-text':SC.copyCoachSessionCoachText();break;
    case 'coach-copy-session-client-text':SC.copyCoachSessionClientText();break;
    case 'coach-copy-session-ai-prompt':SC.copyCoachSessionAiPrompt();break;
    case 'coach-export-session-md':SC.exportCoachSessionMarkdown();break;
    case 'coach-export-session-json':SC.exportCoachSessionJson();break;
  }
}

function bindDropdownGestures(){
  document.addEventListener('click',e=>{const dd=e.target.closest('.dropdown');const tr=e.target.closest('.select-trigger[data-action="toggle-dropdown"]');if(!dd&&!tr)SC.closeDD()});
  const st={startX:0,startY:0,moved:false,item:null};
  document.addEventListener('pointerdown',e=>{const i=e.target.closest('.dropdown-list .select-option');if(!i)return;st.item=i;st.startX=e.clientX;st.startY=e.clientY;st.moved=false},{passive:true});
  document.addEventListener('pointermove',e=>{if(!st.item)return;if(Math.abs(e.clientX-st.startX)>8||Math.abs(e.clientY-st.startY)>8)st.moved=true},{passive:true});
  document.addEventListener('pointerup',e=>{const i=e.target.closest('.dropdown-list .select-option');if(!st.item||!i||i!==st.item){st.item=null;return}if(!st.moved){const ek=i.dataset.dropdownKey;const eid=i.dataset.id;const ex=SC.edProg?.exercises.find(x=>x._id===eid);if(ex&&ek){ex.exerciseKey=ek;SC.renderEditorEx()}}st.item=null},{passive:true});
  document.addEventListener('pointercancel',()=>st.item=null,{passive:true});
}

// ================================================================
// 19. DOMAIN SAVE FUNCTIONS
// ================================================================
function saveSciProfile(){const sm=Number($('#science-session-min').value||Sci.profile().sessionMin);Sci.save({goal:$('#science-goal').value||'general_health',level:$('#science-level').value||'intermediate',sessionMin:Utils.clamp(Number.isFinite(sm)?sm:60,20,180),equipment:$('#science-equipment').value||'full_gym',knee:!!$('#science-knee').checked,shoulder:!!$('#science-shoulder').checked,lowBack:!!$('#science-lowback').checked});SC.renderScience();SC.renderPrograms();SC.renderHome();if(WK.session)SC.renderWorkout();Toast.show('已更新科學設定')}

function saveWeight(){const d=$('#weight-date').value||Utils.today();const w=Number($('#weight-value').value);if(!Number.isFinite(w)||w<=0)return Toast.show('請輸入有效體重');const e={date:d,weight:Number(w.toFixed(1))};DB.data.weightEntries=DB.data.weightEntries.filter(x=>x.date!==d);DB.data.weightEntries.push(e);DB.save();$('#weight-value').value='';SC.renderWeight();Toast.show('已儲存體重')}

function saveCardio(){const d=$('#cardio-date').value||Utils.today();const ty=Utils.text($('#cardio-type').value)||'Cardio';const mi=$('#cardio-minutes').value?Number($('#cardio-minutes').value):'';const di=$('#cardio-distance').value?Number($('#cardio-distance').value):'';const ca=$('#cardio-calories').value?Number($('#cardio-calories').value):'';const no=Utils.text($('#cardio-note').value);DB.data.cardioEntries.unshift({id:Utils.uid('cardio'),date:d,type:ty,minutes:mi,distance:di,calories:ca,note:no});DB.save();$('#cardio-type').value='';$('#cardio-minutes').value='';$('#cardio-distance').value='';$('#cardio-calories').value='';$('#cardio-note').value='';SC.renderCardio();Toast.show('已儲存有氧')}

function importFile(file){if(!file)return;const r=new FileReader();r.onload=()=>{try{const p=JSON.parse(r.result);DB.data=DB.migrate(p);DB.save();SC.renderHome();SC.renderPrograms();SC.renderHistory();SC.renderStrength();SC.renderWeight();SC.renderCardio();SC.renderScience();SC.renderSettings();Toast.show('匯入完成')}catch(e){console.error(e);Toast.show('匯入失敗')}};r.readAsText(file)}

// ================================================================
// 19.5 CLIENT COACHING MODULE v1 — Step 1 Data Layer Skeleton
//      Fully isolated from personal training domain.
//        - Own localStorage keys: COACH_KEY, COACH_DRAFT_KEY.
//        - Does NOT read/write DB.data, DRAFT_KEY, V3 keys.
//        - Does NOT mutate DB / PS / WK / Reports / Sci.
//        - No UI bindings in this step (screens, actions, sheet modes).
// ================================================================
const DEF_CDB={version:CDB_VERSION,clients:[],clientPrograms:[],clientSessions:[],clientReports:[],settings:{defaultClientId:''}};

const CDB={
  data:null,
  load(){
    try{
      const raw=localStorage.getItem(COACH_KEY);
      const parsed=raw?JSON.parse(raw):null;
      this.data=this.migrate(parsed||Utils.copy(DEF_CDB));
    }catch(e){
      console.error('coaching storage load error',e);
      this.data=this.migrate(Utils.copy(DEF_CDB));
    }
    return this.data;
  },
  migrate(d){
    const base=Utils.copy(DEF_CDB);
    const src=(d&&typeof d==='object')?d:{};
    const m={...base,...src};
    m.settings={...base.settings,...((src&&src.settings)||{})};
    ['clients','clientPrograms','clientSessions','clientReports'].forEach(k=>{if(!Array.isArray(m[k]))m[k]=[]});
    m.version=CDB_VERSION;
    return m;
  },
  save(){
    try{localStorage.setItem(COACH_KEY,JSON.stringify(this.data))}
    catch(e){console.error('coaching storage save error',e)}
  },
  reset(){this.data=this.migrate(Utils.copy(DEF_CDB));this.save()}
};

const Clients={
  _now(){return Date.now()},
  getAll(){return((CDB.data&&CDB.data.clients)||[]).slice()},
  getActive(){return this.getAll().filter(c=>!c.isArchived)},
  getArchived(){return this.getAll().filter(c=>!!c.isArchived)},
  byId(id){return this.getAll().find(c=>c.id===id)||null},
  createBlank(){
    const now=this._now();
    return{id:Utils.uid('client'),name:'',gender:'',age:'',heightCm:'',weightKg:'',note:'',goal:'',tags:[],scheduleNote:'',isArchived:false,createdAt:now,updatedAt:now};
  },
  sanitize(c){
    const src=(c&&typeof c==='object')?c:{};
    const now=this._now();
    const num=v=>{if(v===''||v===null||v===undefined)return'';const n=Number(v);return Number.isFinite(n)?n:''};
    const gender=Utils.text(src.gender);
    return{
      id:Utils.text(src.id)||Utils.uid('client'),
      name:Utils.text(src.name)||'Unnamed Client',
      gender:['female','male','other'].includes(gender)?gender:'',
      age:num(src.age),
      heightCm:num(src.heightCm),
      weightKg:num(src.weightKg),
      note:Utils.text(src.note),
      goal:Utils.text(src.goal),
      tags:Array.isArray(src.tags)?src.tags.map(t=>Utils.text(t)).filter(Boolean):[],
      scheduleNote:Utils.text(src.scheduleNote),
      isArchived:!!src.isArchived,
      createdAt:Number.isFinite(src.createdAt)?src.createdAt:now,
      updatedAt:now
    };
  },
  save(client){
    if(!CDB.data)CDB.load();
    const clean=this.sanitize(client);
    const list=CDB.data.clients;
    const idx=list.findIndex(x=>x.id===clean.id);
    if(idx>=0)list[idx]=clean;else list.unshift(clean);
    CDB.save();
    return clean;
  },
  archive(id){const c=this.byId(id);if(!c)return false;c.isArchived=true;c.updatedAt=this._now();if(CDB.data&&CDB.data.settings&&CDB.data.settings.defaultClientId===id)CDB.data.settings.defaultClientId='';CDB.save();return true},
  unarchive(id){const c=this.byId(id);if(!c)return false;c.isArchived=false;c.updatedAt=this._now();CDB.save();return true},
  delete(id){
    if(!CDB.data)return false;
    const before=CDB.data.clients.length;
    CDB.data.clientPrograms=(CDB.data.clientPrograms||[]).filter(p=>p.clientId!==id);
    CDB.data.clientSessions=(CDB.data.clientSessions||[]).filter(s=>s.clientId!==id);
    CDB.data.clientReports=(CDB.data.clientReports||[]).filter(r=>r.clientId!==id);
    CDB.data.clients=CDB.data.clients.filter(c=>c.id!==id);
    if(CDB.data.settings&&CDB.data.settings.defaultClientId===id)CDB.data.settings.defaultClientId='';
    CDB.save();
    return CDB.data.clients.length<before;
  }
};

const CPS={
  _now(){return Date.now()},
  getAll(){return((CDB.data&&CDB.data.clientPrograms)||[]).slice()},
  byClient(clientId){return this.getAll().filter(p=>p.clientId===clientId)},
  byId(id){return this.getAll().find(p=>p.id===id)||null},
  createBlank(clientId){
    const now=this._now();
    return{
      id:Utils.uid('cprog'),
      clientId:Utils.text(clientId)||'',
      name:'',
      note:'',
      category:'Client',
      exercises:[],
      isActive:false,
      createdAt:now,
      updatedAt:now
    };
  },
  sanitize(program){
    const src=(program&&typeof program==='object')?program:{};
    const now=this._now();
    const exSrc=Array.isArray(src.exercises)?src.exercises:[];
    const exercises=exSrc.map(ex=>{
      const key=(ex&&(ex.exerciseKey||resolveKey(ex.name||'')))||'';
      const rirRaw=(ex&&ex.rir!=null)?ex.rir:2;
      const rirNum=parseInt(rirRaw,10);
      return{
        exerciseKey:key,
        sets:Utils.clamp(parseInt((ex&&ex.sets)||3,10)||3,1,20),
        repMin:Utils.clamp(parseInt((ex&&ex.repMin)||8,10)||8,1,60),
        repMax:Utils.clamp(parseInt((ex&&(ex.repMax||ex.repMin))||12,10)||12,1,60),
        rir:Utils.clamp(Number.isFinite(rirNum)?rirNum:2,0,5),
        restSec:Utils.clamp(parseInt((ex&&ex.restSec)||60,10)||60,0,600),
        notes:Utils.text(ex&&ex.notes)
      };
    }).filter(ex=>!!ex.exerciseKey);
    exercises.forEach(ex=>{if(ex.repMax<ex.repMin)ex.repMax=ex.repMin});
    return{
      id:Utils.text(src.id)||Utils.uid('cprog'),
      clientId:Utils.text(src.clientId),
      name:Utils.text(src.name)||'Untitled Client Program',
      note:Utils.text(src.note),
      category:Utils.text(src.category)||'Client',
      exercises,
      isActive:!!src.isActive,
      createdAt:Number.isFinite(src.createdAt)?src.createdAt:now,
      updatedAt:now
    };
  },
  save(program){
    if(!CDB.data)CDB.load();
    const clean=this.sanitize(program);
    const list=CDB.data.clientPrograms;
    const idx=list.findIndex(x=>x.id===clean.id);
    if(idx>=0)list[idx]=clean;else list.unshift(clean);
    CDB.save();
    return clean;
  },
  delete(id){
    if(!CDB.data)return false;
    const before=CDB.data.clientPrograms.length;
    CDB.data.clientPrograms=CDB.data.clientPrograms.filter(p=>p.id!==id);
    CDB.save();
    return CDB.data.clientPrograms.length<before;
  }
};

const CWK={
  session:null,
  summary:null,
  _now(){return Date.now()},
  loadDraft(){
    try{
      const raw=localStorage.getItem(COACH_DRAFT_KEY);
      if(!raw){this.session=null;return}
      const parsed=JSON.parse(raw);
      if(parsed&&typeof parsed==='object'&&(parsed.clientId||parsed.id)){
        if(!Array.isArray(parsed.exercises))parsed.exercises=[];
        this.session=parsed;
      }else{
        this.session=null;
      }
    }catch(e){
      console.error('coaching draft load error',e);
      this.session=null;
    }
  },
  saveDraft(){
    try{
      if(this.session)localStorage.setItem(COACH_DRAFT_KEY,JSON.stringify(this.session));
      else localStorage.removeItem(COACH_DRAFT_KEY);
    }catch(e){console.error('coaching draft save error',e)}
  },
  clearDraft(){
    try{localStorage.removeItem(COACH_DRAFT_KEY)}
    catch(e){console.error('coaching draft clear error',e)}
  },
  createBlankSession(clientId,options){
    const opts=(options&&typeof options==='object')?options:{};
    const client=Clients.byId(clientId)||null;
    const program=opts.programId?CPS.byId(opts.programId):null;
    const now=this._now();
    const exercises=(program&&Array.isArray(program.exercises)?program.exercises:[]).map(ex=>({
      id:Utils.uid('cex'),
      exerciseKey:ex.exerciseKey,
      name:exLabel(ex.exerciseKey)||'',
      sets:Array.from({length:Math.max(1,parseInt(ex.sets||3,10)||3)},()=>({weight:'',reps:'',done:false})),
      repMin:Utils.clamp(parseInt(ex.repMin,10)||8,1,60),
      repMax:Utils.clamp(parseInt(ex.repMax,10)||12,1,60),
      rir:Utils.clamp(Number.isFinite(parseInt(ex.rir,10))?parseInt(ex.rir,10):2,0,5),
      restSec:Utils.clamp(parseInt(ex.restSec,10)||60,0,600),
      notes:Utils.text(ex.notes),
      note:Utils.text(ex.notes)
    }));
    return{
      id:Utils.uid('csess'),
      clientId:Utils.text(clientId),
      clientName:client?client.name:'',
      date:Utils.today(),
      status:'in_progress',
      startedAt:0,
      finishedAt:0,
      endedAt:0,
      durationMin:0,
      programId:program?program.id:'',
      programName:program?program.name:'',
      coachNote:'',
      clientNote:'',
      exercises,
      createdAt:now,
      updatedAt:now
    };
  },
  start(clientId,options){
    this.summary=null;
    const s=this.createBlankSession(clientId,options);
    s.startedAt=this._now();
    s.updatedAt=s.startedAt;
    this.session=s;
    this.saveDraft();
    return s;
  },
  discard(){
    this.session=null;
    this.summary=null;
    this.clearDraft();
  },
  finish(){
    if(!this.session)return null;
    if(!CDB.data)CDB.load();
    const end=this._now();
    const started=this.session.startedAt||end;
    const durationMin=Math.max(0,Math.round((end-started)/60000));
    const saved={
      ...Utils.copy(this.session),
      status:'complete',
      finishedAt:end,
      endedAt:end,
      durationMin,
      updatedAt:end
    };
    CDB.data.clientSessions.unshift(saved);
    CDB.save();
    this.summary=saved;
    this.session=null;
    this.clearDraft();
    return saved;
  },
  _touch(){if(this.session){this.session.updatedAt=this._now();this.saveDraft()}},
  _findEx(exId){return this.session?this.session.exercises.find(e=>e.id===exId)||null:null},
  addExercise(exerciseKey){
    if(!this.session)return null;
    const key=exerciseKey||'';
    if(!key)return null;
    const item={id:Utils.uid('cex'),exerciseKey:key,sets:[{weight:'',reps:''},{weight:'',reps:''},{weight:'',reps:''}],note:''};
    this.session.exercises.push(item);
    this._touch();
    return item;
  },
  removeExercise(exId){
    if(!this.session)return false;
    const before=this.session.exercises.length;
    this.session.exercises=this.session.exercises.filter(e=>e.id!==exId);
    const changed=this.session.exercises.length<before;
    if(changed)this._touch();
    return changed;
  },
  addSet(exId){
    const ex=this._findEx(exId);if(!ex)return false;
    ex.sets.push({weight:'',reps:''});
    this._touch();
    return true;
  },
  removeSet(exId,setIndex){
    const ex=this._findEx(exId);if(!ex)return false;
    if(!Array.isArray(ex.sets))return false;
    if(setIndex<0||setIndex>=ex.sets.length)return false;
    ex.sets.splice(setIndex,1);
    this._touch();
    return true;
  },
  updateSet(exId,setIndex,field,value){
    const ex=this._findEx(exId);if(!ex||!ex.sets||!ex.sets[setIndex])return false;
    if(field!=='weight'&&field!=='reps')return false;
    ex.sets[setIndex][field]=value;
    this._touch();
    return true;
  },
  updateExerciseNote(exId,value){
    const ex=this._findEx(exId);if(!ex)return false;
    ex.note=Utils.text(value);
    this._touch();
    return true;
  },
  updateCoachNote(value){
    if(!this.session)return false;
    this.session.coachNote=Utils.text(value);
    this._touch();
    return true;
  },
  updateClientNote(value){
    if(!this.session)return false;
    this.session.clientNote=Utils.text(value);
    this._touch();
    return true;
  }
};

const ClientReports={
  build(session){
    const s=(session&&typeof session==='object')?session:{};
    const exList=Array.isArray(s.exercises)?s.exercises:[];
    const clientName=Utils.text(s.clientName)||'學員';
    const dateStr=Utils.text(s.date)||Utils.today();
    const programName=Utils.text(s.programName);
    const durationMin=Number.isFinite(s.durationMin)?s.durationMin:0;
    const coachNote=Utils.text(s.coachNote);
    const clientNote=Utils.text(s.clientNote);

    const summaryLines=exList.map(ex=>{
      const name=exLabel(ex.exerciseKey||'');
      const loggedSets=(ex.sets||[])
        .map((set,i)=>({set,i}))
        .filter(({set})=>(set&&((set.weight!==''&&set.weight!=null)||(set.reps!==''&&set.reps!=null))));
      const setTxt=loggedSets.map(({set,i})=>{
        const w=(set.weight===''||set.weight==null)?'—':set.weight;
        const r=(set.reps===''||set.reps==null)?'—':set.reps;
        return `S${i+1} ${w}kg×${r}`;
      }).join(', ');
      const noteTxt=(ex&&ex.note)?`（${ex.note}）`:'';
      return `  • ${name}: ${setTxt||'—'}${noteTxt}`;
    });

    const header=`🧑‍🏫 教練課程紀錄｜${clientName}\n📅 ${dateStr}${programName?`｜課表：${programName}`:''}${durationMin?`｜時長：${durationMin} 分`:''}`;
    const body=summaryLines.length?`\n\n動作內容：\n${summaryLines.join('\n')}`:`\n\n動作內容：（本次未記錄動作）`;

    const coachText=[
      header,
      body,
      coachNote?`\n\n教練備註：${coachNote}`:'',
      clientNote?`\n學員回饋：${clientNote}`:''
    ].join('');

    const clientText=[
      `🏋️ 今日課程回顧｜${clientName}`,
      `📅 ${dateStr}${programName?`｜${programName}`:''}${durationMin?`｜${durationMin} 分鐘`:''}`,
      summaryLines.length?`\n訓練內容：\n${summaryLines.join('\n')}`:'\n本次未記錄動作。',
      coachNote?`\n\n教練提醒：${coachNote}`:'',
      `\n\n下次課程見，保持訓練節奏！`
    ].join('');

    const aiPromptText=[
      '以下是我帶學員的一次訓練紀錄（教練視角，非個人訓練）。請以教練助理的角度幫我分析：',
      '',
      `學員：${clientName}`,
      `日期：${dateStr}`,
      programName?`課表：${programName}`:'',
      durationMin?`時長：${durationMin} 分`:'',
      '',
      '訓練內容：',
      summaryLines.length?summaryLines.join('\n'):'（本次未記錄動作）',
      coachNote?`\n教練備註：${coachNote}`:'',
      clientNote?`學員回饋：${clientNote}`:'',
      '',
      '請協助：',
      '1. 點出本次課程的亮點與需要調整的地方',
      '2. 建議下一次課程的動作選擇或重量方向',
      '3. 若觀察到恢復或技術問題，提供對學員友善的說明',
      '4. 輸出時請區分「給教練」與「給學員」兩段內容'
    ].filter(l=>l!==undefined&&l!==null).join('\n');

    return{coachText,clientText,aiPromptText};
  }
};

// ---- Client Coaching Module v1 · Step 2: Client Management UI ----
SC.coachShowArchived=false;
SC.coachEditingClientId='';
SC.coachClientSheetOpen=false;
SC.coachClientSearch='';

SC.normalizeCoachClientSearch=function(v){return String(v==null?'':v).trim().toLowerCase()};

SC.filterCoachClients=function(list){
  const q=SC.normalizeCoachClientSearch(this.coachClientSearch);
  if(!q||!Array.isArray(list))return Array.isArray(list)?list:[];
  return list.filter(c=>{
    if(!c)return false;
    const name=String(c.name||'').toLowerCase();
    if(name.includes(q))return true;
    const goal=String(c.goal||'').toLowerCase();
    if(goal.includes(q))return true;
    const schedule=String(c.scheduleNote||'').toLowerCase();
    if(schedule.includes(q))return true;
    if(Array.isArray(c.tags)&&c.tags.some(t=>String(t||'').toLowerCase().includes(q)))return true;
    return false;
  });
};

SC.getClientStats=function(clientId){
  if(!CDB.data)return{programCount:0,sessionCount:0,reportCount:0};
  const programs=Array.isArray(CDB.data.clientPrograms)?CDB.data.clientPrograms:[];
  const sessions=Array.isArray(CDB.data.clientSessions)?CDB.data.clientSessions:[];
  const reports=Array.isArray(CDB.data.clientReports)?CDB.data.clientReports:[];
  return{
    programCount:programs.filter(p=>p&&p.clientId===clientId).length,
    sessionCount:sessions.filter(s=>s&&s.clientId===clientId).length,
    reportCount:reports.filter(r=>r&&r.clientId===clientId).length
  };
};

SC.renderCoachClients=function(){
  if(!CDB.data)CDB.load();
  this.renderCoachClientsSummary();
  const searchInput=$('#coach-client-search');
  if(searchInput&&searchInput.value!==this.coachClientSearch)searchInput.value=this.coachClientSearch;
  const hasSearch=!!SC.normalizeCoachClientSearch(this.coachClientSearch);
  const active=Clients.getActive();
  const archived=Clients.getArchived();
  const activeFiltered=this.filterCoachClients(active);
  const archivedFiltered=this.filterCoachClients(archived);
  const activeEl=$('#coach-active-list');
  if(activeEl){
    if(activeFiltered.length){
      activeEl.innerHTML=activeFiltered.map(c=>this.renderCoachClientCard(c)).join('');
    }else if(hasSearch){
      activeEl.innerHTML='<div class="empty">找不到符合條件的學員。</div>';
    }else{
      activeEl.innerHTML='<div class="empty">尚無學員，點右上角「新增學員」開始。</div>';
    }
  }
  const toggle=$('#coach-archived-toggle');
  const section=$('#coach-archived-section');
  const archivedList=$('#coach-archived-list');
  if(toggle)toggle.textContent=this.coachShowArchived?`隱藏封存（${archived.length}）`:`顯示封存（${archived.length}）`;
  if(section)section.classList.toggle('hidden',!this.coachShowArchived);
  if(archivedList){
    if(archivedFiltered.length){
      archivedList.innerHTML=archivedFiltered.map(c=>this.renderCoachClientCard(c)).join('');
    }else if(hasSearch){
      archivedList.innerHTML='<div class="empty">找不到符合條件的封存學員。</div>';
    }else{
      archivedList.innerHTML='<div class="empty">沒有已封存的學員。</div>';
    }
  }
};

SC.renderCoachClientsSummary=function(){
  const box=$('#coach-clients-summary');if(!box)return;
  const all=Clients.getAll();
  const active=all.filter(c=>!c.isArchived).length;
  const archived=all.length-active;
  const defaultId=(CDB.data&&CDB.data.settings&&CDB.data.settings.defaultClientId)||'';
  const def=defaultId?Clients.byId(defaultId):null;
  const defLabel=def?(def.name||'Unnamed Client'):'未設定';
  box.innerHTML=`<div class="coach-summary-grid"><div class="coach-summary-cell"><div class="k">目前學員</div><div class="v">${active}</div></div><div class="coach-summary-cell"><div class="k">已封存</div><div class="v">${archived}</div></div><div class="coach-summary-cell"><div class="k">預設學員</div><div class="v" style="font-size:14px;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${Utils.escape(defLabel)}</div></div></div>`;
};

SC.renderCoachClientCard=function(c){
  const defaultId=(CDB.data&&CDB.data.settings&&CDB.data.settings.defaultClientId)||'';
  const isDefault=defaultId===c.id;
  const isArchived=!!c.isArchived;
  const stats=this.getClientStats(c.id);
  const metaParts=[];
  if(c.gender){const gm={female:'女',male:'男',other:'其他'};metaParts.push(gm[c.gender]||c.gender)}
  if(c.age!==''&&c.age!=null)metaParts.push(`${c.age} 歲`);
  if(c.heightCm!==''&&c.heightCm!=null)metaParts.push(`${c.heightCm} cm`);
  if(c.weightKg!==''&&c.weightKg!=null)metaParts.push(`${c.weightKg} kg`);
  if(c.goal)metaParts.push(`目標：${c.goal}`);
  const metaHtml=metaParts.length?`<div class="client-card-meta">${metaParts.map(t=>`<span>${Utils.escape(t)}</span>`).join('')}</div>`:'';
  const tagsHtml=(Array.isArray(c.tags)&&c.tags.length)?`<div class="client-card-meta">${c.tags.map(t=>`<span>#${Utils.escape(t)}</span>`).join('')}</div>`:'';
  const updatedHtml=c.updatedAt?`<div class="client-card-footer">更新：${Utils.escape(Utils.formatDateTime(c.updatedAt))}</div>`:'';
  const scheduleHtml=c.scheduleNote?`<div class="client-card-footer">上課：${Utils.escape(c.scheduleNote)}</div>`:'';
  const noteHtml=c.note?`<div class="client-card-footer">${Utils.escape(c.note)}</div>`:'';
  const pills=[];
  if(isDefault)pills.push('<span class="client-pill default">預設</span>');
  if(isArchived)pills.push('<span class="client-pill archived">封存</span>');
  const pillsHtml=pills.length?`<div class="client-card-pills">${pills.join('')}</div>`:'';
  const primary=[];
  primary.push(`<button class="btn primary" data-action="open-coach-programs" data-id="${c.id}">課表</button>`);
  primary.push(`<button class="btn" data-action="open-coach-reports" data-id="${c.id}">報告</button>`);
  const more=[];
  if(!isArchived){
    more.push(`<button class="btn btn-sub" data-action="coach-edit-client" data-id="${c.id}">編輯</button>`);
    more.push(`<button class="btn btn-sub ${isDefault?'strong':''}" data-action="coach-set-default-client" data-id="${c.id}">${isDefault?'取消預設':'設為預設'}</button>`);
    more.push(`<button class="btn btn-sub" data-action="coach-archive-client" data-id="${c.id}">封存</button>`);
  }else{
    more.push(`<button class="btn btn-sub" data-action="coach-unarchive-client" data-id="${c.id}">取消封存</button>`);
  }
  more.push(`<button class="btn btn-sub danger" data-action="coach-delete-client" data-id="${c.id}">刪除</button>`);
  const moreHtml=`<details class="client-more"><summary>更多操作</summary><div class="client-more-body">${more.join('')}</div></details>`;
  return`<div class="client-card ${isDefault?'default':''} ${isArchived?'archived':''}"><div class="client-card-head"><h3 class="client-card-name">${Utils.escape(c.name||'Unnamed Client')}</h3>${pillsHtml}</div>${metaHtml}${tagsHtml}<div class="client-card-stats"><div class="kv"><div class="k">課表</div><div class="v">${stats.programCount}</div></div><div class="kv"><div class="k">課程</div><div class="v">${stats.sessionCount}</div></div><div class="kv"><div class="k">報告</div><div class="v">${stats.reportCount}</div></div></div>${updatedHtml}${scheduleHtml}${noteHtml}<div class="client-card-actions client-card-actions-primary">${primary.join('')}</div>${moreHtml}</div>`;
};

SC.fillCoachClientForm=function(c){
  const src=c||Clients.createBlank();
  $('#coach-client-name').value=src.name||'';
  $('#coach-client-gender').value=src.gender||'';
  $('#coach-client-age').value=(src.age===''||src.age==null)?'':src.age;
  $('#coach-client-height').value=(src.heightCm===''||src.heightCm==null)?'':src.heightCm;
  $('#coach-client-weight').value=(src.weightKg===''||src.weightKg==null)?'':src.weightKg;
  $('#coach-client-goal').value=src.goal||'';
  $('#coach-client-tags').value=Array.isArray(src.tags)?src.tags.join(', '):'';
  $('#coach-client-schedule').value=src.scheduleNote||'';
  $('#coach-client-note').value=src.note||'';
};

SC.readCoachClientForm=function(){
  const rawTags=Utils.text($('#coach-client-tags').value);
  const tags=rawTags?rawTags.split(/[,，]/).map(t=>t.trim()).filter(Boolean):[];
  return{
    name:Utils.text($('#coach-client-name').value),
    gender:$('#coach-client-gender').value||'',
    age:$('#coach-client-age').value,
    heightCm:$('#coach-client-height').value,
    weightKg:$('#coach-client-weight').value,
    goal:Utils.text($('#coach-client-goal').value),
    tags,
    scheduleNote:Utils.text($('#coach-client-schedule').value),
    note:Utils.text($('#coach-client-note').value)
  };
};

SC.openCoachClientSheet=function(clientId){
  this.coachEditingClientId=clientId||'';
  const existing=clientId?Clients.byId(clientId):null;
  const title=$('#coach-client-sheet-title');
  const sub=$('#coach-client-sheet-sub');
  if(title)title.textContent=existing?'編輯學員':'新增學員';
  if(sub)sub.textContent=existing?(existing.name||'Unnamed Client'):'填寫基本資訊';
  this.fillCoachClientForm(existing);
  const sheet=$('#coach-client-sheet');
  if(sheet){sheet.classList.add('open');sheet.setAttribute('aria-hidden','false')}
  this.coachClientSheetOpen=true;
  setTimeout(()=>{const n=$('#coach-client-name');if(n)n.focus()},20);
};

SC.closeCoachClientSheet=function(){
  const sheet=$('#coach-client-sheet');
  if(sheet){sheet.classList.remove('open');sheet.setAttribute('aria-hidden','true')}
  this.coachClientSheetOpen=false;
  this.coachEditingClientId='';
};

SC.saveCoachClientFromForm=function(){
  const form=this.readCoachClientForm();
  if(!form.name){Toast.show('請輸入學員姓名');return}
  const editingId=this.coachEditingClientId;
  let payload;
  if(editingId){
    const existing=Clients.byId(editingId);
    if(existing){payload={...existing,...form,id:existing.id}}
    else{payload={...Clients.createBlank(),...form}}
  }else{
    payload={...Clients.createBlank(),...form};
  }
  Clients.save(payload);
  this.closeCoachClientSheet();
  this.renderCoachClients();
  Toast.show(editingId?'已更新學員':'已新增學員');
};

// ---- Client Coaching Module v1 · Step 3: Client Program Management UI ----
SC.coachCurrentClientId='';
SC.coachEditingProgramId='';
SC.coachEditingProgram=null;
SC.coachProgramPickerOpen=false;
SC.coachProgramPickerSearch='';

SC.getCoachClientOrThrow=function(clientId){
  if(!CDB.data)CDB.load();
  const c=Clients.byId(clientId);
  if(!c){Toast.show('找不到該學員');return null}
  return c;
};

SC.getCoachProgramOrThrow=function(programId){
  if(!CDB.data)CDB.load();
  const p=CPS.byId(programId);
  if(!p){Toast.show('找不到該課表');return null}
  return p;
};

SC.createBlankCoachProgram=function(clientId){
  const p=CPS.createBlank(clientId);
  p.name='';
  p.note='';
  p.isActive=false;
  p.exercises=[];
  return p;
};

SC.createBlankCoachExercise=function(exerciseKey){
  return{
    _id:Utils.uid('cee'),
    exerciseKey:exerciseKey||'',
    sets:3,
    repMin:8,
    repMax:12,
    rir:2,
    restSec:60,
    notes:''
  };
};

SC.getCoachProgramExerciseLabel=function(exercise){
  if(!exercise)return'—';
  const k=exercise.exerciseKey||resolveKey(exercise.name||'');
  const lb=exLabel(k);
  return lb||k||'—';
};

SC.cloneCoachProgram=function(programId){
  const src=CPS.byId(programId);if(!src)return'';
  const now=Date.now();
  const copy=Utils.copy(src);
  copy.id=Utils.uid('cprog');
  copy.name=(src.name||'Untitled Client Program')+'（複製）';
  copy.isActive=false;
  copy.createdAt=now;
  copy.updatedAt=now;
  const saved=CPS.save(copy);
  return saved.id;
};

SC.setCoachActiveProgram=function(programId){
  if(!CDB.data)CDB.load();
  const list=CDB.data.clientPrograms||[];
  const target=list.find(p=>p.id===programId);
  if(!target)return false;
  const now=Date.now();
  list.forEach(p=>{
    if(p.clientId===target.clientId){
      const was=!!p.isActive;
      const next=(p.id===programId);
      if(was!==next){p.isActive=next;p.updatedAt=now}
    }
  });
  CDB.save();
  return true;
};

SC.renderCoachPrograms=function(){
  if(!CDB.data)CDB.load();
  this.renderCoachProgramsSummary();
  this.renderCoachProgramList();
};

SC.renderCoachProgramsSummary=function(){
  const box=$('#coach-program-summary');if(!box)return;
  const client=this.coachCurrentClientId?Clients.byId(this.coachCurrentClientId):null;
  const programs=this.coachCurrentClientId?CPS.byClient(this.coachCurrentClientId):[];
  const active=programs.find(p=>p.isActive);
  const clientName=client?(client.name||'Unnamed Client'):'未選擇學員';
  const activeName=active?(active.name||'Untitled Client Program'):'尚未設定';
  box.innerHTML=`<div class="coach-program-summary-grid"><div class="coach-program-summary-cell"><div class="k">學員</div><div class="v">${Utils.escape(clientName)}</div></div><div class="coach-program-summary-cell"><div class="k">使用中課表</div><div class="v">${Utils.escape(activeName)}</div></div><div class="coach-program-summary-cell"><div class="k">課表總數</div><div class="v num">${programs.length}</div></div></div>`;
};

SC.renderCoachProgramList=function(){
  const list=$('#coach-program-list');if(!list)return;
  if(!this.coachCurrentClientId){list.innerHTML='<div class="empty">尚未選擇學員。</div>';return}
  const programs=CPS.byClient(this.coachCurrentClientId);
  list.innerHTML=programs.length?programs.map(p=>this.renderCoachProgramCard(p)).join(''):'<div class="empty">尚未建立課表，點右上角「新增課表」開始。</div>';
};

SC.renderCoachProgramCard=function(program){
  const isActive=!!program.isActive;
  const exCount=Array.isArray(program.exercises)?program.exercises.length:0;
  const activePill=isActive?'<span class="coach-program-card-pill">使用中</span>':'';
  const note=program.note?`<div class="coach-program-card-note">${Utils.escape(program.note)}</div>`:'';
  const updated=program.updatedAt?`<div class="coach-program-card-footer">更新：${Utils.escape(Utils.formatDateTime(program.updatedAt))}</div>`:'';
  let startBtn='';
  if(isActive){
    const hasDraft=!!(CWK.session&&CWK.session.clientId===program.clientId&&CWK.session.programId===program.id);
    const label=hasDraft?'繼續訓練':'開始訓練';
    startBtn=`<button class="btn primary" data-action="start-coach-workout" data-client-id="${program.clientId}">${label}</button>`;
  }
  return`<div class="coach-program-card ${isActive?'active':''}"><div class="coach-program-card-head"><h3 class="coach-program-card-name">${Utils.escape(program.name||'Untitled Client Program')}</h3>${activePill}</div><div class="coach-program-card-meta"><span>${exCount} 個動作</span></div>${note}${updated}<div class="coach-program-card-actions">${startBtn}<button class="btn" data-action="coach-edit-program" data-id="${program.id}">編輯</button><button class="btn ${isActive?'strong':''}" data-action="coach-set-active-program" data-id="${program.id}">${isActive?'使用中':'設為使用中'}</button><button class="btn" data-action="coach-copy-program" data-id="${program.id}">複製</button><button class="btn danger" data-action="coach-delete-program" data-id="${program.id}">刪除</button></div><div class="coach-program-card-export-row"><button class="btn" data-action="coach-open-program-export" data-id="${program.id}">輸出課表</button></div></div>`;
};

SC.openCoachProgramEditor=function(programId){
  if(!CDB.data)CDB.load();
  if(programId){
    const existing=CPS.byId(programId);
    if(!existing){Toast.show('找不到該課表');return}
    this.coachEditingProgramId=existing.id;
    this.coachEditingProgram=Utils.copy(existing);
    if(!Array.isArray(this.coachEditingProgram.exercises))this.coachEditingProgram.exercises=[];
    this.coachEditingProgram.exercises.forEach(ex=>{if(!ex._id)ex._id=Utils.uid('cee')});
  }else{
    if(!this.coachCurrentClientId){Toast.show('請先選擇學員');return}
    this.coachEditingProgramId='';
    this.coachEditingProgram=this.createBlankCoachProgram(this.coachCurrentClientId);
  }
  const title=$('#coach-program-editor-title');
  const sub=$('#coach-program-editor-sub');
  const client=Clients.byId(this.coachEditingProgram.clientId)||null;
  if(title)title.textContent=programId?'編輯課表':'新增課表';
  if(sub)sub.textContent=client?(client.name||'Unnamed Client'):'Client Program';
  const nameInput=$('#coach-program-editor-name');if(nameInput)nameInput.value=this.coachEditingProgram.name||'';
  const noteInput=$('#coach-program-editor-note');if(noteInput)noteInput.value=this.coachEditingProgram.note||'';
  const copyBtn=$('#coach-program-editor-copy');
  if(copyBtn){
    if(programId){copyBtn.classList.remove('hidden');copyBtn.setAttribute('data-id',programId)}
    else{copyBtn.classList.add('hidden');copyBtn.removeAttribute('data-id')}
  }
  this.renderCoachProgramExerciseRows();
  Nav.go('screen-coach-program-editor');
};

SC.renderCoachProgramEditor=function(){
  if(!this.coachEditingProgram){Nav.go('screen-coach-programs');return}
};

SC.renderCoachProgramExerciseRows=function(){
  const list=$('#coach-program-editor-exercise-list');if(!list)return;
  if(!this.coachEditingProgram){list.innerHTML='';return}
  const rows=this.coachEditingProgram.exercises;
  rows.forEach(ex=>{if(!ex._id)ex._id=Utils.uid('cee')});
  if(!rows.length){list.innerHTML='<div class="coach-program-editor-empty">尚未加入任何動作，點「新增動作」開始。</div>';return}
  list.innerHTML=rows.map((ex,i)=>{
    const label=this.getCoachProgramExerciseLabel(ex);
    return`<div class="coach-program-editor-card" data-coach-ex="${ex._id}"><div class="coach-program-editor-top"><div class="coach-program-editor-name">${Utils.escape(label)}</div><div class="coach-program-editor-actions"><button class="order-btn" data-action="coach-editor-move-exercise-up" data-id="${ex._id}" ${i===0?'disabled':''}>↑</button><button class="order-btn" data-action="coach-editor-move-exercise-down" data-id="${ex._id}" ${i===rows.length-1?'disabled':''}>↓</button><button class="icon-btn" data-action="coach-editor-remove-exercise" data-id="${ex._id}">×</button></div></div><div class="fine-grid"><div class="field"><label>組數</label><input type="number" inputmode="numeric" min="1" max="20" value="${ex.sets}" data-action="coach-editor-field" data-id="${ex._id}" data-field="sets"></div><div class="field"><label>Rep Min</label><input type="number" inputmode="numeric" min="1" max="60" value="${ex.repMin}" data-action="coach-editor-field" data-id="${ex._id}" data-field="repMin"></div><div class="field"><label>Rep Max</label><input type="number" inputmode="numeric" min="1" max="60" value="${ex.repMax}" data-action="coach-editor-field" data-id="${ex._id}" data-field="repMax"></div></div><div class="inline-grid"><div class="field"><label>RIR</label><input type="number" inputmode="numeric" min="0" max="5" value="${ex.rir}" data-action="coach-editor-field" data-id="${ex._id}" data-field="rir"></div><div class="field"><label>休息（秒）</label><input type="number" inputmode="numeric" min="0" max="600" value="${ex.restSec}" data-action="coach-editor-field" data-id="${ex._id}" data-field="restSec"></div></div><div class="field"><label>備註</label><textarea class="notes" data-action="coach-editor-field" data-id="${ex._id}" data-field="notes">${Utils.escape(ex.notes||'')}</textarea></div></div>`;
  }).join('');
};

SC.handleCoachProgramEditorField=function(input){
  if(!this.coachEditingProgram)return;
  const id=input.dataset.id;const field=input.dataset.field;
  const ex=this.coachEditingProgram.exercises.find(x=>x._id===id);
  if(!ex)return;
  if(['sets','repMin','repMax','rir','restSec'].includes(field)){
    const n=parseInt(input.value,10);
    if(Number.isFinite(n)){
      ex[field]=n;
      if(field==='repMin'&&ex.repMax<ex.repMin)ex.repMax=ex.repMin;
      if(field==='repMax'&&ex.repMax<ex.repMin)ex.repMin=ex.repMax;
    }
  }else{
    ex[field]=input.value;
  }
};

SC.readCoachProgramEditorForm=function(){
  if(!this.coachEditingProgram)return null;
  const nameInput=$('#coach-program-editor-name');
  const noteInput=$('#coach-program-editor-note');
  const name=Utils.text(nameInput?nameInput.value:'');
  const note=Utils.text(noteInput?noteInput.value:'');
  const exercises=this.coachEditingProgram.exercises.map(ex=>({
    exerciseKey:ex.exerciseKey||'',
    sets:Utils.clamp(parseInt(ex.sets,10)||3,1,20),
    repMin:Utils.clamp(parseInt(ex.repMin,10)||8,1,60),
    repMax:Utils.clamp(parseInt(ex.repMax,10)||12,1,60),
    rir:Utils.clamp(Number.isFinite(parseInt(ex.rir,10))?parseInt(ex.rir,10):2,0,5),
    restSec:Utils.clamp(parseInt(ex.restSec,10)||60,0,600),
    notes:Utils.text(ex.notes)
  })).filter(ex=>!!ex.exerciseKey);
  exercises.forEach(ex=>{if(ex.repMax<ex.repMin)ex.repMax=ex.repMin});
  return{
    id:this.coachEditingProgram.id,
    clientId:this.coachEditingProgram.clientId,
    name,note,
    category:this.coachEditingProgram.category||'Client',
    isActive:!!this.coachEditingProgram.isActive,
    exercises,
    createdAt:this.coachEditingProgram.createdAt,
    updatedAt:this.coachEditingProgram.updatedAt
  };
};

SC.saveCoachProgramFromEditor=function(){
  const form=this.readCoachProgramEditorForm();
  if(!form){Toast.show('找不到編輯資料');return}
  if(!form.name){Toast.show('請輸入課表名稱');return}
  const saved=CPS.save(form);
  this.coachEditingProgramId=saved.id;
  this.coachEditingProgram=Utils.copy(saved);
  this.coachEditingProgram.exercises.forEach(ex=>{if(!ex._id)ex._id=Utils.uid('cee')});
  this.renderCoachPrograms();
  Nav.go('screen-coach-programs');
  Toast.show('已儲存課表');
};

SC.moveCoachProgramExercise=function(id,dir){
  if(!this.coachEditingProgram)return false;
  const list=this.coachEditingProgram.exercises;
  const i=list.findIndex(e=>e._id===id);
  if(i<0)return false;
  const ni=Utils.clamp(i+dir,0,list.length-1);
  if(ni===i)return false;
  const[item]=list.splice(i,1);
  list.splice(ni,0,item);
  this.renderCoachProgramExerciseRows();
  return true;
};

SC.removeCoachProgramExercise=function(id){
  if(!this.coachEditingProgram)return false;
  const before=this.coachEditingProgram.exercises.length;
  this.coachEditingProgram.exercises=this.coachEditingProgram.exercises.filter(e=>e._id!==id);
  const changed=this.coachEditingProgram.exercises.length<before;
  if(changed)this.renderCoachProgramExerciseRows();
  return changed;
};

SC.openCoachProgramPicker=function(){
  if(!this.coachEditingProgram){Toast.show('請先開啟課表編輯');return}
  this.coachProgramPickerOpen=true;
  this.coachProgramPickerSearch='';
  const search=$('#coach-program-picker-search');if(search)search.value='';
  this.renderCoachProgramPicker();
  const sheet=$('#coach-exercise-picker');
  if(sheet){sheet.classList.add('open');sheet.setAttribute('aria-hidden','false')}
  setTimeout(()=>{const s=$('#coach-program-picker-search');if(s)s.focus()},20);
};

SC.closeCoachProgramPicker=function(){
  this.coachProgramPickerOpen=false;
  const sheet=$('#coach-exercise-picker');
  if(sheet){sheet.classList.remove('open');sheet.setAttribute('aria-hidden','true')}
};

SC.filterCoachPicker=function(kw){
  this.coachProgramPickerSearch=Utils.text(kw);
  this.renderCoachProgramPicker();
};

SC.renderCoachProgramPicker=function(){
  const list=$('#coach-program-picker-list');if(!list)return;
  const q=(this.coachProgramPickerSearch||'').toLowerCase();
  const items=EXERCISE_REGISTRY.filter(x=>exMatchesQuery(x,q));
  list.innerHTML=items.length?items.map(i=>`<button class="coach-picker-item" data-action="coach-picker-add-exercise" data-exercise-key="${i.key}"><strong>${Utils.escape(i.labelEn)}｜${Utils.escape(i.labelZh)}</strong><small>${Utils.escape(i.category)} · ${Utils.escape(i.equipment)}</small></button>`).join(''):'<div class="coach-picker-empty">找不到動作</div>';
};

SC.pickerAddExercise=function(exerciseKey){
  if(!this.coachEditingProgram)return;
  const key=exerciseKey||'';if(!key)return;
  const ex=this.createBlankCoachExercise(key);
  this.coachEditingProgram.exercises.push(ex);
  this.closeCoachProgramPicker();
  this.renderCoachProgramExerciseRows();
};

// ---- Coaching Step 4 · Client Workout Session ----
SC.coachWorkoutTimer=null;
SC.coachWorkoutCollapsed=null;

// ---- Coaching Step 4.5 · In-Session Swap / Add ----
SC.coachWorkoutPickerOpen=false;
SC.coachWorkoutPickerMode='';
SC.coachWorkoutPickerSearch='';
SC.coachWorkoutSwapExerciseIndex=-1;

SC.getCoachActiveProgram=function(clientId){
  if(!clientId)return null;
  const list=CPS.byClient(clientId);
  return list.find(p=>p.isActive)||null;
};

// ---- Coaching Step 5A · Client Program Export UI ----
SC.coachExportSheetOpen=false;
SC.coachExportClientId='';
SC.coachExportProgramId='';

SC.sanitizeCoachProgramExportFilename=function(name){
  const base=String(name||'client-program').trim().replace(/[\\/:*?"<>|]+/g,'_').replace(/\s+/g,'_');
  return base.slice(0,80)||'client-program';
};

SC.formatCoachProgramExerciseLine=function(ex,i){
  const label=exLabel(ex.exerciseKey||'')||(ex.exerciseKey||'—');
  const sets=Number(ex.sets)||0;
  const repMin=Number(ex.repMin)||0;
  const repMax=Number(ex.repMax)||0;
  const repRange=repMin===repMax?`${repMin}`:`${repMin}-${repMax}`;
  const rir=Number.isFinite(Number(ex.rir))?Number(ex.rir):2;
  const rest=Number(ex.restSec)||0;
  const restStr=rest>=60?`${Math.round(rest/60*10)/10} 分`:`${rest} 秒`;
  const idx=(typeof i==='number')?`${i+1}. `:'';
  let line=`${idx}${label} — ${sets}×${repRange} reps · RIR ${rir} · 休息 ${restStr}`;
  if(ex.notes&&String(ex.notes).trim())line+=`\n   備註：${String(ex.notes).trim()}`;
  return line;
};

SC.getCoachProgramExportPayload=function(programId){
  if(!CDB.data)CDB.load();
  const program=CPS.byId(programId);if(!program)return null;
  const client=Clients.byId(program.clientId)||null;
  return{program,client};
};

SC.buildCoachProgramTextExport=function(payload){
  const {program,client}=payload;
  const lines=[];
  lines.push(`課表：${program.name||'Untitled Client Program'}`);
  lines.push(`學員：${client?(client.name||'Unnamed Client'):'—'}`);
  if(program.isActive)lines.push('狀態：使用中');
  lines.push(`動作數：${(program.exercises||[]).length}`);
  if(program.note&&String(program.note).trim()){
    lines.push('');
    lines.push(`課表簡介：${String(program.note).trim()}`);
  }
  lines.push('');
  lines.push('— 動作 —');
  (program.exercises||[]).forEach((ex,i)=>{
    lines.push(this.formatCoachProgramExerciseLine(ex,i));
  });
  if(program.updatedAt){
    lines.push('');
    lines.push(`更新時間：${Utils.formatDateTime(program.updatedAt)}`);
  }
  return lines.join('\n');
};

SC.buildCoachProgramAiPrompt=function(payload){
  const {program,client}=payload;
  const head=[];
  head.push('你是一位 ACSM 取向的肌力與體能教練。請依照下列學員資料與課表，提供：');
  head.push('1) 一段教練給學員的中文摘要說明（重點與本日節奏）');
  head.push('2) 每個動作的執行要點與常見錯誤提醒');
  head.push('3) 兩個可選的替代動作建議（若器材不足）');
  head.push('請用條列、實用、不過度教學的口吻。');
  head.push('');
  head.push('=== 學員 ===');
  if(client){
    head.push(`姓名：${client.name||'Unnamed Client'}`);
    if(client.gender)head.push(`性別：${client.gender}`);
    if(Number.isFinite(Number(client.age)))head.push(`年齡：${client.age}`);
    if(Number.isFinite(Number(client.height)))head.push(`身高：${client.height} cm`);
    if(Number.isFinite(Number(client.weight)))head.push(`體重：${client.weight} kg`);
    if(client.goal)head.push(`目標：${client.goal}`);
    if(Array.isArray(client.tags)&&client.tags.length)head.push(`標籤：${client.tags.join(', ')}`);
    if(client.note)head.push(`備註：${client.note}`);
  }else{
    head.push('（未指定學員資料）');
  }
  head.push('');
  head.push('=== 課表 ===');
  head.push(this.buildCoachProgramTextExport(payload));
  return head.join('\n');
};

SC.buildCoachProgramMarkdown=function(payload){
  const {program,client}=payload;
  const md=[];
  md.push(`# ${program.name||'Untitled Client Program'}`);
  md.push('');
  md.push(`- 學員：${client?(client.name||'Unnamed Client'):'—'}`);
  md.push(`- 狀態：${program.isActive?'使用中':'未啟用'}`);
  md.push(`- 動作數：${(program.exercises||[]).length}`);
  if(program.updatedAt)md.push(`- 更新時間：${Utils.formatDateTime(program.updatedAt)}`);
  if(program.note&&String(program.note).trim()){
    md.push('');
    md.push('## 課表簡介');
    md.push(String(program.note).trim());
  }
  md.push('');
  md.push('## 動作');
  md.push('');
  md.push('| # | 動作 | 組×Reps | RIR | 休息 | 備註 |');
  md.push('| - | --- | --- | --- | --- | --- |');
  (program.exercises||[]).forEach((ex,i)=>{
    const label=exLabel(ex.exerciseKey||'')||(ex.exerciseKey||'—');
    const repRange=(Number(ex.repMin)===Number(ex.repMax))?`${ex.repMin}`:`${ex.repMin}-${ex.repMax}`;
    const rest=Number(ex.restSec)||0;
    const restStr=rest>=60?`${Math.round(rest/60*10)/10}m`:`${rest}s`;
    const note=String(ex.notes||'').replace(/\|/g,'\\|').replace(/\n/g,' ');
    md.push(`| ${i+1} | ${label} | ${ex.sets}×${repRange} | ${ex.rir} | ${restStr} | ${note} |`);
  });
  return md.join('\n');
};

SC.buildCoachProgramJson=function(payload){
  const {program,client}=payload;
  const out={
    type:'coach.program.export',
    schema:'1.0',
    exportedAt:new Date().toISOString(),
    client:client?{
      id:client.id,name:client.name||'',gender:client.gender||'',
      age:client.age??null,height:client.height??null,weight:client.weight??null,
      goal:client.goal||'',tags:Array.isArray(client.tags)?client.tags.slice():[],note:client.note||''
    }:null,
    program:{
      id:program.id,clientId:program.clientId,name:program.name||'',
      note:program.note||'',category:program.category||'Client',
      isActive:!!program.isActive,
      createdAt:program.createdAt||null,updatedAt:program.updatedAt||null,
      exercises:(program.exercises||[]).map(ex=>({
        exerciseKey:ex.exerciseKey||'',
        label:exLabel(ex.exerciseKey||'')||'',
        sets:Number(ex.sets)||0,
        repMin:Number(ex.repMin)||0,
        repMax:Number(ex.repMax)||0,
        rir:Number(ex.rir)||0,
        restSec:Number(ex.restSec)||0,
        notes:ex.notes||''
      }))
    }
  };
  return JSON.stringify(out,null,2);
};

SC.openCoachProgramExport=function(programId){
  const payload=this.getCoachProgramExportPayload(programId);
  if(!payload){Toast.show('找不到該課表');return}
  this.coachExportProgramId=payload.program.id;
  this.coachExportClientId=payload.program.clientId;
  this.coachExportSheetOpen=true;
  this.renderCoachProgramExportSheet();
  const sheet=$('#coach-program-export-sheet');
  if(sheet){sheet.classList.add('open');sheet.setAttribute('aria-hidden','false')}
};

SC.openCoachActiveProgramExport=function(){
  if(!this.coachCurrentClientId){Toast.show('請先選擇學員');return}
  const active=this.getCoachActiveProgram(this.coachCurrentClientId);
  if(!active){Toast.show('此學員尚未設定使用中課表');return}
  this.openCoachProgramExport(active.id);
};

SC.closeCoachProgramExport=function(){
  this.coachExportSheetOpen=false;
  const sheet=$('#coach-program-export-sheet');
  if(sheet){sheet.classList.remove('open');sheet.setAttribute('aria-hidden','true')}
};

SC.renderCoachProgramExportSheet=function(){
  if(!this.coachExportProgramId)return;
  const payload=this.getCoachProgramExportPayload(this.coachExportProgramId);
  if(!payload)return;
  const {program,client}=payload;
  const title=$('#coach-program-export-title');
  const sub=$('#coach-program-export-sub');
  const meta=$('#coach-program-export-meta');
  const preview=$('#coach-program-export-preview');
  if(title)title.textContent='輸出課表';
  if(sub)sub.textContent=program.name||'Untitled Client Program';
  if(meta){
    const exCount=(program.exercises||[]).length;
    const updated=program.updatedAt?Utils.formatDateTime(program.updatedAt):'—';
    meta.innerHTML=`<div class="row"><div class="k">學員</div><div class="v">${Utils.escape(client?(client.name||'Unnamed Client'):'—')}</div></div><div class="row"><div class="k">課表</div><div class="v">${Utils.escape(program.name||'Untitled Client Program')}</div></div><div class="row"><div class="k">狀態</div><div class="v">${program.isActive?'使用中':'未啟用'}</div></div><div class="row"><div class="k">動作數</div><div class="v num">${exCount}</div></div><div class="row"><div class="k">更新時間</div><div class="v">${Utils.escape(updated)}</div></div>`;
  }
  if(preview){
    const text=this.buildCoachProgramTextExport(payload);
    preview.textContent=text;
  }
};

SC.copyCoachProgramText=function(){
  if(!this.coachExportProgramId){Toast.show('尚未選擇課表');return}
  const payload=this.getCoachProgramExportPayload(this.coachExportProgramId);
  if(!payload)return;
  Utils.copyText(this.buildCoachProgramTextExport(payload));
};

SC.copyCoachProgramAiPrompt=function(){
  if(!this.coachExportProgramId){Toast.show('尚未選擇課表');return}
  const payload=this.getCoachProgramExportPayload(this.coachExportProgramId);
  if(!payload)return;
  Utils.copyText(this.buildCoachProgramAiPrompt(payload));
};

SC.exportCoachProgramMarkdown=function(){
  if(!this.coachExportProgramId){Toast.show('尚未選擇課表');return}
  const payload=this.getCoachProgramExportPayload(this.coachExportProgramId);
  if(!payload)return;
  const fn=`coach-program-${this.sanitizeCoachProgramExportFilename(payload.program.name)}-${Utils.today()}.md`;
  Utils.download(fn,this.buildCoachProgramMarkdown(payload),'text/markdown');
  Toast.show('已下載 Markdown');
};

SC.exportCoachProgramJson=function(){
  if(!this.coachExportProgramId){Toast.show('尚未選擇課表');return}
  const payload=this.getCoachProgramExportPayload(this.coachExportProgramId);
  if(!payload)return;
  const fn=`coach-program-${this.sanitizeCoachProgramExportFilename(payload.program.name)}-${Utils.today()}.json`;
  Utils.download(fn,this.buildCoachProgramJson(payload),'application/json');
  Toast.show('已下載 JSON');
};

SC.getCoachSessionOrThrow=function(sessionId){
  const s=CWK.session;
  if(!s)return null;
  if(sessionId&&s.id!==sessionId)return null;
  return s;
};

SC.buildCoachSessionFromProgram=function(clientId,program){
  if(!clientId||!program)return null;
  return CWK.createBlankSession(clientId,{programId:program.id});
};

SC.countCoachWorkoutSets=function(session){
  if(!session||!Array.isArray(session.exercises))return 0;
  return session.exercises.reduce((n,ex)=>n+(Array.isArray(ex.sets)?ex.sets.length:0),0);
};

SC.countCoachCompletedSets=function(session){
  if(!session||!Array.isArray(session.exercises))return 0;
  let n=0;
  session.exercises.forEach(ex=>{
    if(Array.isArray(ex.sets))ex.sets.forEach(s=>{if(s&&s.done)n++});
  });
  return n;
};

SC.updateCoachSetValue=function(exerciseIndex,setIndex,field,value){
  if(!CWK.session)return false;
  const ex=CWK.session.exercises&&CWK.session.exercises[exerciseIndex];
  if(!ex||!Array.isArray(ex.sets)||!ex.sets[setIndex])return false;
  if(field!=='weight'&&field!=='reps')return false;
  ex.sets[setIndex][field]=value;
  CWK._touch();
  this.updateCoachWorkoutProgress();
  return true;
};

SC.toggleCoachSetDone=function(exerciseIndex,setIndex){
  if(!CWK.session)return false;
  const ex=CWK.session.exercises&&CWK.session.exercises[exerciseIndex];
  if(!ex||!Array.isArray(ex.sets)||!ex.sets[setIndex])return false;
  ex.sets[setIndex].done=!ex.sets[setIndex].done;
  CWK._touch();
  this.renderCoachWorkoutExercises();
  this.updateCoachWorkoutProgress();
  return true;
};

SC.populateCoachWorkoutFromDraftOrProgram=function(){
  if(CWK.session)return true;
  const clientId=this.coachCurrentClientId;
  if(!clientId){Nav.go('screen-coach-programs');return false}
  const active=this.getCoachActiveProgram(clientId);
  if(!active){Toast.show('此學員尚未設定使用中課表');Nav.go('screen-coach-programs');return false}
  CWK.start(clientId,{programId:active.id});
  return !!CWK.session;
};

SC.startCoachWorkoutTimer=function(){
  this.stopCoachWorkoutTimer();
  this.refreshCoachWorkoutElapsed();
  this.coachWorkoutTimer=setInterval(()=>this.refreshCoachWorkoutElapsed(),1000);
};

SC.stopCoachWorkoutTimer=function(){
  if(this.coachWorkoutTimer){clearInterval(this.coachWorkoutTimer);this.coachWorkoutTimer=null}
};

SC.refreshCoachWorkoutElapsed=function(){
  const el=$('#coach-workout-elapsed');if(!el)return;
  const s=CWK.session;
  if(!s||!s.startedAt){el.textContent='00:00';return}
  const sec=Math.max(0,Math.floor((Date.now()-s.startedAt)/1000));
  el.textContent=Utils.formatDuration(sec);
};

SC.updateCoachWorkoutProgress=function(){
  const s=CWK.session;
  const total=this.countCoachWorkoutSets(s);
  const done=this.countCoachCompletedSets(s);
  const pct=total>0?Math.round(done/total*100):0;
  const fill=$('#coach-workout-progress-fill');if(fill)fill.style.width=pct+'%';
  const txt=$('#coach-workout-progress-text');if(txt)txt.textContent=`${done} / ${total} 組完成`;
};

SC.renderCoachWorkout=function(){
  if(!this.populateCoachWorkoutFromDraftOrProgram())return;
  this.renderCoachWorkoutSummary();
  this.renderCoachWorkoutExercises();
  this.updateCoachWorkoutProgress();
  this.startCoachWorkoutTimer();
};

SC.renderCoachWorkoutSummary=function(){
  const s=CWK.session;if(!s)return;
  const client=Clients.byId(s.clientId);
  const clientName=client?(client.name||'Unnamed Client'):(s.clientName||'—');
  const programName=s.programName||'—';
  const titleEl=$('#coach-workout-title');if(titleEl)titleEl.textContent=clientName;
  const subEl=$('#coach-workout-sub');if(subEl)subEl.textContent=programName;
  const cEl=$('#coach-workout-client-name');if(cEl)cEl.textContent=clientName;
  const pEl=$('#coach-workout-program-name');if(pEl)pEl.textContent=programName;
};

SC.renderCoachWorkoutExercises=function(){
  const list=$('#coach-workout-exercise-list');if(!list)return;
  const s=CWK.session;
  if(!s||!Array.isArray(s.exercises)||!s.exercises.length){
    list.innerHTML='<div class="coach-workout-empty">此課表尚未安排動作。</div>';
    return;
  }
  if(!this.coachWorkoutCollapsed)this.coachWorkoutCollapsed=new Set();
  list.innerHTML=s.exercises.map((ex,i)=>this.renderCoachWorkoutExerciseCard(ex,i)).join('');
};

SC.renderCoachWorkoutExerciseCard=function(exercise,index){
  const name=exercise.name||exLabel(exercise.exerciseKey)||'（動作）';
  const repMin=exercise.repMin;const repMax=exercise.repMax;
  const repRange=(repMin||repMax)?`${repMin||'-'} ~ ${repMax||'-'}`:'—';
  const rir=(exercise.rir!==undefined&&exercise.rir!==null&&exercise.rir!=='')?String(exercise.rir):'—';
  const rest=exercise.restSec?`${exercise.restSec}s`:'—';
  const collapsed=this.coachWorkoutCollapsed&&this.coachWorkoutCollapsed.has(exercise.id);
  const sets=Array.isArray(exercise.sets)?exercise.sets:[];
  const doneCount=sets.filter(s=>s&&s.done).length;
  const metaText=`${doneCount}/${sets.length} 組完成`;
  const noteText=exercise.note||exercise.notes||'';
  const noteHtml=noteText?`<div class="coach-workout-note">${Utils.escape(noteText)}</div>`:'';
  const setsHtml=sets.map((st,si)=>this.renderCoachWorkoutSetRow(st,index,si)).join('');
  const addedPill=exercise.addedInSession?`<span class="coach-workout-session-pill">本次加入</span>`:'';
  const removeBtn=exercise.addedInSession?`<button class="btn coach-workout-tool-remove" data-action="coach-workout-remove-added-exercise" data-exercise-index="${index}">移除此動作</button>`:'';
  return`<div class="coach-workout-exercise ${collapsed?'collapsed':''}" data-coach-ex="${exercise.id}">`+
    `<button class="coach-workout-exercise-head" data-action="coach-toggle-exercise-collapse" data-id="${exercise.id}">`+
      `<div class="coach-workout-exercise-title">`+
        `<h3 class="coach-workout-exercise-name">${Utils.escape(name)}${addedPill}</h3>`+
        `<span class="coach-workout-exercise-meta">${Utils.escape(metaText)}</span>`+
      `</div>`+
      `<span class="coach-workout-exercise-chevron">▾</span>`+
    `</button>`+
    `<div class="coach-workout-exercise-body">`+
      `<div class="coach-workout-targets">`+
        `<div class="coach-workout-target"><div class="k">Reps</div><div class="v">${Utils.escape(repRange)}</div></div>`+
        `<div class="coach-workout-target"><div class="k">RIR</div><div class="v">${Utils.escape(rir)}</div></div>`+
        `<div class="coach-workout-target"><div class="k">Rest</div><div class="v">${Utils.escape(rest)}</div></div>`+
      `</div>`+
      noteHtml+
      `<div class="coach-set-list">${setsHtml}</div>`+
      `<div class="coach-workout-exercise-tools">`+
        `<button class="btn coach-workout-tool-swap" data-action="coach-workout-open-swap-picker" data-exercise-index="${index}">更換動作</button>`+
        removeBtn+
      `</div>`+
    `</div>`+
  `</div>`;
};

SC.renderCoachWorkoutSetRow=function(set,exerciseIndex,setIndex){
  const done=!!(set&&set.done);
  const weight=(set&&set.weight!=null)?set.weight:'';
  const reps=(set&&set.reps!=null)?set.reps:'';
  return`<div class="coach-set-row ${done?'done':''}">`+
    `<div class="coach-set-index">${setIndex+1}</div>`+
    `<div class="field"><label>重量</label><input type="number" inputmode="decimal" step="0.5" value="${Utils.escape(String(weight))}" data-action="coach-set-weight" data-exercise-index="${exerciseIndex}" data-set-index="${setIndex}"></div>`+
    `<div class="field"><label>次數</label><input type="number" inputmode="numeric" min="0" max="100" value="${Utils.escape(String(reps))}" data-action="coach-set-reps" data-exercise-index="${exerciseIndex}" data-set-index="${setIndex}"></div>`+
    `<button class="coach-set-done-mark" data-action="coach-toggle-set-done" data-exercise-index="${exerciseIndex}" data-set-index="${setIndex}" aria-label="切換完成">${done?'✓':'○'}</button>`+
  `</div>`;
};

SC.leaveCoachWorkout=function(){
  this.stopCoachWorkoutTimer();
  Nav.go('screen-coach-programs');
};

// ---- Client Coaching Module v1 · Final Patch · Coach Finish Sync-Back ----
SC.coachFinishSyncSheetOpen=false;

SC.getCoachSessionStructureRow=function(ex){
  if(!ex)return null;
  const setsLen=Array.isArray(ex.sets)?ex.sets.length:0;
  return{
    exerciseKey:String(ex.exerciseKey||''),
    sets:setsLen,
    repMin:parseInt(ex.repMin,10)||0,
    repMax:parseInt(ex.repMax,10)||0,
    rir:(ex.rir==null||ex.rir==='')?2:(parseInt(ex.rir,10)||0),
    restSec:parseInt(ex.restSec,10)||0,
    notes:String(ex.notes||'')
  };
};

SC.getCoachProgramStructureRow=function(ex){
  if(!ex)return null;
  return{
    exerciseKey:String(ex.exerciseKey||''),
    sets:parseInt(ex.sets,10)||0,
    repMin:parseInt(ex.repMin,10)||0,
    repMax:parseInt(ex.repMax,10)||0,
    rir:(ex.rir==null||ex.rir==='')?2:(parseInt(ex.rir,10)||0),
    restSec:parseInt(ex.restSec,10)||0,
    notes:String(ex.notes||'')
  };
};

SC.hasCoachWorkoutStructureChanges=function(session,program){
  if(!session||!Array.isArray(session.exercises))return false;
  if(!program||!Array.isArray(program.exercises))return true;
  const sessionRows=session.exercises.filter(e=>e&&e.exerciseKey).map(e=>this.getCoachSessionStructureRow(e));
  const programRows=program.exercises.filter(e=>e&&e.exerciseKey).map(e=>this.getCoachProgramStructureRow(e));
  if(sessionRows.length!==programRows.length)return true;
  for(let i=0;i<sessionRows.length;i++){
    const a=sessionRows[i],b=programRows[i];
    if(a.exerciseKey!==b.exerciseKey)return true;
    if(a.sets!==b.sets)return true;
    if(a.repMin!==b.repMin)return true;
    if(a.repMax!==b.repMax)return true;
    if(a.rir!==b.rir)return true;
    if(a.restSec!==b.restSec)return true;
    if(a.notes!==b.notes)return true;
  }
  return false;
};

SC.buildCoachProgramFromSessionStructure=function(session,program){
  if(!session||!program)return null;
  const next=Object.assign({},program);
  const srcEx=Array.isArray(session.exercises)?session.exercises:[];
  next.exercises=srcEx.filter(e=>e&&e.exerciseKey).map(e=>({
    exerciseKey:String(e.exerciseKey||''),
    sets:Array.isArray(e.sets)?e.sets.length:3,
    repMin:parseInt(e.repMin,10)||8,
    repMax:parseInt(e.repMax,10)||12,
    rir:(e.rir==null||e.rir==='')?2:(parseInt(e.rir,10)||0),
    restSec:parseInt(e.restSec,10)||60,
    notes:String(e.notes||'')
  }));
  return next;
};

SC.describeCoachFinishSyncDiff=function(session,program){
  if(!session)return'';
  const sessionRows=Array.isArray(session.exercises)?session.exercises.filter(e=>e&&e.exerciseKey):[];
  const programRows=(program&&Array.isArray(program.exercises))?program.exercises.filter(e=>e&&e.exerciseKey):[];
  const sessionKeys=sessionRows.map(e=>String(e.exerciseKey||''));
  const programKeys=programRows.map(e=>String(e.exerciseKey||''));
  const added=sessionKeys.filter(k=>!programKeys.includes(k));
  const removed=programKeys.filter(k=>!sessionKeys.includes(k));
  const lines=[];
  lines.push(`本次動作 ${sessionRows.length} · 原課表 ${programRows.length}`);
  if(added.length)lines.push(`新增：${added.map(k=>exLabel(k)||k).join('、')}`);
  if(removed.length)lines.push(`移除：${removed.map(k=>exLabel(k)||k).join('、')}`);
  if(!added.length&&!removed.length)lines.push('動作順序或組數／參數有變動');
  return lines.join('\n');
};

SC.renderCoachFinishSyncSheet=function(){
  const s=CWK.session;
  const program=s?this.getCoachActiveProgram(s.clientId):null;
  const desc=$('#coach-finish-sync-desc');
  if(desc){
    if(program){
      desc.textContent='本次訓練的動作、組數或參數與使用中課表不一致。要只儲存本次紀錄，還是同步回原課表？';
    }else{
      desc.textContent='找不到使用中課表，將僅儲存本次紀錄。';
    }
  }
  const diff=$('#coach-finish-sync-diff');
  if(diff){
    const txt=program?SC.describeCoachFinishSyncDiff(s,program):'';
    diff.textContent=txt;
    diff.classList.toggle('hidden',!txt);
  }
  const syncBtn=document.querySelector('[data-action="coach-finish-sync-program"]');
  if(syncBtn)syncBtn.disabled=!program;
};

SC.openCoachFinishSyncSheet=function(){
  const sheet=$('#coach-finish-sync-sheet');if(!sheet)return;
  this.coachFinishSyncSheetOpen=true;
  this.renderCoachFinishSyncSheet();
  sheet.classList.add('open');
  sheet.setAttribute('aria-hidden','false');
};

SC.closeCoachFinishSyncSheet=function(){
  const sheet=$('#coach-finish-sync-sheet');if(!sheet)return;
  this.coachFinishSyncSheetOpen=false;
  sheet.classList.remove('open');
  sheet.setAttribute('aria-hidden','true');
};

SC.finishCoachWorkoutSaveOnly=function(){
  const s=CWK.session;if(!s)return;
  s.status='complete';
  s.finishedAt=CWK._now();
  CWK.finish();
  this.stopCoachWorkoutTimer();
  this.closeCoachFinishSyncSheet();
  this.renderCoachPrograms();
  Nav.go('screen-coach-programs');
  Toast.show('已完成訓練');
};

SC.finishCoachWorkoutAndSyncProgram=function(){
  const s=CWK.session;if(!s){this.closeCoachFinishSyncSheet();return}
  const clientId=s.clientId;
  const programId=s.programId;
  const activeProgram=this.getCoachActiveProgram(clientId);
  if(!activeProgram||activeProgram.id!==programId){
    this.finishCoachWorkoutSaveOnly();
    Toast.show('使用中課表已變更，僅儲存本次紀錄');
    return;
  }
  const updated=this.buildCoachProgramFromSessionStructure(s,activeProgram);
  s.status='complete';
  s.finishedAt=CWK._now();
  CWK.finish();
  this.stopCoachWorkoutTimer();
  try{CPS.save(updated)}catch(err){console.error('coach program sync error',err)}
  this.closeCoachFinishSyncSheet();
  this.renderCoachPrograms();
  Nav.go('screen-coach-programs');
  Toast.show('已完成訓練並同步課表');
};

SC.finishCoachWorkout=function(){
  const s=CWK.session;if(!s){Toast.show('目前沒有進行中的訓練');return}
  const doneSets=this.countCoachCompletedSets(s);
  if(doneSets===0&&!confirm('目前還沒有完成任何組，仍要直接結束訓練嗎？'))return;
  const program=this.getCoachActiveProgram(s.clientId);
  const sameProgram=program&&program.id===s.programId;
  if(sameProgram&&this.hasCoachWorkoutStructureChanges(s,program)){
    this.openCoachFinishSyncSheet();
    return;
  }
  this.finishCoachWorkoutSaveOnly();
};

// ---- Coaching Step 4.5 · Swap / Add picker methods ----
SC.createCoachWorkoutExerciseTemplate=function(exerciseKey){
  const key=exerciseKey||'';
  const def=exDef(key)||{};
  const cls=def.classKey||'accessory';
  const isCompound=(cls==='compound_upper'||cls==='compound_lower'||cls==='full_body');
  const setsCount=3;
  const repMin=isCompound?8:10;
  const repMax=isCompound?12:15;
  const rir=2;
  const restSec=isCompound?90:60;
  return{
    id:Utils.uid('cex'),
    exerciseKey:key,
    name:exLabel(key)||'',
    sets:Array.from({length:setsCount},()=>({weight:'',reps:'',done:false})),
    repMin,
    repMax,
    rir,
    restSec,
    notes:'',
    note:'',
    addedInSession:true
  };
};

SC.hasCoachExerciseLoggedData=function(exerciseIndex){
  if(!CWK.session)return false;
  const ex=CWK.session.exercises&&CWK.session.exercises[exerciseIndex];
  if(!ex||!Array.isArray(ex.sets))return false;
  return ex.sets.some(s=>{
    if(!s)return false;
    if(s.done)return true;
    if(s.weight!==''&&s.weight!=null)return true;
    if(s.reps!==''&&s.reps!=null)return true;
    return false;
  });
};

SC.openCoachWorkoutAddPicker=function(){
  if(!CWK.session){Toast.show('目前沒有進行中的訓練');return}
  this.coachWorkoutPickerMode='add';
  this.coachWorkoutSwapExerciseIndex=-1;
  this.coachWorkoutPickerSearch='';
  this.coachWorkoutPickerOpen=true;
  const titleEl=$('#coach-workout-picker-title');if(titleEl)titleEl.textContent='新增動作';
  const subEl=$('#coach-workout-picker-sub');if(subEl)subEl.textContent='加入本次訓練';
  const input=$('#coach-workout-picker-search');if(input)input.value='';
  const sheet=$('#coach-workout-picker');if(sheet){sheet.classList.add('open');sheet.setAttribute('aria-hidden','false')}
  this.renderCoachWorkoutPicker();
};

SC.openCoachWorkoutSwapPicker=function(exerciseIndex){
  if(!CWK.session){Toast.show('目前沒有進行中的訓練');return}
  const idx=Number(exerciseIndex);
  if(!Number.isFinite(idx)||idx<0)return;
  const ex=CWK.session.exercises&&CWK.session.exercises[idx];
  if(!ex)return;
  this.coachWorkoutPickerMode='swap';
  this.coachWorkoutSwapExerciseIndex=idx;
  this.coachWorkoutPickerSearch='';
  this.coachWorkoutPickerOpen=true;
  const titleEl=$('#coach-workout-picker-title');if(titleEl)titleEl.textContent='更換動作';
  const subEl=$('#coach-workout-picker-sub');if(subEl)subEl.textContent=`取代：${exLabel(ex.exerciseKey)||'（動作）'}`;
  const input=$('#coach-workout-picker-search');if(input)input.value='';
  const sheet=$('#coach-workout-picker');if(sheet){sheet.classList.add('open');sheet.setAttribute('aria-hidden','false')}
  this.renderCoachWorkoutPicker();
};

SC.closeCoachWorkoutPicker=function(){
  this.coachWorkoutPickerOpen=false;
  this.coachWorkoutPickerMode='';
  this.coachWorkoutSwapExerciseIndex=-1;
  this.coachWorkoutPickerSearch='';
  const sheet=$('#coach-workout-picker');if(sheet){sheet.classList.remove('open');sheet.setAttribute('aria-hidden','true')}
};

SC.filterCoachWorkoutPicker=function(value){
  this.coachWorkoutPickerSearch=String(value||'');
  this.renderCoachWorkoutPicker();
};

SC.getCoachWorkoutPickerResults=function(){
  const q=(this.coachWorkoutPickerSearch||'').trim().toLowerCase();
  return EXERCISE_REGISTRY.filter(x=>{
    if(!x||x.classKey==='cardio')return false;
    return exMatchesQuery(x,q);
  });
};

SC.renderCoachWorkoutPicker=function(){
  const list=$('#coach-workout-picker-list');if(!list)return;
  const items=this.getCoachWorkoutPickerResults();
  list.innerHTML=items.length
    ?items.map(i=>`<button class="coach-workout-picker-item" data-action="coach-workout-picker-select" data-exercise-key="${i.key}"><strong>${Utils.escape(i.labelEn)}｜${Utils.escape(i.labelZh)}</strong><small>${Utils.escape(i.category)} · ${Utils.escape(i.equipment)}</small></button>`).join('')
    :'<div class="coach-workout-picker-empty">找不到動作</div>';
};

SC.handleCoachWorkoutPickerSelect=function(exerciseKey){
  const key=exerciseKey||'';
  if(!key)return;
  if(this.coachWorkoutPickerMode==='add'){
    this.addCoachWorkoutExercise(key);
  }else if(this.coachWorkoutPickerMode==='swap'){
    this.swapCoachWorkoutExercise(this.coachWorkoutSwapExerciseIndex,key);
  }
};

SC.addCoachWorkoutExercise=function(exerciseKey){
  if(!CWK.session)return false;
  const key=exerciseKey||'';if(!key)return false;
  const item=this.createCoachWorkoutExerciseTemplate(key);
  CWK.session.exercises.push(item);
  CWK._touch();
  this.closeCoachWorkoutPicker();
  this.renderCoachWorkoutExercises();
  this.updateCoachWorkoutProgress();
  Toast.show('已新增動作');
  return true;
};

SC.swapCoachWorkoutExercise=function(exerciseIndex,exerciseKey){
  if(!CWK.session)return false;
  const idx=Number(exerciseIndex);
  if(!Number.isFinite(idx)||idx<0)return false;
  const ex=CWK.session.exercises&&CWK.session.exercises[idx];
  if(!ex)return false;
  const key=exerciseKey||'';if(!key)return false;
  if(key===ex.exerciseKey){this.closeCoachWorkoutPicker();return false}
  if(this.hasCoachExerciseLoggedData(idx)){
    if(!confirm('此動作已有紀錄，更換動作會清除已填寫的重量／次數／完成狀態，確定要繼續嗎？'))return false;
  }
  const tpl=this.createCoachWorkoutExerciseTemplate(key);
  tpl.id=ex.id;
  tpl.addedInSession=!!ex.addedInSession;
  CWK.session.exercises[idx]=tpl;
  if(this.coachWorkoutCollapsed)this.coachWorkoutCollapsed.delete(ex.id);
  CWK._touch();
  this.closeCoachWorkoutPicker();
  this.renderCoachWorkoutExercises();
  this.updateCoachWorkoutProgress();
  Toast.show('已更換動作');
  return true;
};

SC.removeCoachWorkoutExercise=function(exerciseIndex){
  if(!CWK.session)return false;
  const idx=Number(exerciseIndex);
  if(!Number.isFinite(idx)||idx<0)return false;
  const ex=CWK.session.exercises&&CWK.session.exercises[idx];
  if(!ex)return false;
  if(!ex.addedInSession){Toast.show('僅能移除本次加入的動作');return false}
  if(!confirm('移除此動作？已填寫的紀錄也會一併清除。'))return false;
  CWK.session.exercises.splice(idx,1);
  if(this.coachWorkoutCollapsed)this.coachWorkoutCollapsed.delete(ex.id);
  CWK._touch();
  this.renderCoachWorkoutExercises();
  this.updateCoachWorkoutProgress();
  Toast.show('已移除動作');
  return true;
};

// ---- Coaching Step 5B · Client Session Reports UI ----
SC.coachReportsClientId='';
SC.coachReportSheetOpen=false;
SC.coachReportSessionId='';
SC.coachReportPreviewMode='coach';

SC.sanitizeCoachSessionExportFilename=function(name){
  const base=String(name||'client-session').trim().replace(/[\\/:*?"<>|]+/g,'_').replace(/\s+/g,'_');
  return base.slice(0,80)||'client-session';
};

SC.formatCoachSessionDuration=function(min){
  const n=Number(min);
  if(!Number.isFinite(n)||n<=0)return'—';
  if(n<60)return`${n} 分`;
  const h=Math.floor(n/60);const m=n%60;
  return m?`${h} 時 ${m} 分`:`${h} 時`;
};

SC.countCoachSessionSets=function(session){
  if(!session||!Array.isArray(session.exercises))return 0;
  return session.exercises.reduce((n,ex)=>n+(Array.isArray(ex.sets)?ex.sets.length:0),0);
};

SC.countCoachCompletedSessionSets=function(session){
  if(!session||!Array.isArray(session.exercises))return 0;
  let n=0;
  session.exercises.forEach(ex=>{
    if(Array.isArray(ex.sets))ex.sets.forEach(s=>{if(s&&s.done)n++});
  });
  return n;
};

SC.getCoachSessionsForClient=function(clientId){
  if(!CDB.data)CDB.load();
  const list=Array.isArray(CDB.data.clientSessions)?CDB.data.clientSessions:[];
  return list
    .filter(s=>s&&s.clientId===clientId&&s.status==='complete')
    .slice()
    .sort((a,b)=>(b.finishedAt||b.endedAt||b.updatedAt||0)-(a.finishedAt||a.endedAt||a.updatedAt||0));
};

SC.getCoachReportClient=function(){
  if(!this.coachReportsClientId)return null;
  return Clients.byId(this.coachReportsClientId);
};

SC.getCoachReportSession=function(sessionId){
  if(!CDB.data)CDB.load();
  const id=sessionId||this.coachReportSessionId;
  if(!id)return null;
  const list=Array.isArray(CDB.data.clientSessions)?CDB.data.clientSessions:[];
  return list.find(s=>s&&s.id===id)||null;
};

SC.getCoachProgramNameForSession=function(session){
  if(!session)return'';
  if(session.programName)return session.programName;
  if(session.programId){
    const p=CPS.byId(session.programId);
    if(p)return p.name||'';
  }
  return'';
};

SC.getCoachSessionReportPayload=function(sessionId){
  const session=this.getCoachReportSession(sessionId);
  if(!session)return null;
  const client=Clients.byId(session.clientId)||null;
  const programName=this.getCoachProgramNameForSession(session);
  const report=ClientReports.build(session);
  return{session,client,programName,report};
};

SC.buildCoachSessionMarkdown=function(payload){
  const {session,client,programName,report}=payload;
  const clientName=(client&&client.name)||session.clientName||'學員';
  const dateStr=session.date||(session.finishedAt?Utils.dateFromTs(session.finishedAt):Utils.today());
  const totalSets=this.countCoachSessionSets(session);
  const doneSets=this.countCoachCompletedSessionSets(session);
  const durationLabel=this.formatCoachSessionDuration(session.durationMin);
  const md=[];
  md.push(`# 教練課程紀錄 — ${clientName}｜${programName||'—'}｜${dateStr}`);
  md.push('');
  md.push('## 基本資料');
  md.push(`- 學員：${clientName}`);
  md.push(`- 日期：${dateStr}`);
  md.push(`- 課表：${programName||'—'}`);
  if(session.startedAt)md.push(`- 開始：${Utils.formatDateTime(session.startedAt)}`);
  if(session.finishedAt)md.push(`- 結束：${Utils.formatDateTime(session.finishedAt)}`);
  md.push(`- 時長：${durationLabel}`);
  md.push(`- 完成組數：${doneSets} / ${totalSets}`);
  md.push('');
  md.push('## 教練版');
  md.push('');
  md.push('```');
  md.push(report.coachText||'');
  md.push('```');
  md.push('');
  md.push('## 學員版');
  md.push('');
  md.push('```');
  md.push(report.clientText||'');
  md.push('```');
  md.push('');
  md.push('## AI Prompt');
  md.push('');
  md.push('```');
  md.push(report.aiPromptText||'');
  md.push('```');
  md.push('');
  md.push(`> 匯出時間：${Utils.formatDateTime(Date.now())}`);
  return md.join('\n');
};

SC.buildCoachSessionJson=function(payload){
  const {session,client,programName,report}=payload;
  const out={
    exportType:'client_session_report',
    schema:'1.0',
    exportedAt:new Date().toISOString(),
    client:client?{
      id:client.id,
      name:client.name||'',
      gender:client.gender||'',
      age:client.age??null,
      heightCm:client.heightCm??null,
      weightKg:client.weightKg??null,
      goal:client.goal||'',
      tags:Array.isArray(client.tags)?client.tags.slice():[],
      note:client.note||''
    }:{id:session.clientId||'',name:session.clientName||''},
    session:{
      id:session.id,
      clientId:session.clientId,
      programId:session.programId||'',
      programName:programName||'',
      date:session.date||'',
      status:session.status||'',
      startedAt:session.startedAt||0,
      finishedAt:session.finishedAt||session.endedAt||0,
      durationMin:Number.isFinite(session.durationMin)?session.durationMin:0,
      totalSets:this.countCoachSessionSets(session),
      completedSets:this.countCoachCompletedSessionSets(session),
      coachNote:session.coachNote||'',
      clientNote:session.clientNote||'',
      exercises:(session.exercises||[]).map(ex=>({
        id:ex.id||'',
        exerciseKey:ex.exerciseKey||'',
        label:exLabel(ex.exerciseKey||'')||'',
        repMin:ex.repMin??null,
        repMax:ex.repMax??null,
        rir:ex.rir??null,
        restSec:ex.restSec??null,
        note:ex.note||ex.notes||'',
        addedInSession:!!ex.addedInSession,
        sets:(ex.sets||[]).map(s=>({
          weight:(s&&s.weight!=null)?s.weight:'',
          reps:(s&&s.reps!=null)?s.reps:'',
          done:!!(s&&s.done)
        }))
      }))
    },
    report:{
      coachText:report.coachText||'',
      clientText:report.clientText||'',
      aiPromptText:report.aiPromptText||''
    }
  };
  return JSON.stringify(out,null,2);
};

SC.openCoachReports=function(clientId){
  const id=clientId||'';
  if(!id){Toast.show('請先選擇學員');return}
  const c=Clients.byId(id);
  if(!c){Toast.show('找不到該學員');return}
  this.coachReportsClientId=id;
  Nav.go('screen-coach-reports');
};

SC.renderCoachReports=function(){
  if(!CDB.data)CDB.load();
  const client=this.getCoachReportClient();
  const titleEl=$('#coach-reports-title');
  const subEl=$('#coach-reports-sub');
  if(titleEl)titleEl.textContent=client?(client.name||'Unnamed Client'):'教練模式';
  if(subEl)subEl.textContent='課程紀錄';
  this.renderCoachReportsSummary();
  this.renderCoachReportsList();
};

SC.renderCoachReportsSummary=function(){
  const box=$('#coach-reports-summary');if(!box)return;
  const client=this.getCoachReportClient();
  if(!client){box.innerHTML='<div class="empty">未選擇學員。</div>';return}
  const sessions=this.getCoachSessionsForClient(client.id);
  const total=sessions.length;
  const last=sessions[0];
  const lastLabel=last?(last.finishedAt?Utils.formatDateTime(last.finishedAt):(last.date||'—')):'—';
  const totalSetsAll=sessions.reduce((n,s)=>n+this.countCoachSessionSets(s),0);
  box.innerHTML=`<div class="coach-reports-summary-grid"><div class="coach-reports-summary-cell"><div class="k">學員</div><div class="v">${Utils.escape(client.name||'Unnamed Client')}</div></div><div class="coach-reports-summary-cell"><div class="k">已完成課程</div><div class="v num">${total}</div></div><div class="coach-reports-summary-cell"><div class="k">累計組數</div><div class="v num">${totalSetsAll}</div></div><div class="coach-reports-summary-cell"><div class="k">最近課程</div><div class="v">${Utils.escape(lastLabel)}</div></div></div>`;
};

SC.renderCoachReportsList=function(){
  const list=$('#coach-reports-list');if(!list)return;
  const client=this.getCoachReportClient();
  if(!client){list.innerHTML='<div class="empty">尚未選擇學員。</div>';return}
  const sessions=this.getCoachSessionsForClient(client.id);
  if(!sessions.length){list.innerHTML='<div class="empty">此學員尚無已完成的課程。完成一次教練訓練後會出現在這裡。</div>';return}
  list.innerHTML=sessions.map(s=>this.renderCoachReportCard(s)).join('');
};

SC.renderCoachReportCard=function(session){
  const programName=this.getCoachProgramNameForSession(session)||'—';
  const totalSets=this.countCoachSessionSets(session);
  const doneSets=this.countCoachCompletedSessionSets(session);
  const dateLabel=session.finishedAt?Utils.formatDateTime(session.finishedAt):(session.date||'—');
  const durationLabel=this.formatCoachSessionDuration(session.durationMin);
  return`<div class="coach-report-card" data-coach-session="${Utils.escape(session.id)}"><div class="coach-report-card-head"><div class="coach-report-card-title"><h3 class="coach-report-card-name">${Utils.escape(programName)}</h3><div class="coach-report-card-date">${Utils.escape(dateLabel)}</div></div></div><div class="coach-report-card-meta"><span>時長 ${Utils.escape(durationLabel)}</span><span>完成 ${doneSets} / ${totalSets} 組</span></div><div class="coach-report-card-actions"><button class="btn primary" data-action="coach-open-session-report" data-id="${Utils.escape(session.id)}">查看報告</button></div></div>`;
};

SC.openCoachSessionReport=function(sessionId){
  const id=sessionId||'';
  if(!id){Toast.show('找不到該課程');return}
  const payload=this.getCoachSessionReportPayload(id);
  if(!payload){Toast.show('找不到該課程');return}
  this.coachReportSessionId=id;
  this.coachReportPreviewMode='coach';
  this.coachReportSheetOpen=true;
  this.renderCoachSessionReportSheet();
  const sheet=$('#coach-session-report-sheet');
  if(sheet){sheet.classList.add('open');sheet.setAttribute('aria-hidden','false')}
};

SC.closeCoachSessionReport=function(){
  this.coachReportSheetOpen=false;
  const sheet=$('#coach-session-report-sheet');
  if(sheet){sheet.classList.remove('open');sheet.setAttribute('aria-hidden','true')}
};

SC.setCoachSessionReportPreviewMode=function(mode){
  const m=(mode==='client'||mode==='ai')?mode:'coach';
  this.coachReportPreviewMode=m;
  this.renderCoachSessionReportSheet();
};

SC.renderCoachSessionReportSheet=function(){
  if(!this.coachReportSessionId)return;
  const payload=this.getCoachSessionReportPayload(this.coachReportSessionId);
  if(!payload)return;
  const {session,client,programName,report}=payload;
  const clientName=(client&&client.name)||session.clientName||'學員';
  const dateStr=session.date||(session.finishedAt?Utils.dateFromTs(session.finishedAt):'');
  const titleEl=$('#coach-session-report-title');
  const subEl=$('#coach-session-report-sub');
  if(titleEl)titleEl.textContent='課程報告';
  if(subEl)subEl.textContent=`${clientName}｜${programName||'—'}｜${dateStr||'—'}`;
  const meta=$('#coach-session-report-meta');
  if(meta){
    const totalSets=this.countCoachSessionSets(session);
    const doneSets=this.countCoachCompletedSessionSets(session);
    const durationLabel=this.formatCoachSessionDuration(session.durationMin);
    const startLabel=session.startedAt?Utils.formatDateTime(session.startedAt):'—';
    const finishLabel=session.finishedAt?Utils.formatDateTime(session.finishedAt):'—';
    meta.innerHTML=`<div class="row"><div class="k">學員</div><div class="v">${Utils.escape(clientName)}</div></div><div class="row"><div class="k">課表</div><div class="v">${Utils.escape(programName||'—')}</div></div><div class="row"><div class="k">日期</div><div class="v">${Utils.escape(dateStr||'—')}</div></div><div class="row"><div class="k">開始</div><div class="v">${Utils.escape(startLabel)}</div></div><div class="row"><div class="k">結束</div><div class="v">${Utils.escape(finishLabel)}</div></div><div class="row"><div class="k">時長</div><div class="v">${Utils.escape(durationLabel)}</div></div><div class="row"><div class="k">完成組數</div><div class="v num">${doneSets} / ${totalSets}</div></div>`;
  }
  const modeBtns=document.querySelectorAll('#coach-session-report-sheet .coach-session-report-mode');
  if(modeBtns&&modeBtns.length){
    modeBtns.forEach(b=>{const m=b.getAttribute('data-mode')||'';b.classList.toggle('active',m===this.coachReportPreviewMode)});
  }
  const preview=$('#coach-session-report-preview');
  if(preview){
    let txt='';
    if(this.coachReportPreviewMode==='client')txt=report.clientText||'';
    else if(this.coachReportPreviewMode==='ai')txt=report.aiPromptText||'';
    else txt=report.coachText||'';
    preview.textContent=txt;
  }
};

SC.copyCoachSessionCoachText=function(){
  if(!this.coachReportSessionId){Toast.show('尚未選擇課程');return}
  const payload=this.getCoachSessionReportPayload(this.coachReportSessionId);
  if(!payload)return;
  Utils.copyText(payload.report.coachText||'');
  Toast.show('已複製教練文字');
};

SC.copyCoachSessionClientText=function(){
  if(!this.coachReportSessionId){Toast.show('尚未選擇課程');return}
  const payload=this.getCoachSessionReportPayload(this.coachReportSessionId);
  if(!payload)return;
  Utils.copyText(payload.report.clientText||'');
  Toast.show('已複製學員文字');
};

SC.copyCoachSessionAiPrompt=function(){
  if(!this.coachReportSessionId){Toast.show('尚未選擇課程');return}
  const payload=this.getCoachSessionReportPayload(this.coachReportSessionId);
  if(!payload)return;
  Utils.copyText(payload.report.aiPromptText||'');
  Toast.show('已複製 AI Prompt');
};

SC.exportCoachSessionMarkdown=function(){
  if(!this.coachReportSessionId){Toast.show('尚未選擇課程');return}
  const payload=this.getCoachSessionReportPayload(this.coachReportSessionId);
  if(!payload)return;
  const clientName=(payload.client&&payload.client.name)||payload.session.clientName||'client';
  const programLabel=payload.programName||'program';
  const dateStr=payload.session.date||(payload.session.finishedAt?Utils.dateFromTs(payload.session.finishedAt):Utils.today());
  const fn=`client-session-${this.sanitizeCoachSessionExportFilename(clientName)}-${this.sanitizeCoachSessionExportFilename(programLabel)}-${dateStr}.md`;
  Utils.download(fn,this.buildCoachSessionMarkdown(payload),'text/markdown');
  Toast.show('已下載 Markdown');
};

SC.exportCoachSessionJson=function(){
  if(!this.coachReportSessionId){Toast.show('尚未選擇課程');return}
  const payload=this.getCoachSessionReportPayload(this.coachReportSessionId);
  if(!payload)return;
  const clientName=(payload.client&&payload.client.name)||payload.session.clientName||'client';
  const programLabel=payload.programName||'program';
  const dateStr=payload.session.date||(payload.session.finishedAt?Utils.dateFromTs(payload.session.finishedAt):Utils.today());
  const fn=`client-session-${this.sanitizeCoachSessionExportFilename(clientName)}-${this.sanitizeCoachSessionExportFilename(programLabel)}-${dateStr}.json`;
  Utils.download(fn,this.buildCoachSessionJson(payload),'application/json');
  Toast.show('已下載 JSON');
};

function initCoachingDomain(){
  try{
    CDB.load();
    CWK.loadDraft();
  }catch(e){
    console.error('coaching init error',e);
    try{CDB.data=CDB.migrate(Utils.copy(DEF_CDB))}catch(_e){}
    CWK.session=null;
    CWK.summary=null;
  }
}

// ================================================================
// 20. BOOTSTRAP
// ================================================================
function init(){DB.load();bindEvents();WK.loadDraft();if(WK.session)WK.restoreIfNeeded();SC.init();if(WK.session)SC.renderWorkout();initCoachingDomain()}

window.addEventListener('resize',()=>{if(Nav.cur==='screen-strength')SC.renderStrength();if(Nav.cur==='screen-weight')SC.renderWeight()},{passive:true});
document.addEventListener('visibilitychange',()=>{if(document.hidden)WK.saveDraft();else if(WK.session)WK.renderTopBar()});

init();
})();
