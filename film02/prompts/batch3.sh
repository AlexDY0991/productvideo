#!/usr/bin/env bash
# DREAM v03 "Ignition" · batch 3: nine keyframes for the new transition shots + two dynamic scores. Saves nodes only.
set -euo pipefail
cd "$(dirname "$0")/../.."
J="python3 tools/jm.py film02/jimeng-state.json"
LOCK="【产品身份锁定】画面中的飞行器是参考图中的同一台 CoolFly Dream 单人电动飞行器：橙色整流罩，车头有两道白色竖条纹和「05」号码；深灰色钢管防滚架，座舱上方为拱形顶；白色座椅；四根碳纤维机臂呈 X 形伸出，每根机臂末端上下各一组黑色电机和两叶碳纤维螺旋桨。不增减机臂、电机、螺旋桨，不改变比例和涂装，不出现第二台飞行器，不出现任何文字或水印。"
PILOT="驾驶员：黑色哑光连体飞行服、黑色手套、黑色哑光全盔，深色烟色面罩。"
REAL="真实电影摄影，柯达胶片质感，细腻颗粒，自然光比；人物必须像真人实拍：真实皮肤纹理与毛孔、自然的不对称和细小瑕疵，不磨皮、不美颜，不要 CG 感、蜡像感、游戏感。"
SAFE="构图：主体位于画面中部，上下各留出约 12% 的安全区（之后可裁成 2.39:1）。"
FLY="飞行中螺旋桨呈半透明旋转虚影。"

$J img N1 --title "N1 · 机库顶灯" --ref G-v1-front34 --ref K1 --prompt "生成一张 16:9 横屏超写实电影画面。$LOCK 夜里空旷的大型机库，水泥地面微微反光，Dream 停在画面中央，3/4 前侧视角，低机位。天花板上一排排平行的长条 LED 灯管，只有离镜头最远的两排已经亮起，冷白色的光在橙色清漆整流罩上拉出细长的高光条；近处仍是一片黑暗。高反差，暗部深沉。$REAL $SAFE"
$J img N2 --title "N2 · 驾驶员剪影" --ref K10 --prompt "生成一张 16:9 横屏电影画面：驾驶员的侧面剪影，头戴黑色哑光全盔、面罩放下，肩部以上，位于画面左三分之一处，面朝右。背后是一大片饱和的橙色背景光（品牌橙 #FF5A00），头盔边缘被勾出一道锐利的轮廓光，人物几乎全黑，看不到面部。极简、强烈、高级，类似高端汽车广告。$PILOT $REAL $SAFE"
$J img N3 --title "N3 · 眼睛微距" --prompt "生成一张 16:9 横屏超写实微距人像摄影：一名 30 岁左右的东亚男性飞行员的右眼极近特写，眼睛占画面宽度约三分之一，位于画面中央偏右；他戴着头盔，面罩已经抬起，画面边缘能看到黑色头盔衬垫的局部。一道细长的橙色光在虹膜和角膜上反射出一条亮线。真实的皮肤纹理、毛孔、细小的眼周纹路和睫毛，眼白里有自然的细微血丝，眼神专注、平静。100mm 微距镜头，浅景深。$REAL"
$J img N4 --title "N4 · 掠过镜头 机腹" --ref G-v4-top --ref G-v6-low --ref K11 --prompt "生成一张 16:9 横屏超写实电影画面：摄影机放在海边悬崖顶的岩石上，镜头几乎垂直向上仰拍。Dream 正从镜头正上方约 4 米处高速飞过，机腹、底盘镂空钢管和四根机臂、螺旋桨占据画面大半，带有明显的运动模糊；背景是阴天的银灰色天空。$LOCK $PILOT $FLY $REAL"
$J img N5 --title "N5 · 贴海高速跟拍" --ref G-v5-rear34 --ref K12 --prompt "生成一张 16:9 横屏超写实电影画面：Dream 载着驾驶员在离海面约 3 米的高度高速向前飞行，下洗气流在海面上犁出一道白色水雾尾迹；摄影机从侧后方贴着水面同速追拍，近处的海浪带有强烈的运动模糊，传达出速度感。阴天的冷色调，低饱和。$LOCK $PILOT $FLY $REAL $SAFE"
$J img N6 --title "N6 · 俯拍越过海岸线" --ref G-v4-top --ref K11 --prompt "生成一张 16:9 横屏超写实航拍画面：摄影机从约 40 米高空垂直向下俯拍。画面左半是深蓝色的大海和白色浪花，右半是黑色礁石悬崖，海岸线从画面上方斜穿到下方；Dream 正从海面飞越海岸线，顶视角能清楚看到 X 形的四根机臂、螺旋桨和橙色整流罩，它的影子清晰地投在下方的礁石上。$LOCK $PILOT $FLY $REAL"
$J img N7 --title "N7 · 绕海蚀柱侧倾" --ref G-v1-front34 --ref K11 --prompt "生成一张 16:9 横屏超写实电影画面：Dream 正以明显的侧倾姿态绕过一根高耸的黑色海蚀柱转弯，机身倾斜约 20 度，下方是汹涌的海浪；摄影机用长焦从侧面跟摇，背景的海蚀柱和悬崖带有横向的运动模糊。阴天柔光，低饱和，强烈的速度感。$LOCK $PILOT $FLY $REAL $SAFE"
$J img N8 --title "N8 · 迎面冲镜" --ref G-v3-front --ref K12 --prompt "生成一张 16:9 横屏超写实电影画面：Dream 在海面上方约 6 米的高度迎面朝镜头高速飞来，正面视角，橙色整流罩车头的两道白色竖条纹和防滚架清晰可见，四根机臂向两侧展开，已经非常接近镜头，几乎撑满画面宽度；背景是海平线和阴天的天空，带运动模糊。$LOCK $PILOT $FLY $REAL $SAFE"
$J img N9 --title "N9 · 黄昏逆光悬停" --ref G-v2-side --ref K11 --prompt "生成一张 16:9 横屏超写实电影画面：黄昏，太阳刚刚落到海平线上，Dream 载着驾驶员悬停在海面上方，侧面剪影位于画面中央，太阳在它身后形成温暖的逆光光晕，防滚架和机臂边缘被勾出金色轮廓光，螺旋桨的旋转虚影在逆光中发亮。宁静、壮阔、高级，低饱和的暖橙色调。$LOCK $PILOT $FLY $REAL $SAFE"

$J music M3 --title "M3 · 配乐 预告片式 A" --dur 45 --prompt "Cinematic hybrid trailer score for a high-performance personal aircraft film, 120 BPM, 4/4, instrumental. 0-11 s: dark, minimal tension - low drone, ticking metallic pulses, a heartbeat sub kick, very sparse. 11-12 s: a fast reversed riser. 12 s: a massive low braam hit, then driving modern percussion, pulsing distorted bass and aggressive synth stabs with whoosh accents for a fast-cut flight sequence until 29 s. 29-31 s: sudden near-silence, only a high airy tone. 31-40 s: wide, emotional, uplifting strings and synth pads over a steady pulse. 40 s: one final huge hit, then a long tail to 45 s. Premium, precise, no vocals, no EDM drops, no cheesy cliches."
$J music M4 --title "M4 · 配乐 预告片式 B" --dur 45 --prompt "Dark, sleek, high-end automotive-style trailer music, 118-122 BPM, instrumental. Opens almost silent with a deep sub drone and the sound of a single mechanical tick. Tension builds with ticking hi-hats and filtered pulses. At around 12 seconds a hard impact starts an energetic section: tight electronic drums, heavy pulsing bass, cinematic hits and whooshes, relentless forward motion. Around 29-30 seconds everything cuts to silence for one beat, then a soaring, warm, hopeful finale with big drums and strings. Ends with a single decisive hit near 40 seconds and a reverb tail. Luxury, precision, speed. No vocals."
