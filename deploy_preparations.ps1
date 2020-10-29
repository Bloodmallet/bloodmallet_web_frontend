# Save start location
$start_location = pwd

Write-Host "Starting virtual environment" -NoNewline
# Activate virtual env
../env/Scripts/activate
Write-Host "    Done" -ForegroundColor Green

Write-Host "Preparing translations" -NoNewline
# collect and compile translateable texts
$languages = @('zh-hans', 'de', 'es', 'fr', 'it', 'ko', 'pt', 'ru', 'pl')
foreach($language in $languages) {
    python manage.py makemessages --locale=$language -i "env" >$null
    python manage.py compilemessages --locale=$language >$null
}
Write-Host "          Done" -ForegroundColor Green

# Deactivate virtual env
deactivate

# Return to start of script location
cd $start_location
Write-Host "------------------------------------"
Write-Host "Translations are prepared."
