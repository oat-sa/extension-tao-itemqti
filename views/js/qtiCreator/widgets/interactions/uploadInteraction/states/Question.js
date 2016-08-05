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
 * Copyright (c) 2015 (original work) Open Assessment Technologies SA;
 *
 */

define([
    'lodash',
    'i18n',
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/interactions/blockInteraction/states/Question',
    'taoQtiItem/qtiCreator/widgets/helpers/formElement',
    'taoQtiItem/qtiCommonRenderer/helpers/uploadMime',
    'tpl!taoQtiItem/qtiCreator/tpl/forms/interactions/upload'
], function(_, __, stateFactory, Question, formElement, uploadHelper, formTpl){

    'use strict';
    var UploadInteractionStateQuestion = stateFactory.extend(Question);

    UploadInteractionStateQuestion.prototype.initForm = function() {
        var _widget = this.widget,
            $form = _widget.$form,
            interaction = _widget.element,
            callbacks = {},
            types = uploadHelper.getMimeTypes(),
            $previewZone = _widget.$container.find('.qti-interaction .file-upload-preview'),
            selectedMime = '',
            preselected = [],
            previewClassName = 'visible-file-upload-preview';

        types.unshift({ "mime" : "any/kind", "label" : __("-- Any kind of file --") });

        if (interaction.attr('type') === '') {
            // Kill the attribute if it is empty.
            delete interaction.attributes.type;
        }

        // Pre-select a value in the types combo box if needed.
        var classes = interaction.attr('class');
        if(interaction.attr('type')){
            preselected.push(interaction.attr('type'));
        }else if(classes){
            classes.replace(/x-tao-upload-type-([-_a-zA-Z]*)/g, function($0,mime){
                preselected.push(mime.replace('_', '/'));
            });
        }

        for (var i in types) {
            if (_.indexOf(preselected, types[i].mime) >= 0) {
                types[i].selected = true;
                selectedMime = types[i].mime;
            }
        }
        $form.html(formTpl({
            "types" : types
        }));

        formElement.initWidget($form);
        var $select = $form.find('[name="type"]');
        $select.select2({
            width: '100%',
            formatNoMatches : function(){
                return __('Enter a select MIME-type');
            }
        });

        $previewZone.toggleClass(previewClassName, isPreviewable(selectedMime));

        // -- type callback.
        callbacks.type = function(interaction, attrValue) {

            var classes = interaction.attr('class') || '';
            classes = classes.replace(/(x-tao-upload-type-[-_a-zA-Z]*)/, '').trim();
            interaction.attr('class', classes);
            interaction.removeAttr('type');

            if(!attrValue){
                return;
            }

            if(attrValue.length === 1){
                if (attrValue[0] !== 'any/kind') {
                    interaction.attr('type', attrValue[0]);
                }
            }else{
                classes = _.reduce(attrValue, function(acc, selectedType){
                    return acc + ' x-tao-upload-type-'+selectedType.replace('/', '_');
                }, classes).trim();
                interaction.attr('class', classes);
            }

            $previewZone.toggleClass(previewClassName, isPreviewable(attrValue));
        };

        //init data change callbacks
        formElement.setChangeCallbacks($form, interaction, callbacks);
    };

    function isPreviewable(mime) {
        return mime && mime.indexOf('image') === 0 && mime === 'application/pdf';
    }

    return UploadInteractionStateQuestion;
});

