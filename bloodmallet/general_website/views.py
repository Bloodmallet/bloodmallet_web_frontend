from django.shortcuts import render
from .forms import NameForm


def index(request):
    return render(request, "general_website/default.html", {'text': "Sir!", 'form': NameForm()})
