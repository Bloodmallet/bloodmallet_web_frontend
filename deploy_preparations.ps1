# Save start location
$start_location = pwd

Write-Host "Starting virtual environment" -NoNewline
# Activate virtual env
env/Scripts/activate
Write-Host "    Done" -ForegroundColor Green

# Navigate to necessary subdirectory (which has the actual app for the appengine)
cd bloodmallet/

Write-Host "Preparing translations" -NoNewline
# collect and compile translateable texts
$languages = @('cn', 'de', 'es', 'fr', 'it', 'ko', 'pt', 'ru')
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
