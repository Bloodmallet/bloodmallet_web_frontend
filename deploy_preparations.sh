#!/bin/bash
# Save start location
start_location=`pwd`

echo -n "Starting virtual environment"
# Activate virtual env
. ~/envs/django_bloodmallet/bin/activate
echo -e "    \e[32mDone\e[0m"

echo -n "Preparing translations"
# collect and compile translateable texts
languages=('zh-hans' 'de' 'es' 'fr' 'it' 'ko' 'pt' 'ru' 'pl')
for language in ${languages[@]}; do
    python manage.py makemessages --locale=$language --ignore="env/*" >/dev/null
    python manage.py compilemessages --locale=$language >/dev/null
done
echo -e "          \e[32mDone\e[0m"


# Return to start of script location
cd $start_location
echo "------------------------------------"
echo "Translations are prepared."
