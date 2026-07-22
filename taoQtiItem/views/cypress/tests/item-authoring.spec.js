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

import {
    addBlockAndInlineInteractions,
    removeBlockAndInlineInteractions,
    addCommonInteractions,
    removeCommonInteractions,
    addMediaInteraction,
    removeMediaInteraction,
    addGraphicInteractions,
    removeGraphicInteractions
} from '../utils/authoring-add-interactions';
import { getRandomNumber } from '../../../../tao/views/cypress/utils/helpers';

describe('Item Authoring', () => {
    const className = `Test E2E class ${getRandomNumber()}`;
    const itemName = 'Test E2E item 1';
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

            cy.get(selectors.authoring).click();
            cy.location().should(loc => {
                expect(`${loc.pathname}${loc.search}`).to.eq(urls.itemAuthoring);
            });
        });

        it('should be "Manage Items" button', function () {
            cy.get('[data-testid="manage-items"]').should('have.length', 1);
        });

        it('should be "Save" button', function () {
            cy.get('[data-testid="save-the-item"]').should('have.length', 1);
        });

        it('should be disabled "Preview Item" button', function () {
            cy.get('[data-testid="preview-the-item"]').should('have.class', 'disabled');
        });

        it('should be item editor panel', function () {
            cy.get('#item-editor-panel').should('have.length', 1);
        });

        it('should be item properties right panel', function () {
            cy.get('#item-editor-item-widget-bar').should('have.length', 1);
        });

        it('should be interactions left panel', function () {
            cy.get('#item-editor-interaction-bar').should('have.length', 1);
        });

        it('can add inline interactions to Block', () => {
            cy.getSettled('.qti-item.item-editor-item.edit-active').should('exist');
            // open inline interactions panel
            cy.get('#sidebar-left-section-inline-interactions').click();
            addBlockAndInlineInteractions();
            // close inline interactions panel
            cy.get('#sidebar-left-section-inline-interactions ._accordion').click();
        });

        it('can add common interactions to canvas', () => {
            addCommonInteractions();
        });

        it('can add media interaction to canvas and upload video', () => {
            addMediaInteraction();
            // close common interaction panel
            cy.get('#sidebar-left-section-common-interactions ._accordion').click();
        });

        it('can add graphic interactions to canvas and upload image', () => {
            // open graphic interactions panel
            cy.get('#sidebar-left-section-graphic-interactions').click();
            addGraphicInteractions();
        });

        it('can save item with interactions', () => {
            cy.intercept('POST', '**/saveItem*').as('saveItem');
            cy.get('[data-testid="save-the-item"]').click();
            cy.wait('@saveItem').its('response.body').its('success').should('eq', true);
        });

        it('should be enabled "Preview Item" button', () => {
            cy.get('[data-testid="preview-the-item"]').should('not.have.class', 'disabled');
        });

        it('can remove graphic interactions from canvas', () => {
            // open graphic interactions panel
            cy.get('#sidebar-left-section-graphic-interactions').click();
            removeGraphicInteractions();
        });

        it('can remove media interaction from canvas', () => {
            removeMediaInteraction();
            // close common interaction panel
            cy.get('#sidebar-left-section-common-interactions ._accordion').click();
        });

        it('can remove common interactions from canvas', () => {
            removeCommonInteractions();
        });

        it('can remove inline interactions from Block', () => {
            cy.getSettled('.qti-item.item-editor-item.edit-active').should('exist');
            // open inline interactions panel
            cy.get('#sidebar-left-section-inline-interactions').click();

            removeBlockAndInlineInteractions();

            // close inline interactions panel
            cy.get('#sidebar-left-section-inline-interactions ._accordion').click();
        });

        it('can save item with removed interactions', () => {
            cy.intercept('POST', '**/saveItem*').as('saveItem');
            cy.get('[data-testid="save-the-item"]').click();
            cy.wait('@saveItem').its('response.body').its('success').should('eq', true);
        });
    });
});
