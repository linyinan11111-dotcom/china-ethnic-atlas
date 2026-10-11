$ocrWorkspace=Split-Path -Parent $PSScriptRoot
foreach($batch in 0..89){
 $ocrInput=Join-Path $ocrWorkspace "data/raw/census2020-ocr/scaled-$batch.png"
 $ocrOutput=Join-Path $ocrWorkspace "data/raw/census2020-ocr/scaled-$batch.json"
 & "$PSScriptRoot/ocr-census.ps1" -ImagePath $ocrInput -OutputPath $ocrOutput
}
