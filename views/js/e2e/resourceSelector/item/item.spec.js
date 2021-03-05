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

import itemData from './itemData';
import { selectors } from '../resourceTree';

describe('Items', () => {
    const newItemName = itemData.name;

    /**
     * Set up the server & routes
     * Log in
     * Visit the page
     */
    beforeEach(() => {
        cy.setupServer();
        cy.addTreeRoutes();

        cy.login('admin');

        cy.loadItemsPage();
    });

    /**
     * Delete newly created items after each step
     */
    afterEach(() => {
        if (Cypress.$(`[title="${newItemName}"]`).length > 0) {
            cy.deleteItem(`[title="${newItemName}"]`);
        }
    });

    /**
     * Item tests
     */
    describe('Item creation, editing and deletion', () => {
        it('can create and rename a new item', function() {
            cy.addItem(selectors.itemsRootClass);

            cy.renameSelectedItem(newItemName);

            cy.get(selectors.itemsRootClass)
                .contains(newItemName)
                .should('exist');
        });

        it('can delete previously created item', function() {
            cy.addItem(selectors.itemsRootClass);

            cy.renameSelectedItem(newItemName);

            cy.get(selectors.actions.deleteItem).click();
            cy.get('.modal-body [data-control="ok"]').click();

            cy.wait('@deleteItem');
        });

        it('has correct action buttons when item is selected', function() {
            cy.addItem(selectors.itemsRootClass);

            cy.renameSelectedItem(newItemName);

            cy.get(`[title="${newItemName}"]`)
                .closest(selectors.itemsRootClass)
                .should('not.have.class', 'closed');

            cy.get(selectors.actionsContainer).within(() => {
                ['newClass', 'deleteItem', 'import', 'export', 'moveTo', 'copyTo', 'duplicate', 'newItem'].forEach(
                    action => {
                        cy.get(selectors.actions[action])
                            .should('exist')
                            .and('be.visible');
                    }
                );
            });
        });
    });
});
