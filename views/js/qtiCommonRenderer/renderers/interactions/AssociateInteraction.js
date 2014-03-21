define([
    'lodash',
    'i18n',
    'jquery',
    'tpl!taoQtiItem/qtiCommonRenderer/tpl/interactions/associateInteraction',
    'tpl!taoQtiItem/qtiCommonRenderer/tpl/interactions/associateInteraction.pair',
    'taoQtiItem/qtiCommonRenderer/helpers/Helper',
    'eyecatcher'
], function(_, __, $, tpl, pairTpl, Helper, eyecatcher){

    /**
     * Global variable to count number of choice usages:
     * @type type
     */
    var _choiceUsages = {}

    var setChoice = function(interaction, $choice, $target){

        var choiceSerial = $choice.data('serial'),
            choice = interaction.getChoice(choiceSerial);

        if(!_choiceUsages[choiceSerial]){
            _choiceUsages[choiceSerial] = 0;
        }
        _choiceUsages[choiceSerial]++;

        $target
            .data('serial', choiceSerial)
            .html($choice.html())
            .addClass('filled');

        if(choice.attr('matchMax') && _choiceUsages[choiceSerial] >= choice.attr('matchMax')){
            $choice.addClass('deactivated');
        }

        if($target.siblings('div').hasClass('filled')){
            //pair made!
            Helper.triggerResponseChangeEvent(interaction);
            Helper.validateInstructions(interaction, {choice : $choice, target : $target});

            if(parseInt(interaction.attr('maxAssociations')) === 0){
                var $resultArea = Helper.getContainer(interaction).find('.result-area');

                $target.parent().removeClass('incomplete-pair');

                //append new pair option?
                if(!$resultArea.children('.incomplete-pair').length){
                    $resultArea.append(pairTpl({empty : true}));
                    $resultArea.children('.incomplete-pair').fadeIn(600, function(){
                        $(this).show();
                    });
                }
            }
        }
    };

    var unsetChoice = function(interaction, $choice, animate){

        var serial = $choice.data('serial'),
            $container = Helper.getContainer(interaction);

        $container.find('.choice-area [data-serial=' + serial + ']').removeClass('deactivated');

        _choiceUsages[serial]--;

        $choice
            .removeClass('filled')
            .removeData('serial')
            .empty();

        if(!interaction.swapping){

            //a pair with one single element is not valid, so consider the response to be modified:
            Helper.triggerResponseChangeEvent(interaction);
            Helper.validateInstructions(interaction, {choice : $choice});

            //completely empty pair: 
            if(!$choice.siblings('div').hasClass('filled') && parseInt(interaction.attr('maxAssociations')) === 0){
                //shall we remove it?
                var $parent = $choice.parent();
                if(!$parent.hasClass('incomplete-pair')){
                    if(animate){
                        $parent.addClass('removing').fadeOut(500, function(){
                            $(this).remove();
                        });
                    }else{
                        $parent.remove();
                    }
                }
            }
        }
    };

    var getChoice = function(interaction, identifier){
        return Helper.getContainer(interaction).find('.choice-area [data-identifier=' + identifier + ']');
    };

    var renderEmptyPairs = function(interaction){

        var max = parseInt(interaction.attr('maxAssociations')),
            $resultArea = Helper.getContainer(interaction).find('.result-area');

        if(max){
            for(var i = 0; i < max; i++){
                $resultArea.append(pairTpl());
            }
        }else{
            $resultArea.append(pairTpl({empty : true}));
        }
    };

    /**
     * Init rendering, called after template injected into the DOM
     * All options are listed in the QTI v2.1 information model:
     * http://www.imsglobal.org/question/qtiv2p1/imsqti_infov2p1.html#element10291
     * 
     * @param {object} interaction
     */
    var render = function(interaction){

        renderEmptyPairs(interaction);

        var $container = Helper.getContainer(interaction),
            $choiceArea = $container.find('.choice-area'),
            $resultArea = $container.find('.result-area'),
            $activeChoice = null;

        var _getChoice = function(serial){
            return $choiceArea.find('[data-serial=' + serial + ']');
        };

        var _setChoice = function($choice, $target){
            setChoice(interaction, $choice, $target);
        };

        var _resetSelection = function(){
            if($activeChoice){
                $resultArea.find('.remove-choice').remove();
                $activeChoice.removeClass('active');
                $container.find('.empty').removeClass('empty');
                $activeChoice = null;
            }
        };

        var _unsetChoice = function($choice){
            unsetChoice(interaction, $choice, true);
        };

        var _isInsertionMode = function(){
            return ($activeChoice && $activeChoice.data('identifier'));
        };

        var _isModeEditing = function(){
            return ($activeChoice && !$activeChoice.data('identifier'));
        };

        $choiceArea.on('mousedown.commonRenderer', '>li', function(e){

            if($(this).hasClass('deactivated')){
                e.preventDefault();
                return;
            }

            if(_isModeEditing()){
                //swapping:
                interaction.swapping = true;
                _unsetChoice($activeChoice);
                _setChoice($(this), $activeChoice);
                _resetSelection();
                interaction.swapping = false;
            }else{

                if($(this).hasClass('active')){
                    _resetSelection();
                }else{
                    _resetSelection();

                    //activate it:
                    $activeChoice = $(this);
                    $(this).addClass('active');
                    $resultArea.find('>li>div').addClass('empty');
                }
            }

        });

        $resultArea.on('mousedown.commonRenderer', '>li>div', function(){

            if(_isInsertionMode()){

                var $target = $(this),
                    choiceSerial = $activeChoice.data('serial'),
                    targetSerial = $target.data('serial');

                if(targetSerial !== choiceSerial){
                    
                    if($target.hasClass('filled')){
                        interaction.swapping = true;//hack to prevent deleting empty pair in infinite association mode
                    }
                    
                    //set choices:
                    if(targetSerial){
                        _unsetChoice($target);
                    }

                    _setChoice($activeChoice, $target);
                    
                    //always reset swapping mode after the choice is set
                    interaction.swapping = false;
                }

                _resetSelection();

            }else if(_isModeEditing()){

                //editing mode:
                var $target = $(this),
                    targetSerial = $target.data('serial'),
                    choiceSerial = $activeChoice.data('serial');

                if(targetSerial !== choiceSerial){

                    if($target.hasClass('filled') || $activeChoice.siblings('div')[0] === $target[0]){
                        interaction.swapping = true;//hack to prevent deleting empty pair in infinite association mode
                    }

                    _unsetChoice($activeChoice);
                    if(targetSerial){
                        //swapping:
                        _unsetChoice($target);
                        _setChoice(_getChoice(targetSerial), $activeChoice);
                    }
                    _setChoice(_getChoice(choiceSerial), $target);

                    //always reset swapping mode after the choice is set
                    interaction.swapping = false;
                }

                _resetSelection();

            }else if($(this).data('serial')){

                //selecting a choice in editing mode:
                var serial = $(this).data('serial');

                $activeChoice = $(this);
                $activeChoice.addClass('active');

                $resultArea.find('>li>div').filter(function(){
                    return $(this).data('serial') !== serial;
                }).addClass('empty');

                $choiceArea.find('>li:not(.deactivated)').filter(function(){
                    return $(this).data('serial') !== serial;
                }).addClass('empty');

                //append trash bin:
                var $bin = $('<span>', {'class' : 'icon-undo remove-choice', 'title' : __('remove')});
                $bin.on('mousedown', function(e){
                    e.stopPropagation();
                    _unsetChoice($activeChoice);
                    _resetSelection();
                });
                $(this).append($bin);
            }

        });

        //@todo run eyecatcher: fix it
//        eyecatcher();

        _setInstructions(interaction);
    };

    var _setInstructions = function(interaction){

        var min = parseInt(interaction.attr('minAssociations')),
            max = parseInt(interaction.attr('maxAssociations'));

        //infinite association:
        if(min === 0){
            if(max === 0){
                Helper.appendInstruction(interaction, __('You may make as many association pairs as you want.'));
            }
        }else{
            if(max === 0){
                Helper.appendInstruction(interaction, __('The maximum number of association is unlimited.'));
            }
            //the max value is implicit since the appropriate number of empty pairs have already been created
            var msg = __('You need to make at least') + ' ';
            msg += (min > 1) ? min + ' ' + __('association pairs') : __('one association pair');
            Helper.appendInstruction(interaction, msg, function(){
                if(_getRawResponse(interaction).length >= min){
                    this.setLevel('success');
                }else{
                    this.reset();
                }
            });
        }
    };

    var _resetResponse = function(interaction){
        Helper.getContainer(interaction).find('.result-area>li>div').each(function(){
            unsetChoice(interaction, $(this));
        });
    };

    var _setPairs = function(interaction, pairs){

        var addedPairs = 0,
            $emptyPair = Helper.getContainer(interaction).find('.result-area>li:first');

        _.each(pairs, function(pair){
            if($emptyPair.length){
                var $divs = $emptyPair.children('div');
                setChoice(interaction, getChoice(interaction, pair[0]), $($divs[0]));
                setChoice(interaction, getChoice(interaction, pair[1]), $($divs[1]));
                addedPairs++;
                $emptyPair = $emptyPair.next('li');
            }else{
                //the number of pairs exceeds the maxium allowed pairs: break;
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
     * Special value: the empty object value {} resets the interaction responses
     * 
     * @param {object} interaction
     * @param {object} response
     */
    var setResponse = function(interaction, response){

        if(response.base && response.base.pair && _.isArray(response.base.pair) && response.base.pair.length === 2){
            _setPairs(interaction, [response.base.pair]);
        }else if(response.list && response.list.pair && _.isArray(response.list.pair)){
            _setPairs(interaction, response.list.pair);
        }else if(_.isEmpty(response)){
            _resetResponse(interaction);
        }else{
            throw new Error('wrong response format in argument: ');
        }
    };

    var _getRawResponse = function(interaction){
        var response = [];
        Helper.getContainer(interaction).find('.result-area>li').each(function(){
            var pair = [];
            $(this).find('div').each(function(){
                var serial = $(this).data('serial');
                if(serial){
                    pair.push(interaction.getChoice(serial).id());
                }
            });
            if(pair.length === 2){
                response.push(pair);
            }
        });
        return response;
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
    var getResponse = function(interaction){
        var ret = {}, values = _getRawResponse(interaction);
        if(values.length === 1){
            ret = {base : {pair : values[0]}};
        }else{
            ret = {list : {pair : values}};
        }
        return ret;
    };

    var restore = function(interaction){

        var $container = Helper.getContainer(interaction);

        //restore seelcted choice:
        $container.find('.result-area .active').mousedown();

        //remove event
        $(document).off('.commonRenderer');
        $container.find('.choice-area, .result-area').off('.commonRenderer');

        //restore response
        _resetResponse(interaction);

        //remove instructions
        Helper.removeInstructions(interaction);
    };

    return {
        qtiClass : 'associateInteraction',
        template : tpl,
        render : render,
        getContainer : Helper.getContainer,
        setResponse : setResponse,
        getResponse : getResponse,
        restore : restore
    };
});