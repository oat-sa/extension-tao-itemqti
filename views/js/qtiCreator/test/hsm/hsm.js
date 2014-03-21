function log() {
    console.log.apply(window, arguments);
}

function Widget() {

    var currentState = null;

    this.switch = function(state) {

        var _this = this;

        if (currentState) {

            if (currentState.name === state.name) {
                log('same state', state.name);
                return;
            } else {

                //first, exit the current state
                currentState.exit();

                //then, exit super states in order:
                var exitedStates = _.difference(currentState.superState, state.superState);
                log('super states to exit ', exitedStates.join(', '), ':');
                _.each(exitedStates, function(stateName) {
                    stateName = stateName.charAt(0).toUpperCase() + stateName.slice(1);
                    (new State[stateName](_this)).exit();
                });


                //finally, init super states in reverse order:
                var enteredStates = _.difference(state.superState, currentState.superState);
                log('super states to init ', enteredStates.join(', '), ':');
                _.eachRight(enteredStates, function(stateName) {
                    stateName = stateName.charAt(0).toUpperCase() + stateName.slice(1);
                    (new State[stateName](_this)).init();
                });
            }

        } else {
            log('super states init:');
            _.eachRight(state.superState, function(stateName) {
                stateName = stateName.charAt(0).toUpperCase() + stateName.slice(1);
                (new State[stateName](_this)).init();
            });
        }
        
        currentState = state;
        currentState.init();
    };

    this.init = function() {
        currentState = new State.Sleep(this);
        currentState.init();
    };
}


var State = {
    Sleep: function(widget) {
        this.name = 'sleep';
        this.superState = [];
        this.widget = widget;

        this.init = function() {
            log('init sleep');
            //hover: show toolbar
            
            //can be switched to question, answer or deleting
        };

        this.exit = function() {
            log('exit sleep');
            
            //remove hover evt?
        };
    },
    Active: function(widget) {
        this.name = 'active';
        this.superState = [];
        this.widget = widget;

        this.init = function() {
            log('init active');
            
            //top state for all editing states
            
            //show toolbar, ok button
        };

        this.exit = function() {
            log('exit active');
            //hide toolbar, ok button
        };
    },
    Deleting: function(widget) {
        this.name = 'deleting';
        this.superState = [];
        this.widget = widget;

        this.init = function() {
            log('init deleting');
            
            //a popup is displayed indicating deleted element
            //if any action is performed but the cancel (undo) action, the widget will be deleted for good
            
            //switchable to question or answer (onCancel)
        };

        this.exit = function() {
            log('exit deleting');
            
            //remove the popup
        };
    },
    Question: function(widget) {
        this.name = 'question';
        this.superState = ['active'];
        this.widget = widget;

        this.init = function() {
            log('init question');
            
            //show option form
            //allow quick edit of internal element (toggle shuffle/fix, delete choices via minit-toolbar)
            
            //switchable to choice(click), answer(toolbar), deleting(toolbar), sleep (OK button) 
        };

        this.exit = function() {
            log('exit question');
            
            //disable/destroy editor, hide mini-toolbar
        };
    },
    Choice: function(widget) {
        this.name = 'choice';
        this.superState = ['question', 'active'];
        this.widget = widget;

        this.init = function() {
            log('init choice');
            
            //(focus auto set via ck editor)
            
            //show options form
            
            //switchable into question(breadcrumb), answer(toolbar), deleting(toolbar), sleep (OK button) 
        };

        this.exit = function() {
            log('exit choice');
            
            //update breadcrumb, remove options form
        };
    },
    Answer: function(widget) {
        this.name = 'answer';
        this.superState = ['active'];
        this.widget = widget;

        this.init = function() {
            log('init answer');
            
            
            //update breadcrumb
            
            //createResponseWidget, show response form
            
        };

        this.exit = function() {
            log('exit answer');
            
            //update breadcrumb
            
            //hide ResponseWidget, destroy response form
        };
    },
    Correct: function(widget) {
        this.name = 'correct';
        this.superState = ['answer', 'active'];
        this.widget = widget;

        this.init = function() {
            log('init correct');
            
            //show "correct column"
        };

        this.exit = function() {
            log('exit correct');
            
            //hide "correct column"
        };
    },
    Map: function(widget) {
        this.name = 'map';
        this.superState = ['answer', 'active'];
        this.widget = widget;

        this.init = function() {
            log('init map');
            
            //show "score column" + "correct column"
        };

        this.exit = function() {
            log('exit map');
            
            //hide "score and correct"
        };
    }
};

var widget1 = new Widget();
widget1.switch(new State.Question(widget1));
widget1.switch(new State.Answer(widget1));
widget1.switch(new State.Answer(widget1));
widget1.switch(new State.Question(widget1));
widget1.switch(new State.Correct(widget1));
widget1.switch(new State.Sleep(widget1));
widget1.switch(new State.Map(widget1));
widget1.switch(new State.Correct(widget1));
widget1.switch(new State.Map(widget1));
widget1.switch(new State.Question(widget1));
widget1.switch(new State.Map(widget1));
widget1.switch(new State.Sleep(widget1));