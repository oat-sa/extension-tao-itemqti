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

import { addABlock } from '../utils/authoring-add-interactions';
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
            cy.get(selectors.authoring).click();
            cy.location().should(loc => {
                expect(`${loc.pathname}${loc.search}`).to.eq(urls.itemAuthoring);
            });
        });

        it('can add A-Block', () => {
            cy.getSettled('.qti-item.item-editor-item.edit-active').should('exist');
            // open inline interactions panel
            cy.get('#sidebar-left-section-inline-interactions').click();
            addABlock();
            // close inline interactions panel
            cy.get('#sidebar-left-section-inline-interactions ._accordion').click();
        });

        it('CK Editor is present when added A-block is highlighted', () => {
            cy.get('.widget-box.widget-block.widget-textBlock').click();
            cy.getSettled('#toolbar-top .cke').should('be.visible');
            cy.getSettled('#toolbar-top .cke .cke_toolbar').should('have.length', 5);
        });
    });
});
