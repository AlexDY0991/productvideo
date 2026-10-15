// The film's script: chapter timing, chapter cards and bilingual subtitles.
// Times are in seconds. The audio score (tools/score.py) reads the same data
// through tools/export-timeline.mjs, so picture and sound stay locked.

export const TITLE = { zh: '仰望', en: 'LOOKING UP', subZh: '人类飞行的梦想与飞行器演变史', subEn: 'A History of Human Flight, from Dream to Machine' };

export const DURATION = 300;

// Scene blocks (ids map to scene modules in film.js)
export const SCENES = [
  { id: 'prologue', a: 0, b: 20 },
  { id: 'icarus', a: 20, b: 31 },
  { id: 'feitian', a: 31, b: 42 },
  { id: 'luban', a: 42, b: 52 },
  { id: 'kite', a: 52, b: 62 },
  { id: 'codex', a: 62, b: 84 },
  { id: 'lantern', a: 84, b: 94 },
  { id: 'balloon', a: 94, b: 106 },
  { id: 'wright', a: 106, b: 126 },
  { id: 'war', a: 126, b: 140 },
  { id: 'golden', a: 140, b: 158 },
  { id: 'jet', a: 158, b: 180 },
  { id: 'heli', a: 180, b: 194 },
  { id: 'space', a: 194, b: 222 },
  { id: 'digital', a: 222, b: 242 },
  { id: 'individual', a: 242, b: 256 },
  { id: 'finale', a: 256, b: 300 },
];

// Chapter index cards (top-left caption, museum style)
export const CHAPTERS = [
  { n: 'I', a: 20, b: 62, zh: '神话与仿生', en: 'MYTH & MIMICRY', year: 'ANTIQUITY' },
  { n: 'II', a: 62, b: 84, zh: '手稿', en: 'THE CODEX', year: '1505' },
  { n: 'III', a: 84, b: 106, zh: '比空气更轻', en: 'LIGHTER THAN AIR', year: '1783' },
  { n: 'IV', a: 106, b: 126, zh: '十二秒', en: 'TWELVE SECONDS', year: '1903' },
  { n: 'V', a: 126, b: 140, zh: '战争之翼', en: 'WINGS OF WAR', year: '1914 — 1918' },
  { n: 'VI', a: 140, b: 158, zh: '黄金年代', en: 'THE GOLDEN AGE', year: '1927 — 1939' },
  { n: 'VII', a: 158, b: 180, zh: '超越声音', en: 'BEYOND SOUND', year: '1947 — 1969' },
  { n: 'VIII', a: 180, b: 194, zh: '垂直', en: 'VERTICAL', year: '1939' },
  { n: 'IX', a: 194, b: 222, zh: '天空之外', en: 'BEYOND THE SKY', year: '1957 — 1969' },
  { n: 'X', a: 222, b: 242, zh: '数字之翼', en: 'DIGITAL WINGS', year: '2010 —' },
  { n: 'XI', a: 242, b: 256, zh: '每一个人', en: 'EVERYONE', year: 'NOW' },
];

export const SUBS = [
  [3.0, 7.6, '很久以前，有人第一次抬起头。', 'Long ago, someone looked up for the first time.'],
  [8.2, 12.8, '飞鸟掠过天空。从那一刻起，人类有了一个梦。', 'Birds crossed the sky. From that moment, humankind had a dream.'],

  [21.0, 25.4, '古希腊神话里，伊卡洛斯以蜡粘羽，飞向太阳。', 'In Greek myth, Icarus bound feathers with wax and flew toward the sun.'],
  [25.8, 30.4, '蜡融化了，他坠入大海——但这个梦从未坠落。', 'The wax melted and he fell into the sea — but the dream never fell.'],

  [32.0, 36.6, '敦煌壁画上，飞天不借羽翼，', 'On the walls of Dunhuang, the apsaras need no wings —'],
  [36.8, 41.4, '仅凭衣带当风，凌空而舞。', 'they dance across the sky on ribbons and wind.'],

  [43.0, 47.4, '《墨子》记载：公输子削竹木以为鹊，', 'Mozi records that Lu Ban carved a magpie from bamboo and wood;'],
  [47.6, 51.6, '成而飞之，三日不下。', 'once finished, it flew — and stayed aloft for three days.'],

  [53.0, 57.2, '而风筝，让人第一次把心愿系上了天空。', 'And with the kite, we first tied our wishes to the sky.'],
  [57.6, 61.4, '一根线，一端在手中，一端在云里。', 'One string: one end in the hand, the other in the clouds.'],

  [64.0, 68.6, '1505 年，达·芬奇写下《论鸟的飞行》。', '1505: Leonardo da Vinci writes the Codex on the Flight of Birds.'],
  [69.0, 74.0, '他观察、测量、绘制，试图把鸟的秘密翻译成机械。', 'He watched, measured and drew, translating the secrets of birds into machines.'],
  [76.0, 82.6, '纸上的扑翼与螺旋，还要再等待四百年。', 'The flapping wings and spirals on his pages would wait four hundred years.'],

  [85.0, 89.4, '孔明灯升起——热空气，托起了光。', 'Sky lanterns rise: warm air lifting light.'],
  [89.8, 93.6, '人们开始相信，比空气更轻的东西，可以载我们上升。', 'We began to believe that something lighter than air could carry us up.'],

  [95.0, 100.0, '1783 年 11 月 21 日，巴黎。蒙哥尔费热气球载人升空。', 'Paris, 21 November 1783. A Montgolfier balloon carries two men aloft.'],
  [100.6, 105.4, '人类第一次，离开了地面。', 'For the first time, humans left the ground.'],

  [107.5, 112.0, '1903 年 12 月 17 日，北卡罗来纳州，基蒂霍克。', '17 December 1903. Kitty Hawk, North Carolina.'],
  [112.5, 117.4, '云杉木、平纹布，和一台 12 马力的发动机。', 'Spruce, muslin, and a twelve-horsepower engine.'],
  [118.6, 125.4, '12 秒，36.5 米。动力飞行，从这里开始。', 'Twelve seconds. One hundred and twenty feet. Powered flight begins.'],

  [127.0, 131.8, '仅仅十一年后，飞机被送上了战场。', 'Just eleven years later, aircraft were sent to war.'],
  [132.4, 135.6, '木材、帆布与张线，在硝烟中迅速成熟。', 'Wood, canvas and wire matured fast in the smoke of war.'],
  [136.0, 139.4, '天空，成了国家的疆域。', "The sky became a nation's frontier."],

  [141.0, 145.6, '铝板与铆钉，把冒险变成了旅程。', 'Aluminium and rivets turned adventure into travel.'],
  [146.0, 151.2, '1927 年，林德伯格独自飞越大西洋；1936 年，DC-3 投入航线。', '1927: Lindbergh flies the Atlantic alone. 1936: the DC-3 enters airline service.'],
  [152.0, 157.4, '天空，开始属于每一位乘客。', 'The sky began to belong to passengers.'],

  [159.0, 163.0, '风洞、蓝图、计算尺。', 'Wind tunnels. Blueprints. Slide rules.'],
  [164.0, 168.8, '1947 年 10 月 14 日，X-1 突破声障。', '14 October 1947: the X-1 breaks the sound barrier.'],
  [170.0, 174.6, '1952 年，第一架喷气客机投入航线。', '1952: the first jet airliner enters service.'],
  [175.0, 179.4, '1969 年，协和式首飞——为两倍音速而生。', '1969: Concorde flies — built for twice the speed of sound.'],

  [181.0, 185.4, '1939 年，西科斯基的 VS-300 垂直升空。', "1939: Sikorsky's VS-300 lifts straight up."],
  [185.8, 189.6, '达·芬奇纸上的螺旋，终于转动起来。', "Leonardo's paper spiral finally began to turn."],
  [190.0, 193.6, '飞行，不再需要跑道。', 'Flight no longer needed a runway.'],

  [195.5, 199.6, '1957 年，第一颗人造卫星划过夜空。', '1957: the first artificial satellite crosses the night sky.'],
  [200.2, 204.6, '1961 年，加加林说：“我们出发了！”', '1961: Yuri Gagarin says, "Poyekhali — let\'s go!"'],
  [205.4, 210.4, '1969 年 7 月 20 日，人类踏上月球。', '20 July 1969: humans set foot on the Moon.'],
  [211.2, 216.0, '也是在那个年代，我们第一次回望地球。', 'In those same years, we looked back at the Earth for the first time.'],
  [216.6, 221.4, '原来，我们一直生活在天空之中。', 'We had been living in the sky all along.'],

  [223.0, 227.0, '碳纤维、无刷电机、数字飞控。', 'Carbon fibre. Brushless motors. Digital flight control.'],
  [227.6, 232.6, '传感器每秒校准上千次，让飞行前所未有地稳定。', 'Sensors correcting a thousand times a second made flight steadier than ever.'],
  [233.4, 239.6, '飞行器从国家与产业的工具，重新回到每个人手中。', "Flight passed from the tools of nations and industry back into everyone's hands."],

  [243.0, 247.6, '千百年来，每个时代，都有一个人仰望天空。', 'For thousands of years, in every age, someone has looked up at the sky.'],
  [248.2, 251.6, '那道目光，从未落下。', 'That gaze has never fallen.'],
  [252.2, 255.6, '现在，轮到你了。', "Now, it's your turn."],

  [287.4, 293.0, '自由意志可以抵达的高度。', 'As high as free will can reach.'],
].map(([a, b, zh, en]) => ({ a, b, zh, en }));

// Key sound/picture sync points used by the score
export const CUES = {
  titleHit: 13.5,
  waxMelt: 25.6,
  splash: 30.6,
  magpieAssemble: 45.6,
  sealStamp: 48.2,
  burner: 97.5,
  balloonLift: 99.0,
  wrightEngine: 108.5,
  wrightLift: 112.5,
  wrightLand: 124.4,
  warStart: 126.0,
  sonicBoom: 166.4,
  heliSpin: 184.2,
  heliLift: 188.2,
  sputnik: 194.2,
  launch: 205.6,
  moon: 208.6,
  earthrise: 211.2,
  digitalStart: 222.0,
  gust: 229.4,
  individual: 242.0,
  lineup: 249.0,
  whiteout: 255.0,
  converge: 261.8,
  assembled: 267.0,
  solid: 268.2,
  urbanRise: 270.5,
  dreamSkim: 278.5,
  freeze: 286.0,
  logo: 289.0,
};
