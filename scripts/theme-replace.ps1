$files = Get-ChildItem -Recurse -Include '*.tsx' -Path 'src'

foreach ($file in $files) {
  $content = Get-Content $file.FullName -Raw
  if ($content.Contains('border-blue-600')) {
    $content = $content.Replace('border-blue-600', 'border-accent-bold')
    [System.IO.File]::WriteAllText($file.FullName, $content)
    Write-Host "Fixed spinner in: $($file.Name)"
  }
}
Write-Host 'Done.'
