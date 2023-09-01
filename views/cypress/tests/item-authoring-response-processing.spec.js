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
 * Copyright (c) 2021 (original work) Open Assessment Technologies SA ;
 */

import urls from '../utils/urls';
import selectors from '../utils/selectors';

import { addInteraction } from '../utils/authoring-add-interactions';
import { addResponseProcessing } from '../utils/set-response';
import { getRandomNumber } from '../../../../tao/views/cypress/utils/helpers';

describe('Item Authoring', () => {
    const className = `Test E2E class ${getRandomNumber()}`;
    const itemName = 'Test E2E item 1';

    const commonWidgetSelector = (qtiClass) => `.widget-box.widget-blockInteraction[data-qti-class="${qtiClass}"]`;

    const choice= 'choiceInteraction';
    const responseProcessingOption = ['match correct', 'map response', 'none'];
    /**
     * Log in
     * Visit Items page
     */
     before(() => {
        cy.setup(
            selectors.treeRenderUrl,
            selectors.editClassLabelUrl,
            urls.items,
            selectors.root
        );

        cy.addClassToRoot(
            selectors.root,
            selectors.itemClassForm,
            className,
            selectors.editClassLabelUrl,
            selectors.treeRenderUrl,
            selectors.addSubClassUrl
        );
        cy.addNode(selectors.itemForm, selectors.addItem);
        cy.renameSelectedNode(selectors.itemForm, selectors.editItemUrl, itemName);
    });
    /**
     * Visit Items page
     * Delete e2e class
     */
     after(() => {
        cy.intercept('POST', '**/edit*').as('edit');
        cy.visit(urls.items);
        cy.wait('@edit');

        cy.deleteClassFromRoot(
            selectors.root,
            selectors.itemClassForm,
            selectors.deleteClass,
            selectors.deleteConfirm,
            className,
            selectors.deleteClassUrl,
            true
        );
    });
    /**
     * Tests
     */
    describe('Item authoring', () => {
        it('can open item authoring', function () {
            cy.get(selectors.authoring).click();
            cy.location().should(loc => {
                expect(`${loc.pathname}${loc.search}`).to.eq(urls.itemAuthoring);
            });
        });
        it('can add single interaction to an item', function () {

            addInteraction("choice");
        });
        it('can add  match correct response processing to item', function () {
            addResponseProcessing(
                commonWidgetSelector(choice),
                choice,
                responseProcessingOption[0]
            );
        });
        it('can add map response response processing to item', function () {
            addResponseProcessing(
                commonWidgetSelector(choice),
                choice,
                responseProcessingOption[1]
            );
        });
        it('can add none to response processing to item', function () {
            addResponseProcessing(
                commonWidgetSelector(choice),
                choice,
                responseProcessingOption[2]
            );
        });
        it('can save item with responses in interactions', () => {
            cy.intercept('POST', '**/saveItem*').as('saveItem');
            cy.get('[data-testid="save-the-item"]').click();
            cy.wait('@saveItem').its('response.body').its('success').should('eq', true);
        });
    });
});
