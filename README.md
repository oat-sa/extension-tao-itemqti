extension-tao-itemqti
=====================


extension to create QTI items for TAO

## How to import items

- [Importing items](./model/import/README.md)

## Environment Variables

### QTI Identifier Validator Pattern - `ENV_QTI_IDENTIFIER_VALIDATOR_PATTERN`

QTI Item identifiers by default are normalized strings that accepts everything in the pattern
`/^[a-zA-Z_][a-zA-Z0-9_\\.-]*$/u`. If for some reason you want to change this behavior, it's 
possible by using the environment variable `ENV_QTI_IDENTIFIER_VALIDATOR_PATTERN`
with a different pattern. Example:

```shell script
# Do not accept dots on the QTI Item identifier
ENV_QTI_IDENTIFIER_VALIDATOR_PATTERN='/^[a-zA-Z_][a-zA-Z0-9_-]*$/u'
```
This would mean that case the user tries to save or import an item with an identifier with dots, this would return an 
error:

<img width="1531" alt="Error Provided by ENV_QTI_IDENTIFIER_VALIDATOR_PATTERN environment variable" src="https://user-images.githubusercontent.com/11900046/151950352-ddffff4c-d402-4737-98b2-7ec60bb4a9a6.png">


After that, please always run `taoUpdate` to make sure that all the configurations were successfully applied.

```shell script
cd /path/to/tao/app

php tao/scripts/taoUpdate.php
```
