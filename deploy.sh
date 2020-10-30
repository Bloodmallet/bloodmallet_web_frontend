#!/bin/bash
echo "Deploying to bloodmallet.com"

# Save start location
start_location=`pwd`

echo -n "Starting virtual environment"
# Activate virtual env (here could be a list search that looks for env, venv and .env instead)
. ./env/bin/activate
echo -e "    \e[32mDone\e[0m"

echo -n "Preparing Styles"
# Create fresh css files
python manage.py compilescss >/dev/null
echo -e "                \e[32mDone\e[0m"


echo -n "Preparing static files"
# Collect fresh css files
python manage.py collectstatic --clear --noinput --ignore=*.scss --ignore=*.po --ignore=*.zip >/dev/null
echo -e "          \e[32mDone\e[0m"

# Deploy
gcloud app deploy --no-promote --quiet

gcloud app deploy cron.yaml

echo -n "Cleaning up"
# remove compiled css files
python manage.py compilescss --delete-files >/dev/null

# Delete created "static" directory
rm -rf static/

# Return to start of script location
cd $start_location
echo -e "                     \e[32mDone\e[0m"
echo "------------------------------------"
echo "Deployment successful"
