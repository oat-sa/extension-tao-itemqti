<?php

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
 * Copyright (c) 2025 (original work) Open Assessment Technologies SA ;
 *
 */

namespace oat\taoQtiItem\scripts\cli;

use oat\generis\model\GenerisRdf;
use oat\oatbox\reporting\Report;
use oat\generis\model\OntologyAwareTrait;
use oat\generis\model\OntologyRdf;
use oat\oatbox\extension\script\ScriptAction;
use oat\tao\model\TaoOntology;
use taoItems_models_classes_ItemsService as ItemService;

/**
 * Class linkTranslatedItems
 *
 * php index.php '\oat\taoQtiItem\scripts\cli\linkTranslatedItems'
 *
 * @package oat\taoQtiItem\scripts\cli
 */
class linkTranslatedItems extends ScriptAction
{
    use OntologyAwareTrait;

    private $wetRun = false;
    private $classUri = '';
    private $mainItemLanguage = '';
    private $report;

    protected function provideOptions()
    {
        return [
            'wet-run' => [
                'prefix' => 'w',
                'flag' => true,
                'longPrefix' => 'wet-run',
                'description' => 'Find and remove all orphan triples related to files for removed items.',
            ],
            'class' => [
                'prefix' => 'c',
                'longPrefix' => 'class',
                'description' => 'Class to link translations',
                'required' => true
            ],
            'main-language' => [
                'prefix' => 'm',
                'longPrefix' => 'main-language',
                'description' => 'Item with this language will be considered as main item',
                'required' => false,
                'default' => 'en-US'
            ]

        ];
    }

    protected function provideDescription()
    {
        return 'Tool to remove orphan files attached to removed items. By default in dry-run';
    }

    protected function provideUsage()
    {
        return [
            'prefix' => 'h',
            'longPrefix' => 'help',
            'description' => 'Prints a help statement'
        ];
    }
    public function run()
    {
        $this->report = Report::createInfo('Starting linking translations');
        $this->init();

        $class = $this->getClass($this->classUri);

        $this->report->add(new Report(Report::TYPE_INFO, 'Linking translations for class ' . $class->getLabel()));

        $aliasProperty = $this->getProperty(GenerisRdf::PROPERTY_ALIAS);
        $classProperties = $class->getProperties(true);

        foreach ($classProperties as $property) {
            $aliasName = (string)$property->getOnePropertyValue($aliasProperty);

            if (empty($aliasName)) {
                continue;
            }

            if ($aliasName === 'taoImportedUniqueIdentifier') {
                $uniqueIdentifierProperty = $property->getUri();
                break;
            }
        }

        $items = $this->getItemService()->getRootClass()->searchInstances(
            [
                TaoOntology::PROPERTY_TRANSLATION_TYPE => TaoOntology::PROPERTY_VALUE_TRANSLATION_TYPE_ORIGINAL,
                TaoOntology::PROPERTY_LANGUAGE => TaoOntology::LANGUAGE_PREFIX . $this->mainItemLanguage
            ],
            ['like' => false, 'recursive' => true]
        );
        $mainItem = 0;
        $translations = 0;

        foreach ($items as $item) {
            $importedUniqueId = $item->getOnePropertyValue($this->getProperty($uniqueIdentifierProperty));
            if (!$this->wetRun) {
                $item->editPropertyValues(
                    $this->getProperty(TaoOntology::PROPERTY_TRANSLATION_STATUS),
                    TaoOntology::PROPERTY_VALUE_TRANSLATION_STATUS_READY
                );
                $item->editPropertyValues(
                    $this->getProperty(TaoOntology::PROPERTY_UNIQUE_IDENTIFIER),
                    $importedUniqueId
                );
            }
            $mainItem++;
            $translatedLanguages = $item->getPropertyValues(
                $this->getProperty(TaoOntology::PROPERTY_TRANSLATED_INTO_LANGUAGES)
            );
            foreach ($translatedLanguages as $lang) {
                $linkedItems =  $this->getItemService()->getRootClass()->searchInstances(
                    [
                        TaoOntology::PROPERTY_LANGUAGE => $lang,
                        $uniqueIdentifierProperty => $importedUniqueId
                    ],
                    ['like' => false, 'recursive' => true]
                );
                foreach ($linkedItems as $linkedItem) {
                    $translations++;
                    if ($this->wetRun) {
                        $linkedItem->editPropertyValues(
                            $this->getProperty(TaoOntology::PROPERTY_TRANSLATION_STATUS),
                            TaoOntology::PROPERTY_VALUE_TRANSLATION_STATUS_READY
                        );
                        $linkedItem->editPropertyValues(
                            $this->getProperty(TaoOntology::PROPERTY_TRANSLATION_TYPE),
                            TaoOntology::PROPERTY_VALUE_TRANSLATION_TYPE_TRANSLATION
                        );
                        $linkedItem->setPropertyValue(
                            $this->getProperty(TaoOntology::PROPERTY_TRANSLATION_ORIGINAL_RESOURCE_URI),
                            $item->getUri()
                        );
                        $linkedItem->setPropertyValue(
                            $this->getProperty(TaoOntology::PROPERTY_TRANSLATION_PROGRESS),
                            TaoOntology::PROPERTY_VALUE_TRANSLATION_PROGRESS_TRANSLATED
                        );
                        $linkedItem->editPropertyValues(
                            $this->getProperty(OntologyRdf::RDF_TYPE),
                            TaoOntology::CLASS_URI_ITEM
                        );
                    }
                }
            }
        }
        $this->report->add(
            new Report(
                Report::TYPE_SUCCESS,
                'Linked ' . $translations . ' translations to ' . $mainItem . ' main items'
            )
        );
        return $this->report;
    }

    private function init()
    {
        if ($this->getOption('wet-run')) {
            $this->wetRun = true;
        }
        $this->classUri = $this->getOption('class');
        $this->mainItemLanguage = $this->getOption('main-language');
    }

    protected function getItemService(): ItemService
    {
        return $this->getServiceLocator()->get(ItemService::class);
    }
}
