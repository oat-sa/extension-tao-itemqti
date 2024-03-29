# Import Items

Here you can find instructions about import items using TAO platform.

## Configuration
The feature is disabled by default. It can be enabled by the feature flag `FEATURE_FLAG_TABULAR_IMPORT_ENABLED`.

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

- *match_correct*: In case there are empty `choice_N_score` and `correct_answer` is provided.
- *map_response*: In case there is more than one `choice_N_score`.
- *none*: In case there is only empty `choice_N_score` fields and no `correct_answer`.
- *MAXSCORE*:
    - If `max_choices` = 0 (unlimited), it will be the sum of all `choice_N_score` without include negative values.
    - If `max_choices` = 1, it will be the higher `choice_N_score` value.
    - If `max_choices` = 2..N, it will be higher possible sum of `choice_N_score`.

### Examples

- You can see an [example here](./../../templates/import/import.sample.csv).

### Limitations

- Only single/multiple choice interactions are supported.
- Only those types of metadata are supported: 
    - Text Short Field
    - Text Long Box
    - Text HTML editor
- Only metadata properties with the attribute “alias” will be considered.