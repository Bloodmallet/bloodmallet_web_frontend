from django.shortcuts import render
from django.http import HttpResponse
from django.http.request import HttpRequest

# Create your views here.
def talent_trees(request: HttpRequest) -> HttpResponse:
    template = "general_website/talent_trees.html"
    context = {}
    return render(request, template_name=template, context=context)
