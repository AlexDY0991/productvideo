# 安装剪映草稿：把草稿里的素材路径换成本素材包在这台电脑上的实际位置，再复制到剪映的草稿目录。
# 素材包整个文件夹以后不要再移动；移动了就重新运行一次 install-draft.bat。
$ErrorActionPreference = 'Stop'
try {
  $root = Split-Path -Parent $PSScriptRoot
  $source = Join-Path $root 'draft'
  $default = Join-Path $env:LOCALAPPDATA 'JianyingPro\User Data\Projects\com.lveditor.draft'
  Write-Host ''
  Write-Host '素材包位置：' $root
  Write-Host '剪映的草稿位置可以在剪映「全局设置 → 草稿位置」里看到。'
  if (Test-Path $default) {
    Write-Host '检测到默认草稿位置：' $default
    $answer = Read-Host '直接按回车使用这个位置；如果你改过草稿位置，请把路径粘贴进来再回车'
  } else {
    $answer = Read-Host '请把剪映「全局设置 → 草稿位置」里的路径粘贴进来，再按回车'
  }
  $target = if ([string]::IsNullOrWhiteSpace($answer)) { $default } else { $answer.Trim().Trim('"') }
  if (-not (Test-Path $target)) { throw "找不到草稿位置：$target" }

  $utf8 = New-Object System.Text.UTF8Encoding($false)
  $escaped = $root.Replace('\', '\\')
  foreach ($draft in Get-ChildItem $source -Directory) {
    $dest = Join-Path $target $draft.Name
    if (Test-Path $dest) {
      $ok = Read-Host "剪映里已经有同名草稿「$($draft.Name)」，要覆盖吗？输入 y 覆盖"
      if ($ok -ne 'y') { Write-Host '已跳过：' $draft.Name; continue }
      Remove-Item $dest -Recurse -Force
    }
    Copy-Item $draft.FullName $dest -Recurse
    $file = Join-Path $dest 'draft_content.json'
    $json = [IO.File]::ReadAllText($file, $utf8).Replace('__COOLFLY_ROOT__', $escaped)
    [IO.File]::WriteAllText($file, $json, $utf8)
    Write-Host '已安装草稿：' $dest
  }
  Write-Host ''
  Write-Host '完成。请重启剪映（或回到首页再进），在草稿列表里打开。'
} catch {
  Write-Host ''
  Write-Host '安装失败：' $_.Exception.Message -ForegroundColor Red
}
Read-Host '按回车关闭'
