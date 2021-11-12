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
import { getRandomNumber } from '../../../../tao/views/cypress/utils/helpers';

describe('Item preview', () => {
    const className = `Test E2E class ${getRandomNumber()}`;
    const itemName = 'Test E2E item 1';
    /**
     * Log in
     * Visit the page
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
            selectors.resourceRelationsUrl,
            false,
            true
        );
    });
    it('Authors item', () => {
        cy.get(selectors.authoring).click();
        cy.location().should(loc => {
            expect(`${loc.pathname}${loc.search}`).to.eq(urls.itemAuthoring);
        });

        addInteraction('choice');
    });

    it('Saves item', () => {
        cy.intercept('POST', '**/saveItem*').as('saveItem');
        cy.get('[data-testid="save-the-item"]').click();
        cy.wait('@saveItem').its('response.body').its('success').should('eq', true);
    });

    it('Previews item from authoring page', () => {
        cy.intercept('GET', '**/taoQtiTestPreviewer/Previewer/getItem*').as('preview');
        cy.get('[data-testid="preview-the-item"]').should('not.have.class', 'disabled');
        cy.get('[data-testid="preview-the-item"]').click();
        cy.wait('@preview');
        cy.get('.qti-choiceInteraction').should('exist');
        cy.get('[data-control="close"] .icon-close').should('exist');
        cy.get('[data-control="close"] .icon-close').click();
    });

    it('Previews item from items page', () => {
        cy.intercept('GET', '**/taoQtiTestPreviewer/Previewer/getItem*').as('preview');
        cy.visit(urls.items);
        cy.selectNode(selectors.root, selectors.itemClassForm, className);
        cy.selectNode(selectors.root, selectors.itemForm, itemName);
        cy.get('#item-preview').should('exist');
        cy.get('#item-preview').click();
        cy.wait('@preview');
        cy.get('.qti-choiceInteraction').should('exist');
        cy.get('[data-control="close"] .icon-close').should('exist');
        cy.get('[data-control="close"] .icon-close').click();
    });
});
