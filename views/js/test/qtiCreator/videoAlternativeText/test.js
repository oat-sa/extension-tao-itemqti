define([
    'jquery',
    'taoQtiItem/qtiCreator/model/Object',
    'taoQtiItem/qtiCreator/model/Item',
    'taoQtiItem/qtiCreator/model/interactions/MediaInteraction',
    'taoQtiItem/qtiCreator/widgets/static/object/states/Active',
    'taoQtiItem/qtiCreator/widgets/interactions/mediaInteraction/states/Question',
    'taoQtiItem/qtiXmlRenderer/renderers/Renderer',
    'taoQtiItem/qtiCreator/model/Loader',
    'taoQtiItem/qtiCreator/model/qtiClasses',
    'taoQtiItem/qtiCreator/helper/altText',
    'taoQtiItem/qtiCreator/model/Img',
    'taoQtiItem/qtiCreator/model/Figure',
    'taoQtiItem/qtiCreator/model/Include',
    'taoQtiItem/qtiCreator/model/Container',
    'taoQtiItem/qtiCreator/widgets/item/Widget',
    'taoQtiItem/qtiCreator/itemCreator',
    'taoQtiItem/qtiCreator/helper/itemLoader',
    'taoQtiItem/portableElementRegistry/ciRegistry',
    'taoQtiItem/portableElementRegistry/icRegistry',
    'taoQtiItem/qtiCreator/editor/styleEditor/styleEditor',
    'taoQtiItem/qtiCreator/plugins/content/changeTracker',
    'taoQtiItem/qtiCreator/editor/containerEditor',
    'taoQtiItem/qtiCreator/helper/creatorRenderer',
    'lib/jquery.mockjax/jquery.mockjax'
], function (
    $, QtiObject, Item, MediaInteraction, ObjectActive, MediaQuestion, XmlRenderer, Loader, creatorClasses,
    altText, Img, Figure, Include, Container, ItemWidget, itemCreatorFactory, itemLoader, ciRegistry, icRegistry, styleEditor,
    changeTrackerPlugin, containerEditor, creatorRenderer
) {
    'use strict';

    QUnit.module('Video alternative text');

    QUnit.test('whole-item normalization covers unopened figures, prompt images and both video contexts', function (assert) {
        const item = new Item('normalize_alt_item', {});
        item.createResponseProcessing();
        const figure = new Figure('normalize_figure', {});
        const image = new Img('normalize_figure_image', { src: 'image.png', alt: '🌍'.repeat(201) });
        figure.setElement(image);
        item.getBody().setElement(figure);
        const media = new MediaInteraction('normalize_media', {});
        media.object.attr('data', 'video.mp4');
        media.object.attr('type', 'video/mp4');
        media.object._alt = `<span class="legacy">Preserved</span><span class="tao-multimedia-video-description">${'é'.repeat(201)}</span>`;
        const promptImage = new Img('normalize_prompt_image', { src: 'prompt.png', alt: 'p'.repeat(5000) });
        media.prompt.getBody().setElement(promptImage);
        item.getBody().setElement(media);
        const video = new QtiObject('normalize_static_video', { data: 'static.mp4', type: 'video/mp4' });
        video._alt = `<span class="tao-multimedia-video-description">${'v'.repeat(201)}</span>`;
        item.getBody().setElement(video);
        const audio = new QtiObject('normalize_audio', { data: 'audio.mp3', type: 'audio/mpeg' });
        audio._alt = `<span class="tao-multimedia-video-description">${'a'.repeat(5000)}</span>`;
        item.getBody().setElement(audio);
        const include = new Include('normalize_shared', { href: 'shared.xml' });
        const sharedBody = new Container('normalize_shared_body', {});
        const sharedImage = new Img('normalize_shared_image', { src: 'shared.png', alt: 'r'.repeat(5000) });
        sharedBody.setElement(sharedImage);
        include.data('readOnlyContent', sharedBody);
        item.getBody().setElement(include);
        assert.strictEqual(altText.normalize(item), 4);
        assert.strictEqual(image.attr('alt'), '🌍'.repeat(200));
        assert.strictEqual(promptImage.attr('alt'), 'p'.repeat(200));
        assert.strictEqual(media.object.description(), 'é'.repeat(200));
        assert.strictEqual(video.description(), 'v'.repeat(200));
        assert.ok(media.object._alt.includes('Preserved'), 'Other fallback is not shortened');
        assert.strictEqual(audio.description(), 'a'.repeat(5000), 'Audio is unchanged');
        assert.strictEqual(sharedImage.attr('alt'), 'r'.repeat(5000), 'Read-only shared content is not rewritten');
        assert.strictEqual(altText.normalize(item), 0, 'Normalizing twice does not report a new truncation');
    });

    QUnit.test('creator, change tracker and XML save share one truncation lifecycle', function (assert) {
        const done = assert.async();
        const item = new Item('warning_alt_item', {
            identifier: 'boundedAlt', title: 'Bounded alternatives', adaptive: false, timeDependent: false
        });
        item.createResponseProcessing();
        item.addNamespace('', 'http://www.imsglobal.org/xsd/imsqti_v2p2');
        item.addNamespace('xsi', 'http://www.w3.org/2001/XMLSchema-instance');
        item.addNamespace('m', 'http://www.w3.org/1998/Math/MathML');
        const image = new Img('warning_alt_image', { src: 'image.png', alt: 'w'.repeat(201) });
        item.getBody().setElement(image);
        const video = new QtiObject('warning_alt_video', { data: 'video.mp4', type: 'video/mp4' });
        video._alt = `<span class="tao-multimedia-video-description">${'é'.repeat(201)}</span>`;
        item.getBody().setElement(video);
        altText.normalize(item);
        const originals = [itemLoader.loadItem, ciRegistry.loadCreators, icRegistry.loadCreators, styleEditor.save];
        itemLoader.loadItem = (config, callback) => callback(item);
        ciRegistry.loadCreators = () => Promise.resolve();
        icRegistry.loadCreators = () => Promise.resolve();
        styleEditor.save = () => Promise.resolve();
        let saves = 0;
        const request = $.mockjax({
            url: /saveBoundedAltText/,
            type: 'POST',
            response(settings) {
                saves++;
                const dom = new DOMParser().parseFromString(settings.data, 'application/xml');
                assert.strictEqual(dom.getElementsByTagName('parsererror').length, 0, 'Save sends valid XML');
                assert.strictEqual(dom.getElementsByTagName('img')[0].getAttribute('alt'), '🌍'.repeat(200));
                assert.strictEqual(dom.querySelector('.tao-multimedia-video-description').textContent, 'é'.repeat(200));
                this.responseText = { success: true };
            }
        });
        item.data('widget', {
            element: item, itemUri: 'item-uri', saveItemUrl: '/saveBoundedAltText', save: ItemWidget.save
        });
        let trackerPlugin;
        const $container = $('<div>').appendTo('#qunit-fixture');
        const creator = itemCreatorFactory(
            { properties: { uri: 'test-uri', label: 'Test item', baseUrl: '/' } },
            { getContainer: () => $container, getContentCreatorPanelArea: () => $container },
            [(host, broker) => {
                trackerPlugin = changeTrackerPlugin(host, broker);
                return trackerPlugin;
            }]
        );
        const restore = () => {
            [itemLoader.loadItem, ciRegistry.loadCreators, icRegistry.loadCreators, styleEditor.save] = originals;
            $.mockjax.clear(request);
        };
        creator.on('init', function () {
            const tracker = trackerPlugin.changeTracker;
            assert.ok(tracker.hasChanged(), 'Automatic truncation is an unsaved edit');
            this.trigger('ready');
            assert.ok(tracker.hasChanged(), 'Ready cannot hide truncation');
            $(document).trigger('customcssloaded.styleeditor');
            assert.ok(tracker.hasChanged(), 'CSS initialization cannot hide truncation');
            assert.ok($container.text().includes('2 alternative text(s) were truncated to 200 characters.'), 'Warning is visible in the creator');
            assert.ok(item.data('altTextTruncated'), 'Opening did not mark the changes saved');
            assert.strictEqual(saves, 0, 'Opening does not persist content');
            image.attributes.alt = '🌍'.repeat(5000);
            setTimeout(() => this.trigger('save'), 0);
        }).on('saved', function () {
            setTimeout(() => {
                assert.notOk(item.data('altTextTruncated'), 'Creator clears truncation state');
                assert.notOk(video.data('altTextTruncatedFrom'), 'Creator clears field metadata');
                assert.notOk(trackerPlugin.changeTracker.hasChanged(), 'Tracker captures the clean saved baseline after creator cleanup');
                assert.strictEqual(image.attr('alt'), '🌍'.repeat(200), 'Saved XML agrees with the editable model');
                assert.strictEqual(saves, 1, 'Only explicit Save persisted the item');
                assert.ok($container.text().includes('2 alternative text(s) were truncated to 200 characters and saved.'), 'Save-time truncation is not silent');
                video.description('A subsequent video-only edit');
                assert.ok(trackerPlugin.changeTracker.hasChanged(), 'Video-only edits remain detectable after saving');
                restore();
                this.destroy();
            }, 0);
        }).on('destroy', done).on('error', err => {
            restore();
            assert.ok(false, String(err));
            done();
        });
        new XmlRenderer().load(() => creator.init());
    });

    QUnit.test('a save completing after destruction cannot recreate a truncation warning', function (assert) {
        const done = assert.async();
        const item = new Item('destroyed_save_item', {});
        item.createResponseProcessing();
        item.getBody().setElement(new Img('destroyed_save_image', { src: 'image.png', alt: 'x'.repeat(201) }));
        altText.normalize(item);
        const originals = [itemLoader.loadItem, ciRegistry.loadCreators, icRegistry.loadCreators, styleEditor.save];
        itemLoader.loadItem = (config, callback) => callback(item);
        ciRegistry.loadCreators = () => Promise.resolve();
        icRegistry.loadCreators = () => Promise.resolve();
        styleEditor.save = () => Promise.resolve();
        const restore = () => {
            [itemLoader.loadItem, ciRegistry.loadCreators, icRegistry.loadCreators, styleEditor.save] = originals;
        };
        const $container = $('<div>').appendTo('#qunit-fixture');
        const creator = itemCreatorFactory(
            { properties: { uri: 'destroyed-uri', label: 'Destroyed item', baseUrl: '/' } },
            { getContainer: () => $container, getContentCreatorPanelArea: () => $container },
            []
        );
        let finishSave;
        item.data('widget', {
            save() {
                creator.destroy();
                return new Promise(resolve => {
                    finishSave = resolve;
                });
            }
        });
        creator.on('init', function () {
            this.trigger('ready');
            assert.ok($container.text().includes('were truncated'), 'Active creator shows its warning');
            setTimeout(() => this.trigger('save'), 0);
        }).on('destroy', () => finishSave()).on('saved', () => {
            setTimeout(() => {
                assert.notOk($container.text().includes('were truncated'), 'Destroyed creator stays free of stale feedback');
                restore();
                done();
            }, 0);
        }).on('error', error => {
            restore();
            assert.ok(false, String(error));
            done();
        }).init();
    });

    QUnit.test('the creator surfaces a normalization load error', function (assert) {
        const done = assert.async();
        const originalLoad = itemLoader.loadItem;
        const error = new Error('Cannot edit alternative text: invalid object fallback XML');
        itemLoader.loadItem = (config, callback) => callback(null, {}, error);
        const creator = itemCreatorFactory(
            { properties: { uri: 'invalid-uri', label: 'Invalid item', baseUrl: '/' } },
            {},
            []
        );
        creator.on('error', received => {
            itemLoader.loadItem = originalLoad;
            assert.strictEqual(received, error, 'The original load error reaches existing UI feedback');
            done();
        }).init();
    });

    ['Insert Media', 'Media Interaction'].forEach(function (context) {
        QUnit.test(`${context}: enter, edit, clear and reopen without losing fallback`, function (assert) {
            const interaction = context === 'Insert Media' ?
                new QtiObject('video_Insert_Media', {}) : new MediaInteraction('media', {});
            const object = context === 'Insert Media' ? interaction : interaction.object;
            object.attr('data', 'video.mp4');
            object.attr('type', 'video/mp4');
            object._alt = 'Existing &amp; fallback <span class="legacy">préservé</span>' +
                '<object data="fallback.mp4" type="video/mp4">' +
                '<span class="tao-multimedia-video-description">Nested description</span></object>';
            object.renderer = { resolveUrl: value => value };
            const state = {
                widget: {
                    element: interaction,
                    $form: $('<div>').appendTo('#qunit-fixture'),
                    $original: $('<div>').appendTo('#qunit-fixture'),
                    options: { mediaManager: {} }
                }
            };
            const originalPreviewer = $.fn.previewer;
            $.fn.previewer = function () {
                return this;
            };
            try {
                const initForm = context === 'Insert Media' ? ObjectActive.prototype.initForm : MediaQuestion.prototype.initForm;
                initForm.call(state);
                let $input = state.widget.$form.find('textarea[name=alt]');
                assert.strictEqual($input.length, 1, 'Video field is available');
                assert.strictEqual($input.val(), '', 'Nested description is not the outer description');
                const values = ['Planètes < Terre & "Soleil" > \'étoiles\' 🌍\nLiteral &amp; and $&', 'é'.repeat(212), ''];
                values.forEach(function (value) {
                    const limited = Array.from(value).slice(0, 200).join('');
                    $input.val(value).trigger('input');
                    assert.strictEqual(object.description(), limited, 'Real form binding updates the bounded object');
                    assert.strictEqual($input.val(), limited, 'Field and model agree');
                    const fallback = new DOMParser().parseFromString(`<root>${object._alt}</root>`, 'application/xml');
                    assert.strictEqual(fallback.getElementsByTagName('parsererror').length, 0, 'Fallback remains XML');
                    assert.strictEqual(fallback.querySelector('.legacy').textContent, 'préservé');
                    assert.strictEqual(fallback.querySelector('object .tao-multimedia-video-description').textContent, 'Nested description');
                    initForm.call(state);
                    $input = state.widget.$form.find('textarea[name=alt]');
                    assert.strictEqual($input.val(), limited, 'Reopening the editor retains the bounded value');
                });
                object.attr('type', 'audio/mpeg');
                initForm.call(state);
                assert.notOk(state.widget.$form.find('.video-alt-text-panel').is(':visible'), 'Audio does not expose video descriptions');
            } finally {
                $.fn.previewer = originalPreviewer;
            }
        });
    });

    QUnit.test('Fallback-only content, XML-sensitive text and media URLs survive XML rendering', function (assert) {
        const done = assert.async();
        const object = new QtiObject('render_video', { data: 'video.mp4?a=1&b=2', type: 'video/mp4' });
        object._alt = '<object data="fallback.mp4" type="video/mp4">Fallback</object>';
        const initialFallback = object._alt;
        const text = 'été < & > " \' 🌍\nLiteral &amp; $&';
        new XmlRenderer().load(function () {
            object.description(text);
            const xml = object.render({}, null, '', this);
            const dom = new DOMParser().parseFromString(xml, 'application/xml');
            assert.strictEqual(dom.getElementsByTagName('parsererror').length, 0);
            assert.strictEqual(dom.documentElement.getAttribute('data'), 'video.mp4?a=1&b=2');
            assert.strictEqual(dom.querySelector('.tao-multimedia-video-description').textContent, text);
            assert.strictEqual(object.attr('data'), 'video.mp4?a=1&b=2', 'Rendering does not mutate attributes');
            object.description('');
            assert.strictEqual(object._alt, initialFallback, 'Clearing restores the nested fallback alone');
            done();
        }, ['object']);
    });

    QUnit.test('Malformed fallback is never overwritten', function (assert) {
        const object = new QtiObject('invalid_video', { data: 'video.mp4', type: 'video/mp4' });
        object._alt = '<span>Unclosed';
        assert.throws(() => object.description('Replacement'), /invalid object fallback XML/);
        assert.strictEqual(object._alt, '<span>Unclosed');
    });

    QUnit.test('rich-text parsing preserves every video fallback through repeated XML saves', function (assert) {
        const done = assert.async();
        const $container = $('<div>').appendTo('#qunit-fixture');
        $container.html(
            '<p><object data="first.mp4" type="video/mp4">' +
            '<span class="tao-multimedia-video-description">First &amp; été</span>' +
            '<object data="nested.mp4" type="video/mp4"><span>Nested fallback</span></object>' +
            '</object></p><table><tbody><tr><td><object data="second.mp4" type="video/mp4">' +
            '<span class="tao-multimedia-video-description">Second video</span><img src="fallback.png" alt="Fallback"/>' +
            '</object></td></tr></tbody></table>'
        );
        const originalGet = creatorRenderer.get;
        let rounds = 0;
        const renderer = new XmlRenderer();
        renderer.load(() => {
            creatorRenderer.get = () => ({
                load() {
                    const container = $container.data('container');
                    const xml = container.render({}, null, '', renderer);
                    const doc = new DOMParser().parseFromString(`<root>${xml}</root>`, 'application/xml');
                    assert.strictEqual(doc.getElementsByTagName('parsererror').length, 0, 'Saved fallback is XML');
                    assert.strictEqual(doc.querySelector('object[data="first.mp4"] > .tao-multimedia-video-description')?.textContent, 'First & été');
                    assert.strictEqual(doc.querySelector('object[data="second.mp4"] > .tao-multimedia-video-description')?.textContent, 'Second video');
                    assert.strictEqual(doc.querySelector('object[data="nested.mp4"] span')?.textContent, 'Nested fallback');
                    assert.strictEqual(doc.querySelector('object[data="second.mp4"] img')?.getAttribute('alt'), 'Fallback');
                    if (++rounds < 2) {
                        $container.html(xml);
                        containerEditor.create($container);
                    } else {
                        creatorRenderer.get = originalGet;
                        done();
                    }
                }
            });
            containerEditor.create($container);
        });
    });

    QUnit.test('structured nested object fallback loads as XML without losing its content', function (assert) {
        const done = assert.async();
        const saved = {
            qtiClass: 'object', serial: 'structured_fallback_parent',
            attributes: { data: 'parent.mp4', type: 'video/mp4' },
            _alt: {
                qtiClass: 'object', serial: 'structured_fallback_child',
                attributes: { data: 'nested.mp4?a=1&b=2', type: 'video/mp4' },
                _alt: '<span class="tao-multimedia-video-description">Nested &amp; été</span>'
            }
        };
        const before = JSON.stringify(saved);
        new Loader(null, creatorClasses).loadRequiredClasses(saved, function () {
            try {
                const object = this.buildElement(saved);
                assert.strictEqual(object.description(), '', 'Nested alternative does not describe the parent');
                object.description('Parent description');
                const doc = new DOMParser().parseFromString(`<root>${object._alt}</root>`, 'application/xml');
                assert.strictEqual(doc.getElementsByTagName('parsererror').length, 0);
                assert.strictEqual(doc.querySelector('object .tao-multimedia-video-description').textContent, 'Nested & été');
                assert.strictEqual(doc.querySelector('object').getAttribute('data'), 'nested.mp4?a=1&b=2');
                assert.strictEqual(JSON.stringify(saved), before, 'Loading does not rewrite source fallback data');
            } catch (error) {
                assert.ok(false, error.message);
            }
            done();
        });
    });

    ['Insert Media', 'Media Interaction'].forEach(function (context) {
        QUnit.test(`${context}: saved descriptions reload into the editable object`, function (assert) {
            const done = assert.async();
            const saved = {
                qtiClass: 'mediaInteraction',
                serial: context === 'Insert Media' ? 'saved_static_video' : 'saved_media_video',
                attributes: { responseIdentifier: 'RESPONSE', autostart: false, maxPlays: 3 },
                object: {
                    qtiClass: 'object',
                    attributes: { data: 'saved.mp4', type: 'video/mp4' },
                    _alt: '<span class="legacy">Existing fallback</span>' +
                        '<span class="tao-multimedia-video-description">Description &amp; été</span>'
                }
            };
            const data = context === 'Insert Media' ? Object.assign({ serial: saved.serial }, saved.object) : saved;
            new Loader(null, creatorClasses).loadRequiredClasses(data, function () {
                const element = this.buildElement(data);
                const object = element.object || element;
                assert.ok(object instanceof QtiObject, 'Loader retains the creator object model');
                assert.strictEqual(object.description(), 'Description & été', 'Saved description can be read');
                object.description('Edited <🌍> & text');
                assert.strictEqual(object.description(), 'Edited <🌍> & text');
                object.description('');
                assert.strictEqual(object.description(), '');
                assert.ok(object._alt.includes('Existing fallback'));
                assert.strictEqual(object.attr('data'), 'saved.mp4');
                if (element.object) {
                    assert.strictEqual(element.attr('maxPlays'), 3, 'Playback settings are retained');
                }
                done();
            });
        });
    });

    QUnit.test('clearing an absent description leaves the dirty snapshot unchanged', function (assert) {
        const object = new QtiObject('empty_description_noop', { data: 'video.mp4', type: 'video/mp4' });
        const before = JSON.stringify(object.toArray());
        let changes = 0;
        $(document).on('attributeChange.qti-widget.noopReview', (event, data) => {
            if (data.element === object) {
                changes++;
            }
        });
        object.description('');
        assert.strictEqual(JSON.stringify(object.toArray()), before, 'Empty field keyup cannot create an unsaved edit');
        assert.strictEqual(changes, 0, 'No change event is emitted');
        $(document).off('.noopReview');
    });

    QUnit.test('Item namespaces and namespaced fallback survive description editing', function (assert) {
        const item = new Item('namespaced_item', {});
        item.addNamespace('', 'http://www.imsglobal.org/xsd/imsqti_v2p1');
        item.addNamespace('m', 'http://www.w3.org/1998/Math/MathML');
        const object = new QtiObject('namespaced_video', { data: 'video.mp4', type: 'video/mp4' });
        object.setRootElement(item);
        object._alt = '<m:math><m:mi>x</m:mi></m:math><span class="legacy">été</span>';
        object.description('Description & <été>');
        assert.strictEqual(object.description(), 'Description & <été>');
        const dom = new DOMParser().parseFromString(`<root>${object._alt}</root>`, 'application/xml');
        assert.strictEqual(dom.getElementsByTagName('parsererror').length, 0);
        assert.strictEqual(dom.getElementsByTagNameNS('http://www.w3.org/1998/Math/MathML', 'mi')[0].textContent, 'x');
        assert.strictEqual(dom.querySelector('.tao-multimedia-video-description').namespaceURI, item.getNamespaces()['']);
        object.description('');
        assert.strictEqual(object.description(), '');
        assert.ok(object._alt.includes('legacy'), 'Other fallback survives clearing');
    });
});
