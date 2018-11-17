
# from .production import *
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
