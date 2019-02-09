import os

from .common import *

if os.getenv('GAE_APPLICATION', None):
  from .production import *
else:
  from .development import *

# secrets
try:
  from .secrets import *
except:
  pass
try:
  from .secrets import SECRET_KEY
except:
  pass
