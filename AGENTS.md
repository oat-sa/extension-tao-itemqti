## Cursor Cloud specific instructions

This is a TAO platform extension (`extension-tao-itemqti` / `taoQtiItem`) for creating and managing QTI assessment items. It is **not a standalone application** — it runs as part of the [TAO](https://www.taotesting.com) platform ecosystem.

### Project structure

- **PHP backend**: Controllers, models, services under `controller/`, `model/`, `helpers/`, `scripts/`
- **JavaScript frontend**: AMD/RequireJS modules under `views/js/`
- **PHP tests**: `test/unit/` (PHPUnit unit tests), `test/integration/` (integration tests requiring TAO platform)
- **Frontend E2E tests**: `views/cypress/tests/` (Cypress, requires a running TAO instance)
- **Frontend JS test fixtures**: `views/js/test/` (QUnit-style, run via Grunt)

### Running PHP unit tests

```bash
cd /workspace
./vendor/bin/phpunit --bootstrap generis/test/bootstrap.php test/unit/ --no-configuration
```

To run a specific test file or directory:

```bash
./vendor/bin/phpunit --bootstrap generis/test/bootstrap.php test/unit/model/qti/ImportServiceTest.php --no-configuration
```

The integration tests (`test/integration/`) require a fully installed TAO platform with database and are not runnable in this environment.

### Running JavaScript linting

The JS linting tools live in `tao/views/build/`. A symlink `taoQtiItem -> /workspace` is needed so the Grunt tasks can locate the extension by name.

```bash
ln -sf /workspace /workspace/taoQtiItem
cd /workspace/tao/views/build
npx grunt eslint:extension --extension=taoQtiItem --no-color --force
```

### Key caveats

- The `composer.json` does not include `phpunit` in `require-dev`; it must be installed separately (`composer require --dev phpunit/phpunit:"^10.0"`). The CI action `oat-sa/tao-extension-ci-action@v1` provides it in CI.
- Composer plugins `oat-sa/oatbox-extension-installer` and `oat-sa/composer-npm-bridge` must be allowed. Run `composer config --no-plugins allow-plugins.oat-sa/oatbox-extension-installer true` and `composer config --no-plugins allow-plugins.oat-sa/composer-npm-bridge true` before `composer install` if not already configured.
- The npm-bridge plugin automatically installs npm dependencies for all extensions (including `views/` for this extension) during `composer install`.
- The `taoQtiItem` symlink (`ln -sf /workspace /workspace/taoQtiItem`) is necessary for the Grunt-based lint/build/test tasks to resolve extension paths correctly.
- PHP 8.1, 8.2, and 8.3 are supported (per CI matrix). PHP 8.3 is recommended.
- Pre-existing ESLint errors (1800+) exist in the JS codebase; these are not regressions.
