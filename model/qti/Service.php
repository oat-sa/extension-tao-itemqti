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
 * Copyright (c) 2013-2014 (original work) Open Assessment Technologies SA (under the project TAO-PRODUCT);
 *
 */

namespace oat\taoQtiItem\model\qti;

use common_exception_Error;
use common_exception_NotFound;
use oat\oatbox\filesystem\File;
use oat\oatbox\filesystem\FilesystemException;
use oat\taoQtiItem\model\qti\parser\XmlToItemParser;
use tao_helpers_Uri;
use common_exception_FileSystemError;
use oat\generis\model\fileReference\FileReferenceSerializer;
use oat\generis\model\OntologyAwareTrait;
use oat\oatbox\event\EventManagerAwareTrait;
use oat\oatbox\service\ConfigurableService;
use oat\oatbox\service\ServiceManager;
use oat\taoItems\model\event\ItemCreatedEvent;
use oat\taoItems\model\event\ItemUpdatedEvent;
use oat\taoQtiItem\helpers\Authoring;
use oat\taoQtiItem\model\ItemModel;
use oat\taoQtiItem\model\qti\exception\XIncludeException;
use oat\taoQtiItem\model\qti\metadata\MetadataRegistry;
use oat\taoQtiItem\model\qti\exception\ParsingException;
use core_kernel_classes_Resource;
use taoItems_models_classes_ItemsService;
use common_Logger;
use common_Exception;
use Exception;
use oat\taoItems\model\media\ItemMediaResolver;

/**
 * The QTI_Service gives you a central access to the managment methods of the
 * objects
 *
 * @author Somsack Sipasseuth <sam@taotesting.com>
 * @author Jérôme Bogaerts <jerome@taotesting.com>
 */
class Service extends ConfigurableService
{
    use EventManagerAwareTrait;
    use OntologyAwareTrait;

    public const QTI_ITEM_FILE = 'qti.xml';

    /**
     * Load a QTI_Item from an, RDF Item using the itemContent property of the
     * Item as the QTI xml
     *
     * @access public
     * @author Somsack Sipasseuth, <somsack.sipasseuth@tudor.lu>
     * @param  Resource item
     * @throws \common_Exception If $item is not representing an item with a QTI item model.
     * @return Item An item as a business object.
     */
    public function getDataItemByRdfItem(core_kernel_classes_Resource $item, $langCode = '', $resolveXInclude = false)
    {
        $returnValue = null;

        try {
            //Parse it and build the QTI_Data_Item
            $file = $this->getXmlByRdfItem($item, $langCode);
            $qtiParser = new Parser($file);
            $returnValue = $qtiParser->load();

            if (is_null($returnValue) && !empty($qtiParser->getErrors())) {
                common_Logger::w($qtiParser->displayErrors(false));
            }

            if ($resolveXInclude && !empty($langCode)) {
                try {
                    //loadxinclude
                    $resolver = new ItemMediaResolver($item, $langCode);
                    $xincludeLoader = new XIncludeLoader($returnValue, $resolver);
                    $xincludeLoader->load(true);
                } catch (XIncludeException $exception) {
                    common_Logger::e($exception->getMessage());
                }
            }

            if (!$returnValue->getAttributeValue('xml:lang')) {
                $returnValue->setAttribute('xml:lang', \common_session_SessionManager::getSession()->getDataLanguage());
            }
        } catch (FilesystemException $e) {
            // fail silently, since file might not have been created yet
            // $returnValue is then NULL.
            common_Logger::d('item(' . $item->getUri() . ') is empty, newly created?');
        } catch (common_Exception $e) {
            common_Logger::d('item(' . $item->getUri() . ') is not existing');
        }

        return $returnValue;
    }

    /**
     * Load the XML of the QTI item
     *
     * @param core_kernel_classes_Resource $item
     * @param string $language
     * @return false|string
     * @throws common_Exception
     */
    public function getXmlByRdfItem(core_kernel_classes_Resource $item, $language = '')
    {
        //check if the item is QTI item
        if (! $this->getItemService()->hasItemModel($item, [ItemModel::MODEL_URI])) {
            throw new common_Exception('Non QTI item(' . $item->getUri() . ') opened via QTI Service');
        }

        $file = $this->getItemService()->getItemDirectory($item, $language)->getFile(self::QTI_ITEM_FILE);
        return $file->read();
    }

    /**
     * Save a QTI_Item into an RDF Item, by exporting the QTI_Item to QTI xml
     * and saving it in the itemContent property of the RDF Item
     *
     * @param \oat\taoQtiItem\model\qti\Item $qtiItem
     * @param core_kernel_classes_Resource $rdfItem
     * @return bool
     * @throws common_exception_Error
     * @throws common_exception_NotFound
     * @throws common_Exception
     * @throws exception\QtiModelException
     */
    public function saveDataItemToRdfItem(Item $qtiItem, core_kernel_classes_Resource $rdfItem)
    {
        $label = mb_substr($rdfItem->getLabel(), 0, 256, 'UTF-8');
        //set the current data lang in the item content to keep the integrity
        if ($qtiItem->hasAttribute('xml:lang') && !empty($qtiItem->getAttributeValue('xml:lang'))) {
            $lang = $qtiItem->getAttributeValue('xml:lang');
        } else {
            $lang = \common_session_SessionManager::getSession()->getDataLanguage();
        }
        $qtiItem->setAttribute('xml:lang', $lang);
        $qtiItem->setAttribute('label', $label);

        $directory = taoItems_models_classes_ItemsService::singleton()->getItemDirectory($rdfItem);
        $success = $directory->getFile(self::QTI_ITEM_FILE)->put($qtiItem->toXML());

        if ($success) {
            $this->getEventManager()->trigger(new ItemUpdatedEvent($rdfItem->getUri()));
        }

        return $success;
    }

    /**
     * @param string|File $xml
     * @param core_kernel_classes_Resource $rdfItem
     *
     * @return bool
     *
     * @throws common_exception_Error
     * @throws common_exception_NotFound
     * @throws common_Exception
     */
    public function saveXmlItemToRdfItem($xml, core_kernel_classes_Resource $rdfItem)
    {
        $sanitized = Authoring::sanitizeQtiXml($xml);

        $qtiItem = $this->getXmlToItemParser()->parse($sanitized);

        return $this->saveDataItemToRdfItem($qtiItem, $rdfItem);
    }

    /**
     * @param ItemCreatedEvent $event
     */
    public function catchItemCreatedEvent(ItemCreatedEvent $event)
    {
        if ($event->getItemContent() !== null) {
            $this->saveXmlItemToRdfItem($event->getItemContent(), $this->getResource($event->getItemUri()));
        }
    }

    /**
     * Load a QTI item from a qti file in parameter.
     *
     * @param $file
     * @return null|Item
     * @throws Exception
     * @throws ParsingException
     */
    public function loadItemFromFile($file)
    {
        $returnValue = null;

        if (is_string($file) && !empty($file)) {
            //validate the file to import
            try {
                $qtiParser = new Parser($file);
                $qtiParser->validate();

                if (!$qtiParser->isValid()) {
                    throw new ParsingException($qtiParser->displayErrors());
                }

                $returnValue = $qtiParser->load();
            } catch (ParsingException $pe) {
                throw new ParsingException($pe->getMessage());
            } catch (Exception $e) {
                throw new Exception("Unable to load file {$file} caused  by {$e->getMessage()}");
            }
        }

        return $returnValue;
    }

    /**
     * Build the XHTML/CSS/JS from a QTI_Item to be rendered.
     *
     * @param Item $item
     * @param string $language
     * @return string
     */
    public function renderQTIItem(Item $item, $language = 'en-US')
    {
        if (! is_null($item)) {
            return $item->toXHTML(['lang' => $language]);
        }
        return '';
    }

    public function getVariableElements(Item $item)
    {
        $allData = $item->getDataForDelivery();
        return $allData['variable'];
    }

    /**
     * Obtain a reference on the Metadata Injector/Extractor Registry.
     *
     * @return \oat\taoQtiItem\model\qti\metadata\MetadataRegistry
     */
    public function getMetadataRegistry()
    {
        return new MetadataRegistry();
    }

    public function hasItemModel(core_kernel_classes_Resource $item, $models)
    {
        return taoItems_models_classes_ItemsService::singleton()->hasItemModel($item, $models);
    }

    /**
     * Delete the contents of the item, but not the resource representing it.
     *
     * @param core_kernel_classes_Resource $item
     * @return bool
     */
    public function deleteContentByRdfItem(core_kernel_classes_Resource $item)
    {
        return taoItems_models_classes_ItemsService::singleton()->deleteItemContent($item);
    }

    /**
     * @param core_kernel_classes_Resource $item
     * @return array
     * @throws common_exception_FileSystemError
     */
    public function backupContentByRdfItem(core_kernel_classes_Resource $item): array
    {
        try {
            $itemContentProperty = $this->getItemService()->getItemContentProperty();

            $oldItemContentPropertyValues = [];
            $newItemContentDirectoryName = tao_helpers_Uri::getUniqueId($item->getUri()) . '.' . uniqid();
            $propertyLanguages = $item->getUsedLanguages($itemContentProperty);
            foreach ($propertyLanguages as $language) {
                $oldItemContentPropertyValues[$language] = (string) $item
                    ->getPropertyValuesByLg($itemContentProperty, $language)
                    ->get(0);
                $serial = $this->getNewSerializedItemContentDirectory($newItemContentDirectoryName, $language);

                $item->editPropertyValueByLg($itemContentProperty, $serial, $language);
            }

            return $oldItemContentPropertyValues;
        } catch (Exception $e) {
            $this->logError('Item content backup failed: ' . $e->getMessage());
            throw new common_Exception("QTI Item backup failed. Item uri - " . $item->getUri());
        }
    }

    /**
     * @param core_kernel_classes_Resource $item
     * @param array $backUpNames
     * @throws common_exception_FileSystemError
     */
    public function restoreContentByRdfItem(core_kernel_classes_Resource $item, array $backUpNames): void
    {
        try {
            $itemContentProperty = $this->getItemService()->getItemContentProperty();
            foreach ($backUpNames as $language => $itemContentPropertyValue) {
                $item->editPropertyValueByLg($itemContentProperty, $itemContentPropertyValue, $language);
            }
        } catch (Exception $e) {
            $this->logError('Rollback item error: ' . $e->getMessage());
            throw new common_Exception(
                sprintf(
                    'Cannot rollback item. Item uri - %s :: Backup folders - %s ',
                    $item->getUri(),
                    json_encode($backUpNames)
                )
            );
        }
    }

    /**
     * @deprecated use ServiceManager::get(\oat\taoQtiItem\model\qti\Service::class)
     * @return self
     */
    public static function singleton()
    {
        return ServiceManager::getServiceManager()->get(self::class);
    }

    private function getItemService(): taoItems_models_classes_ItemsService
    {
        return $this->getServiceLocator()->get(taoItems_models_classes_ItemsService::class);
    }

    /**
     * @param string $newItemContentDirectoryName
     * @param $language
     * @return mixed
     * @throws \common_ext_ExtensionException
     */
    private function getNewSerializedItemContentDirectory(string $newItemContentDirectoryName, $language): string
    {
        $newItemContentDirectoryPath = $this->getItemService()->composeItemDirectoryPath(
            $newItemContentDirectoryName,
            $language
        );
        $newDirectory = $this->getItemService()->getDefaultItemDirectory()->getDirectory($newItemContentDirectoryPath);

        return $this->getServiceLocator()->get(FileReferenceSerializer::SERVICE_ID)->serialize($newDirectory);
    }

    private function getXmlToItemParser(): XmlToItemParser
    {
        return $this->getServiceLocator()->get(XmlToItemParser::class);
    }
}
