# Import Items

Here you can find instructions about import items using TAO platform.

## Tabular Import with CSV Template

We currently support only **multiple-choices** questions.

| field | required | qti compliant | allowed values | Default value | existent on tao | Comments |
|---|---|---|---|---|---|---|
| name | yes | yes | String | - | - | Valid QTI string |
| language | no | yes | String | Default setting | - | Valid QTI language |
| shuffle | no | - | 0 or 1 | 0 | - | Whenever or not shuffle choices |
| max_choices | no | - | Numeric 0...N | 0 | - | - |
| min_choices | no | - | Numeric 0...N | 0 | - | - |
| question | yes | yes | String | - | - | String, including QTI compatible XHTML elements |
| choice_1...choice_N | yes | yes | String | - | - | String, including QTI compatible XHTML elements |
| choice_1_score...choice_N_score | yes | - | Numerical | - | - | MUST be 1 to 1 with the previous field |
| correct_answer | no | - | List of choices | - | List of choices separated by "/" |
| metadata_{property_alias} | no | - | - | - | Matching properties based on existent property alias |

### Links

- You can see an [example here](./../../../templates/import/import.sample.csv).
- You can download the [template here](./../../../templates/import/import.template.xml).
