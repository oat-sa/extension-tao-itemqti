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
 * Copyright (c) 2016 (original work) Open Assessment Technologies SA;
 *
 */

namespace oat\taoQtiItem\model\portableElement;

use oat\taoQtiItem\model\portableElement\element\PortableElementObject;
use oat\taoQtiItem\model\portableElement\exception\PortableElementInconsistencyModelException;
use oat\taoQtiItem\model\portableElement\exception\PortableElementInvalidModelException;
use oat\taoQtiItem\model\portableElement\exception\PortableElementNotFoundException;
use oat\taoQtiItem\model\portableElement\exception\PortableElementParserException;
use oat\taoQtiItem\model\portableElement\exception\PortableElementVersionIncompatibilityException;
use oat\taoQtiItem\model\portableElement\model\PortableModelRegistry;
use oat\taoQtiItem\model\portableElement\parser\element\PortableElementDirectoryParser;
use oat\taoQtiItem\model\portableElement\parser\element\PortableElementPackageParser;
use oat\taoQtiItem\model\portableElement\storage\PortableElementRegistry;
use oat\taoQtiItem\model\portableElement\validator\Validator;
use oat\taoQtiItem\model\qti\Element;
use oat\taoQtiItem\model\qti\interaction\CustomInteraction;
use oat\taoQtiItem\model\qti\InfoControl;
use Zend\ServiceManager\ServiceLocatorAwareInterface;
use Zend\ServiceManager\ServiceLocatorAwareTrait;

class PortableElementService implements ServiceLocatorAwareInterface
{
    use ServiceLocatorAwareTrait;

    public const PORTABLE_CLASS_INTERACTION = CustomInteraction::class;
    public const PORTABLE_CLASS_INFOCONTROL = InfoControl::class;

    protected function getPortableModelRegistry()
    {
        return PortableModelRegistry::getRegistry();
    }

    /**
     * Validate a model using associated validator
     *
     * @param PortableElementObject $object
     * @param null $source Directory of portable element, if not null it will be checked
     * @param array $validationGroup Fields to be checked, empty=$validator->getConstraints()
     * @return bool
     * @throws PortableElementInconsistencyModelException
     */
    public function validate(PortableElementObject $object, $source = null, $validationGroup = [])
    {
        $validator = $object->getModel()->getValidator();
        Validator::validate($object, $validator, $validationGroup);
        if ($source) {
            $validator->validateAssets($object, $source);
        }
    }

    /**
     * Register a $model with $source into registryEntries & filesystem
     *
     * @param PortableElementObject $object
     * @param $source
     * @return bool
     * @throws PortableElementInvalidModelException
     * @throws PortableElementVersionIncompatibilityException
     */
    public function registerModel(PortableElementObject $object, $source)
    {
        $validationGroup = ['typeIdentifier', 'version', 'runtime'];
        $this->validate($object, $source, $validationGroup);

        $registry = $object->getModel()->getRegistry();

        //enable portable element immediately when registering it
        $object->enable();

        $registry->register($object, $source);

        return true;
    }

    /**
     * Unregister the portable element
     *
     * @param PortableElementObject $object
     * @return bool
     * @throws PortableElementVersionIncompatibilityException
     */
    public function unregisterModel(PortableElementObject $object)
    {
        $registry = $object->getModel()->getRegistry();
        $registry->delete($object);
        return true;
    }

    /**
     * Export a model with files into a ZIP
     *
     * @param $type
     * @param $identifier
     * @param null $version
     * @return string
     * @throws PortableElementNotFoundException
     * @throws \common_Exception
     * @throws PortableElementInconsistencyModelException
     */
    public function export($type, $identifier, $version = null)
    {
        $model = $this->getPortableModelRegistry()->getModel($type);
        $object = $model->getRegistry()->fetch($identifier, $version);

        if (is_null($object)) {
            throw new PortableElementNotFoundException(
                'Unable to find a PCI associated to identifier: ' . $identifier
            );
        }
        $this->validate($object);
        return $model->getRegistry()->export($object);
    }

    /**
     * Import a Portable element from an uploaded zip file
     *
     * @param $type
     * @param $zipFile
     * @return mixed
     * @throws PortableElementInconsistencyModelException
     */
    public function import($type, $zipFile)
    {
        /** @var PortableElementPackageParser $parser */
        $parser = $this->getPortableModelRegistry()->getModel($type)->getPackageParser();
        $source = $parser->extract($zipFile);
        $object = $parser->getModel()->createDataObject($parser->getManifestContent($zipFile));

        $this->registerModel($object, $source);

        \tao_helpers_File::delTree($source);

        return $object;
    }

    /**
     * Extract a valid model from a zip
     *
     * @param $type
     * @param $zipFile
     * @return mixed
     * @throws PortableElementInconsistencyModelException
     */
    public function getValidPortableElementFromZipSource($type, $zipFile)
    {
        /** @var PortableElementPackageParser $parser */
        $parser = $this->getPortableModelRegistry()->getModel($type)->getPackageParser();
        $source = $parser->extract($zipFile);
        $object = $parser->getModel()->createDataObject($parser->getManifestContent($zipFile));
        $this->validate($object, $source);

        return $object;
    }

    /**
     * Return all directory parsers from configuration
     *
     * @return PortableElementDirectoryParser[]
     */
    protected function getDirectoryParsers()
    {
        $parsers = [];
        $models = $this->getPortableModelRegistry()->getModels();
        foreach ($models as $key => $model) {
            if ($model->getDirectoryParser() instanceof PortableElementDirectoryParser) {
                $parsers[] = $model->getDirectoryParser();
            } else {
                \common_Logger::w('Invalid DirectoryParser for model ' . $key);
            }
        }
        return $parsers;
    }

    /**
     * Extract a valid model from a directory
     *
     * @param $directory
     * @return null|PortableElementObject
     * @throws PortableElementParserException
     * @throws \common_Exception
     */
    public function getValidPortableElementFromDirectorySource($directory)
    {
        $parserMatched = null;
        $parsers = $this->getDirectoryParsers();
        /** @var PortableElementDirectoryParser $parser */
        foreach ($parsers as $parser) {
            if ($parser->hasValidPortableElement($directory)) {
                $parserMatched = $parser;
            }
        }

        if (is_null($parserMatched)) {
            throw new PortableElementParserException(
                'This zip source is not compatible with any portable element. Manifest and/or engine file are missing '
                . ' or related extensions are not installed.'
            );
        }

        $source = $parserMatched->extract($directory);
        $object = $parserMatched->getModel()->createDataObject($parserMatched->getManifestContent($directory));

        // Validate Portable Element  Model
        try {
            $this->validate($object, $source);
        } catch (PortableElementInvalidModelException $e) {
            \common_Logger::w($e->getMessage());
            return null;
        }

        return $object;
    }

    /**
     * Get model from identifier & version
     *
     * @param $type
     * @param $identifier
     * @param null $version
     * @return null|PortableElementObject
     * @throws PortableElementNotFoundException
     * @throws PortableElementInconsistencyModelException
     */
    public function getPortableElementByIdentifier($type, $identifier, $version = null)
    {
        $model = $this->getPortableModelRegistry()->getModel($type);
        $registry = $model->getRegistry();

        if ($registry->has($identifier, $version)) {
            return $registry->fetch($identifier, $version);
        }
        return null;
    }

    public function getLatestCompatibleVersionElementById(
        string $modeId,
        string $identifier,
        string $targetVersion
    ): ?PortableElementObject {
        $model = $this->getPortableModelRegistry()->getModel($modeId);
        /* @var $registry PortableElementRegistry */
        $registry = $model->getRegistry();

        return $registry->getLatestCompatibleVersion($identifier, $targetVersion);
    }

    /**
     * Register a model from a directory based on manifest.json
     *
     * @param $directory
     * @return bool
     * @throws \common_Exception
     */
    public function registerFromDirectorySource($directory)
    {
        $object = $this->getValidPortableElementFromDirectorySource($directory);
        if (is_null($object)) {
            throw new PortableElementNotFoundException(
                'No valid portable element model found in the directory ' . $directory
            );
        }

        return $this->registerModel($object, $directory);
    }

    /**
     * Fill all values of a model based on $object->getTypeIdentifier, $object->getVersion
     *
     * @param $type
     * @param $identifier
     * @param null $version
     * @return PortableElementObject
     * @throws PortableElementNotFoundException
     * @throws PortableElementInconsistencyModelException
     */
    public function retrieve($type, $identifier, $version = null)
    {
        $model = $this->getPortableModelRegistry()->getModel($type);
        return $model->getRegistry()->fetch($identifier, $version);
    }

    /**
     * Return the stream of a file model
     *
     * @param PortableElementObject $object
     * @param $file
     * @return bool|false|resource
     * @throws \tao_models_classes_FileNotFoundException
     */
    public function getFileStream(PortableElementObject $object, $file)
    {
        return $object->getModel()->getRegistry()->getFileStream($object, $file);
    }

    /**
     * @param Element $element
     * @return PortableElementObject|null
     */
    public function getPortableObjectFromInstance(Element $element)
    {
        foreach ($this->getPortableModelRegistry()->getModels() as $model) {
            $portableElementClass = $model->getQtiElementClassName();
            if ($element instanceof $portableElementClass) {
                return $this->retrieve($model->getId(), $element->getTypeIdentifier());
            }
        }
        return null;
    }

    /**
     * Get the array of portable elements used in qti item object by its php class
     * @param string $portableElementClass - PORTABLE_CLASS_INTERACTION or PORTABLE_CLASS_INFOCONTROL
     * @param Element $qtiItem
     * @return array
     */
    public function getPortableElementByClass($portableElementClass, Element $qtiItem, $useVersionAlias = false)
    {
        $portableElements = [];

        $identifiers = array_map(function ($portableElement) {
            return $portableElement->getTypeIdentifier();
        }, $qtiItem->getComposingElements($portableElementClass));

        foreach ($this->getPortableModelRegistry()->getModels() as $model) {
            $phpClass = $model->getQtiElementClassName();
            if (is_subclass_of($phpClass, $portableElementClass)) {
                $portableElements = array_merge(
                    $portableElements,
                    array_filter(
                        $model->getRegistry()->getLatestRuntimes($useVersionAlias),
                        function ($data) use ($identifiers) {
                            $portableElement = reset($data);

                            if (
                                !empty($portableElement)
                                && in_array($portableElement['typeIdentifier'], $identifiers)
                            ) {
                                return true;
                            }

                            return false;
                        }
                    )
                );
            }
        }

        /**
         * @deprecated do not use the returned baseUrl
         */
        return $portableElements;
    }

    /**
     * Set the base url to a portable element data array
     * @param $data
     * @return mixed
     */
    public function setBaseUrlToPortableData(&$data)
    {
        $model = $this->getPortableModelRegistry()->getModel($data['model']);
        $portableObject = $model->createDataObject($data);
        $data['baseUrl'] = $model->getRegistry()->getBaseUrl($portableObject);
        return $data;
    }
}
