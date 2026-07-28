define(['taoQtiItem/qtiCreator/helper/itemIdentifier'], function (
    itemIdentifier,
) {
  QUnit.module('itemIdentifier', function (hooks) {
    QUnit.test('generate uniqueNumericIdentifier', function (assert) {
      const identifier = itemIdentifier.uniqueNumericIdentifier();

      assert.ok(
        identifier.length === 9,
        'Identifier has the correct length (9 characters)',
      );
      assert.ok(
        /^\d{9}$/.test(identifier),
        'Identifier is numeric and has 9 digits',
      );
    });
  });
});
