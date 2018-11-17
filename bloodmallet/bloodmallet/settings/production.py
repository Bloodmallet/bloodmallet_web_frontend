
from .common import *

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = False

ALLOWED_HOSTS = []

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
        'file': {
            'level': 'DEBUG',
            'class': 'logging.FileHandler',
            'filename': 'D:/Programme/bloodmallet2/debug.log',
        },
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': 'default',
            'level': 'DEBUG' if DEBUG else 'INFO'
        },
    },
    'loggers': {
        'django': {
            'handlers': ['file'],
            'level': 'DEBUG',
            'propagate': True,
        },
        'general_website': { # add app to logger!
            'handlers': ['console', 'file'],
            'level': 'DEBUG' if DEBUG else 'INFO',
            'propagate': True,
        }
    },
}


# Database
# https://docs.djangoproject.com/en/2.1/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': os.path.join(BASE_DIR, 'db.sqlite3'),
    }
}
