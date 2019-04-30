# bloodmallet.com frontend
> You're seeing the code that runs the frontend of bloodmallet.com.

Everyone is welcome to add issues, discuss improvements and features, or create
pull requests.

## Development setup

1. Get or have [Python 3.6+](https://www.python.org/downloads/) (make sure to install it into PATH on windows)
2. Create a [virtual environment](https://docs.python.org/3/tutorial/venv.html)
    - `python3 -m venv env` (creates a directory "env")
    - activate virtual environment
        - `env/Scripts/activate` (windows)
        - `source env/bin/activate` (linux)
3. Get or have [git](https://git-scm.com/downloads) installed
4. Download this repository
    - `git clone https://github.com/Bloodmallet/bloodmallet_web_frontend.git bloodmallet` (creates a directory "bloodmallet")
5. Install requirements
    - `cd bloodmallet` (navigate into the created directory)
    - `python -m pip install --upgrade pip setuptools wheel` (update all basic tools)
    - `(env)bloodmallet/$ pip install -U -r requirements.txt` (install the actual requirements, have a look at the *_dev.txt file, too)
6. Create local database and tables
    - `(env)bloodmallet/$ cd bloodmallet` (so you're in "bloodmallet/bloodmallet/")
    - `(env)bloodmallet/bloodmallet/$ python manage.py migrate`
7. Start local django development server
    - `(env)bloodmallet/bloodmallet/$ python manage.py runserver`
8. Open `http://127.0.0.1:8000` in your browser of choice. And code away! :tada:

### Optional:
Maybe you want to [create a superuser](https://docs.djangoproject.com/en/2.2/intro/tutorial02/#creating-an-admin-user) for local development.
