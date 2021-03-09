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

import interactionData from './interactionsData';
import { selectors } from '../../resourceSelector/resourceTree';
import { selectors as selectors2 } from '../authoring';

describe('Common Interactions', () => {
    const newItemName = interactionData.name;

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
    // afterEach(() => {
    //     cy.returnToManageItems();
    //
    //     if (Cypress.$(`[title="${newItemName}"]`).length > 0) {
    //         cy.deleteItem(`[title="${newItemName}"]`);
    //     }
    // });

    /**
     * Interactions tests
     */
    describe('Adding editing and deleting a simple choice interaction', () => {
        it('can add simple choice interaction', function() {
            cy.addItem(selectors.itemsRootClass);

            cy.renameSelectedItem(newItemName);

            cy.get(selectors.itemsRootClass)
                .contains(newItemName)
                .should('exist');

            cy.goToItemAuthoring(selectors.itemsRootClass);

            // const t = cy.get(selectors2.itemEditor);
            // cy.dragToPoint(t, { x: 200, y : 200 });
        });
    });
});
