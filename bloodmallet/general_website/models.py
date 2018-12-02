from django.db import models
from django.dispatch import receiver
from django.contrib.auth.signals import user_logged_in
from allauth.socialaccount.signals import pre_social_login, social_account_updated


# Create your models here.

@receiver([pre_social_login, social_account_updated])
def update_pledge_level(sender, sociallogin, **kwargs):
    """Checks kwargs for pledge level in account data.

    Arguments:
        sender {[type]} -- [description]
        sociallogin {[type]} -- [description]
    """

    print(sender)
    print(sociallogin)
    try:
        print(sociallogin.account) # read social allauth models.py
    except Exception:
        print("No social.account could be found yet. Probably linking in progress.")

#https://stackoverflow.com/questions/40684838/django-django-allauth-save-extra-data-from-social-login-in-signal

@receiver(user_logged_in)
def update_user_information(sender, request, user, **kwargs):
    """Login triggers a check for the patreon level.

    Arguments:
        sender {django.contrib.auth.models.User} -- [description]
        request {} -- [description]
        user {User} -- User model data blop
    """

    print("User logged in!")
    print(sender)
    print(request)
    print(user)
    print(user.email)
# https://docs.patreon.com/#fetching-a-patron-39-s-profile-info
