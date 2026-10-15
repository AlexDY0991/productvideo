#!/usr/bin/env bash
# 下载片中用到的字体（Google Fonts，均为 SIL OFL 开源授权）。字体文件较大，不入库。
set -euo pipefail
cd "$(dirname "$0")"
get() { [ -s "$1" ] || curl -sSfL --retry 3 -o "$1" "$2"; }
# 思源宋体（Noto Serif SC）：标题与字幕
get NotoSerifSC-500.ttf https://fonts.gstatic.com/s/notoserifsc/v36/H4cyBXePl9DZ0Xe7gG9cyOj7uK2-n-D2rd4FY7SwqyWv.ttf
get NotoSerifSC-600.ttf https://fonts.gstatic.com/s/notoserifsc/v36/H4cyBXePl9DZ0Xe7gG9cyOj7uK2-n-D2rd4FY7RcrCWv.ttf
get NotoSerifSC-900.ttf https://fonts.gstatic.com/s/notoserifsc/v36/H4cyBXePl9DZ0Xe7gG9cyOj7uK2-n-D2rd4FY7QrrCWv.ttf
# 马善政楷书（Ma Shan Zheng）：“拱”“宸”大字与印章
get MaShanZheng-400.ttf https://fonts.gstatic.com/s/mashanzheng/v18/NaPecZTRCLxvwo41b4gvzkXaRMQ.ttf
echo "fonts ok"
