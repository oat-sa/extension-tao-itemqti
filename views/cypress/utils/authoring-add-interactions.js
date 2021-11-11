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
 * Copyright (c) 2021 Open Assessment Technologies SA ;
 */
import paths from './paths';
import { selectUploadLocalAsset } from './resource-manager';
import { addShapeToImage } from './graphic-interactions';

const blockContainer = '_container';
const aBlockContainer = 'textBlock';
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
const undoSelector = '.feedback-info.popup a.undo';
const closeUndoSelector = '.feedback-info.popup .icon-close';

/**
 * Add A-Block and then all inline interactions on it
 */
export function addBlockAndInlineInteractions() {
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
}

/**
 * Adds A block without inner inline interactions
 */
export function addAblock() {

    const dropSelector = 'div.qti-itemBody.item-editor-drop-area';
    cy.getSettled('.qti-item.item-editor-item.edit-active').should('exist');
    // open inline interactions panel
    cy.get('#sidebar-left-section-inline-interactions').click();
    cy.log('ADDING A-BLOCK INTERACTION');
    const blockSelector = `[data-qti-class="${blockContainer}"]`;
    cy.dragAndDrop(blockSelector, dropSelector);
    // check that widget is initialized
    cy.getSettled(`${dropSelector} .widget-box.edit-active${blockSelector}`).should('exist');
    cy.log('A-BLOCK IS ADDED');
};

/**
 * Removes interaction, undo and remove again
 * @param {String} deleteSelector - css selector of delete button
 * @param {String} interaction - interaction name
 * @param {String} interactionSelector - css selector of the interaction container
 */
export function removeInteraction(deleteSelector, interaction, interactionSelector) {
    cy.log('REMOVING INTERACTION', interaction);
    cy.get(deleteSelector).click({ force: true });
    cy.log(interaction, 'IS REMOVED');

    cy.get(undoSelector).should('exist');
    cy.get(undoSelector).click();
    cy.log(interaction, 'UNDO REMOVE');
    cy.get(interactionSelector).should('exist');
    cy.get(undoSelector).should('not.exist');

    cy.get(deleteSelector).click({ force: true });
    cy.log(interaction, 'IS REMOVED');
    cy.get(undoSelector).should('exist');
    cy.get(closeUndoSelector).click();
}

/**
 * Removes A-Block and then all inline interactions in it
 */
export function removeBlockAndInlineInteractions() {
    const aBlockSelector = `.widget-box.widget-block.widget-${aBlockContainer}`;

    for (const interaction in inlineInteractions) {
        const interactionSelector = `.widget-box.edit-active.widget-${inlineInteractions[interaction]}`;
        const deleteSelector = `${interactionSelector} .tlb [data-role="delete"]`;

        cy.get(aBlockSelector).click();
        cy.get(`.widget-box.${inlineInteractions[interaction]}-placeholder`).click();

        removeInteraction(deleteSelector, interaction, interactionSelector);
    }

    const blockSelector = `[data-qti-class="${blockContainer}"]`;
    const deleteSelector = `.widget-box.edit-active${blockSelector} [data-role="delete"]`;

    cy.get(aBlockSelector).click();
    removeInteraction(deleteSelector, 'A-BLOCK', blockSelector);
}

/**
 * Add common interactions to canvas except media interaction
 */
export function addCommonInteractions() {
    for (const interaction in commonInteractions) {
        addInteraction(interaction);
    }
}

/**
 * Remove common interactions from canvas except media interaction
 */
export function removeCommonInteractions() {
    for (const interactionKey of Object.keys(commonInteractions).reverse()) {
        const interaction = commonInteractions[interactionKey];
        const interactionSelector = `[data-qti-class="${commonInteractions[interactionKey]}"]`;
        const deleteSelector = `.widget-box.edit-active${interactionSelector} .tlb [data-role="delete"]`;

        cy.get(`.widget-box${interactionSelector}`).click();
        removeInteraction(deleteSelector, interaction, interactionSelector);
    }
}

/**
 * Add media interaction to canvas
 */
export function addMediaInteraction() {
    cy.log('ADDING INTERACTION', mediaInteraction);
    const interactionSelector = `[data-qti-class="${mediaInteraction}"]`;
    const videoName = 'sample-mp4-file.mp4';
    cy.dragAndDrop(interactionSelector, dropSelector);
    // check that widget is initialized
    cy.getSettled(`${dropSelector} .widget-box.edit-active${interactionSelector}`).should('exist');
    // resource selector
    selectUploadLocalAsset(videoName, `${paths.assetsPath}${videoName}`).then(() => {
        cy.log(mediaInteraction, 'IS ADDED');
    });
}

/**
 * Remove media interaction from canvas
 */
export function removeMediaInteraction() {
    const interactionSelector = `[data-qti-class="${mediaInteraction}"]`;
    const deleteSelector = `.widget-box.edit-active${interactionSelector} .tlb [data-role="delete"]`;

    cy.get(`.widget-box${interactionSelector}`).click();
    removeInteraction(deleteSelector, mediaInteraction, interactionSelector);
}

/**
 * Add graphic interactions to canvas
 */
export function addGraphicInteractions() {
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
                addShapeToImage(interactionSelector, 'rect').then(() => {
                    // add image option if needed
                    if (imageEditor.find('li.add-option').length) {
                        cy.get(`.widget-box.edit-active${interactionSelector} .image-editor li.add-option`).click();
                        selectUploadLocalAsset(imageOptionName, `${paths.assetsPath}${imageOptionName}`);
                        cy.getSettled(`.widget-box.edit-active${interactionSelector} .source .qti-choice img`).should(
                            'exist'
                        );
                    }

                    cy.log(interaction, 'IS ADDED');
                });
            }
        });
    }
}

/**
 * Remove graphic interactions to canvas
 */
export function removeGraphicInteractions() {
    for (const interactionKey of Object.keys(graphicInteractions).reverse()) {
        const interaction = graphicInteractions[interactionKey];
        const interactionSelector = `[data-qti-class="${graphicInteractions[interaction]}"]`;
        const deleteSelector = `.widget-box.edit-active${interactionSelector} .tlb [data-role="delete"]`;

        cy.get(`.widget-box${interactionSelector}`).click();
        removeInteraction(deleteSelector, interaction, interactionSelector);
    }
}

/**
 * Adds single interaction
 * @param {string} interaction - Interaction to add
 */
export function addInteraction(interaction) {
    if (interaction === mediaInteraction) {
        addMediaInteraction();
        return;
    }
    if (!commonInteractions[interaction]) {
        throw new Error(`Unknown interaction: ${interaction}`);
    }
    cy.log('ADDING INTERACTION', interaction);
    const interactionSelector = `[data-qti-class="${commonInteractions[interaction]}"]`;
    cy.dragAndDrop(interactionSelector, dropSelector);
    // check that widget is initialized
    cy.get(`${dropSelector} .widget-box.edit-active${interactionSelector}`).should('exist');
    cy.log(interaction, 'IS ADDED');
}
