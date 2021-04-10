Write-Host "Deploying to bloodmallet.com"

# Save start location
$start_location = pwd

Write-Host "Starting virtual environment" -NoNewline

# Activate virtual env (here could be a list search that looks for env, venv and .env instead)
./env/Scripts/activate
Write-Host "    Done" -ForegroundColor Green

Write-Host "Preparing Styles" -NoNewline
# Create fresh css files
python manage.py compilescss >$null
Write-Host "                Done" -ForegroundColor Green


Write-Host "Preparing static files" -NoNewline
# Collect fresh css files
python manage.py collectstatic --clear --noinput --ignore=*.scss --ignore=*.po --ignore=*.zip >$null
Write-Host "          Done" -ForegroundColor Green

# Deploy
gcloud app deploy --no-promote --quiet

gcloud app deploy cron.yaml --quiet

Write-Host "Cleaning up" -NoNewline
# remove compiled css files
python manage.py compilescss --delete-files >$null

# Delete created "static" directory
rm -r -Force .\static\ >$null

# Deactivate virtual env
deactivate

# Return to start of script location
cd $start_location
Write-Host "                     Done" -ForegroundColor Green
Write-Host "------------------------------------"
Write-Host "Deployment successful"
