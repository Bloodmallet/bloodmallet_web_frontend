# -*- coding: utf-8 -*-
import os

from .common import *  # pylint: disable=unused-wildcard-import

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = [
    "localhost",
    "127.0.0.1",
]

# logging
LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "default": {
            "format": "%(asctime)s %(levelname)s %(module)s / %(funcName)s:%(lineno)d - %(message)s",
        },  # "%(asctime)s - %(filename)s / %(funcName)s - %(levelname)s - %(message)s"
    },
    "handlers": {
        "file": {
            "level": "DEBUG",
            "class": "logging.FileHandler",
            "formatter": "default",
            "filename": os.path.join(BASE_DIR, "debug.log"),
        },
        "console": {
            "level": "DEBUG" if DEBUG else "INFO",
            "class": "logging.StreamHandler",
            "formatter": "default",
        },
    },
    "loggers": {
        "django": {
            "handlers": [
                # 'console',
                "file",
            ],
            "level": "DEBUG",
            "propagate": True,
        },
        "general_website": {  # add app to logger!
            "handlers": ["console", "file"],
            "level": "DEBUG" if DEBUG else "INFO",
            "propagate": True,
        },
        "compute_api": {  # add app to logger!
            "handlers": ["console", "file"],
            "level": "DEBUG" if DEBUG else "INFO",
            "propagate": True,
        },
    },
}

# don't send mails...print them to console
EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"

# Database
# https://docs.djangoproject.com/en/2.1/ref/settings/#databases
try:
    from bloodmallet.settings.secrets.secrets import (
        DEV_DB_HOST,
        DEV_DB_NAME,
        DEV_DB_USER,
        DEV_DB_PASSWORD,
    )
except ModuleNotFoundError:
    # pure frontend development uses a local dbs
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": "db.sqlite3",
        }
    }
else:
    import pymysql

    # ! hacky way to enable pymysql for dev
    pymysql.version_info = (1, 4, 6, "final", 0)
    pymysql.install_as_MySQLdb()

    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.mysql",
            "HOST": "127.0.0.1",
            "PORT": "3306",
            "NAME": DEV_DB_NAME,
            "USER": DEV_DB_USER,
            "PASSWORD": DEV_DB_PASSWORD,
            "OPTIONS": {"charset": "utf8mb4"},
        }
    }

# used to serve files from this path in non-debug production
STATIC_ROOT = "static"

# SASS settings
SASS_PRECISION = 8
SASS_PROCESSOR_ROOT = STATIC_ROOT

# google cloud storage
try:
    from bloodmallet.settings.secrets.secrets import DEV_BUCKET_NAME, DEV_CREDENTIALS
except ModuleNotFoundError:
    # not required for local dev
    pass
else:
    GS_BUCKET_NAME = DEV_BUCKET_NAME
    from google.oauth2 import service_account

    GS_CREDENTIALS = service_account.Credentials.from_service_account_file(
        DEV_CREDENTIALS
    )


# add development tools
# INSTALLED_APPS.append("debug_toolbar")
# MIDDLEWARE.append("debug_toolbar.middleware.DebugToolbarMiddleware")
INTERNAL_IPS = ["127.0.0.1"]
