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



const blockContainer = '_container';
const dropSelector = 'div.qti-itemBody.item-editor-drop-area';


/**
 * Add A-Block for Asset
 */
export function addBlockAndInlineInteractions() {
    cy.log('ADDING A-BLOCK INTERACTION');
    const blockSelector = `[data-qti-class="${blockContainer}"]`;
    cy.dragAndDrop(blockSelector, dropSelector);
    // check that widget is initialized
    cy.getSettled(`${dropSelector} .widget-box.edit-active${blockSelector}`).should('exist');
    cy.log('A-BLOCK IS ADDED');

}
