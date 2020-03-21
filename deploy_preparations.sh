#!/bin/bash
# Save start location
start_location=`pwd`

echo -n "Starting virtual environment"
# Activate virtual env
. ./env/bin/activate
echo -e "    \e[32mDone\e[0m"

echo -n "Preparing translations"
# collect and compile translateable texts
languages=('cn' 'de' 'es' 'fr' 'it' 'ko' 'pt' 'ru')
for language in ${languages[@]}; do
    python manage.py makemessages --locale=$language -i "env" >/dev/null
    python manage.py compilemessages --locale=$language >/dev/null
done
echo -e "          \e[32mDone\e[0m"


# Return to start of script location
cd $start_location
echo "------------------------------------"
echo "Translations are prepared."
