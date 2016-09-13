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

use oat\taoQtiItem\model\portableElement\common\exception\PortableElementInconsistencyModelException;
use oat\taoQtiItem\model\portableElement\common\exception\PortableElementInvalidModelException;
use oat\taoQtiItem\model\portableElement\common\exception\PortableElementNotFoundException;
use oat\taoQtiItem\model\portableElement\common\exception\PortableElementParserException;
use oat\taoQtiItem\model\portableElement\common\model\PortableElementObject;
use oat\taoQtiItem\model\portableElement\common\parser\implementation\PortableElementDirectoryParser;
use oat\taoQtiItem\model\portableElement\common\parser\implementation\PortableElementPackageParser;
use oat\taoQtiItem\model\portableElement\common\validator\Validator;
use Zend\ServiceManager\ServiceLocatorAwareInterface;
use Zend\ServiceManager\ServiceLocatorAwareTrait;

class PortableElementService implements ServiceLocatorAwareInterface
{
    use ServiceLocatorAwareTrait;

    /**
     * @var PortableElementFactory
     */
    protected $factory;

    protected function getPortableFactory()
    {
        if (! $this->factory) {
            $this->factory = $this->getServiceLocator()->get(PortableElementFactory::SERVICE_ID);
        }
        return $this->factory;
    }

    /**
     * Validate a model using associated validator
     *
     * @param PortableElementObject $object
     * @param null $source Directory of portable element, if not null it will be checked
     * @param array $validationGroup Fields to be checked, empty=$validator->getConstraints()
     * @return bool
     * @throws common\exception\PortableElementInconsistencyModelException
     */
    public function validate(PortableElementObject $object, $source=null, $validationGroup=array())
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
     * @throws common\exception\PortableElementVersionIncompatibilityException
     */
    public function registerModel(PortableElementObject $object, $source)
    {
        $validationGroup = array('typeIdentifier', 'version', 'runtime');
        $this->validate($object, $source, $validationGroup);

        $registry = $object->getModel()->getRegistry();
        $registry->register($object, $source);

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
     * @throws common\exception\PortableElementInconsistencyModelException
     */
    public function export($type, $identifier, $version=null)
    {
        $data = ['typeIdentifier' => $identifier];
        if (! is_null($version)) {
            $data['version'] = $version;
        }
        $model = $this->getPortableFactory()->getModel($type);
        $object = $model->getRegistry()->fetch($model->createDataObject($data));

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
     * @return PortableElementObject
     * @throws common\exception\PortableElementException
     * @throws common\exception\PortableElementExtractException
     * @throws common\exception\PortableElementInconsistencyModelException
     * @throws common\exception\PortableElementParserException
     */
    public function import($type, $zipFile)
    {
        /** @var PortableElementPackageParser $parser */
        $parser = $this->getPortableFactory()->getModel($type)->getPackageParser();
        $parser->setSource($zipFile);
        $source = $parser->extract();
        $object = $parser->getModel()->createDataObject($parser->getManifestContent());
        $this->registerModel($object, $source);

        \tao_helpers_File::delTree($source);

        return $object;
    }

    /**
     * Extract a valid model from a zip
     *
     * @param $type
     * @param $zipFile
     * @return PortableElementObject
     * @throws PortableElementParserException
     * @throws common\exception\PortableElementException
     * @throws common\exception\PortableElementExtractException
     * @throws common\exception\PortableElementInconsistencyModelException
     */
    public function getValidPortableElementFromZipSource($type, $zipFile)
    {
        /** @var PortableElementPackageParser $parser */
        $parser = $this->getPortableFactory()->getModel($type)->getPackageParser();
        $parser->setSource($zipFile);
        $source = $parser->extract();
        $object = $parser->getModel()->createDataObject($parser->getManifestContent());
        $this->validate($object, $source);

        return $object;
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
        $parsers = $this->getPortableFactory()->getDirectoryParsers();
        /** @var PortableElementDirectoryParser $parser */
        foreach ($parsers as $parser) {
            $parser->setSource($directory);
            if ($parser->hasValidPortableElement()) {
                $parserMatched = $parser;
            }
        }

        if (is_null($parserMatched)) {
            throw new PortableElementParserException(
                'This zip source is not compatible with any portable element. Manifest and/or engine file are missing '
                . ' or related extensions are not installed.'
            );
        }

        $source = $parserMatched->extract();
        $object = $parserMatched->getModel()->createDataObject($parser->getManifestContent());

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
     * @throws common\exception\PortableElementInconsistencyModelException
     */
    public function getPortableElementByIdentifier($type, $identifier, $version=null)
    {
        $model = $this->getPortableFactory()->getModel($type);
        $registry = $model->getRegistry();

        if($registry->has($identifier, $version)){
            return $registry->fetch($identifier, $version);
        }
        return null;
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
            throw new PortableElementNotFoundException('No valid portable element model found in the directory '.$directory);
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
    public function retrieve($type, $identifier, $version=null)
    {
        $data = ['typeIdentifier' => $identifier];
        if (! is_null($version)) {
            $data['version'] = $version;
        }

        $model = $this->getPortableFactory()->getModel($type);
        $object = $model->createDataObject($data);
        return $model->getRegistry()->fetch($object->getTypeIdentifier(), $object->getVersion());
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
}