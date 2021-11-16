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

import { selectUploadLocalAsset } from '../utils/resource-manager';
import { addAblock } from '../utils/authoring-add-interactions';
import { editText } from '../utils/asset-edit-text-Ablock';

import paths from '../utils/paths';
import { getRandomNumber } from '../../../../tao/views/cypress/utils/helpers';

describe('Item Authoring', () => {
    const className = `Test E2E class ${getRandomNumber()}`;
    const itemName = 'Test E2E item 1';
    const ablockContainerParagraph = '.widget-box[data-qti-class="_container"] p';
    const aBlockContainer = '.widget-box[data-qti-class="_container"]';

    /**
     * Log in
     * Visit the page
     */
    before(() => {
        cy.setup(
            selectors.treeRenderUrl,
            selectors.editClassLabelUrl,
            urls.items,
            selectors.root,
            selectors.editItemUrl
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

        it('can add A block and edit text (bold, italic sub, sup)', () => {
            addAblock();
            editText();
        });
        it('can add image to A-block', () => {
            const imageName = 'img-option.png';
            cy.getSettled(`${aBlockContainer}`).click();
            cy.get('[id="toolbar-top"]')
                .find('[class="cke_button cke_button__taoqtiimage cke_button_off"]')
                .click({ force: true });
            cy.get('.resourcemgr.modal').should('be.visible');
            selectUploadLocalAsset(imageName, `${paths.assetsPath}${imageName}`).then(() => {
                cy.log(`${paths.assetsPath}${imageName}`, 'IS ADDED');
            });
        });
        it('can add audio to A-block', () => {
            const audioName = 'sampleAudioSmall.mp3';
            cy.getSettled(`${ablockContainerParagraph}`).click({ force: true });
            cy.get('[id="toolbar-top"]')
                .find('[class="cke_button cke_button__taoqtimedia cke_button_off"]')
                .click({ force: true });
            cy.get('.resourcemgr.modal').should('be.visible');
            selectUploadLocalAsset(audioName, `${paths.assetsPath}${audioName}`).then(() => {
                cy.getSettled('.qti-object-container.previewer  div[data-type="audio/mpeg"]').should('have.length', 1);
                cy.log(`${paths.assetsPath}${audioName}`, 'IS ADDED');
            });
            cy.getSettled(`${ablockContainerParagraph}`).click({ force: true });
        });
        it('can add video to A-block', () => {
            const videoName = 'sampleSmall.mp4';
            cy.getSettled(`${ablockContainerParagraph}`).click({ force: true });
            cy.get('[id="toolbar-top"]')
                .find('[class="cke_button cke_button__taoqtimedia cke_button_off"]')
                .click({ force: true });
            cy.get('.resourcemgr.modal').should('be.visible');
            selectUploadLocalAsset(videoName, `${paths.assetsPath}${videoName}`).then(() => {
                cy.log(`${paths.assetsPath}${videoName}`, 'IS ADDED');
                cy.getSettled('.qti-object-container.previewer  div[data-type="video/mp4"]').should('have.length', 1);
            });
            cy.getSettled(`${ablockContainerParagraph}`).click({ force: true });
        });
        it('can save item with A block & content', () => {
            cy.intercept('POST', '**/saveItem*').as('saveItem');
            cy.get('[data-testid="save-the-item"]').click({ force: true });
            cy.wait('@saveItem').its('response.body').its('success').should('eq', true);
        });
    });
});
