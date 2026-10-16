#!/usr/bin/env bash
# DREAM Anatomy · batch 2: seven 4 s Seedance 2.5 1080p clips from approved keyframes. Saves nodes only.
set -euo pipefail
cd "$(dirname "$0")/../.."
J="python3 tools/jm.py film02/jimeng-state.json"
LOCK="【产品身份锁定】画面中唯一的产品是首帧中的同一台 CoolFly Dream 单人电动飞行器：橙色整流罩带两道白色竖条纹和「05」号码，深灰色钢管防滚架，白色座椅，四根碳纤维机臂，每根机臂末端上下各一组黑色电机和两叶碳纤维螺旋桨。全程不增加或减少机臂、电机、螺旋桨，不改变比例和涂装，不变形，不出现第二台飞行器，不出现任何文字、字幕或水印。"
CLEAN="不出现突然亮起的灯光、光斑、镜头光晕或闪烁，曝光全程稳定。"
MOVE="运镜：长缓入、稳定滑行、精准减速，有真实的重量感，禁止轻飘感、抖动和变焦跳变。"
STUDIO_FLY="驾驶员全程坐在座椅上不动，头盔面罩遮住脸。"

$J vid V5 --title "V5 video · S1 桨叶开场" --first K5 --dur 4 --prompt "$LOCK 以首帧为起点，全程一个连续镜头：镜头以 100mm 沿桨叶方向极其缓慢地横移约 5%，一条柔和的顶光沿碳纤维桨叶表面从根部滑向桨尖，编织纹理随光线逐渐显现。产品静止，螺旋桨不转。$MOVE $CLEAN"
$J vid V3 --title "V3 video · S2 光带扫过侧面" --first K2 --dur 4 --prompt "$LOCK 以首帧为起点，镜头几乎锁定，只极轻微地向右平移。一条狭长的白色光带从画面左侧缓慢扫向右侧，依次照亮防滚架钢管、整流罩上沿和机臂，光带经过后的部分重新暗下去，只留下细窄的轮廓高光。产品静止，螺旋桨不转。$MOVE $CLEAN"
$J vid V9 --title "V9 video · S6 沿机臂推进" --first K9 --dur 4 --prompt "$LOCK 以首帧为起点，全程一个连续镜头：摄影机贴着碳纤维机臂，沿机臂方向平稳地向前推进约 15%，靠近画面中央的飞行器机身；机臂编织纹理在前景缓慢滑过，单点透视保持不变。产品静止，螺旋桨不转。$MOVE $CLEAN"
$J vid V10 --title "V10 video · S11 水面起飞" --first K10 --dur 4 --prompt "$LOCK $STUDIO_FLY 以首帧为起点：0.0–1.0 秒螺旋桨加速成半透明虚影，水面开始出现细密波纹；1.0–4.0 秒飞行器垂直、平稳地离开水面上升约 1.5 米，强劲下洗气流把水面吹出一圈圈向外扩散的同心涟漪和细小水雾。镜头低机位锁定，随飞行器上升轻微上摇。纯黑影棚，水面倒影随涟漪破碎。$MOVE $CLEAN"
$J vid V4b --title "V4b video · S14 崖边悬停起飞" --first K4b --dur 4 --prompt "$LOCK $STUDIO_FLY 以首帧为起点：飞行器在悬崖边缘上方平稳悬停，螺旋桨呈半透明旋转虚影；1.0 秒后缓慢向前、向右上方飞离悬崖，越过海面；镜头保持在原位，以平稳的摇镜跟随飞行器。清晨阴天的银灰色柔光，海浪在下方拍打礁石。$MOVE $CLEAN"
$J vid V11 --title "V11 video · S15 海岸跟飞" --first K11 --dur 4 --prompt "$LOCK $STUDIO_FLY 以首帧为起点：飞行器沿海岸线平稳地向画面右侧飞行，螺旋桨呈半透明旋转虚影；摄影机以长焦与飞行器同速平行跟拍，飞行器在画面中的位置基本不变，背景的悬崖、浪花和远处灯塔以视差缓慢向左后方移动。阴天银灰色柔光，低饱和。$MOVE $CLEAN"
$J vid V12 --title "V12 video · S16 低空掠海" --first K12 --dur 4 --prompt "$LOCK $STUDIO_FLY 以首帧为起点：飞行器在海面上方平稳向前飞行，螺旋桨呈半透明旋转虚影，下洗气流在海面上吹出一道浅浅的涟漪尾迹；摄影机从侧后方以同速追拍，缓慢靠近约 10%。远处海岸线和薄雾以视差移动。阴天柔光，低饱和。$MOVE $CLEAN"
