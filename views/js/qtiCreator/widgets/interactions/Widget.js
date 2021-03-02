define([
    'lodash',
    'jquery',
    'taoQtiItem/qtiCreator/widgets/Widget',
    'taoQtiItem/qtiCreator/widgets/helpers/movable',
    'tpl!taoQtiItem/qtiCreator/tpl/toolbars/interaction',
    'tpl!taoQtiItem/qtiCreator/tpl/toolbars/okButton',
    'taoQtiItem/qtiCreator/editor/gridEditor/content',
    '../../helper/classTitles'
], function (_, $, Widget, movable, toolbarTpl, okButtonTpl, contentHelper, getQtiClassTitle) {
    /**
     *
     * Create a new widget definition from another prototype.
     */
    const InteractionWidget = Widget.clone();

    /**
     * Optional method to be implemented :
     * Init the widget
     * It should never be called directly in normal usage
     * Here, it is overwriten to accomodate for a new argument
     * that other widgets does not have: $responseForm
     */
    InteractionWidget.init = function (element, $container, $form, $responseForm, options) {
        Widget.init.call(this, element, $container, $form, options);
        this.$responseForm = $responseForm;
        return this;
    };

    /**
     * Optional method to be implemented :
     * Build the widget and return an instance ready to be used
     * Here, it is overwritten to accomodate for a new argument
     * that other widgets does not have: $responseForm
     */
    InteractionWidget.build = function (element, $container, $form, $responseForm, options) {
        return this.clone().init(element, $container, $form, $responseForm, options);
    };

    /**
     * Required method to be implemented :
     * define the states and common structure valid for all states
     */
    InteractionWidget.initCreator = function () {
        Widget.initCreator.call(this);

        this.createToolbar({});
        this.createOkButton();
        this.listenToChoiceStates();
        this.listenToIncludeStates();
    };

    /**
     * Required method to be implemented :
     * Define the contaieinr where everything is going on.
     * It normally used this.$original as the start point : from there, you can wrap, innerWrap
     */
    InteractionWidget.buildContainer = function () {
        const $wrap = $('<div>', {
            'data-serial': this.element.serial,
            class: 'widget-box widget-blockInteraction clearfix',
            'data-qti-class': this.element.qtiClass
        });
        const $interactionContainer = this.$original.wrap($wrap);
        this.$container = $interactionContainer.parent();

        //@todo : implement movable interaction here:
        //        movable.create(this);

        return this;
    };

    function _convertToTitle(str) {
        str = str.replace(/[A-Z]/g, match => ' ' + match.toUpperCase());
        return str.charAt(0).toUpperCase() + str.substr(1);
    }

    /**
     * Below here, optional ui component init functions
     */

    /**
     * Create a toolbar
     */
    InteractionWidget.createToolbar = function (options) {
        options = _.defaults(options || {}, {
            title: _convertToTitle(getQtiClassTitle(this.element.qtiClass))
        });

        const $toolbar = $(
            toolbarTpl({
                title: options.title,
                serial: this.element.serial,
                switcher: !!this.registeredStates.answer
            })
        );

        this.$container.append($toolbar);
        $toolbar.hide();

        $toolbar.find('[data-role="delete"]').click(e => {
            e.stopPropagation(); //prevent direct deleting
            this.changeState('deleting');
        });

        //if the answer state has been registered
        if (this.registeredStates.answer) {
            //initialize the state switcher
            $toolbar.on('click', '.link', (e) => {
                const $link = $(e.target),
                    state = $link.data('state');

                $link.siblings('.selected').removeClass('selected').addClass('link');
                $link.removeClass('link').addClass('selected');
                this.changeState(state);
            });

            //add stateChange event listener to auto toggle the question/answer trigger
            this.beforeStateInit((e, element, state) => {
                if (element.getSerial() === this.serial) {
                    const $link = $toolbar.find('.link[data-state="' + state.name + '"]');
                    if ($link.length) {
                        //a known active state:
                        $link.siblings('.selected').removeClass('selected').addClass('link');
                        $link.removeClass('link').addClass('selected');
                    }
                }
            });
        }

        return this;
    };

    InteractionWidget.createOkButton = function () {
        const $ok = $(okButtonTpl()).on('click.qti-widget', e => {
            e.stopPropagation();
            this.changeState('sleep');
        });

        this.$container.append($ok);
    };

    InteractionWidget.listenToChoiceStates = function () {
        this.afterStateInit((e, element, state) => {
            const currentState = this.getCurrentState();

            if (
                element.is('choice') &&
                this.element.getChoice(element.getSerial()) &&
                currentState &&
                state.name !== currentState.name
            ) {
                switch (state.name) {
                    case 'choice':
                        this.changeState(state.name);
                        break;
                }
            }
        });
    };

    InteractionWidget.listenToIncludeStates = function () {
        this.afterStateExit((e, element, state) => {
            const serial = element.getSerial();

            if (state.name === 'active' && element.qtiClass === 'include') {
                // update body of container in case include is wrapped in custom-include-box
                let container = this.element;

                const composingElts = this.element.getComposingElements();
                if (composingElts[serial]) {
                    const $editableContainer = element.metaData.widget.$container.closest(
                        '[data-html-editable="true"]'
                    );
                    container =
                        Object.values(composingElts).find(el => el.elements && el.elements[serial]) || container;

                    const editableContent = $editableContainer.wrap($('<div>'));
                    const newBody = contentHelper.getContent(editableContent);
                    container.body(newBody);
                }
            }
        });
    };

    return InteractionWidget;
});
