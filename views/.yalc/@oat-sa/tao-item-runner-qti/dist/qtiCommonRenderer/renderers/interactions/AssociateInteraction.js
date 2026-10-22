define(['jquery', 'lodash', 'i18n', 'ui/hider', 'handlebars', 'lib/handlebars/helpers', 'taoQtiItem/qtiCommonRenderer/helpers/container', 'taoQtiItem/qtiCommonRenderer/helpers/instructions/instructionManager', 'taoQtiItem/qtiCommonRenderer/helpers/PciResponse', 'taoQtiItem/qtiCommonRenderer/helpers/sizeAdapter', 'interact', 'ui/interactUtils'], function ($$1, _, __, hider, Handlebars, Helpers0, containerHelper, instructionMgr, pciResponse, sizeAdapter, interact, interactUtils) { 'use strict';

    $$1 = $$1 && Object.prototype.hasOwnProperty.call($$1, 'default') ? $$1['default'] : $$1;
    _ = _ && Object.prototype.hasOwnProperty.call(_, 'default') ? _['default'] : _;
    __ = __ && Object.prototype.hasOwnProperty.call(__, 'default') ? __['default'] : __;
    hider = hider && Object.prototype.hasOwnProperty.call(hider, 'default') ? hider['default'] : hider;
    Handlebars = Handlebars && Object.prototype.hasOwnProperty.call(Handlebars, 'default') ? Handlebars['default'] : Handlebars;
    Helpers0 = Helpers0 && Object.prototype.hasOwnProperty.call(Helpers0, 'default') ? Helpers0['default'] : Helpers0;
    containerHelper = containerHelper && Object.prototype.hasOwnProperty.call(containerHelper, 'default') ? containerHelper['default'] : containerHelper;
    instructionMgr = instructionMgr && Object.prototype.hasOwnProperty.call(instructionMgr, 'default') ? instructionMgr['default'] : instructionMgr;
    pciResponse = pciResponse && Object.prototype.hasOwnProperty.call(pciResponse, 'default') ? pciResponse['default'] : pciResponse;
    sizeAdapter = sizeAdapter && Object.prototype.hasOwnProperty.call(sizeAdapter, 'default') ? sizeAdapter['default'] : sizeAdapter;
    interact = interact && Object.prototype.hasOwnProperty.call(interact, 'default') ? interact['default'] : interact;
    interactUtils = interactUtils && Object.prototype.hasOwnProperty.call(interactUtils, 'default') ? interactUtils['default'] : interactUtils;

    if (!Helpers0.__initialized) {
      Helpers0(Handlebars);
      Helpers0.__initialized = true;
    }
    var Template = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
      this.compilerInfo = [4,'>= 1.0.0'];
    helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
      var buffer = "", stack1, helper, options, functionType="function", escapeExpression=this.escapeExpression, self=this, blockHelperMissing=helpers.blockHelperMissing;

    function program1(depth0,data) {
      
      var buffer = "", stack1;
      buffer += "id=\""
        + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.attributes)),stack1 == null || stack1 === false ? stack1 : stack1.id)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
        + "\"";
      return buffer;
      }

    function program3(depth0,data) {
      
      var buffer = "", stack1;
      buffer += " "
        + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.attributes)),stack1 == null || stack1 === false ? stack1 : stack1['class'])),typeof stack1 === functionType ? stack1.apply(depth0) : stack1));
      return buffer;
      }

    function program5(depth0,data) {
      
      var buffer = "", stack1;
      buffer += " lang=\""
        + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.attributes)),stack1 == null || stack1 === false ? stack1 : stack1['xml:lang'])),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
        + "\"";
      return buffer;
      }

    function program7(depth0,data) {
      
      var stack1, helper;
      if (helper = helpers.prompt) { stack1 = helper.call(depth0, {hash:{},data:data}); }
      else { helper = (depth0 && depth0.prompt); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
      if(stack1 || stack1 === 0) { return stack1; }
      else { return ''; }
      }

    function program9(depth0,data) {
      
      var stack1;
      stack1 = (typeof depth0 === functionType ? depth0.apply(depth0) : depth0);
      if(stack1 || stack1 === 0) { return stack1; }
      else { return ''; }
      }

      buffer += "<div\n    ";
      stack1 = helpers['if'].call(depth0, ((stack1 = (depth0 && depth0.attributes)),stack1 == null || stack1 === false ? stack1 : stack1.id), {hash:{},inverse:self.noop,fn:self.program(1, program1, data),data:data});
      if(stack1 || stack1 === 0) { buffer += stack1; }
      buffer += "\n    class=\"qti-interaction qti-blockInteraction qti-associateInteraction";
      stack1 = helpers['if'].call(depth0, ((stack1 = (depth0 && depth0.attributes)),stack1 == null || stack1 === false ? stack1 : stack1['class']), {hash:{},inverse:self.noop,fn:self.program(3, program3, data),data:data});
      if(stack1 || stack1 === 0) { buffer += stack1; }
      buffer += "\"\n    data-serial=\"";
      if (helper = helpers.serial) { stack1 = helper.call(depth0, {hash:{},data:data}); }
      else { helper = (depth0 && depth0.serial); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
      buffer += escapeExpression(stack1)
        + "\"\n    data-qti-class=\"associateInteraction\"\n    ";
      stack1 = helpers['if'].call(depth0, ((stack1 = (depth0 && depth0.attributes)),stack1 == null || stack1 === false ? stack1 : stack1['xml:lang']), {hash:{},inverse:self.noop,fn:self.program(5, program5, data),data:data});
      if(stack1 || stack1 === 0) { buffer += stack1; }
      buffer += "\n>\n    ";
      stack1 = helpers['if'].call(depth0, (depth0 && depth0.prompt), {hash:{},inverse:self.noop,fn:self.program(7, program7, data),data:data});
      if(stack1 || stack1 === 0) { buffer += stack1; }
      buffer += "\n    <div class=\"instruction-container\"></div>\n    <ul class=\"choice-area clearfix  none block-listing solid horizontal source\">\n        ";
      options={hash:{},inverse:self.noop,fn:self.program(9, program9, data),data:data};
      if (helper = helpers.choices) { stack1 = helper.call(depth0, options); }
      else { helper = (depth0 && depth0.choices); stack1 = typeof helper === functionType ? helper.call(depth0, options) : helper; }
      if (!helpers.choices) { stack1 = blockHelperMissing.call(depth0, stack1, {hash:{},inverse:self.noop,fn:self.program(9, program9, data),data:data}); }
      if(stack1 || stack1 === 0) { buffer += stack1; }
      buffer += "\n    </ul>\n    <ul class=\"result-area none target clearfix\">\n    </ul>\n    <div class=\"notification-container\"></div>\n</div>\n";
      return buffer;
      });
    function tpl(data, options, asString) {
      var html = Template(data, options);
      return (asString || true) ? html : $(html);
    }

    if (!Helpers0.__initialized) {
      Helpers0(Handlebars);
      Helpers0.__initialized = true;
    }
    var Template$1 = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
      this.compilerInfo = [4,'>= 1.0.0'];
    helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
      var buffer = "", stack1, functionType="function", escapeExpression=this.escapeExpression, self=this;

    function program1(depth0,data) {
      
      
      return "hidden incomplete-pair";
      }

    function program3(depth0,data) {
      
      var buffer = "", stack1;
      buffer += " lang=\""
        + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.attributes)),stack1 == null || stack1 === false ? stack1 : stack1['xml:lang'])),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
        + "\"";
      return buffer;
      }

      buffer += "<li class=\"";
      stack1 = helpers['if'].call(depth0, (depth0 && depth0.empty), {hash:{},inverse:self.noop,fn:self.program(1, program1, data),data:data});
      if(stack1 || stack1 === 0) { buffer += stack1; }
      buffer += "\"";
      stack1 = helpers['if'].call(depth0, ((stack1 = (depth0 && depth0.attributes)),stack1 == null || stack1 === false ? stack1 : stack1['xml:lang']), {hash:{},inverse:self.noop,fn:self.program(3, program3, data),data:data});
      if(stack1 || stack1 === 0) { buffer += stack1; }
      buffer += ">\n    <div class=\"target lft\"></div>\n    <div class=\"target rgt\"></div>\n</li>\n";
      return buffer;
      });
    function pairTpl(data, options, asString) {
      var html = Template$1(data, options);
      return (asString || true) ? html : $(html);
    }

    /*
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
     * Copyright (c) 2014-2019 (original work) Open Assessment Technlogies SA (under the project TAO-PRODUCT);
     *
     */

    const setChoice = function (interaction, $choice, $target) {
        const $container = containerHelper.get(interaction);
        const choiceSerial = $choice.data('serial');
        const choice = interaction.getChoice(choiceSerial);
        let usage = $choice.data('usage') || 0;

        if (!choiceSerial) {
            throw new Error('empty choice serial');
        }

        //to track number of times a choice is used in a pair
        usage++;
        $choice.data('usage', usage);

        const _setChoice = function () {
            $target.data('serial', choiceSerial).html($choice.html()).addClass('filled');

            if (!interaction.responseMappingMode && choice.attr('matchMax') && usage >= choice.attr('matchMax')) {
                $choice.addClass('deactivated');
            }
        };

        if ($target.siblings('div').hasClass('filled')) {
            const $resultArea = $$1('.result-area', $container);
            const $pair = $target.parent();
            const thisPairSerial = [$target.siblings('div').data('serial'), choiceSerial];
            let $otherRepeatedPair = $$1();

            //check if it is not a repeating association!
            $resultArea
                .children()
                .not($pair)
                .each(function () {
                    let $otherPair = $$1(this).children('.filled');
                    if ($otherPair.length === 2) {
                        let otherPairSerial = [$$1($otherPair[0]).data('serial'), $$1($otherPair[1]).data('serial')];
                        if (_.intersection(thisPairSerial, otherPairSerial).length === 2) {
                            $otherRepeatedPair = $otherPair;
                            return false;
                        }
                    }
                });

            if ($otherRepeatedPair.length === 0) {
                //no repeated pair, so allow the choice to be set:
                _setChoice();

                //trigger pair made event
                containerHelper.triggerResponseChangeEvent(interaction, {
                    type: 'added',
                    $pair: $pair,
                    choices: thisPairSerial
                });

                instructionMgr.validateInstructions(interaction, { choice: $choice, target: $target });

                if (interaction.responseMappingMode || parseInt(interaction.attr('maxAssociations')) === 0) {
                    $pair.removeClass('incomplete-pair');

                    //append new pair option?
                    if (!$resultArea.children('.incomplete-pair').length) {
                        $resultArea.append(pairTpl({ empty: true }));
                        $resultArea.children('.incomplete-pair').fadeIn(600, function () {
                            hider.show(this);
                        });
                    }
                }
            } else {
                //repeating pair: show it:

                //@todo add a notification message here in warning
                $otherRepeatedPair.css('border', '1px solid orange');
                $target.html(__('identical pair already exists')).css({
                    color: 'orange',
                    border: '1px solid orange'
                });
                setTimeout(function () {
                    $otherRepeatedPair.removeAttr('style');
                    $target.empty().css({ color: '', border: '' });
                }, 2000);
            }
        } else {
            _setChoice();
        }
    };

    const unsetChoice = function (interaction, $filledChoice, animate, triggerChange) {
        const $container = containerHelper.get(interaction);
        const choiceSerial = $filledChoice.data('serial');
        const $choice = $container.find('.choice-area [data-serial=' + choiceSerial + ']');
        const $parent = $filledChoice.parent();
        const $sibling = $container.find(
            '.choice-area [data-serial=' + $filledChoice.siblings('.target').data('serial') + ']'
        );
        const isNumberOfMaxAssociationsZero = parseInt(interaction.attr('maxAssociations')) === 0;
        let usage = $choice.data('usage') || 0;

        //decrease the  use for this choice
        usage--;

        $choice.data('usage', usage).removeClass('deactivated');

        $filledChoice.removeClass('filled').removeData('serial').empty();

        if (!interaction.swapping) {
            if (triggerChange !== false) {
                //a pair with one single element is not valid, so consider the response to be modified:
                containerHelper.triggerResponseChangeEvent(interaction, {
                    type: 'removed',
                    $pair: $filledChoice.parent()
                });
                instructionMgr.validateInstructions(interaction, { choice: $choice });
            }

            // if we are removing the sibling too, update its usage
            // but only if number of maximum assotiations is zero
            if (isNumberOfMaxAssociationsZero) {
                $sibling.data('usage', $sibling.data('usage') - 1).removeClass('deactivated');
            }

            //completely empty pair:
            if (
                !$choice.siblings('div').hasClass('filled') &&
                (isNumberOfMaxAssociationsZero || interaction.responseMappingMode)
            ) {
                //shall we remove it?
                if (!$parent.hasClass('incomplete-pair')) {
                    if (animate) {
                        $parent.addClass('removing').fadeOut(500, function () {
                            $$1(this).remove();
                        });
                    } else {
                        $parent.remove();
                    }
                }
            }
        }
    };

    const getChoice = function (interaction, identifier) {
        const $container = containerHelper.get(interaction);

        //warning: do not use selector data-identifier=identifier because data-identifier may change dynamically
        const choice = interaction.getChoiceByIdentifier(identifier);
        if (!choice) {
            throw new Error('cannot find a choice with the identifier : ' + identifier);
        }
        return $$1('.choice-area [data-serial=' + choice.getSerial() + ']', $container);
    };

    const renderEmptyPairs = function (interaction) {
        const $container = containerHelper.get(interaction);
        const max = parseInt(interaction.attr('maxAssociations'));
        const $resultArea = $$1('.result-area', $container);

        if (interaction.responseMappingMode || max === 0) {
            $resultArea.append(pairTpl({ empty: true }));
            hider.show($resultArea.children('.incomplete-pair'));
        } else {
            for (let i = 0; i < max; i++) {
                $resultArea.append(pairTpl());
            }
        }
    };

    const _getRawResponse = function (interaction) {
        const response = [];
        const $container = containerHelper.get(interaction);
        $$1('.result-area>li', $container).each(function () {
            const pair = [];
            $$1(this)
                .find('div')
                .each(function () {
                    const serial = $$1(this).data('serial');
                    if (serial) {
                        const choice = interaction.getChoice(serial);
                        if (choice) {
                            pair.push(choice.id());
                        }
                    }
                });
            if (pair.length === 2) {
                response.push(pair);
            }
        });
        return response;
    };
    const _setInstructions = function (interaction) {
        const min = parseInt(interaction.attr('minAssociations'), 10);
        const max = parseInt(interaction.attr('maxAssociations'), 10);

        //infinite association:
        if (min === 0) {
            if (max === 0) {
                instructionMgr.appendInstruction(interaction, __('You may make as many association pairs as you want.'));
            }
        } else {
            if (max === 0) {
                instructionMgr.appendInstruction(interaction, __('The maximum number of association is unlimited.'));
            }
            //the max value is implicit since the appropriate number of empty pairs have already been created
            let msg = __('You need to make') + ' ';
            msg += min > 1 ? __('at least') + ' ' + min + ' ' + __('association pairs') : __('one association pair');
            instructionMgr.appendInstruction(interaction, msg, function () {
                if (_getRawResponse(interaction).length >= min) {
                    this.setLevel('success');
                } else {
                    this.reset();
                }
            });
        }
    };
    /**
     * Init rendering, called after template injected into the DOM
     * All options are listed in the QTI v2.1 information model:
     * http://www.imsglobal.org/question/qtiv2p1/imsqti_infov2p1.html#element10291
     *
     * @param {object} interaction
     */
    const render = function (interaction) {
        const self = this;

        return new Promise(function (resolve) {
            const $container = containerHelper.get(interaction);
            const $choiceArea = $container.find('.choice-area');
            const $resultArea = $container.find('.result-area');

            let $activeChoice = null;
            let scrollObserver = null;

            let isDragAndDropEnabled;
            let dragOptions;
            let dropOptions;
            let scaleX, scaleY;

            let $bin = $$1('<span>', { class: 'icon-undo remove-choice', title: __('remove') });

            let choiceSelector = $choiceArea.selector + ' >li';
            let resultSelector = $resultArea.selector + ' >li>div';
            let binSelector = $container.selector + ' .remove-choice';

            let _getChoice = function (serial) {
                return $choiceArea.find('[data-serial=' + serial + ']');
            };

            /**
             * @todo Tried to store $resultArea.find[...] in a variable but this fails
             * @param $choice
             * @param $target
             * @private
             */
            const _setChoice = function ($choice, $target) {
                setChoice(interaction, $choice, $target);
                sizeAdapter.adaptSize(
                    $$1('.result-area .target, .choice-area .qti-choice', containerHelper.get(interaction))
                );
            };

            const _resetSelection = function () {
                if ($activeChoice) {
                    $resultArea.find('.remove-choice').remove();
                    $activeChoice.removeClass('active');
                    $container.find('.empty').removeClass('empty');
                    $activeChoice = null;
                }
            };

            const _unsetChoice = function ($choice) {
                unsetChoice(interaction, $choice, true);
                sizeAdapter.adaptSize(
                    $$1('.result-area .target, .choice-area .qti-choice', containerHelper.get(interaction))
                );
            };

            const _isInsertionMode = function () {
                return $activeChoice && $activeChoice.data('identifier');
            };

            const _isModeEditing = function () {
                return $activeChoice && !$activeChoice.data('identifier');
            };
            const _activateChoice = function ($choice) {
                _resetSelection();
                $activeChoice = $choice;
                $choice.addClass('active');
                $resultArea.find('>li>.target').addClass('empty');
            };

            const _handleChoiceActivate = function ($target) {
                if ($target.hasClass('deactivated')) {
                    return;
                }

                if (_isModeEditing()) {
                    //swapping:
                    interaction.swapping = true;
                    _unsetChoice($activeChoice);
                    _setChoice($target, $activeChoice);
                    _resetSelection();
                    interaction.swapping = false;
                } else {
                    if ($target.hasClass('active')) {
                        _resetSelection();
                    } else {
                        _activateChoice($target);
                    }
                }
            };
            const _activateResult = function ($target) {
                const targetSerial = $target.data('serial');

                $activeChoice = $target;
                $activeChoice.addClass('active');

                $resultArea
                    .find('>li>.target')
                    .filter(function () {
                        return $$1(this).data('serial') !== targetSerial;
                    })
                    .addClass('empty');

                $choiceArea
                    .find('>li:not(.deactivated)')
                    .filter(function () {
                        return $$1(this).data('serial') !== targetSerial;
                    })
                    .addClass('empty');
            };

            const _handleResultActivate = function ($target) {
                let choiceSerial,
                    targetSerial = $target.data('serial');

                if (_isInsertionMode()) {
                    choiceSerial = $activeChoice.data('serial');

                    if (targetSerial !== choiceSerial) {
                        if ($target.hasClass('filled')) {
                            interaction.swapping = true; //hack to prevent deleting empty pair in infinite association mode
                        }
                        //set choices:
                        if (targetSerial) {
                            _unsetChoice($target);
                        }
                        _setChoice($activeChoice, $target);

                        //always reset swapping mode after the choice is set
                        interaction.swapping = false;
                    }

                    _resetSelection();
                } else if (_isModeEditing()) {
                    choiceSerial = $activeChoice.data('serial');

                    if (targetSerial !== choiceSerial) {
                        if ($target.hasClass('filled') || $activeChoice.siblings('div')[0] === $target[0]) {
                            interaction.swapping = true; //hack to prevent deleting empty pair in infinite association mode
                        }

                        _unsetChoice($activeChoice);
                        if (targetSerial) {
                            //swapping:
                            _unsetChoice($target);
                            _setChoice(_getChoice(targetSerial), $activeChoice);
                        }
                        _setChoice(_getChoice(choiceSerial), $target);

                        //always reset swapping mode after the choice is set
                        interaction.swapping = false;
                    }

                    _resetSelection();
                } else if (targetSerial) {
                    _activateResult($target);
                    $target.append($bin);
                }
            };

            // Point & click handlers

            interact($container.selector).on('tap', function (e) {
                //if tts component is loaded and click-to-speak function is activated - we should prevent this listener to go further
                if ($$1(e.currentTarget).closest('.qti-item').hasClass('prevent-click-handler')) {
                    return;
                }

                _resetSelection();
            });

            interact($choiceArea.selector + ' >li').on('tap', function (e) {
                const $target = $$1(e.currentTarget);

                //if tts component is loaded and click-to-speak function is activated - we should prevent this listener to go further
                if ($target.closest('.qti-item').hasClass('prevent-click-handler')) {
                    return;
                }

                e.stopPropagation();
                _handleChoiceActivate($target);
                e.preventDefault();
            });

            interact($resultArea.selector + ' >li>div').on('tap', function (e) {
                const $target = $$1(e.currentTarget);

                //if tts component is loaded and click-to-speak function is activated - we should prevent this listener to go further
                if ($target.closest('.qti-item').hasClass('prevent-click-handler')) {
                    return;
                }

                e.stopPropagation();
                _handleResultActivate($target);
                e.preventDefault();
            });

            interact(binSelector).on('tap', function (e) {
                //if tts component is loaded and click-to-speak function is activated - we should prevent this listener to go further
                if ($$1(e.currentTarget).closest('.qti-item').hasClass('prevent-click-handler')) {
                    return;
                }

                e.stopPropagation();
                _unsetChoice($activeChoice);
                _resetSelection();
                e.preventDefault();
            });

            if (!interaction.responseMappingMode) {
                _setInstructions(interaction);
            }

            // Drag & drop handlers

            if (self.getOption && self.getOption('enableDragAndDrop') && self.getOption('enableDragAndDrop').associate) {
                isDragAndDropEnabled = self.getOption('enableDragAndDrop').associate;
            }

            function _iFrameDragFix(draggableSelector, target) {
                interactUtils.iFrameDragFixOn(function () {
                    let $activeDrop = $$1(resultSelector + '.dropzone');
                    if ($activeDrop.length) {
                        interact(resultSelector).fire({
                            type: 'drop',
                            target: $activeDrop.eq(0),
                            relatedTarget: target
                        });
                    }
                    $activeDrop = $$1(choiceSelector + '.dropzone');
                    if ($activeDrop.length) {
                        interact(choiceSelector + '.empty').fire({
                            type: 'drop',
                            target: $activeDrop.eq(0),
                            relatedTarget: target
                        });
                    }
                    interact(draggableSelector).fire({
                        type: 'dragend',
                        target: target
                    });
                });
            }

            if (isDragAndDropEnabled) {
                scrollObserver = interactUtils.scrollObserverFactory($container);
                const touchPatch = interactUtils.touchPatchFactory();
                interaction.data('touchPatch', touchPatch);

                dragOptions = {
                    inertia: false,
                    autoScroll: {
                        container: scrollObserver.getScrollContainer().get(0)
                    },
                    restrict: {
                        restriction: '.qti-interaction',
                        endOnly: false,
                        elementRect: { top: 0, left: 0, bottom: 1, right: 1 }
                    }
                };

                // makes choices draggables
                interact(choiceSelector + ':not(.deactivated)')
                    .draggable(
                        _.defaults(
                            {
                                onstart: function (e) {
                                    let $target = $$1(e.target);
                                    let scale;
                                    $target.addClass('dragged');
                                    _activateChoice($target);
                                    _iFrameDragFix(choiceSelector + ':not(.deactivated)', e.target);
                                    scale = interactUtils.calculateScale(e.target);
                                    scaleX = scale[0];
                                    scaleY = scale[1];

                                    scrollObserver.start($activeChoice);
                                    touchPatch.onstart();
                                },
                                onmove: function (e) {
                                    interactUtils.moveElement(e.target, e.dx / scaleX, e.dy / scaleY);
                                },
                                onend: function (e) {
                                    let $target = $$1(e.target);
                                    $target.removeClass('dragged');
                                    // The reason of placing delay here is that there was timing conflict between "draggable" and "drag-zone" elements.
                                    _.delay(function () {
                                        _resetSelection();
                                    });
                                    interactUtils.restoreOriginalPosition($target);
                                    interactUtils.iFrameDragFixOff();

                                    scrollObserver.stop();
                                    touchPatch.onend();
                                }
                            },
                            dragOptions
                        )
                    )
                    .styleCursor(false)
                    .actionChecker(touchPatch.actionChecker);

                // makes results draggables
                interact(resultSelector + '.filled')
                    .draggable(
                        _.defaults(
                            {
                                onstart: function (e) {
                                    let $target = $$1(e.target);
                                    let scale;
                                    $target.addClass('dragged');
                                    _resetSelection();
                                    _activateResult($target);
                                    _iFrameDragFix(resultSelector + '.filled', e.target);
                                    scale = interactUtils.calculateScale(e.target);
                                    scaleX = scale[0];
                                    scaleY = scale[1];

                                    scrollObserver.start($activeChoice);
                                    touchPatch.onstart();
                                },
                                onmove: function (e) {
                                    interactUtils.moveElement(e.target, e.dx / scaleX, e.dy / scaleY);
                                },
                                onend: function (e) {
                                    let $target = $$1(e.target);
                                    $target.removeClass('dragged');

                                    interactUtils.restoreOriginalPosition($target);

                                    if ($activeChoice) {
                                        _unsetChoice($activeChoice);
                                    }
                                    _resetSelection();

                                    interactUtils.iFrameDragFixOff();

                                    scrollObserver.stop();
                                    touchPatch.onend();
                                }
                            },
                            dragOptions
                        )
                    )
                    .styleCursor(false)
                    .actionChecker(touchPatch.actionChecker);

                dropOptions = {
                    overlap: 'pointer',
                    ondragenter: function (e) {
                        $$1(e.target).addClass('dropzone');
                        $$1(e.relatedTarget).addClass('droppable');
                    },
                    ondragleave: function (e) {
                        $$1(e.target).removeClass('dropzone');
                        $$1(e.relatedTarget).removeClass('droppable');
                    }
                };

                // makes hotspots droppables
                interact(resultSelector).dropzone(
                    _.defaults(
                        {
                            ondrop: function (e) {
                                this.ondragleave(e);
                                _handleResultActivate($$1(e.target));
                            }
                        },
                        dropOptions
                    )
                );

                // makes available choices droppables
                interact(choiceSelector + '.empty').dropzone(
                    _.defaults(
                        {
                            ondrop: function (e) {
                                this.ondragleave(e);
                                _handleChoiceActivate($$1(e.target));
                            }
                        },
                        dropOptions
                    )
                );
            }

            // interaction init

            renderEmptyPairs(interaction);

            sizeAdapter.adaptSize($$1('.result-area .target, .choice-area .qti-choice', $container));
            resolve();
        });
    };

    const resetResponse = function (interaction) {
        const $container = containerHelper.get(interaction);

        //destroy selected choice:
        $container.find('.result-area .active').each(function () {
            interactUtils.tapOn(this);
        });

        $$1('.result-area>li>div', $container).each(function () {
            unsetChoice(interaction, $$1(this), false, false);
        });

        containerHelper.triggerResponseChangeEvent(interaction);
        instructionMgr.validateInstructions(interaction);
    };

    const _setPairs = function (interaction, pairs) {
        const $container = containerHelper.get(interaction);
        let addedPairs = 0;
        let $emptyPair = $$1('.result-area>li:first', $container);
        if (pairs && interaction.getResponseDeclaration().attr('cardinality') === 'single' && pairs.length) {
            pairs = [pairs];
        }
        _.forEach(pairs, function (pair) {
            if ($emptyPair.length) {
                let $divs = $emptyPair.children('div');
                setChoice(interaction, getChoice(interaction, pair[0]), $$1($divs[0]));
                setChoice(interaction, getChoice(interaction, pair[1]), $$1($divs[1]));
                addedPairs++;
                $emptyPair = $emptyPair.next('li');
            } else {
                //the number of pairs exceeds the maximum allowed pairs: break;
                return false;
            }
        });

        return addedPairs;
    };

    /**
     * Set the response to the rendered interaction.
     *
     * The response format follows the IMS PCI recommendation :
     * http://www.imsglobal.org/assessment/pciv1p0cf/imsPCIv1p0cf.html#_Toc353965343
     *
     * Available base types are defined in the QTI v2.1 information model:
     * http://www.imsglobal.org/question/qtiv2p1/imsqti_infov2p1.html#element10291
     *
     * @param {object} interaction
     * @param {object} response
     */
    const setResponse = function (interaction, response) {
        _setPairs(interaction, pciResponse.unserialize(response, interaction));
    };

    /**
     * Return the response of the rendered interaction
     *
     * The response format follows the IMS PCI recommendation :
     * http://www.imsglobal.org/assessment/pciv1p0cf/imsPCIv1p0cf.html#_Toc353965343
     *
     * Available base types are defined in the QTI v2.1 information model:
     * http://www.imsglobal.org/question/qtiv2p1/imsqti_infov2p1.html#element10291
     *
     * @param {object} interaction
     * @returns {object}
     */
    const getResponse = function (interaction) {
        return pciResponse.serialize(_getRawResponse(interaction), interaction);
    };

    /**
     * Destroy the interaction by leaving the DOM exactly in the same state it was before loading the interaction.
     * @param {Object} interaction - the interaction
     */
    const destroy = function (interaction) {
        const $container = containerHelper.get(interaction);

        //remove event
        if (interaction.data('touchPatch')) {
            interaction.data('touchPatch').destroy();
            interaction.removeData('touchPatch');
        }
        interact($container.selector).unset();
        interact($container.find('.choice-area').selector + ' >li').unset();
        interact($container.find('.result-area').selector + ' >li>div').unset();
        interact($container.find('.remove-choice').selector).unset();

        //remove instructions
        instructionMgr.removeInstructions(interaction);

        $$1('.result-area', $container).empty();

        //remove all references to a cache container
        containerHelper.reset(interaction);
    };

    /**
     * Set the interaction state. It could be done anytime with any state.
     *
     * @param {Object} interaction - the interaction instance
     * @param {Object} state - the interaction state
     */
    const setState = function setState(interaction, state) {
        let $container;
        if (_.isObject(state)) {
            if (state.response) {
                interaction.resetResponse();
                interaction.setResponse(state.response);
            }

            //restore order of previously shuffled choices
            if (_.isArray(state.order) && state.order.length === _.size(interaction.getChoices())) {
                $container = containerHelper.get(interaction);

                $$1('.choice-area .qti-choice', $container)
                    .sort(function (a, b) {
                        let aIndex = _.indexOf(state.order, $$1(a).data('identifier'));
                        let bIndex = _.indexOf(state.order, $$1(b).data('identifier'));
                        if (aIndex > bIndex) {
                            return 1;
                        }
                        if (aIndex < bIndex) {
                            return -1;
                        }
                        return 0;
                    })
                    .detach()
                    .appendTo($$1('.choice-area', $container));
            }
        }
    };

    /**
     * Get the interaction state.
     *
     * @param {Object} interaction - the interaction instance
     * @returns {Object} the interaction current state
     */
    const getState = function getState(interaction) {
        let $container;
        let state = {};
        let response = interaction.getResponse();

        if (response) {
            state.response = response;
        }

        //we store also the choice order if shuffled
        if (interaction.attr('shuffle') === true) {
            $container = containerHelper.get(interaction);

            state.order = [];
            $$1('.choice-area .qti-choice', $container).each(function () {
                state.order.push($$1(this).data('identifier'));
            });
        }
        return state;
    };

    /**
     * Expose the common renderer for the associate interaction
     * @exports qtiCommonRenderer/renderers/interactions/AssociateInteraction
     */
    var AssociateInteraction = {
        qtiClass: 'associateInteraction',
        template: tpl,
        render: render,
        getContainer: containerHelper.get,
        setResponse: setResponse,
        getResponse: getResponse,
        resetResponse: resetResponse,
        destroy: destroy,
        setState: setState,
        getState: getState,

        renderEmptyPairs: renderEmptyPairs
    };

    return AssociateInteraction;

});
