import os

if os.getenv('GAE_APPLICATION', None):
    from .production import *
else:
    from .development import *
