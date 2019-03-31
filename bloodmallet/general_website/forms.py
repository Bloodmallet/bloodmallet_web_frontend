# -*- coding: utf-8 -*-
from django import forms
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm, PasswordChangeForm

from general_website.models import User, Simulation, SimulationType, WowSpec

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
        model = User
        fields = ('bloodytext',)

        labels = {
            'bloodytext': 'bloody-announcement',
        }
        help_texts = {
            'bloodytext': "Allow others to see your short message below the title.",
        }


class SimulationCreationForm(forms.ModelForm):

    class Meta:
        model = Simulation
        fields = (
            'name',
            'wow_spec',
            'simulation_type',
            'fight_style',
        )

        # widgets = {
        #     'wow_spec': forms.CheckboxSelectMultiple(),
        # }

    def __init__(self, *args, **kwargs):
        super(SimulationCreationForm, self).__init__(*args, **kwargs)
        self.fields['simulation_type'].queryset = SimulationType.objects.order_by('name')     # pylint: disable=no-member
        self.fields['wow_spec'].queryset = WowSpec.objects.order_by('wow_class__pretty_name', 'pretty_name')     # pylint: disable=no-member
