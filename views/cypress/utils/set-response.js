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
 * Copyright (c) 2021 Open Assessment Technologies SA ;
 */
import { addShapeToImage } from './graphic-interactions';
import selectors from '../utils/selectors';
import urls from '../utils/urls';
/**
 * Set response in Interaction in item Authoring
 * @param {String} widgetSelector
 * @param {String} widgetActiveSelector
 * @param {String} qtiClass
 */
export function setResponse(widgetSelector, widgetActiveSelector, qtiClass) {
    cy.log('SET RESPONSE', widgetSelector, qtiClass);

    cy.getSettled(widgetSelector).click({ force: true });
    cy.getSettled(widgetActiveSelector).should('have.class', 'edit-active');

    switch (qtiClass) {
        case 'hottextInteraction':
            cy.selectTextWithin(`${widgetActiveSelector} .qti-flow-container p`);
            cy.get(`${widgetActiveSelector} div[data-role="create-hottext"]`).click({ force: true });
            break;
        case 'gapMatchInteraction':
            cy.selectTextWithin(`${widgetActiveSelector} .qti-flow-container p`);
            cy.get(`${widgetActiveSelector} div[data-role="create-gap"]`).click({ force: true });
            break;
        case 'graphicAssociateInteraction':
            addShapeToImage('[data-qti-class="graphicAssociateInteraction"]', 'rect', 50);
            break;
    }

    cy.getSettled(`${widgetActiveSelector} span.link[data-state="answer"]`).should('exist');
    cy.get(`${widgetActiveSelector} span.link[data-state="answer"]`).click({ force: true });
    cy.getSettled(widgetActiveSelector).should('have.class', 'edit-answer');

    switch (qtiClass) {
        case 'inlineChoiceInteraction':
            cy.get(`${widgetActiveSelector} select`).select('choice_1', { force: true });
            cy.get(`${widgetActiveSelector} select`).should('have.value', 'choice_1');
            break;
        case 'textEntryInteraction':
            cy.get(`${widgetActiveSelector} input[name="correct"]`).type('answer');
            cy.get(`${widgetActiveSelector} input[name="correct"]`).should('have.value', 'answer');
            break;
        case 'choiceInteraction':
            cy.get(`${widgetActiveSelector} .qti-choice`).first().click({ force: true });
            cy.get(`${widgetActiveSelector} .qti-choice`).first().should('have.class', 'user-selected');
            break;
        case 'orderInteraction':
            cy.get(`${widgetActiveSelector} .choice-area .qti-choice`).first().click({ force: true });
            cy.get(`${widgetActiveSelector} .result-area .qti-choice`).should('exist');
            break;
        case 'associateInteraction':
            cy.get(`${widgetActiveSelector} .choice-area .qti-choice`).first().click({ force: true });
            cy.get(`${widgetActiveSelector} .result-area .target`).first().click({ force: true });
            cy.get(`${widgetActiveSelector} .choice-area .qti-choice`).last().click({ force: true });
            cy.get(`${widgetActiveSelector} .result-area .target`).last().click({ force: true });
            break;
        case 'matchInteraction':
            cy.get(`${widgetActiveSelector} table input[type="checkbox"]`).first().check({ force: true });
            cy.get(`${widgetActiveSelector} table input[type="checkbox"]`).first().should('be.checked');
            break;
        case 'hottextInteraction':
            cy.get(`${widgetActiveSelector} .qti-flow-container .qti-choice`).first().click({ force: true });
            cy.get(`${widgetActiveSelector} .qti-flow-container input[type="checkbox"]`).first().should('be.checked');
            break;
        case 'gapMatchInteraction':
            cy.get(`${widgetActiveSelector} .choice-area .qti-choice`).first().click({ force: true });
            cy.get(`${widgetActiveSelector} .qti-flow-container .qti-gap .gapmatch-content`).first().click({ force: true });
            cy.get(`${widgetActiveSelector} .qti-flow-container .qti-gap .gapmatch-content`).should('have.class', 'filled');
            break;
        case 'sliderInteraction':
            cy.get(`${widgetActiveSelector} .qti-slider .noUi-handle`).click({ force: true });
            cy.get(`${widgetActiveSelector} .qti-slider .noUi-origin`).click('center', { force: true });
            cy.get(`${widgetActiveSelector} input.qti-slider-value`).should('not.have.value', '0');
            break;
        case 'extendedTextInteraction':
            cy.get(`${widgetActiveSelector} textarea`).type('answer');
            cy.get(`${widgetActiveSelector} textarea`).should('have.value', 'answer');
            break;
        case 'hotspotInteraction':
            cy.get(`${widgetActiveSelector} .image-editor svg rect`).first().click({ force: true });
            break;
        case 'graphicOrderInteraction':
            cy.get(`${widgetActiveSelector} .image-editor svg rect`).first().click({ force: true });
            cy.get(`${widgetActiveSelector} .image-editor svg text`).should('not.have.css', 'display', 'none')  ;
            break;
        case 'graphicAssociateInteraction':
            cy.get(`${widgetActiveSelector} .image-editor svg rect`).first().click({ force: true });
            cy.get(`${widgetActiveSelector} .image-editor svg rect`).last().click({ force: true });
            cy.get(`${widgetActiveSelector} .image-editor svg path`).should('exist');
            break;
        case 'graphicGapMatchInteraction':
            cy.get(`${widgetActiveSelector} .image-editor .source .qti-choice`).first().click({ force: true });
            cy.get(`${widgetActiveSelector} .image-editor svg rect`).first().click({ force: true });
            cy.get(`${widgetActiveSelector} .image-editor svg image`).should('have.length', 2);
            break;
        case 'selectPointInteraction':
            addShapeToImage('[data-qti-class="selectPointInteraction"]', 'rect');
            cy.get(`${widgetActiveSelector} .image-editor svg rect`).should('exist');
            break;
    }

    cy.get(`${widgetActiveSelector} button.widget-ok`).click({ force: true });
}

/**
 * Triggers item preview
 * verfies that interaction is present in preview
 */

function previewItem () {
    cy.intercept('GET', selectors.itemPreviewUrl).as('preview');
    cy.get(selectors.previewItemButton).should('not.have.class', 'disabled');
    cy.get(selectors.previewItemButton).click({force :true});
    cy.wait('@preview');
    cy.get('.qti-choiceInteraction').should('exist');
}
/**
 * Saves Item
 * verifies its success
 */

function saveItem() {
    cy.intercept('POST', '**/saveItem*').as('saveItem');
    cy.get('[data-testid="save-the-item"]').click();
    cy.wait('@saveItem')
        .its('response.body')
        .its('success')
        .should('eq', true);
}

export function addResponseProcessing(
    widgetSelector,
    qtiClass,
    responseProcessingOption
) {
    cy.log('ADD RESPONSE PROCESSING', widgetSelector, qtiClass);
    cy.getSettled(widgetSelector).find( selectors.selectInteractionResponse).click({force: true});
    cy.intercept('POST', selectors.itemSubmitUrl).as('submitItem');

    switch (responseProcessingOption) {
        case 'match correct':
            cy.get('ol').find('li[data-identifier="choice_3"]').click({force: true});
            cy.get('[id="s2id_responseProcessing"]').click({force: true});
            saveItem();
            previewItem();
            //chose correct response
            cy.getSettled('ol').find('li[data-identifier="choice_3"]').last().click({force:true});
            cy.get(selectors.previewSubmitButton).click({force: true});
            cy.wait('@submitItem').its('response.body').its('success').should('eq', true);
            cy.getSettled('[class="log-message"]').contains('SCORE: (float) 1');
            //chose wrong response
            cy.getSettled('ol').find('li[data-identifier="choice_3"]').last().click({force:true});
            cy.get(selectors.previewSubmitButton).click({force: true});
            cy.getSettled('[class="log-message"]').contains('SCORE: (float) 0');
            //close item
            cy.get('[class="rgt navi-box"]').find('[data-control="close"]').click({force: true});
            break;

        case 'map response':
            cy.log('This is case ', responseProcessingOption);
            cy.getSettled(widgetSelector).find(selectors.selectInteractionResponse).click({force: true});
            cy.get('[id="s2id_responseProcessing"]').click();
            cy.get('div[class="select2-drop select2-display-none select2-drop-active"]').last().click();
            cy.get('input.score[data-for="choice_3"]').type(2);
            //set correct response
            cy.get('[name="defineCorrect"]').click({force: true});
            //able to set min/max
            cy.getSettled('[class="panel min-max-panel"]')
                .find('[name="lowerBound-toggler"]')
                .click({force:true});
            cy.getSettled('[class="panel min-max-panel"]')
                .find('[name="upperBound-toggler"]')
                .click({force: true})
                .should('not.have.value', '0');
            cy.getSettled('[class="panel min-max-panel"]').find('[name="upperBound-toggler"]').click({force: true});
            //set mapping default
            cy.get('[name="defaultValue"]')
                .clear()
                .type(1)
                .clear()
                .type(0);
            saveItem();
            previewItem();
            //check correct response
            cy.getSettled('ol').find('li[data-identifier="choice_3"]').last().click({force:true});
            cy.get(selectors.previewSubmitButton).click({force: true});
            cy.wait('@submitItem').its('response.body').its('success').should('eq', true);
            cy.getSettled('[class="log-message"]').contains('SCORE: (float) 2');
            //check wrong response
            cy.getSettled('ol').find('li[data-identifier="choice_3"]').last().click({force:true});
            cy.getSettled('ol').find('li[data-identifier="choice_2"]').last().click({force:true});
            cy.get(selectors.previewSubmitButton).click({force: true});
            cy.getSettled('[class="log-message"]').contains('SCORE: (float) 0');
            //close item preview
            cy.get('[class="rgt navi-box"]').find('[data-control="close"]').click({force: true});
            break;

        case 'none':
            cy.log('This is case ', qtiClass);
            cy.getSettled(widgetSelector).find(selectors.selectInteractionResponse).click({force: true});
            cy.get('[id="s2id_responseProcessing"]').click();
            cy.get('div[class="select2-drop select2-display-none select2-drop-active"]')
                .contains('none')
                .click({force: true});
            cy.getSettled('ol').find('li[data-identifier="choice_2"]')
                .last()
                .click({force:true})
                .should('not.be.checked');
            saveItem();
            previewItem();
            cy.getSettled('ol').find('li[data-identifier="choice_3"]').last().click({force:true});
            cy.get(selectors.previewSubmitButton).click({force: true});
            cy.wait('@submitItem').its('response.body').its('success').should('eq', true);
            cy.getSettled('[class="log-message"]').should('not.contain','SCORE:');
            cy.getSettled('[class="log-message"]').contains('(identifier) [choice_3]');
            cy.get('[class="rgt navi-box"]').find('[data-control="close"]').click({force: true});
    }
}
