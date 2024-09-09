<?php

namespace oat\taoQtiItem\model\Form\Modifier;

use core_kernel_classes_Resource;
use oat\generis\model\data\Ontology;
use oat\tao\model\form\Modifier\FormModifierInterface;
use oat\tao\model\TaoOntology;
use oat\taoQtiItem\model\qti\Service;
use tao_helpers_form_Form as Form;
use tao_helpers_Uri;

class EditTranslationInstanceFormModifier implements FormModifierInterface
{
    public const ID = 'tao_qti_item.form_modifier.edit_translation_instance';

    private Ontology $ontology;
    private Service $itemQtiService;

    public function __construct(Ontology $ontology, Service $itemQtiService)
    {
        $this->ontology = $ontology;
        $this->itemQtiService = $itemQtiService;
    }

    public function supports(Form $form, array $options = []): bool
    {
        $instanceUri = $form->getValue(self::FORM_INSTANCE_URI);

        if (!$instanceUri) {
            return false;
        }

        $instance = $this->ontology->getResource($instanceUri);

        // @TODO Check if FF for translation enabled
        return $instance->isInstanceOf($this->ontology->getClass(TaoOntology::CLASS_URI_ITEM));
    }

    public function modify(Form $form, array $options = []): void
    {
        $uniqueIdElement = $form->getElement(tao_helpers_Uri::encode(TaoOntology::PROPERTY_UNIQUE_IDENTIFIER));

        if (!$uniqueIdElement) {
            return;
        }

        $instance = $this->ontology->getResource($form->getValue(self::FORM_INSTANCE_URI));
        $itemData = $this->itemQtiService->getDataItemByRdfItem($instance);

        if ($itemData) {
            $uniqueIdElement->setValue($itemData->getIdentifier());
        }
    }
}
