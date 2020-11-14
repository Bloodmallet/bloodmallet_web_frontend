# -*- coding: utf-8 -*-

from bloodmallet.settings.secrets.secrets import LIVE_BUCKET_NAME
from bloodmallet.settings.secrets.secrets import LIVE_DB_HOST, LIVE_DB_NAME, LIVE_DB_USER, LIVE_DB_PASSWORD
import pymysql
from .common import *     # pylint: disable=unused-wildcard-import

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = False

ALLOWED_HOSTS = [
    '.appspot.com',
    '.bloodmallet.com',
    'bloodmallet.com',
]

# logging
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'default': {
            'format': '%(asctime)s %(levelname)s %(module)s / %(funcName)s - %(message)s',
        },  # "%(asctime)s - %(filename)s / %(funcName)s - %(levelname)s - %(message)s"

    },
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': 'default',
            'level': 'DEBUG' if DEBUG else 'INFO'
        },
    },
    'loggers': {
        'django': {
            'handlers': [
                # 'file'
            ],
            'level': 'DEBUG',
            'propagate': True,
        },
        'general_website': {  # add app to logger!
            'handlers': [
                'console',
                # 'file'
            ],
            'level': 'DEBUG' if DEBUG else 'INFO',
            'propagate': True,
        },
        'compute_api': {  # add app to logger!
            'handlers': [
                'console',
                # 'file'
            ],
            'level': 'DEBUG' if DEBUG else 'INFO',
            'propagate': True,
        }
    },
}

# Database
# https://docs.djangoproject.com/en/2.1/ref/settings/#databases
# ! hacky way to enable pymysql for dev
pymysql.version_info = (1, 4, 6, 'final', 0)
pymysql.install_as_MySQLdb()

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'HOST': '/cloudsql/{}'.format(LIVE_DB_HOST),
        'NAME': LIVE_DB_NAME,
        'USER': LIVE_DB_USER,
        'PASSWORD': LIVE_DB_PASSWORD,
        'OPTIONS': {
            'charset': 'utf8mb4'
        },
    }
}

# used to serve files from this path in non-debug production
STATIC_ROOT = 'static'

# SASS settings
SASS_PRECISION = 8
SASS_PROCESSOR_ROOT = STATIC_ROOT
# SASS_PROCESSOR_INCLUDE_FILE_PATTERN = r'^.+\.scss$'
SASS_PROCESSOR_ENABLED = False

# google cloud storage
GS_BUCKET_NAME = LIVE_BUCKET_NAME

# redirect loop
# SECURE_SSL_REDIRECT = True
SECURE_HSTS_SECONDS = 3600
# SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')



EMAIL_BACKEND = "anymail.backends.mailjet.EmailBackend"
from bloodmallet.settings.secrets.secrets import MAILJET_API_KEY, MAILJET_SECRET_KEY
ANYMAIL = {
    "MAILJET_API_KEY": MAILJET_API_KEY,
    "MAILJET_SECRET_KEY": MAILJET_SECRET_KEY,
}

DEFAULT_FROM_EMAIL = "info@bloodmallet.com"
SERVER_EMAIL = "info@bloodmallet.com"
