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
 * Add common interactions to canvas except media interaction
 */
export function addCommonInteractions() {
    for (const interaction in commonInteractions) {
        cy.log('ADDING INTERACTION', interaction);
        const interactionSelector = `[data-qti-class="${commonInteractions[interaction]}"]`;
        cy.dragAndDrop(interactionSelector, dropSelector);
        // check that widget is initialized
        cy.getSettled(`${dropSelector} .widget-box.edit-active${interactionSelector}`).should('exist');
        cy.log(interaction, 'IS ADDED');
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
    selectUploadLocalAsset(videoName, `${paths.assetsPath}${videoName}`);
    cy.log(mediaInteraction, 'IS ADDED');
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
                addShapeToImage(interactionSelector, 'rect');
            }
            // add image option if needed
            if (imageEditor.find('li.add-option').length) {
                cy.get(`.widget-box.edit-active${interactionSelector} .image-editor li.add-option`).click();
                selectUploadLocalAsset(imageOptionName, `${paths.assetsPath}${imageOptionName}`);
                cy.getSettled(`.widget-box.edit-active${interactionSelector} .source .qti-choice img`).should('exist');
            }
        });
        cy.log(interaction, 'IS ADDED');
    }
}
