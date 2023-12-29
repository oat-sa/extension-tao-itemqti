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
 * Copyright (c) 2015-2022 (original work) Open Assessment Technologies SA ;
 */
/**
 * Utility to retrieve and manipualte QTI Elements
 */
define(['jquery', 'lodash', 'i18n', 'services/features'], function ($, _, __, featuresService) {
    'use strict';

    const QtiElements = {
        classes: {
            //abstract classes:
            itemBody: { parents: ['bodyElement'], contains: ['block'], abstract: true },
            atomicBlock: {
                parents: ['blockStatic', 'bodyElement', 'flowStatic'],
                contains: ['inline'],
                abstract: true
            },
            atomicInline: {
                parents: ['bodyElement', 'flowStatic', 'inlineStatic'],
                contains: ['inline'],
                abstract: true
            },
            simpleBlock: { parents: ['blockStatic', 'bodyElement', 'flowStatic'], contains: ['block'], abstract: true },
            simpleInline: {
                parents: ['bodyElement', 'flowStatic', 'inlineStatic'],
                contains: ['inline'],
                abstract: true
            },
            flowStatic: { parents: ['flow'], abstract: true },
            blockStatic: { parents: ['block'], abstract: true },
            inlineStatic: { parents: ['inline'], abstract: true },
            flow: { parents: ['objectFlow'], abstract: true },
            tableCell: { parents: ['bodyElement'], contains: ['flow'], abstract: true },
            //html-derived qti elements:
            caption: { parents: ['bodyElement'], contains: ['inline'], xhtml: true },
            col: { parents: ['bodyElement'], xhtml: true },
            colgroup: { parents: ['bodyElement'], contains: ['col'], xhtml: true },
            div: { parents: ['blockStatic', 'bodyElement', 'flowStatic'], contains: ['flow'], xhtml: true },
            dl: { parents: ['blockStatic', 'bodyElement', 'flowStatic'], contains: ['dlElement'], xhtml: true },
            dt: { parents: ['dlElement'], contains: ['inline'], xhtml: true },
            dd: { parents: ['dlElement'], contains: ['flow'], xhtml: true },
            hr: { parents: ['blockStatic', 'bodyElement', 'flowStatic'], xhtml: true },
            math: { parents: ['blockStatic', 'flowStatic', 'inlineStatic'], xhtml: true },
            li: { parents: ['bodyElement'], contains: ['flow'], xhtml: true },
            ol: { parents: ['blockStatic', 'bodyElement', 'flowStatic'], contains: ['li'], xhtml: true },
            ul: { parents: ['blockStatic', 'bodyElement', 'flowStatic'], contains: ['li'], xhtml: true },
            object: { parents: ['bodyElement', 'flowStatic', 'inlineStatic'], contains: ['objectFlow'], xhtml: true },
            param: { parents: ['objectFlow'], xhtml: true },
            table: {
                parents: ['blockStatic', 'bodyElement', 'flowStatic'],
                contains: ['caption', 'col', 'colgroup', 'thead', 'tfoot', 'tbody'],
                xhtml: true
            },
            tbody: { parents: ['bodyElement'], contains: ['tr'], xhtml: true },
            tfoot: { parents: ['bodyElement'], contains: ['tr'], xhtml: true },
            thead: { parents: ['bodyElement'], contains: ['tr'], xhtml: true },
            td: { parents: ['tableCell'], xhtml: true },
            th: { parents: ['tableCell'], xhtml: true },
            tr: { parents: ['bodyElement'], contains: ['tableCell'], xhtml: true },
            a: { parents: ['simpleInline'], xhtml: true },
            abbr: { parents: ['simpleInline'], xhtml: true },
            acronym: { parents: ['simpleInline'], xhtml: true },
            b: { parents: ['simpleInline'], xhtml: true },
            big: { parents: ['simpleInline'], xhtml: true },
            cite: { parents: ['simpleInline'], xhtml: true },
            code: { parents: ['simpleInline'], xhtml: true },
            dfn: { parents: ['simpleInline'], xhtml: true },
            em: { parents: ['simpleInline'], xhtml: true },
            i: { parents: ['simpleInline'], xhtml: true },
            kbd: { parents: ['simpleInline'], xhtml: true },
            q: { parents: ['simpleInline'], xhtml: true },
            samp: { parents: ['simpleInline'], xhtml: true },
            small: { parents: ['simpleInline'], xhtml: true },
            span: { parents: ['simpleInline'], xhtml: true },
            strong: { parents: ['simpleInline'], xhtml: true },
            sub: { parents: ['simpleInline'], xhtml: true },
            sup: { parents: ['simpleInline'], xhtml: true },
            tt: { parents: ['simpleInline'], xhtml: true },
            var: { parents: ['simpleInline'], xhtml: true },
            blockquote: { parents: ['simpleBlock'], xhtml: true },
            address: { parents: ['atomicBlock'], xhtml: true },
            h1: { parents: ['atomicBlock'], xhtml: true },
            h2: { parents: ['atomicBlock'], xhtml: true },
            h3: { parents: ['atomicBlock'], xhtml: true },
            h4: { parents: ['atomicBlock'], xhtml: true },
            h5: { parents: ['atomicBlock'], xhtml: true },
            h6: { parents: ['atomicBlock'], xhtml: true },
            p: { parents: ['atomicBlock'], xhtml: true },
            pre: { parents: ['atomicBlock'], xhtml: true },
            img: { parents: ['atomicInline'], xhtml: true, attributes: ['src', 'alt', 'longdesc', 'height', 'width'] },
            br: { parents: ['atomicInline'], xhtml: true },
            //qti elements:
            infoControl: { parents: ['blockStatic', 'bodyElement', 'flowStatic'], qti: true },
            textRun: { parents: ['inlineStatic', 'flowstatic'], qti: true },
            feedbackInline: { parents: ['simpleInline', 'feedbackElement'], qti: true },
            feedbackBlock: { parents: ['simpleBlock'], qti: true },
            rubricBlock: { parents: ['simpleBlock'], qti: true }, //strange qti 2.1 exception, marked as simpleBlock instead of
            blockInteraction: { parents: ['block', 'flow', 'interaction'], qti: true },
            inlineInteraction: { parents: ['inline', 'flow', 'interaction'], qti: true },
            gap: { parents: ['inlineStatic'], qti: true },
            hottext: { parents: ['flowstatic', 'inlineStatic'], contains: ['inlineStatic'], qti: true },
            printedVariable: { parents: ['bodyElement', 'flowStatic', 'inlineStatic', 'textOrVariable'], qti: true },
            prompt: { parents: ['bodyElement'], contains: ['inlineStatic'], qti: true },
            templateElement: { parents: ['bodyElement'], qti: true },
            templateBlock: {
                parents: ['blockStatic', 'flowStatic', 'templateElement'],
                contains: ['blockStatic'],
                qti: true
            },
            templateInline: {
                parents: ['inlineStatic', 'flowStatic', 'templateElement'],
                contains: ['inlineStatic'],
                qti: true
            },
            choiceInteraction: { parents: ['blockInteraction'], qti: true },
            associateInteraction: { parents: ['blockInteraction'], qti: true },
            orderInteraction: { parents: ['blockInteraction'], qti: true },
            matchInteraction: { parents: ['blockInteraction'], qti: true },
            hottextInteraction: { parents: ['blockInteraction'], qti: true },
            gapMatchInteraction: { parents: ['blockInteraction'], qti: true },
            mediaInteraction: { parents: ['blockInteraction'], qti: true },
            sliderInteraction: { parents: ['blockInteraction'], qti: true },
            uploadInteraction: { parents: ['blockInteraction'], qti: true },
            drawingInteraction: { parents: ['blockInteraction'], qti: true },
            graphicInteraction: { parents: ['blockInteraction'], qti: true },
            hotspotInteraction: { parents: ['graphicInteraction'], qti: true },
            graphicAssociateInteraction: { parents: ['graphicInteraction'], qti: true },
            graphicOrderInteraction: { parents: ['graphicInteraction'], qti: true },
            graphicGapMatchInteraction: { parents: ['graphicInteraction'], qti: true },
            selectPointInteraction: { parents: ['graphicInteraction'], qti: true },
            textEntryInteraction: { parents: ['stringInteraction', 'inlineInteraction'], qti: true },
            extendedTextInteraction: { parents: ['stringInteraction', 'blockInteraction'], qti: true },
            inlineChoiceInteraction: { parents: ['inlineInteraction'], qti: true },
            endAttemptInteraction: { parents: ['inlineInteraction'], qti: true },
            customInteraction: { parents: ['block', 'flow', 'interaction'], qti: true },
            _container: { parents: ['block'], qti: true } //a pseudo class introduced in TAO
        },

        cache: { containable: {}, children: {}, parents: {} },

        getAllowedContainersElements(qtiClass, $container) {
            const classes = QtiElements.getAllowedContainers(qtiClass);
            let jqSelector = '';
            for (let i in classes) {
                if (!classes[i].qti) {
                    //html element:
                    jqSelector += `${classes[i]}, `;
                }
            }

            if (jqSelector) {
                jqSelector = jqSelector.substring(0, jqSelector.length - 2);
            }

            return $(jqSelector, $container ? $container : $(document)).filter(':not([data-qti-type])');
        },

        getAllowedContainers(qtiClass) {
            let ret;
            if (QtiElements.cache.containable[qtiClass]) {
                ret = QtiElements.cache.containable[qtiClass];
            } else {
                ret = [];
                const parents = QtiElements.getParentClasses(qtiClass, true);
                for (let aClass in QtiElements.classes) {
                    const model = QtiElements.classes[aClass];
                    if (model.contains) {
                        const intersect = _.intersection(model.contains, parents);
                        if (intersect.length) {
                            if (!model.abstract) {
                                ret.push(aClass);
                            }
                            ret = _.union(ret, QtiElements.getChildClasses(aClass, true));
                        }
                    }
                }
                QtiElements.cache.containable[qtiClass] = ret;
            }

            return ret;
        },

        getAllowedContents(qtiClass, recursive, checked) {
            let ret = [];
            checked = checked || {};

            const model = QtiElements.classes[qtiClass];
            if (model && model.contains) {
                for (let i in model.contains) {
                    const contain = model.contains[i];
                    if (!checked[contain]) {
                        checked[contain] = true;

                        //qtiClass can contain everything defined as its contents
                        ret.push(contain);

                        //qtiClass can also contain subclass of its contents
                        const children = QtiElements.getChildClasses(contain, true);
                        for (let j in children) {
                            const child = children[j];
                            if (!checked[child]) {
                                checked[child] = true;

                                ret.push(child);

                                //adding children allowed contents depends on the option "recursive"
                                if (recursive) {
                                    ret = _.union(ret, QtiElements.getAllowedContents(child, true, checked));
                                }
                            }
                        }

                        //adding allowed contents of qtiClass' allowed contents depends on the option "recursive"
                        if (recursive) {
                            ret = _.union(ret, QtiElements.getAllowedContents(contain, true, checked));
                        }
                    }
                }
            }

            //qtiClass can contain all allowed contents of its parents:
            const parents = QtiElements.getParentClasses(qtiClass, true);
            for (let i in parents) {
                ret = _.union(ret, QtiElements.getAllowedContents(parents[i], recursive, checked));
            }

            return _.uniq(ret);
        },

        isAllowedClass(qtiContainerClass, qtiContentClass) {
            const allowedClasses = QtiElements.getAllowedContents(qtiContainerClass);
            return _.indexOf(allowedClasses, qtiContentClass) >= 0;
        },

        getParentClasses(qtiClass, recursive) {
            let ret;
            if (recursive && QtiElements.cache.parents[qtiClass]) {
                ret = QtiElements.cache.parents[qtiClass];
            } else {
                ret = [];
                if (QtiElements.classes[qtiClass]) {
                    ret = QtiElements.classes[qtiClass].parents;
                    if (recursive) {
                        for (let i in ret) {
                            ret = _.union(ret, QtiElements.getParentClasses(ret[i], recursive));
                        }
                        ret = _.uniq(ret);
                    }
                }
                QtiElements.cache.parents[qtiClass] = ret;
            }

            return ret;
        },

        getChildClasses(qtiClass, recursive, type) {
            let ret;
            const cacheType = type ? type : 'all';
            if (recursive && QtiElements.cache.children[qtiClass] && QtiElements.cache.children[qtiClass][cacheType]) {
                ret = QtiElements.cache.children[qtiClass][cacheType];
            } else {
                ret = [];
                for (let aClass in QtiElements.classes) {
                    const model = QtiElements.classes[aClass];
                    if (_.indexOf(model.parents, qtiClass) >= 0) {
                        if (type) {
                            if (model[type]) {
                                ret.push(aClass);
                            }
                        } else {
                            ret.push(aClass);
                        }
                        if (recursive) {
                            ret = _.union(ret, QtiElements.getChildClasses(aClass, recursive, type));
                        }
                    }
                }
                if (!QtiElements.cache.children[qtiClass]) {
                    QtiElements.cache.children[qtiClass] = {};
                }
                QtiElements.cache.children[qtiClass][cacheType] = ret;
            }

            return ret;
        },

        isBlock(qtiClass) {
            return QtiElements.is(qtiClass, 'block');
        },

        isInline(qtiClass) {
            return QtiElements.is(qtiClass, 'inline');
        },

        is(qtiClass, topClass) {
            if (qtiClass === topClass) {
                return true;
            } else {
                const parents = QtiElements.getParentClasses(qtiClass, true);
                return _.indexOf(parents, topClass) >= 0;
            }
        },

        /**
         * Check wether an element is visible, using the feature viibility service
         * @param {string} qtiClass - see the list of available classes
         * @returns {boolean} true by default and false only if the element is explicitely registered as hidden
         */
        isVisible(qtiClass) {
            if (this.is(qtiClass, 'customInteraction')) {
                return featuresService.isVisible(`taoQtiItem/creator/customInteraction/${qtiClass.replace(/Interaction$/, '').replace(/^customInteraction\./, '')}`);
            }
            if (this.is(qtiClass, 'interaction')) {
                return featuresService.isVisible(`taoQtiItem/creator/interaction/${qtiClass.replace(/Interaction$/, '')}`);
            }
            return true;
        },

        /**
         * Get the list of available elements for the authoring side
         * The list of those element is statically defined, but we filter out elements that should be visible
         * @returns {Object} the available elements
         */
        getAvailableAuthoringElements() {
            const tagTitles = {
                commonInteractions: __('Common Interactions'),
                inlineInteractions: __('Inline Interactions'),
                graphicInteractions: __('Graphic Interactions')
            };

            const authoringElements = {
                choiceInteraction: {
                    label: __('Choice Interaction'),
                    description: __(
                        'Select a single (radio buttons) or multiple (check boxes) responses among a set of choices.'
                    ),
                    icon: 'icon-choice',
                    short: __('Choice'),
                    qtiClass: 'choiceInteraction',
                    tags: [tagTitles.commonInteractions, 'mcq'],
                    group: 'common-interactions'
                },
                orderInteraction: {
                    label: __('Order Interaction'),
                    icon: 'icon-order',
                    description: __('Arrange a list of choices in the correct order.'),
                    short: __('Order'),
                    qtiClass: 'orderInteraction',
                    tags: [tagTitles.commonInteractions, 'ordering'],
                    group: 'common-interactions'
                },
                associateInteraction: {
                    label: __('Associate Interaction'),
                    icon: 'icon-associate',
                    description: __('Create pair(s) from a series of choices.'),
                    short: __('Associate'),
                    qtiClass: 'associateInteraction',
                    tags: [tagTitles.commonInteractions, 'association'],
                    group: 'common-interactions'
                },
                matchInteraction: {
                    label: __('Match Interaction'),
                    icon: 'icon-match',
                    description: __(
                        'Create association(s) between two sets of choices displayed in a table (row and column).'
                    ),
                    short: __('Match'),
                    qtiClass: 'matchInteraction',
                    tags: [tagTitles.commonInteractions, 'association'],
                    group: 'common-interactions'
                },
                hottextInteraction: {
                    label: __('Hottext Interaction'),
                    icon: 'icon-hottext',
                    description: __('Select one or more text parts (hottext) within a text.'),
                    short: __('Hottext'),
                    qtiClass: 'hottextInteraction',
                    tags: [tagTitles.commonInteractions, 'text'],
                    group: 'common-interactions'
                },
                gapMatchInteraction: {
                    label: __('Gap Match Interaction'),
                    icon: 'icon-gap-match',
                    description: __(' Fill in the gaps in a text from a set of choices.'),
                    short: __('Gap Match'),
                    qtiClass: 'gapMatchInteraction',
                    tags: [tagTitles.commonInteractions, 'text', 'association'],
                    group: 'common-interactions'
                },
                sliderInteraction: {
                    label: __('Slider Interaction'),
                    icon: 'icon-slider',
                    description: __('Select a value within a numerical range.'),
                    short: __('Slider'),
                    qtiClass: 'sliderInteraction',
                    tags: [tagTitles.commonInteractions, 'special'],
                    group: 'common-interactions'
                },
                extendedTextInteraction: {
                    label: __('Extended Text Interaction'),
                    icon: 'icon-extended-text',
                    description: __(
                        'Collect open-ended information in one or more text area(s) (strings or numeric values).'
                    ),
                    short: __('Extended Text'),
                    qtiClass: 'extendedTextInteraction',
                    tags: [tagTitles.commonInteractions, 'text'],
                    group: 'common-interactions'
                },
                uploadInteraction: {
                    label: __('File Upload Interaction'),
                    icon: 'icon-upload',
                    description: __('Upload a file (e.g. document, picture...) as a response.'),
                    short: __('File Upload'),
                    qtiClass: 'uploadInteraction',
                    tags: [tagTitles.commonInteractions, 'special'],
                    group: 'common-interactions'
                },
                mediaInteraction: {
                    label: __('Media Interaction'),
                    icon: 'icon-media',
                    description: __(
                        'Control the playing parameters (auto-start, loop) of a video or audio file and report the number of time it has been played.'
                    ),
                    short: __('Media'),
                    qtiClass: 'mediaInteraction',
                    tags: [tagTitles.commonInteractions, 'media'],
                    group: 'common-interactions'
                },
                _container: {
                    label: __('Text Block'),
                    icon: 'icon-font',
                    description: __(
                        'Block contains the content (stimulus) of the item such as text or image. It is also required for Inline Interactions.'
                    ),
                    short: __('Block'),
                    qtiClass: '_container',
                    tags: [tagTitles.inlineInteractions, 'text'],
                    group: 'inline-interactions'
                },
                inlineChoiceInteraction: {
                    label: __('Inline Choice Interaction'),
                    icon: 'icon-inline-choice',
                    description: __('Select a choice from a drop-down list.'),
                    short: __('Inline Choice'),
                    qtiClass: 'inlineChoiceInteraction',
                    tags: [tagTitles.inlineInteractions, 'inline-interactions', 'mcq'],
                    group: 'inline-interactions'
                },
                textEntryInteraction: {
                    label: __('Text Entry Interaction'),
                    icon: 'icon-text-entry',
                    description: __(
                        'Collect open-ended information in a short text input (strings or numeric values).'
                    ),
                    short: __('Text Entry'),
                    qtiClass: 'textEntryInteraction',
                    tags: [tagTitles.inlineInteractions, 'inline-interactions', 'text'],
                    group: 'inline-interactions'
                },
                endAttemptInteraction: {
                    label: __('End Attempt Interaction'),
                    icon: 'icon-end-attempt',
                    description: __('Trigger the end of the item attempt.'),
                    short: __('End Attempt'),
                    qtiClass: 'endAttemptInteraction',
                    tags: [tagTitles.inlineInteractions, 'inline-interactions', 'button', 'submit'],
                    group: 'inline-interactions'
                },
                hotspotInteraction: {
                    label: __('Hotspot Interaction'),
                    icon: 'icon-hotspot',
                    description: __('Select one or more areas (hotspots) displayed on an picture.'),
                    short: __('Hotspot'),
                    qtiClass: 'hotspotInteraction',
                    tags: [tagTitles.graphicInteractions, 'mcq'],
                    group: 'graphic-interactions'
                },
                graphicOrderInteraction: {
                    label: __('Graphic Order Interaction'),
                    icon: 'icon-graphic-order',
                    description: __('Order the areas (hotspots) displayed on a picture.'),
                    short: __('Order'),
                    qtiClass: 'graphicOrderInteraction',
                    tags: [tagTitles.graphicInteractions, 'ordering'],
                    group: 'graphic-interactions'
                },
                graphicAssociateInteraction: {
                    label: __('Graphic Associate Interaction'),
                    icon: 'icon-graphic-associate',
                    description: __('Create association(s) between areas (hotspots) displayed on a picture.'),
                    short: __('Associate'),
                    qtiClass: 'graphicAssociateInteraction',
                    tags: [tagTitles.graphicInteractions, 'association'],
                    group: 'graphic-interactions'
                },
                graphicGapMatchInteraction: {
                    label: __('Graphic Gap Match Interaction'),
                    icon: 'icon-graphic-gap',
                    description: __('Fill in the gaps on a picture with a set of image choices.'),
                    short: __('Gap Match'),
                    qtiClass: 'graphicGapMatchInteraction',
                    tags: [tagTitles.graphicInteractions, 'association'],
                    group: 'graphic-interactions'
                },
                selectPointInteraction: {
                    label: __('Select Point Interaction'),
                    icon: 'icon-select-point',
                    description: __('Position one or more points on a picture (response areas are not displayed).'),
                    short: __('Select Point'),
                    qtiClass: 'selectPointInteraction',
                    tags: [tagTitles.graphicInteractions],
                    group: 'graphic-interactions'
                }
            };

            //filter out hidden elements
            const availableElements = {};
            for (const [elementId, element] of Object.entries(authoringElements)) {
                if (this.isVisible(elementId)) {
                    availableElements[elementId] = element;
                }
            }
            return availableElements;
        }
    };

    return QtiElements;
});
