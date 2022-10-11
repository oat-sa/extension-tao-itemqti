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
 * @param {String} fileName
 * @param {String} pathToFile
 */
export function selectUploadLocalAsset(fileName, pathToFile) {
    cy.log('SELECT OR UPLOAD LOCAL ASSET', fileName, pathToFile);
    return cy.get('.resourcemgr.modal')
        .last()
        .then(resourcemgr => {
            const resourcemgrId = resourcemgr[0].id;
            cy.getSettled(`#${resourcemgrId} .file-browser .root-folder`).should('exist');
            cy.getSettled(`#${resourcemgrId} .file-browser .local .root-folder`).click();
            cy.get(`#${resourcemgrId} .file-selector .files`).then(root => {
                if (root.find(`#${resourcemgrId} li[data-file="/${fileName}"]`).length === 0) {
                    cy.getSettled(`#${resourcemgrId} .file-selector .upload-switcher .upload`).click();
                    cy.fileUpload(
                        `#${resourcemgrId} .file-upload-container input[type="file"][name="content"]`,
                        pathToFile
                    );
                    cy.getSettled(`#${resourcemgrId} .file-upload-container .btn-upload`).click();
                    cy.getSettled(`#${resourcemgrId} .file-upload-container .progressbar.success`, {timeout: 100000}).should('exist');
                }
            });
            cy.getSettled(`#${resourcemgrId} li[data-file="/${fileName}"] .actions a.select`).click();
        });
}
/**
 * select shared stimulus option from ck menu
 * @param isChoice {boolean} determines if selector to add
 * the stimulus is choice(answer) vs prompt(question) in the interaction.
 */
export function addSharedStimulusToInteraction(isChoice) {
   if(isChoice){
       cy.get('#item-editor-scroll-inner').click();
       cy.get('.choice-area').click({force:true});
       cy.get('[data-identifier="choice_2"]')
         .click({force:true});
   }
   cy.get('[id="toolbar-top"]')
        .find('[class="cke_button cke_button__taoqtiinclude cke_button_off"]')
        .last()
        .click({force: true});
    cy.get('.resourcemgr.modal').should('be.visible');
}