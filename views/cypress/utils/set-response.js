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
