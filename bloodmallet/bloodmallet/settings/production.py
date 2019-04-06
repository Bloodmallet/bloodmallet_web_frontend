# -*- coding: utf-8 -*-

from .common import *     # pylint: disable=unused-wildcard-import

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = False

ALLOWED_HOSTS = ['dev.bloodmallet.com']

# logging
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'default': {
            'format': '%(asctime)s %(levelname)s %(module)s / %(funcName)s - %(message)s',
        }, # "%(asctime)s - %(filename)s / %(funcName)s - %(levelname)s - %(message)s"

    },
    'handlers': {
        # 'file': {
        #     'level': 'DEBUG',
        #     'class': 'logging.FileHandler',
        #     'filename': '', # TODO: add path!
        # },
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
        'general_website': { # add app to logger!
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
import pymysql
pymysql.install_as_MySQLdb()
from .secrets import DB_HOST, DB_NAME, DB_USER, DB_PASSWORD

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'HOST': '/cloudsql/{}'.format(DB_HOST),
        'NAME': DB_NAME,
        'USER': DB_USER,
        'PASSWORD': DB_PASSWORD,
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
from .secrets import LIVE_BUCKET_NAME
GS_BUCKET_NAME = LIVE_BUCKET_NAME
