# -*- coding: utf-8 -*-

from django.contrib import messages
from django.contrib.auth import authenticate
from django.contrib.auth import login as auth_login
from django.contrib.auth import logout as auth_logout
from django.contrib.auth.decorators import login_required
from django.shortcuts import render, redirect
from general_website.forms import UserLoginForm, SignUpForm

import logging

logger = logging.getLogger(__name__)


def login(request):
    """View to allow users to log in with their inpage account.

    Arguments:
        request {[type]} -- [description]

    Returns:
        form -- login form
    """

    # if login is attempted
    if request.method == 'POST':
        login_form = UserLoginForm(request=request, data=request.POST)
        if login_form.is_valid():
            username = login_form.cleaned_data['username']
            password = login_form.cleaned_data['password']
            user = authenticate(username=username, password=password)
            if user is not None:
                auth_login(request, user)
                # don't display an annoying login message
                # messages.info(request, "Welcome {}".format(username))
                n = 'index'
                # TODO: get query string parameter 'next' which has the actual destination
                return redirect(n)
            else:
                messages.warning(request, "Couldn't log in. Please check your input.")

        else:
            pass
    else:
        login_form = UserLoginForm()
        pass
    return render(request, 'general_website/login.html', {'login_form': login_form})


def logout(request):
    """Logs out the user and returns him to the front page.

    Arguments:
        request {[type]} -- [description]

    Returns:
        [type] -- [description]
    """

    auth_logout(request)
    return redirect('index')


def signup(request):
    """View to create a user account.

    Arguments:
        request {[type]} -- [description]

    Returns:
        [type] -- [description]
    """

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


@login_required
def account(request):
    pass


def settings(request):
    return render(request, 'general_website/settings.html', {})
