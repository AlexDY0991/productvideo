#!/bin/bash
# 用途: 从视频里均匀抽 n 帧，拼成每行 4 张的网格图，方便快速查看整条视频。
# usage: vframes.sh video.mp4 out.jpg [n]
v=$1; out=$2; n=${3:-8}
d=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$v")
tmp=$(mktemp -d)
for i in $(seq 0 $((n-1))); do t=$(python3 -c "print($d*($i+0.5)/$n)"); ffmpeg -v error -ss $t -i "$v" -frames:v 1 -vf scale=640:-2 -y $tmp/f$i.jpg; done
ffmpeg -v error -i $tmp/f%d.jpg -vf tile=4x$(( (n+3)/4 )) -frames:v 1 -y "$out"
echo "$v dur=$d $(ffprobe -v error -select_streams v -show_entries stream=width,height -of csv=p=0 $v)"
rm -rf $tmp
