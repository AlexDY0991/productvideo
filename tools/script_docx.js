// Build film02/SCRIPT-v09.docx (Word script with storyboard frames + full prompts). Frames are extracted to ./frames next to this script first.
const fs = require('fs');
const path = require('path');
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, ImageRun,
  HeadingLevel, AlignmentType, WidthType, ShadingType, BorderStyle, PageBreak,
  LevelFormat, Header, Footer, PageNumber, TableOfContents, VerticalAlign,
} = require('docx');

const REPO = '/home/user/productvideo';
const FR = path.join(__dirname, 'frames');
const OUT = path.join(REPO, 'film02', 'SCRIPT-v09.docx');

const ORANGE = 'E85200', INK = '1D1A17', MUTED = '6D655D', LINE = 'D9D3CB', TINT = 'FBEFE8', HEAD = 'F3F0EC';
const CJK = 'Microsoft YaHei', LAT = 'Arial', MONO = 'Consolas';

// A4 portrait, 2 cm margins -> content width 11906 - 2*1134 = 9638 DXA
const W = 9638;

const src = fs.readFileSync(path.join(REPO, 'film02', 'SCRIPT-v09.md'), 'utf8');
const prompts = [...src.matchAll(/```\n([\s\S]*?)```/g)].map(m => m[1].trim());

const run = (text, o = {}) => new TextRun({ text, font: { ascii: o.mono ? MONO : LAT, hAnsi: o.mono ? MONO : LAT, eastAsia: CJK }, size: o.size || 21, bold: o.bold, color: o.color || INK, italics: o.italics });
const p = (children, o = {}) => new Paragraph({ children: Array.isArray(children) ? children : [run(children, o)], spacing: o.noLine ? { before: o.before || 0, after: o.after ?? 120 } : { after: o.after ?? 120, line: o.line || 300 }, alignment: o.align, indent: o.indent, keepNext: o.keepNext });
const h1 = t => new Paragraph({ heading: HeadingLevel.HEADING_1, children: [run(t, { size: 32, bold: true })], spacing: { before: 360, after: 160 }, keepNext: true });
const h2 = t => new Paragraph({ heading: HeadingLevel.HEADING_2, children: [run(t, { size: 26, bold: true })], spacing: { before: 240, after: 120 }, keepNext: true });
const bullet = (children, level = 0) => new Paragraph({ numbering: { reference: 'bul', level }, children: Array.isArray(children) ? children : [run(children)], spacing: { after: 80, line: 300 } });
const brk = () => new Paragraph({ children: [new PageBreak()] });

const border = { style: BorderStyle.SINGLE, size: 4, color: LINE };
const borders = { top: border, bottom: border, left: border, right: border };
const cell = (content, width, o = {}) => new TableCell({
  width: { size: width, type: WidthType.DXA }, borders,
  shading: o.fill ? { fill: o.fill, type: ShadingType.CLEAR, color: 'auto' } : undefined,
  margins: { top: 70, bottom: 70, left: 100, right: 100 }, verticalAlign: o.valign || VerticalAlign.TOP,
  children: (Array.isArray(content) ? content : [content]).map(c => typeof c === 'string' ? p(c, { size: o.size || 19, bold: o.bold, after: 0, line: 270, color: o.color }) : c),
});
const table = (widths, header, rows, o = {}) => new Table({
  width: { size: widths.reduce((a, b) => a + b, 0), type: WidthType.DXA }, columnWidths: widths,
  rows: [
    new TableRow({ tableHeader: true, children: header.map((h, i) => cell(h, widths[i], { fill: HEAD, bold: true, size: 18, color: MUTED })) }),
    ...rows.map(r => new TableRow({ cantSplit: true, children: r.map((c, i) => cell(c, widths[i], { fill: o.fills?.[i] })) })),
  ],
});
const img = (file, w) => new Paragraph({ children: [new ImageRun({ type: 'jpg', data: fs.readFileSync(file), transformation: { width: w, height: Math.round(w * 480 / 854) } })], spacing: { after: 0 } });
const promptBlock = text => text.split('\n').map(line => new Paragraph({
  children: [run(line || ' ', { mono: true, size: 16, color: INK })], spacing: { after: 0, line: 240 },
  shading: { fill: 'F7F5F2', type: ShadingType.CLEAR, color: 'auto' }, indent: { left: 120, right: 120 },
}));

// ---------- content ----------
const tempoFill = { '慢': null, '快': TINT, '慢动作': 'E8EEF3', '静止': 'EDEBE8', '中': null };
const parts = [
  {
    no: 1, en: 'TAKEOFF', cn: '起飞', dur: 11, at: '0–11 s', note: '沿用 v08 样片（V8P1），不重跑。',
    refs: '@char_pilot4 · @prop_dream · @loc_hangar_us',
    shots: [
      ['0.0–2.4', '机库里，他把咖啡放在工作台上，推开巨大的推拉门；门板扫过整个画面（前景遮挡），晨光涌进来，露出停在起降圈上的 Dream 和大海。', '慢'],
      ['2.4–4.0', '室外横移跟拍：他绕着 Dream 走，用手套划过螺旋桨做起飞前检查；转身时背后的 CoolFly logo 清楚。切在他坐进座椅的动作上。', '慢'],
      ['4.0–6.2', '85mm 环绕：扣上安全带 → 从腿上拿起头盔 → 完整戴上 → 扣下巴带 → 放下透明面罩。', '慢'],
      ['6.2–6.8', '微距：螺旋桨猛地转起来，变成半透明的圆盘。', '快'],
      ['6.8–7.3', '微距：戴手套的手把操纵杆往前推。', '快'],
      ['7.3–8.0', '贴地：下洗气流把尘土和草吹成一圈，扑向镜头。', '快'],
      ['8.0–9.4', '低机位升降：Dream 从起降圈平稳垂直起飞，机库在背后亮着灯。', '中'],
      ['9.4–11.0', '机腹从镜头正上方掠过；镜头翻转 180° 跟上去，像 FPV 一样俯冲出崖边，贴着海面追向朝阳。', '快'],
    ],
  },
  {
    no: 2, en: 'THE COAST', cn: '海岸', dur: 11, at: '11–22 s', note: '第一帧 = 第 1 段最后一帧（@p1_end），按顺序生成。',
    refs: '@p1_end · @char_pilot4 · @prop_dream2 · @loc_coast_us',
    shots: [
      ['0.0–1.6', '接着第 1 段的俯冲继续：同样倾斜的地平线、同样的太阳位置；1 秒内地平线转平，FPV 加速追近 Dream。', '快'],
      ['1.6–2.4', '贴着水面拍，Dream 从镜头旁呼啸而过，溅起水雾。切在掠过的瞬间。', '快'],
      ['2.4–4.0', '50mm 在驾驶舱斜前方同步跟拍：透过透明面罩，他从专注变成咧嘴大笑。他看向前方，镜头顺着他的视线甩出去。', '快'],
      ['4.0–4.4', '甩镜：一道带动态模糊的横扫。', '快'],
      ['4.4–6.2', '甩镜落在峡谷口：巨大的混凝土拱桥压在画面上方，Dream 贴着海面从桥下穿过，冲出桥的阴影进入阳光，光晕扫过镜头。', '快'],
      ['6.2–8.8', '升格慢动作：镜头从他的侧脸出发，沿着伸出去的左臂一路移到张开的手；手占满大半个画面，风吹得手套和袖子发抖，阳光从指缝里闪过；最后手指慢慢握拢。右手一直握着操纵杆。声音只剩风和呼吸。', '慢动作'],
      ['8.8–9.6', '速度猛地恢复：镜头越过防滚架顶部往下看，靴子踩在镂空踏板上，十几米下面的海浪飞快掠过。', '快'],
      ['9.6–11.0', '镜头拉出驾驶舱，升到 Dream 的后上方；Dream 转向崖顶的绿色草地，开始下降。', '中'],
    ],
  },
  {
    no: 3, en: 'HOME', cn: '回家', dur: 10, at: '22–32 s', note: '第一帧 = 第 2 段最后一帧（@p2_end）。',
    refs: '@p2_end · @char_pilot4 · @char_pilot3 · @char_family · @prop_dream2 · @loc_breakfast',
    shots: [
      ['0.0–2.6', '接着第 2 段的下降运镜继续：镜头跟着 Dream 往下降，穿过草地边缘的野花落到草地高度，露出左边早餐桌旁抬头张望的妻子和女儿；Dream 在草地远端降落，离她们至少 40 米。', '慢'],
      ['2.6–4.0', '低机位滑向 Dream：草被吹平，螺旋桨慢下来，完全停住。这时没有任何人在旁边。', '慢'],
      ['4.0–5.6', '前景是静止的螺旋桨；螺旋桨停稳以后女儿才跑过来，焦点从桨叶移到她身上，妈妈在后面慢慢走。', '慢'],
      ['5.6–7.6', '环绕驾驶舱：他摘下头盔，头发被风吹乱，笑着；女儿跑到跟前，他把她抱进座椅。切在她落进座椅的动作上。', '中'],
      ['7.6–10.0', '他把大一号的头盔戴到女儿头上，她咯咯笑；焦点移到爸爸的笑脸；女儿仰头看天，镜头跟着她的视线往上摇，明亮的晨空和柔和的光晕铺满画面。', '慢'],
    ],
  },
  {
    no: 4, en: 'FINALE', cn: '收尾 · 定版', dur: 10, at: '32–42 s', note: '第一帧 = 第 3 段最后一帧（@p3_end）。定版镜头模型只给了约 1.8 秒，样片里后期放慢到约 4.7 秒。',
    refs: '@p3_end · @char_pilot3 · @char_pilot4 · @char_family · @prop_dream2 · @loc_breakfast',
    shots: [
      ['0.0–2.0', '从同一片天空往下摇：妻子的手把冒着热气的咖啡杯放在亚麻桌布上（呼应片头），焦点移开，露出一家人在早餐桌旁笑着，远处停着橙色的 Dream。', '慢'],
      ['2.0–3.6', '低机位慢慢环绕停着的 Dream，逆光从防滚架里透过来。', '慢'],
      ['3.6–4.1', '微距：碳纤维机臂的纹理。', '快'],
      ['4.1–4.6', '微距：黑色共轴电机和静止的螺旋桨。', '快'],
      ['4.6–5.1', '微距：橙色整流罩的弧线和两条白色条纹（不出现编号）。', '快'],
      ['5.1–10.0', '定版英雄远景：Dream 停在崖边，一家人背对镜头站在旁边看海和朝阳，女儿骑在爸爸肩上；构图对称，上方三分之一留给文字；几乎静止。', '静止'],
    ],
  },
];

const children = [];

// cover
children.push(
  new Paragraph({ children: [new ImageRun({ type: 'png', data: fs.readFileSync(path.join(REPO, 'brand', 'coolfly-logo.png')), transformation: { width: 150, height: 150 } })], spacing: { before: 1600, after: 400 } }),
  p([run('CoolFly Dream · 第 2 号品牌片', { size: 24, color: ORANGE, bold: true })], { after: 240, noLine: true }),
  p([run('First Light', { size: 72, bold: true })], { after: 160, noLine: true }),
  p([run('脚本 v09 · 面向美国用户', { size: 30, color: MUTED })], { after: 600, noLine: true }),
  table([2400, 7238], ['项目', '内容'], [
    ['时长', '约 45 秒（4 段生成 11 + 11 + 10 + 10 秒，加 3 秒整屏橙色 logo 卡；当前样片合成版约 48 秒）'],
    ['画幅', '16:9，1920×1080 主版本；9:16 竖版之后再做'],
    ['语言', '画面文字一律英文；全片没有台词和旁白'],
    ['生成', '即梦 Seedance 2.5 样片模式（480p）→ 满意后在画布上直出 1080p'],
    ['日期', '2026-10-21'],
  ]),
  brk(),
);


// 1 story
children.push(
  h1('1. 一句话故事'),
  p('周六凌晨，他从崖顶牧场的机库里推出 Dream，从停机坪起飞，贴着加州 1 号公路的海岸飞行，从拱桥下穿过，然后降落在崖顶草地上，和等着他吃早餐的妻子、女儿团聚。女儿坐进了驾驶座，抬头望着天空。'),
  p('时间线是一个早晨（凌晨 → 日出 → 早上），和 Dream Pro 40 分钟的续航对得上：一次早晨飞行，飞完就到。'),
  table([1300, 1300, 1500, 3238, 2300], ['段', '时长', '全片时间', '内容', '情绪'],
    [
      ['1 · TAKEOFF', '11 s', '0–11 s', '机库、检查、戴头盔、起飞、俯冲出崖边', '仪式感 → 爆发'],
      ['2 · THE COAST', '11 s', '11–22 s', '贴海追飞、大笑、穿桥、张手慢动作、脚下的海', '速度 → 喘息 → 自由'],
      ['3 · HOME', '10 s', '22–32 s', '远处降落、女儿跑来、戴头盔、仰望天空', '温暖'],
      ['4 · FINALE', '10 s', '32–42 s', '咖啡、一家人、Dream 细节、定版远景', '回味 → 品牌'],
      ['logo 卡', '3 s', '42–45 s', '整屏 CoolFly 橙 + 黑色 logo', '—'],
    ]),
);

// 2 US audience
children.push(
  h1('2. 从美国用户的心理出发'),
  p('看片的人：美国的高收入人群，35–55 岁，男女都有；住在海边、山里或郊区，车库里已经有 Porsche、Rivian 或者一辆皮卡；喜欢户外，是新科技的早期用户。他们不缺车，缺的是没人做过的体验，和属于自己的时间。'),
  h2('五个判断'),
  bullet([run('「开阔的路」是美国人最深的自由神话。', { bold: true }), run('片子要说的是：开阔的路，变成了开阔的天空。所以海岸拍成加州 1 号公路的样子：混凝土拱桥、金色草坡、公路上慢慢开着的车。')]),
  bullet([run('想要，来自「它就住在我家」。', { bold: true }), run('起飞地点是自家牧场的开放式机库，Dream 停在门外的起降圈上，而不是工业机库。')]),
  bullet([run('美国人对「飞行汽车」先怀疑，再心动。', { bold: true }), run('所以要让人觉得一切在掌控之中：起飞前用手检查螺旋桨、安全带咔嗒一声、全程单手握杆；只飞过开阔的海岸和海面，高度不超过约 20 米，不飞过人群和车流。')]),
  bullet([run('情绪要看得见。', { bold: true }), run('头盔用透明面罩，看得到他的大笑；张开手迎风的慢动作；透过镂空踏板看到脚下的海浪。')]),
  bullet([run('爽完之后，要有一个和人分享的落点。', { bold: true }), run('Dream 是单座，分享发生在落地以后：女儿坐进驾驶座（飞行器关机，不会飞），抬头看天，爸爸看着她笑。「这个梦，会传下去」，不写出来，靠画面说。')]),
);

// 3 rhythm
children.push(
  h1('3. 节奏设计（快慢切换）'),
  p('参考 Xiaomi「长镜头蓄势 → 连续快切 → 突然停住」和 Eletre「微距慢、飞驰快」，再用一个停得最久的英雄远景收尾。'),
  table([1500, 900, 4238, 1300, 1700], ['全片时间', '段', '节奏', '镜头长度', '声音'],
    [
      ['0–6 s', '1', '慢：推门、检查、戴头盔，仪式感', '1.6–2.4 s', '门轨、脚步、咔嗒'],
      ['6–11 s', '1', '爆发：螺旋桨、手、气流三个快切 → 起飞 → 俯冲', '0.5–0.7 s', '电机声突然响起'],
      ['11–17 s', '2', '快：追飞、擦身而过、甩镜、穿桥', '0.4–1.8 s', '风、浪、桥下回声'],
      ['17–19.8 s', '2', '慢动作喘息：镜头沿手臂移到张开的手', '2.6 s', '只剩风声和呼吸'],
      ['19.8–22 s', '2', '再快：脚下的海浪，拉起', '0.8–1.4 s', '声音猛地恢复'],
      ['22–32 s', '3', '慢、温柔：降落、女儿跑来、戴头盔', '1.4–2.6 s', '草地、风、笑声'],
      ['32–35.6 s', '4', '慢：咖啡、一家人、环绕 Dream', '1.6–2.0 s', '安静'],
      ['35.6–37.1 s', '4', '三个快拍：机臂、电机、整流罩', '0.5 s', '配乐踩点'],
      ['37.1–42 s', '4', '定版静止：全片最长的镜头', '约 4.9 s', '只剩风声，配乐收尾'],
      ['42–45 s', '卡', '整屏橙色 + 黑色 logo', '3 s', '最后一拍'],
    ]),
);

// 4 joins
children.push(
  h1('4. 段与段之间的衔接'),
  p('每段分开生成时，模型不知道上一段最后一帧长什么样，接缝处的角度、大小和光线就会跳变。v09 的做法是：按顺序生成，把上一段样片的最后一帧截下来，作为下一段的第一帧参考图，并要求开头的运镜沿同一方向、以同样速度继续。'),
  table([1300, 4038, 4300], ['接缝', '上一段结尾 → 下一段开头', '「桥」'],
    [
      ['1 → 2', 'FPV 俯冲、倾斜的地平线 → 同一个画面', '同一个 FPV 运镜继续，1 秒内把地平线转平'],
      ['2 → 3', 'Dream 后上方的俯拍 → 同一个画面', '同一个下降运镜继续，穿过野花落到草地高度，露出家人'],
      ['3 → 4', '女儿仰头，镜头摇进明亮的天空 → 同一片天空', '用天空做桥：从天空摇下来，落到放咖啡杯的手上；笑声延续到早餐桌，做声音桥'],
      ['4 → 卡', '定版远景静止', '硬切整屏橙色 logo 卡（参考 Eletre 的整屏品牌黄）'],
    ]),
  p('段内规则：切点两边的运动方向一致、速度相近，切在动作上。后期在接缝前后各补 4–6 帧速度渐变，配乐跨过接缝不断开。', { after: 120 }),
);

// 5 assets
children.push(
  h1('5. 资产'),
  table([2600, 7038], ['标签', '内容'],
    [
      ['@char_pilot4', '主演：美国男性，30 多岁，深棕短发，灰绿眼睛；黑色飞行服，左胸小号、背后大号 CoolFly logo；黑色头盔配透明面罩'],
      ['@char_pilot3', '主演不戴头盔的脸（摘下头盔后用）'],
      ['@char_family', '妻子（30 多岁，米色针织衫、深色牛仔裤）和 8 岁女儿（雀斑、浅色牛仔外套、深蓝打底裤）'],
      ['@prop_dream2', 'Dream 三视图（去掉编号 05，整流罩只有橙色和两条白色条纹）'],
      ['@loc_hangar_us', '崖顶牧场的开放式机库：两扇大推拉门、停机坪和白色起降圈'],
      ['@loc_coast_us', '加州 1 号公路式海岸：混凝土拱桥、金色草坡、海雾'],
      ['@loc_breakfast', '崖顶草地上的早餐桌（亚麻桌布、咖啡壶），崖下是海雾；不出现汽车'],
      ['@p1_end / @p2_end / @p3_end', '上一段样片的最后一帧，作为下一段的第一帧'],
    ]),
);

// 6 parts
parts.forEach((pt, idx) => {
  children.push(brk(), h1(`6.${pt.no} 第 ${pt.no} 段 · ${pt.en} · ${pt.cn}（${pt.dur} 秒，全片 ${pt.at}）`));
  children.push(p([run('说明：', { bold: true }), run(pt.note)]));
  children.push(p([run('参考图：', { bold: true }), run(pt.refs, { mono: true, size: 19 })]));
  children.push(h2('分镜'));
  const widths = [2700, 1150, 4888, 900];
  children.push(table(widths, ['画面（样片截图）', '时间', '内容', '节奏'],
    pt.shots.map((s, i) => [
      img(path.join(FR, `p${pt.no}_s${i + 1}.jpg`), 170),
      s[0] + ' s', s[1], s[2],
    ]),
    {}));
  children.push(h2('英文提示词（提交给即梦的原文）'));
  children.push(p('提交前，提示词里的 @名字会换成画布节点。', { color: MUTED, size: 19 }));
  children.push(...promptBlock(prompts[idx]));
});

// 7 post & budget
children.push(
  brk(),
  h1('7. 后期'),
  bullet('配乐：Seed Music，在 6 秒（起飞爆发）、17 秒（慢动作）、19.8 秒（恢复）、35.6 秒（三个快拍）和 37.1 秒（定版）几处踩点。'),
  bullet('数据小字（英文，只用已确认的参数）：第 2 段叠 100 km/h，第 3 段叠 40 min，第 4 段叠 Dream Pro / Dream ST 参数。'),
  bullet('定版文字：约 38.5 秒在天空位置淡入产品名「Dream」；标语那一行先空着，等 slogan 定了再加。'),
  bullet('结尾卡：42 秒硬切到整屏 CoolFly 橙色，配黑色 logo，3 秒。'),
  bullet('响度统一到 −14 LUFS，输出 16:9 母版。'),
  h2('产品参数（画面上只能出现这些数据）'),
  table([3200, 3219, 3219], ['', 'Dream Pro', 'Dream ST'],
    [
      ['续航（载一位 70 kg 驾驶员）', '40 分钟', '16 分钟'],
      ['最高速度', '100 km/h', '100 km/h'],
      ['载重', '120 kg', '95 kg'],
    ]),
  h1('8. 待定事项'),
  bullet('四段样片确认后，在网页画布上直出 1080p：约 2,688 积分，今天剩 2,507，最后一段可能要明天出。'),
  bullet('加州海岸面朝西，日出在陆地一侧；现在片中的太阳在海平面上，更像日落。要不要把故事时间改成傍晚，待定。'),
  bullet('Slogan 待定；定下以后再考虑旁白或文字。'),
);

const doc = new Document({
  creator: 'CoolFly', title: 'First Light · 脚本 v09',
  styles: {
    default: { document: { run: { font: { ascii: LAT, hAnsi: LAT, eastAsia: CJK }, size: 21, color: INK } } },
    paragraphStyles: [
      { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { size: 32, bold: true, color: INK, font: { ascii: LAT, eastAsia: CJK } }, paragraph: { spacing: { before: 360, after: 160 }, outlineLevel: 0, border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: ORANGE, space: 4 } } } },
      { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { size: 26, bold: true, color: INK, font: { ascii: LAT, eastAsia: CJK } }, paragraph: { spacing: { before: 240, after: 120 }, outlineLevel: 1 } },
    ],
  },
  numbering: { config: [{ reference: 'bul', levels: [{ level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 420, hanging: 280 } } } }] }] },
  sections: [{
    properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 1134, bottom: 1134, left: 1134, right: 1134 } } },
    headers: { default: new Header({ children: [p([run('CoolFly Dream · First Light · 脚本 v09', { size: 16, color: MUTED })], { align: AlignmentType.RIGHT, after: 0 })] }) },
    footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ children: [PageNumber.CURRENT], size: 16, color: MUTED })] })] }) },
    children,
  }],
});

Packer.toBuffer(doc).then(b => { fs.writeFileSync(OUT, b); console.log('wrote', OUT, b.length); });
