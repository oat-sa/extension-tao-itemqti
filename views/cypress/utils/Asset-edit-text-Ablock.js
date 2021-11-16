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
const aBlockParagraph = '.widget-box[data-qti-class="_container"] p'

export function  editText() {

    // edit text : Bold
    cy.selectTextWithin(`${aBlockParagraph}`);
    cy.get('[class="cke_button cke_button__bold cke_button_off"]').click({force:true});
    cy.get(`${aBlockParagraph} strong` ).should('exist');
    cy.get('[class="cke_button cke_button__bold cke_button_on"]').click({force:true});
    // edit text : Italic
    cy.selectTextWithin(`${aBlockParagraph}`);
    cy.get('[class="cke_button cke_button__italic cke_button_off"]').click({force:true});
    cy.get(`${aBlockParagraph} em`).should('exist');
    cy.get('[class="cke_button cke_button__italic cke_button_on"]').click({force:true});
    // edit text : Underline
    cy.selectTextWithin(`${aBlockParagraph}`);
    cy.get('[class="cke_button cke_button__taounderline cke_button_off"]').click({force:true});
    cy.get(`${aBlockParagraph} span`).should('exist');
    cy.get('[class="cke_button cke_button__taounderline cke_button_on"]').click({force:true});
    // edit text : subscript
    cy.selectTextWithin(`${aBlockParagraph}`);
    cy.get('[class="cke_button cke_button__subscript cke_button_off"]').click({force:true});
    cy.get(`${aBlockParagraph} sub`).should('exist');
    cy.get('[class="cke_button cke_button__subscript cke_button_on"]').click({force:true});
    // edit text : subscript
    cy.selectTextWithin(`${aBlockParagraph}`);
    cy.get('[class="cke_button cke_button__superscript cke_button_off"]').click({force:true});
    cy.get(`${aBlockParagraph} sup`).should('exist');
    cy.get('[class="cke_button cke_button__superscript cke_button_on"]').click({force:true});
};
