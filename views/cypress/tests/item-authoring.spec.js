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
import paths from '../utils/paths';
import { selectUploadLocalAssest } from '../utils/resource-manager';
import { addShapeToImage } from '../utils/graphic-interactions';

describe('Items', () => {
    const className = 'Test E2E class';
    const itemName = 'Test E2E item 1';
    const interactionList = {
        choice: 'choiceInteraction',
        order: 'orderInteraction',
        asociate: 'associateInteraction',
        match: 'matchInteraction',
        hottext: 'hottextInteraction',
        gapMatch: 'gapMatchInteraction',
        slider: 'sliderInteraction',
        extendedText: 'extendedTextInteraction',
        upload: 'uploadInteraction',
        aBlock: '_container'
    };
    const mediaInteraction = 'mediaInteraction';
    const graphicInteractions = {
        hotspotInteraction: 'hotspotInteraction',
        graphicOrderInteraction: 'graphicOrderInteraction',
        graphicAssociateInteraction: 'graphicAssociateInteraction',
        graphicGapMatchInteraction: 'graphicGapMatchInteraction',
        selectPointInteraction: 'selectPointInteraction'
    };
    const dropSelector = 'div.qti-itemBody.item-editor-drop-area';
    /**
     * Log in
     * Visit the page
     */
    before(() => {
        cy.loginAsAdmin();

        cy.intercept('POST', '**/edit*').as('edit');
        cy.intercept('POST', `**/${selectors.editClassLabelUrl}`).as('editClassLabel');
        cy.viewport(1000, 660);
        cy.visit(urls.items);
        cy.wait('@edit');

        cy.get(selectors.root).then(root => {
            if (root.find(`li[title="${className}"] a`).length) {
                cy.deleteClassFromRoot(
                    selectors.root,
                    selectors.itemClassForm,
                    selectors.deleteClass,
                    selectors.deleteConfirm,
                    className,
                    selectors.deleteClassUrl,
                    selectors.resourceRelations,
                    false,
                    true
                );
            }
        });
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
            cy.renameSelectedItem(selectors.itemForm, selectors.editItemUrl, itemName);

            cy.get(selectors.authoring).click();
            cy.location().should(loc => {
                expect(`${loc.pathname}${loc.search}`).to.eq(urls.itemAuthoring);
            });
        });

        it('should be "Manage Items" button', function () {
            cy.get(selectors.editItemTestId).should('have.length', 1);
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
            // open all interactions
            cy.get('#sidebar-left-section-inline-interactions').click();
            cy.get('#sidebar-left-section-graphic-interactions').click();
        });

        it('can add common interactions to canvas', () => {
            cy.getSettled('.qti-item.item-editor-item.edit-active').should('exist');
            for (const interaction in interactionList) {
                cy.log('ADDING INTERACTION', interaction);
                const interactionSelector = `[data-qti-class="${interactionList[interaction]}"]`;
                cy.dragAndDrop(interactionSelector, dropSelector);
                // check that widget is initialized
                cy.getSettled(`${dropSelector} .widget-box.edit-active${interactionSelector}`).should('exist');
                cy.log(interaction, 'IS ADDED');
            }
        });
        it('can add media interaction to canvas and upload video', () => {
            cy.log('ADDING INTERACTION', mediaInteraction);
            const interactionSelector = `[data-qti-class="${mediaInteraction}"]`;
            const videoName = 'sample-mp4-file.mp4';
            cy.dragAndDrop(interactionSelector, dropSelector);
            // check that widget is initialized
            cy.getSettled(`${dropSelector} .widget-box.edit-active${interactionSelector}`).should('exist');
            // resource selector
            selectUploadLocalAssest(videoName, `${paths.assetsPath}${videoName}`);
            cy.log(mediaInteraction, 'IS ADDED');
        });

        it('can add graphic interactions to canvas and upload image', () => {
            for (const interaction in graphicInteractions) {
                cy.log('ADDING INTERACTION', interaction);
                const interactionSelector = `[data-qti-class="${graphicInteractions[interaction]}"]`;
                const imageName = 'cats.jpg';
                const imageOptionName = 'img-option.png';
                cy.dragAndDrop(interactionSelector, dropSelector);
                // check that widget is initialized
                cy.getSettled(`${dropSelector} .widget-box.edit-active${interactionSelector}`).should('exist');
                selectUploadLocalAssest(imageName, `${paths.assetsPath}${imageName}`);

                // image is loaded to widget
                cy.getSettled(`.widget-box.edit-active${interactionSelector} .main-image-box image`).should('exist');
                cy.get(`.widget-box.edit-active${interactionSelector} .image-editor`).then(imageEditor => {
                    // add shape to image if needed
                    if (imageEditor.find('li[data-type="rect"]').length) {
                        addShapeToImage(interactionSelector, 'rect');
                    }
                    // add image option if needed
                    if (imageEditor.find('li.add-option').length) {
                        cy.get(`.widget-box.edit-active${interactionSelector} .image-editor li.add-option`).click();
                        selectUploadLocalAssest(imageOptionName, `${paths.assetsPath}${imageOptionName}`);
                        cy.getSettled(`.widget-box.edit-active${interactionSelector} .source .qti-choice img`).should('exist');
                    }
                });
                cy.log(interaction, 'IS ADDED');
            }
        });

        it('can save item with interactions', () => {
            cy.intercept('POST', '**/saveItem*').as('saveItem');
            cy.get('[data-testid="save-the-item"]').click();
            cy.wait('@saveItem').its('response.body').its('success').should('eq', true);
        });

        it('should be enabled "Preview Item" button', () => {
            cy.get('[data-testid="preview-the-item"]').should('not.have.class', 'disabled');
        });
    });
});
