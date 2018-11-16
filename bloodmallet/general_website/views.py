from django.contrib import messages
from django.shortcuts import render, redirect
from .forms import UserLoginForm, SignUpForm

import logging

logger = logging.getLogger(__name__)


def error(request, code: int=404, message: str="Page not found"):
    error = {
        'error': {
            'code': code,
            'text': message
        }
    }
    return render(request, 'general_website/error.html', error, status=code)


# define custom error pages
def handler404(request, exception, template_name='general_website/error.html'):
    return error(request, 404, "Page not found")


def handler500(request, exception, template_name='general_website/error.html'):
    return error(request, 500, "Something went wrong. Try again later")


def index(request):
    return render(request, 'general_website/index.html', {'text': "Sir!"})


def login(request):
    if request.method == 'POST':
        login_form = UserLoginForm(request.POST)
        if login_form.is_valid():
            email = login_form.cleaned_data["email"]
            password = login_form.cleaned_data["password"]
            logger.info(f'Login attempt of email: {email} password: {password}')
            login_form.add_error('email', "Whatever dude!")
            return render(request, 'general_website/login.html', {'login_form': login_form})
        else:
            logger.info("Form was somehow not valid")
    else:
        messages.info(request, 'Page was loaded (no shit, sherlock)')
        pass
    login_form = UserLoginForm()
    return render(request, 'general_website/login.html', {'login_form': login_form})


def signup(request):
    if request.method == 'POST':
        logger.info('Someone tried to sign up!')
        signup_form = SignUpForm(request.POST)
        if signup_form.is_valid():
            logger.info("Trying to save the user form")
            signup_form.save()
            messages.success(request, "Account was created. Please confirm your Email address.")
            return redirect('index')
    else:
        signup_form = SignUpForm()
    return render(request, 'general_website/signup.html', {'signup_form': signup_form})
