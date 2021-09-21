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
import { selectUploadLocalAsset } from '../utils/resource-manager';
import { addShapeToImage } from '../utils/graphic-interactions';

describe('Items', () => {
    const className = 'Test E2E class';
    const itemName = 'Test E2E item 1';
    const blockContainer = '_container';
    const inlineInteractions = {
        inlineChoiceInteraction: 'inlineChoiceInteraction',
        textEntryInteraction: 'textEntryInteraction',
        endAttemptInteraction: 'endAttemptInteraction'
    };
    const commonInteractions = {
        choice: 'choiceInteraction',
        order: 'orderInteraction',
        asociate: 'associateInteraction',
        match: 'matchInteraction',
        hottext: 'hottextInteraction',
        gapMatch: 'gapMatchInteraction',
        slider: 'sliderInteraction',
        extendedText: 'extendedTextInteraction',
        upload: 'uploadInteraction'
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
        });
        it('can add inline interactions to Block', () => {
            cy.getSettled('.qti-item.item-editor-item.edit-active').should('exist');
            // open inline interactions panel
            cy.get('#sidebar-left-section-inline-interactions').click();

            cy.log('ADDING A-BLOCK INTERACTION');
            const blockSelector = `[data-qti-class="${blockContainer}"]`;
            cy.dragAndDrop(blockSelector, dropSelector);
            // check that widget is initialized
            cy.getSettled(`${dropSelector} .widget-box.edit-active${blockSelector}`).should('exist');
            cy.log('A-BLOCK IS ADDED');

            for (const interaction in inlineInteractions) {
                cy.log('ADDING INTERACTION', interaction);
                const interactionSelector = `[data-qti-class="${inlineInteractions[interaction]}"]`;
                cy.dragAndDrop(interactionSelector, dropSelector, [
                    '.widget-box[data-qti-class="_container"]',
                    '.widget-box[data-qti-class="_container"] span.qti-word-wrap'
                ]);
                // check that widget is initialized (outside item-editor-drop-area)
                cy.getSettled(`.widget-box.edit-active.widget-${inlineInteractions[interaction]}`).should('exist');
                cy.getSettled(`.widget-box.edit-active.widget-${inlineInteractions[interaction]} button.widget-ok`).click();
                cy.log(interaction, 'IS ADDED');
            }
            // close inline interactions panel
            cy.get('#sidebar-left-section-inline-interactions ._accordion').click();
        });
        it('can add common interactions to canvas', () => {
            for (const interaction in commonInteractions) {
                cy.log('ADDING INTERACTION', interaction);
                const interactionSelector = `[data-qti-class="${commonInteractions[interaction]}"]`;
                cy.dragAndDrop(interactionSelector, dropSelector);
                // check that widget is initialized
                cy.getSettled(`${dropSelector} .widget-box.edit-active${interactionSelector}`).should('exist');
                cy.log(interaction, 'IS ADDED');
            }
            // close common interactions panel
            cy.get('#sidebar-left-section-common-interactions ._accordion').click();
        });
        it('can add media interaction to canvas and upload video', () => {
            // open common interaction panel
            cy.get('#sidebar-left-section-common-interactions').click();
            cy.log('ADDING INTERACTION', mediaInteraction);
            const interactionSelector = `[data-qti-class="${mediaInteraction}"]`;
            const videoName = 'sample-mp4-file.mp4';
            cy.dragAndDrop(interactionSelector, dropSelector);
            // check that widget is initialized
            cy.getSettled(`${dropSelector} .widget-box.edit-active${interactionSelector}`).should('exist');
            // resource selector
            selectUploadLocalAsset(videoName, `${paths.assetsPath}${videoName}`);
            cy.log(mediaInteraction, 'IS ADDED');
            // close common interaction panel
            cy.get('#sidebar-left-section-common-interactions ._accordion').click();
        });

        it('can add graphic interactions to canvas and upload image', () => {
            // open graphic interactions panel
            cy.get('#sidebar-left-section-graphic-interactions').click();
            for (const interaction in graphicInteractions) {
                cy.log('ADDING INTERACTION', interaction);
                const interactionSelector = `[data-qti-class="${graphicInteractions[interaction]}"]`;
                const imageName = 'cats.jpg';
                const imageOptionName = 'img-option.png';
                cy.dragAndDrop(interactionSelector, dropSelector);
                // check that widget is initialized
                cy.getSettled(`${dropSelector} .widget-box.edit-active${interactionSelector}`).should('exist');
                selectUploadLocalAsset(imageName, `${paths.assetsPath}${imageName}`);

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
                        selectUploadLocalAsset(imageOptionName, `${paths.assetsPath}${imageOptionName}`);
                        cy.getSettled(`.widget-box.edit-active${interactionSelector} .source .qti-choice img`).should(
                            'exist'
                        );
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
