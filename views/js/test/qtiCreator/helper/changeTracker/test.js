/**
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; under version 2
 * of the License (non-upgradable).
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 *
 * Copyright (c) 2019 (original work) Open Assessment Technologies SA ;
 */

/**
 * @author Jean-Sébastien Conan <jean-sebastien@taotesting.com>
 */
define([
    'jquery',
    'lodash',
    'core/eventifier',
    'taoQtiItem/qtiCreator/helper/changeTracker',
    'json!taoQtiItem/test/samples/json/space-shuttle.json'
], function ($, _, eventifier, changeTrackerFactory, itemData) {
    'use strict';

    function itemCreatorFactory(data = null) {
        const item = _.defaults(data || _.cloneDeep(itemData), {
            toArray() {
                return this;
            }
        });
        return eventifier({
            getItem() {
                return item;
            }
        });
    }

    QUnit.module('API');

    QUnit.test('module', assert => {
        const fixture = document.getElementById('fixture-api');
        const itemCreator = itemCreatorFactory();
        const instance1 = changeTrackerFactory(fixture, itemCreator);
        const instance2 = changeTrackerFactory(fixture, itemCreator);
        assert.expect(3);
        assert.equal(typeof changeTrackerFactory, 'function', 'The module exposes a function');
        assert.equal(typeof instance1, 'object', 'The factory produces an object');
        assert.notStrictEqual(instance1, instance2, 'The factory provides a different object on each call');
        instance1.uninstall();
        instance2.uninstall();
    });

    QUnit.cases.init([
        {title: 'on'},
        {title: 'off'},
        {title: 'before'},
        {title: 'after'},
        {title: 'trigger'},
        {title: 'spread'}
    ]).test('event API ', (data, assert) => {
        const fixture = document.getElementById('fixture-api');
        const itemCreator = itemCreatorFactory();
        const instance = changeTrackerFactory(fixture, itemCreator);
        assert.expect(1);
        assert.equal(typeof instance[data.title], 'function', `The instance exposes a "${data.title}" function`);
        instance.uninstall();
    });

    QUnit.cases.init([
        {title: 'init'},
        {title: 'install'},
        {title: 'uninstall'},
        {title: 'confirmBefore'},
        {title: 'hasChanged'},
        {title: 'getSerializedItem'}
    ]).test('helper API ', (data, assert) => {
        const fixture = document.getElementById('fixture-api');
        const itemCreator = itemCreatorFactory();
        const instance = changeTrackerFactory(fixture, itemCreator);
        assert.expect(1);
        assert.equal(typeof instance[data.title], 'function', `The instance exposes a "${data.title}" function`);
        instance.uninstall();
    });

    QUnit.module('Behavior');

    QUnit.cases.init([{
        title: 'not modified',
        change: {},
        expected: false
    }, {
        title: 'modified',
        change: {
            foo: 'bar'
        },
        expected: true
    }, {
        title: 'wrong item',
        item: {
            toArray: null
        },
        change: {},
        expected: true
    }]).test('hasChanged ', (data, assert) => {
        const fixture = document.getElementById('fixture-hasChanged');
        const itemCreator = itemCreatorFactory(data.item);
        const instance = changeTrackerFactory(fixture, itemCreator);

        Object.assign(itemCreator.getItem(), data.change);

        assert.expect(1);
        assert.equal(instance.hasChanged(), data.expected, 'The changes in item are properly detected');
        instance.uninstall();
    });

    QUnit.cases.init([{
        title: 'simple',
        item: {
            body: '<div>foo <span>bar</span></div>'
        },
        expected: '{"body":"<div>foo <span>bar</span></div>"}'
    }, {
        title: 'multiple spaces',
        item: {
            body: '<div>foo     <span>      bar       </span>      </div>'
        },
        expected: '{"body":"<div>foo <span> bar </span> </div>"}'
    }, {
        title: 'wrong item',
        item: {
            toArray: null
        },
        expected: null
    }]).test('getSerializedItem ', (data, assert) => {
        const fixture = document.getElementById('fixture-getSerializedItem');
        const itemCreator = itemCreatorFactory(data.item);
        const instance = changeTrackerFactory(fixture, itemCreator);

        assert.expect(1);
        assert.equal(instance.getSerializedItem(), data.expected, 'The item is serialized');
        instance.uninstall();
    });

    QUnit.test('stylechange ', assert => {
        const fixture = document.getElementById('fixture-stylechange');
        const itemCreator = itemCreatorFactory();
        const instance = changeTrackerFactory(fixture, itemCreator)
            .on('stylechange', () => assert.ok(true, 'stylechange event emitted'));

        assert.expect(5);
        assert.equal(instance.hasChanged(), false, 'No change yet');

        $(window.document).trigger('stylechange.qti-creator');
        assert.equal(instance.hasChanged(), true, 'Style has changed');

        $(window.document).trigger('customcssloaded.styleeditor');
        assert.equal(instance.hasChanged(), false, 'Style is loaded');

        $(window.document).trigger('stylechange.qti-creator', [{initializing: true}]);
        assert.equal(instance.hasChanged(), false, 'Style not changed');

        instance.uninstall();
    });

    QUnit.test('confirmBefore ', assert => {
        const ready = assert.async();
        const modalSelector = '.modal.opened';
        const fixtureSelector = '#fixture-confirmBefore';
        const $fixture = $(fixtureSelector);
        const fixture = document.querySelector(`${fixtureSelector} .editor`);
        const itemCreator = itemCreatorFactory();
        const instance = changeTrackerFactory(fixture, itemCreator, fixtureSelector);

        assert.expect(45);

        Promise
            .resolve()

            // click outside, no change yet
            .then(() => new Promise(resolve => {
                assert.equal(instance.hasChanged(), false, 'No change yet');

                $fixture
                    .off('.test')
                    .on('click.test', () => {
                        assert.ok(true, 'The click event has been propagated');
                    });

                itemCreator
                    .off('.test')
                    .on('save.test', () => {
                        assert.ok(false, 'The save event should not be emitted');
                    });

                window.setTimeout(resolve, 200);
                $fixture.click();
            }))

            // click outside, cancel confirm
            .then(() => new Promise(resolve => {
                $(window.document).trigger('stylechange.qti-creator');
                assert.equal(instance.hasChanged(), true, 'Style has changed');

                $fixture
                    .off('.test')
                    .on('click.test', () => {
                        assert.ok(false, 'The click event should not be propagated');
                    });

                itemCreator
                    .off('.test')
                    .on('save.test', () => {
                        assert.ok(false, 'The save event should not be emitted');
                    });

                window.setTimeout(() => {
                    assert.equal($(modalSelector).length, 1, 'The confirm dialog is open - cancel click');
                    $(modalSelector).find('.cancel').click();
                    assert.equal($(modalSelector).length, 0, 'The confirm dialog is canceled');
                    window.setTimeout(resolve, 200);
                }, 200);

                $fixture.click();
            }))

            // click outside, confirm without change
            .then(() => new Promise(resolve => {
                assert.equal(instance.hasChanged(), true, 'Changes not saved yet');

                $fixture
                    .off('.test')
                    .on('click.test', () => {
                        assert.ok(true, 'The click event should be propagated');
                    });

                itemCreator
                    .off('.test')
                    .on('save.test', () => {
                        assert.ok(false, 'The save event should not be emitted');
                    });

                window.setTimeout(() => {
                    assert.equal($(modalSelector).length, 1, 'The confirm dialog is open - confirm click without save');
                    $(modalSelector).find('.dontsave').click();
                    assert.equal($(modalSelector).length, 0, 'The confirm dialog is closed without save');
                    window.setTimeout(resolve, 200);
                }, 200);

                $fixture.click();
            }))

            // click outside, save and confirm
            .then(() => new Promise(resolve => {
                instance.install();
                $(window.document).trigger('stylechange.qti-creator');
                assert.equal(instance.hasChanged(), true, 'Style changed');

                $fixture
                    .off('.test')
                    .on('click.test', () => {
                        assert.ok(true, 'The click event should be propagated');
                    });

                itemCreator
                    .off('.test')
                    .on('save.test', () => {
                        assert.ok(true, 'The save event has been emitted');
                        itemCreator.trigger('saved');
                    })
                    .after('saved.test', () => {
                        assert.equal(instance.hasChanged(), false, 'Changes saved');
                        resolve();
                    });

                window.setTimeout(() => {
                    assert.equal($(modalSelector).length, 1, 'The confirm dialog is open - save and confirm click');
                    $(modalSelector).find('.save').click();
                    assert.equal($(modalSelector).length, 0, 'The confirm dialog is closed with save');
                    window.setTimeout(resolve, 200);
                }, 200);

                $fixture.click();
            }))

            // exit, no change yet
            .then(() => new Promise(resolve => {
                instance.install();
                assert.equal(instance.hasChanged(), false, 'No change yet');

                itemCreator
                    .off('.test')
                    .on('save.test', () => {
                        assert.ok(false, 'The save event should not be emitted');
                    })
                    .on('exit.test', () => {
                        assert.ok(true, 'The exit event is emitted');
                        resolve();
                    })
                    .trigger('exit');
            }))

            // cancel exit
            .then(() => {
                instance.install();
                $(window.document).trigger('stylechange.qti-creator');
                assert.equal(instance.hasChanged(), true, 'Style has changed');

                itemCreator
                    .off('.test')
                    .on('save.test', () => {
                        assert.ok(false, 'The save event should not be emitted');
                    });

                const race = Promise.race([
                    new Promise(resolve => {
                        itemCreator
                            .before('exit.test', () => {
                                assert.equal($(modalSelector).length, 1, 'The confirm dialog is open - cancel exit');
                                $(modalSelector).find('.cancel').click();
                                assert.equal($(modalSelector).length, 0, 'The confirm dialog is canceled');
                                window.setTimeout(resolve, 200);
                            });
                    }),
                    new Promise(resolve => {
                        itemCreator
                            .on('exit.test', () => {
                                assert.ok(false, 'The exit event should not be emitted');
                                resolve();
                            });
                    })
                ]);

                itemCreator.trigger('exit');

                return race;
            })

            // exit without save
            .then(() => new Promise(resolve => {
                assert.equal(instance.hasChanged(), true, 'Style still changed');

                itemCreator
                    .off('.test')
                    .on('save.test', () => {
                        assert.ok(false, 'The save event should not be emitted');
                    })
                    .before('exit.test', () => {
                        assert.equal($(modalSelector).length, 1, 'The confirm dialog is open - exit without save');
                        $(modalSelector).find('.dontsave').click();
                        assert.equal($(modalSelector).length, 0, 'The confirm dialog is closed without save');
                    })
                    .on('exit.test', () => {
                        assert.ok(true, 'The exit event has been emitted');
                        resolve();
                    })
                    .trigger('exit');
            }))

            // save and exit
            .then(() => new Promise(resolve => {
                instance.install();
                $(window.document).trigger('stylechange.qti-creator');
                assert.equal(instance.hasChanged(), true, 'Style changed');

                itemCreator
                    .off('.test')
                    .before('exit.test', () => {
                        assert.equal($(modalSelector).length, 1, 'The confirm dialog is open - save and exit');
                        $(modalSelector).find('.save').click();
                        assert.equal($(modalSelector).length, 0, 'The confirm dialog is closed with save');
                    })
                    .on('exit.test', () => {
                        assert.ok(true, 'The exit event has been emitted');
                    })
                    .on('save.test', () => {
                        assert.ok(true, 'The save event has been emitted');
                        itemCreator.trigger('saved');
                    })
                    .after('saved.test', () => {
                        assert.equal(instance.hasChanged(), false, 'Changes saved');
                        resolve();
                    })
                    .trigger('exit');
            }))

            // preview, no change yet
            .then(() => new Promise(resolve => {
                instance.install();
                assert.equal(instance.hasChanged(), false, 'No change yet');

                itemCreator
                    .off('.test')
                    .on('save.test', () => {
                        assert.ok(false, 'The save event should not be emitted');
                    })
                    .on('preview.test', () => {
                        assert.ok(true, 'The preview event is emitted');
                        resolve();
                    })
                    .trigger('preview');
            }))

            // cancel preview
            .then(() => {
                $(window.document).trigger('stylechange.qti-creator');
                assert.equal(instance.hasChanged(), true, 'Style has changed');

                itemCreator
                    .off('.test')
                    .on('save.test', () => {
                        assert.ok(false, 'The save event should not be emitted');
                    });

                const race = Promise.race([
                    new Promise(resolve => {
                        itemCreator
                            .before('preview.test', () => {
                                assert.equal($(modalSelector).length, 1, 'The confirm dialog is open - cancel preview');
                                $(modalSelector).find('.cancel').click();
                                assert.equal($(modalSelector).length, 0, 'The confirm dialog is canceled');
                                window.setTimeout(resolve, 200);
                            });
                    }),
                    new Promise(resolve => {
                        itemCreator
                            .on('preview.test', () => {
                                assert.ok(false, 'The preview event should not be emitted');
                                resolve();
                            });
                    })
                ]);

                itemCreator.trigger('preview');

                return race;
            })

            // preview without save
            .then(() => new Promise(resolve => {
                assert.equal(instance.hasChanged(), true, 'Style still changed');

                itemCreator
                    .off('.test')
                    .on('save.test', () => {
                        assert.ok(false, 'The save event should not be emitted');
                    })
                    .before('preview.test', () => {
                        assert.equal($(modalSelector).length, 1, 'The confirm dialog is open - preview without save');
                        $(modalSelector).find('.dontsave').click();
                        assert.equal($(modalSelector).length, 0, 'The confirm dialog is closed without save');
                    })
                    .on('preview.test', () => {
                        assert.ok(true, 'The preview event has been emitted');
                        resolve();
                    })
                    .trigger('preview');
            }))

            // save and preview
            .then(() => new Promise(resolve => {
                assert.equal(instance.hasChanged(), true, 'Style still changed');

                itemCreator
                    .off('.test')
                    .before('preview.test', () => {
                        assert.equal($(modalSelector).length, 1, 'The confirm dialog is open - save and preview');
                        $(modalSelector).find('.save').click();
                        assert.equal($(modalSelector).length, 0, 'The confirm dialog is closed with save');
                    })
                    .on('preview.test', () => {
                        assert.ok(true, 'The preview event has been emitted');
                    })
                    .on('save.test', () => {
                        assert.ok(true, 'The save event has been emitted');
                        itemCreator.trigger('saved');
                    })
                    .after('saved.test', () => {
                        assert.equal(instance.hasChanged(), false, 'Changes saved');
                        resolve();
                    })
                    .trigger('preview');
            }))

            .catch(err => {
                assert.ok(false, 'The operation should not fail!');
                assert.pushResult({
                    result: false,
                    message: err
                });
            })
            .then(() => {
                instance.uninstall();
                ready();
            });
    });
});
