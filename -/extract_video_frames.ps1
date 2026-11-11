Add-Type -AssemblyName PresentationCore
Add-Type -AssemblyName PresentationFramework
Add-Type -AssemblyName WindowsBase

$video = 'C:\Users\TIMING.KZ\Downloads\WhatsApp Video 2026-11-10 at 18.59.58.mp4'
$output = (Get-Location).Path + '\video-frame.png'
$player = New-Object System.Windows.Media.MediaPlayer
$player.Open([Uri]$video)

$frame = New-Object System.Windows.Threading.DispatcherFrame
$timer = New-Object System.Windows.Threading.DispatcherTimer
$ticks = 0
$timer.Interval = [TimeSpan]::FromMilliseconds(100)
$timer.add_Tick({
  $script:ticks++
  if ($player.NaturalVideoWidth -gt 0 -or $script:ticks -ge 50) {
    $timer.Stop()
    $frame.Continue = $false
  }
})
$timer.Start()
[System.Windows.Threading.Dispatcher]::PushFrame($frame)

if ($player.NaturalVideoWidth -eq 0) { throw 'Could not decode the video' }
$duration = $player.NaturalDuration.TimeSpan
Write-Output "Duration: $duration"
$width = $player.NaturalVideoWidth
$height = $player.NaturalVideoHeight
$player.Play()
Start-Sleep -Milliseconds 600
$player.Pause()

$visual = New-Object System.Windows.Media.DrawingVisual
$context = $visual.RenderOpen()
$videoDrawing = New-Object System.Windows.Media.VideoDrawing
$videoDrawing.Player = $player
$videoDrawing.Rect = New-Object System.Windows.Rect(0, 0, $width, $height)
$context.DrawDrawing($videoDrawing)
$context.Close()
$bitmap = New-Object System.Windows.Media.Imaging.RenderTargetBitmap($width, $height, 96, 96, [System.Windows.Media.PixelFormats]::Pbgra32)
$bitmap.Render($visual)
$encoder = New-Object System.Windows.Media.Imaging.PngBitmapEncoder
$encoder.Frames.Add([System.Windows.Media.Imaging.BitmapFrame]::Create($bitmap))
$stream = [System.IO.File]::OpenWrite($output)
$encoder.Save($stream)
$stream.Dispose()
Write-Output "$width x $height"
