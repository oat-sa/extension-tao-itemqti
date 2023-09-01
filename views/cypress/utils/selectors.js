export default {
    addItem: '[data-context="resource"][data-action="instanciate"]',
    selectInteractionResponse: '[data-state="answer"]',
    authoring: '[data-context="instance"][data-action="launchEditor"]',
    addSubClassUrl: 'taoItems/Items/addSubClass',

    deleteClass: '[data-context="class"][data-action="deleteItemClass"]',
    deleteConfirm: '[data-control="delete"]',
    deleteClassUrl: 'taoItems/Items/deleteClass',

    editItemUrl: 'taoItems/Items/editItem',
    editClassLabelUrl: 'taoItems/Items/editClassLabel',

    itemForm: 'form[action="/taoItems/Items/editItem"]',
    itemClassForm: 'form[action="/taoItems/Items/editClassLabel"]',

    manageItems: '[data-testid="manage-items"]',

    previewItemButton: '[data-testid="preview-the-item"]',
    previewSubmitButton: '[data-control="submit"]',

    root: '[data-uri="http://www.tao.lu/Ontologies/TAOItem.rdf#Item"]',
    resourceRelationsUrl: 'tao/ResourceRelations',

    treeRenderUrl: 'taoItems/Items',
    itemPreviewUrl: '**/taoQtiTestPreviewer/Previewer/getItem*',
    itemSubmitUrl: '**/taoQtiTestPreviewer/Previewer/submitItem*'
};
