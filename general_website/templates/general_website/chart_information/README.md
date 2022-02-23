# Adding information to /chart

`.html` files found in subdirectories of this location are used to show additional information at the `/chart` endpoint.

Examples:
- a disclaimer about a class
- a link to a spec specific TC resource
- how the chart works, what is assumed, what is enforced

## simulation_type/
- file path schema: `./simulation_type/<fightstylename>.html`
- <fightstylename> must be lower case.
- file path example: `./simulation_type/castingpatchwerk.html`
- explanations how this chart works, how the profiles are created, what assumptions were made on creation

## wow_class/
- file path schema: `./wow_class/<class_name>.html`
- <class_name> must be lower case using underscores instead of spaces.
- file path example: `./wow_class/death_knight.html`

## wow_spec/
- file path schema: `./wow_spec/<class_name>_<spec_name>.html`
- <class_name> must be lower case using underscores instead of spaces.
- <spec_name> must be lower case using underscores instead of spaces.
- file path example: `./wow_spec/hunter_beast_mastery.html`

## Styling
You can use `html` and `css` to style your information.
The website uses [Bootstrap v4.4](https://getbootstrap.com/docs/4.4/getting-started/introduction/).
Feel free to use it too. The technology for the backend and therefore the html files are [Django templates](https://docs.djangoproject.com/en/4.0/topics/templates/).
