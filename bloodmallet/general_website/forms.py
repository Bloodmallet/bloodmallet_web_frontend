# -*- coding: utf-8 -*-
from django import forms
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm, PasswordChangeForm
from django.contrib.auth.models import User

from general_website.models import Profile

# class UserLoginForm(forms.ModelForm):
#     class Meta:
#         model = User
#         fields = (
#             'email',
#             'password'
#         )
#         widgets = {
#             'password': forms.PasswordInput(),
#         }
#         help_texts = {
#         #     'email': "Enter Email here...",
#         #     'password': "Enter Password here...",
#         }

#     def __init__(self, *args, **kwargs):
#         super(UserLoginForm, self).__init__(*args, **kwargs)
#         self.fields['email'].required = True


class SignUpForm(UserCreationForm):
    email = forms.EmailField(max_length=254, help_text='Required. 254 characters or fewer.')

    class Meta:
        model = User
        fields = (
            'username',
            'email',
            'password1',
            'password2',
        )


class UserLoginForm(AuthenticationForm):
    pass


class UserUpdateForm(PasswordChangeForm):
    """Settings form for the user to update his own profile.
    """
    pass


class ProfileUpdateForm(forms.ModelForm):

    class Meta:
        model = Profile
        fields = ('bloodyfiller',)

        help_texts = {
            'bloodyfiller': "Allow others to see your short message in the title. \"Bloody( [Bloodyfiller] )\"",
        }
