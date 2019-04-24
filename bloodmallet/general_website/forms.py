# -*- coding: utf-8 -*-
from django import forms
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm, PasswordChangeForm
from django.utils.translation import gettext_lazy as _

from general_website.models import User, Simulation, SimulationType, WowSpec

from crispy_forms.helper import FormHelper
from crispy_forms.layout import Layout, Field, Div
from crispy_forms.bootstrap import FieldWithButtons, StrictButton


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
            'custom_profile',
        )

        # widgets = {
        #     'wow_spec': forms.CheckboxSelectMultiple(),
        # }

    def __init__(self, *args, **kwargs):
        super(SimulationCreationForm, self).__init__(*args, **kwargs)
        self.fields['simulation_type'].queryset = SimulationType.objects.order_by('name')     # pylint: disable=no-member
        self.fields['wow_spec'].queryset = WowSpec.objects.order_by('wow_class__pretty_name', 'pretty_name')     # pylint: disable=no-member

        self.helper = FormHelper()
        self.helper.layout = Layout(
            Div(
                Div(Field('name'), css_class='col-12 col-md-6'),
                Div(Field('wow_spec'), css_class='col-12 col-md-6'),
                css_class='row'
            ),
            Div(
                Div(Field('simulation_type'), css_class='col-12 col-md-6'),
                Div(Field('fight_style'), css_class='col-12 col-md-6'),
                css_class='row'
            ),
            Div(Div(Field('custom_profile'), css_class='col-12'), css_class='row'),
            StrictButton(_("Create Chart"), css_class="btn btn-primary")
        )
