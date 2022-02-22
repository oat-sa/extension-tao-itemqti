extension-tao-itemqti
=====================


extension to create QTI items for TAO

## How to import items

- [Importing items](./model/import/README.md)

## Environment Variables

### QTI Identifier Validator Pattern - `ENV_QTI_IDENTIFIER_VALIDATOR_PATTERN`

QTI Item identifiers by default are normalized strings that accepts everything in the pattern
`/^[a-zA-Z_]{1}[a-zA-Z0-9_\.-]*$/u`. If for some reason you want to change this behavior, it's 
possible by using the environment variable `ENV_QTI_IDENTIFIER_VALIDATOR_PATTERN`
with a different pattern. Example:

```shell script
# Do not accept dots on the QTI Item identifier
ENV_QTI_IDENTIFIER_VALIDATOR_PATTERN='/^[a-zA-Z_]{1}[a-zA-Z0-9_-]*$/u'
```
This would mean that case the user tries to save or import an item with an identifier with dots, this would return an 
error:


![Error Provided by ENV_QTI_IDENTIFIER_VALIDATOR_PATTERN environment variable](https://user-images.githubusercontent.com/11900046/151952020-e6ed4ff3-a499-4aa9-bd3e-d2bc81a83bd8.jpg)


After that, please always run `taoUpdate` to make sure that all the configurations were successfully applied.

```shell script
cd /path/to/tao/app

php tao/scripts/taoUpdate.php
```
