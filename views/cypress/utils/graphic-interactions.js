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

/**
 * Select file in resource manager or upload it
 * @param {String} interactionSelector
 * @param {String} shapeType
 */
export function addShapeToImage(interactionSelector, shapeType) {
    cy.log('ADD SHAPE TO IMAGE', interactionSelector, shapeType);
    cy.getSettled(
        `.widget-box.edit-active${interactionSelector} .image-editor li[data-type="${shapeType}"]`
    ).click();
    cy.get(`.widget-box.edit-active${interactionSelector} .main-image-box image`)
        .then($image => {
            const coords = $image[0].getBoundingClientRect();
            const pageX = Math.round(coords.left + coords.width / 2);
            const pageY = Math.round(coords.top + coords.height / 2);
            cy.wrap($image)
                .trigger('mouseover', { force: true })
                .trigger('mousedown', {
                    which: 1,
                    pageX,
                    pageY,
                    force: true
                })
                .trigger('mousemove', {
                    which: 1,
                    pageX: pageX + 20,
                    pageY: pageY + 20,
                    force: true
                })
                .trigger('mouseup', { force: true });
            cy.getSettled(`.widget-box.edit-active${interactionSelector} .main-image-box svg ${shapeType}`).should('exist');
        });
}
