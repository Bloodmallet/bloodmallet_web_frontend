from django import template

register = template.Library()

@register.filter
def replace_underscore_with_space(value):
    while "_" in value:
        value = value.replace("_", " ")
    return value
