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


describe('Items', () => {
    const className = 'Test E2E class';
    const itemName = 'Test E2E item 1';

    /**
     * Log in
     * Visit the page
     */
    before(() => {
        cy.loginAsAdmin();

        cy.intercept('POST', '**/edit*').as('edit');
        cy.visit(urls.items);
        cy.wait('@edit', {
            requestTimeout: 10000
        });

        cy.get(selectors.root).then(root => {
            if ((root.find(`li[title="${className}"] a`).length)) {
                cy.deleteClassFromRoot(
                    selectors.root,
                    selectors.itemClassForm,
                    selectors.deleteClass,
                    selectors.deleteConfirm,
                    className
                );
            }
        });
    });

    /**
     * Tests
     */
    describe('Item authoring', () => {
        it('can open item authoring', function () {
            cy.addClassToRoot(selectors.root, selectors.itemClassForm, className);
            cy.addNode(selectors.itemForm, selectors.addItem);
            cy.renameSelected(selectors.itemForm, itemName);

            cy.get(selectors.authoring).click();
            cy.location().should((loc) => {
                expect(`${loc.pathname}${loc.search}`).to.eq(urls.itemAuthoring);
            })
        });

        it('should be "Manage Items" button', function () {
            cy.get('[data-testid="manage-items"]').should('have.length', 1);
        });

        it('should be "Save" button', function () {
            cy.get('[data-testid="save-the-item"]').should('have.length', 1);
        });

        it('should be "Preview Item" button', function () {
            cy.get('[data-testid="preview-the-item"]').should('have.length', 1);
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
    });
});
