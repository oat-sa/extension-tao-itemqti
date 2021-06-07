# Import Items

Here you can find instructions about import items using TAO platform.

## Configuration
The feature is disabled by default. To enable it, flag `FEATURE_FLAG_TABULAR_IMPORT_ENABLED` should be set to True at the env variables.

## Tabular Import with CSV Template

We currently support only **multiple-choices** questions.

| field | required | qti compliant | allowed values | Default value | existent on tao | Comments |
|---|---|---|---|---|---|---|
| name | yes | yes | String | - | - | Valid QTI string |
| language | - | yes | String | Default setting | - | Valid QTI language |
| shuffle | - | - | 0 or 1 | 0 | - | Whenever or not shuffle choices |
| max_choices | - | - | Numeric 0...N | 0 | - | 0 means unlimited |
| min_choices | - | - | Numeric 0...N | 0 | - | - |
| question | yes | yes | String | - | - | String, including QTI compatible XHTML elements |
| choice_1...choice_N | yes | yes | String | - | - | String, including QTI compatible XHTML elements |
| choice_1_score...choice_N_score | yes | - | Numerical | - | - | MUST be 1 to 1 with the previous field |
| correct_answer | - | - | List of choices | - | List of choices separated by "," |
| metadata_{property_alias} | - | - | - | - | Matching properties based on existent property alias |

### Score setup

How the score is set on the QTI Item based on the import fields.

- *match_correct*: In case there is just one `choice_N_score`, the score will be considered `match_correct`
- *map_response*: In case there is more than one `choice_N_score`.
- *MAXSCORE*:
    - If `max_choices` = 0 (unlimited), it will be the sum of all `choice_N_score` without include negative values.
    - If `max_choices` = 1, it will be the higher `choice_N_score` value.
    - If `max_choices` = 2..N, it will be higher possible sum of `choice_N_score`.

### Examples

- You can see an [example here](./../../templates/import/import.sample.csv).

### Limitations

In the current state of work, following are some limitations:
   - Only choice interactions are supported for CSV 
   - Text property type with one of the following types: Text Short Field, Text Long Box,  Text HTML editor values are supported
   - All metadata properties that define the “alias” attribute only considered