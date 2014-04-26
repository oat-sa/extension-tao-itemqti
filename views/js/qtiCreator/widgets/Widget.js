define([
    'lodash',
    'jquery',
    'taoQtiItem/qtiItem/core/Element'
], function(_, $, Element){

    var _pushState = function(widget, stateName){
        var currentState = new widget.registeredStates[stateName](widget);
        widget.stateStack.push(currentState);
        currentState.init();
    };

    var _popState = function(widget){
        var state = widget.stateStack.pop();
        if(state){
            state.exit();
        }
    };

    var Widget = {
        init : function(element, $original, $form, options){
            if(element instanceof Element){

                options = options || {};

                this.element = element;
                this.serial = element.getSerial();
                this.$original = $original;
                this.$form = $form;
                this.stateStack = [];
                this.registeredStates = {};

                //build container from origin element
                this.buildContainer();
                this.$container.data('widget', this);
                
                //clean old referenced event
                this.offEvents();//not sure if still required after state definition

                //pass the options to the initCreator for custom options usage 
                this.initCreator(options);

                //init state after creator init
                if(options.state){
                    this.changeState(options.state);
                }else{
                    this.changeState('sleep');
                }

                if(_.isFunction(options.ready)){
                    options.ready.call(this, this);
                }

            }else{
                throw new Error('element is not a QTI Element');
            }
            return this;
        },
        buildContainer : function(){
            throw new Error('method buildContainer must be implemented');
        },
        build : function(element, $container, $form, options){
            return this.clone().init(element, $container, $form, options);
        },
        clone : function(){
            return _.clone(this);
        },
        initCreator : function(){
            //prepare all common actions, event handlers and dom for every state of the widget
        },
        getCurrentState : function(){
            return _.last(this.stateStack);
        },
        /**
         * Very important method:
         * It changes the state of the widget by checking the relation between
         * the target and the current states.
         * 
         * @param {string} stateName
         * @returns {object} this
         */
        changeState : function(stateName){

            var _this = this,
                state,
                superStateName,
                currentState = this.getCurrentState();

            if(this.registeredStates[stateName]){
                state = new this.registeredStates[stateName];
            }else{
                throw new Error('unknown target state : ' + stateName);
                return null;
            }

            if(currentState){

                if(currentState.name === state.name){
                    return this;
                }else if(_.indexOf(state.superState, currentState.name) >= 0){

                    //initialize super states in reverse order:
                    for(var i = _.indexOf(state.superState, currentState.name) - 1; i >= 0; i--){
                        superStateName = state.superState[i];
                        _pushState(this, superStateName);
                    }
                }else{

                    //first, exit the current state
                    _popState(_this);

                    //then, exit super states in order:
                    var exitedStates = _.difference(currentState.superState, state.superState);
                    _.each(exitedStates, function(){
                        _popState(_this);
                    });

                    //finally, init super states in reverse order:
                    var enteredStates = _.difference(state.superState, currentState.superState);
                    _.eachRight(enteredStates, function(superStateName){
                        _pushState(_this, superStateName);
                    });
                }

            }else{
                _.eachRight(state.superState, function(superStateName){
                    _pushState(_this, superStateName);
                });
            }

            _pushState(this, stateName);

            return this;
        },
        registerState : function(name, State){
            if(name && State){
                this.registeredStates[name] = State;
            }else{
                throw new Error('missing required arguments in state registration');
            }
        },
        registerStates : function(states){
            var _this = this;
            _.forIn(states, function(State, name){
                _this.registerState(name, State);
            });
        },
        afterStateInit : function(callback, ns){
            var evtName = 'afterStateInit.qti-widget.' + this.serial + (ns ? '.' + ns : '');
            $(document).on(evtName, callback);
        },
        beforeStateInit : function(callback, ns){
            var evtName = 'beforeStateInit.qti-widget.' + this.serial + (ns ? '.' + ns : '');
            $(document).on(evtName, callback);
        },
        offEvents : function(ns){
            var evtName = '.qti-widget.' + this.serial + (ns ? '.' + ns : '');
            $(document).off(evtName);
        },
        destroy : function(){
            //remove editable widgets
            this.$container.find('[data-edit]').remove();

            //clean old referenced event
            this.offEvents();
        },
        reload : function(options){

            options = options || {};

            var opts = {};
            if(_.isFunction(options.ready)){
                opts['ready'] = options.ready;
            }

            //we assume that the element still has its renderer set
            this.element.render({}, this.$container);
            this.element.postRender(opts);
        },
        //assign an event listener that lives with the state
        on : function(qtiElementEventName, callback){
            
            var _this = this;

            var eventNameToken = [
                qtiElementEventName,
                'qti-widget',
                this.getCurrentState().name,
                this.serial
            ];
            
            $(document).on(eventNameToken.join('.'), function(e, data){
                callback.call(_this, data);
            });
            
            return this;//for chaining
        }
    };

    return Widget;
});