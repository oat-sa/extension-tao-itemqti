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

use oat\taoQtiItem\model\portableElement\common\exception\PortableElementException;
use oat\taoQtiItem\model\portableElement\common\exception\PortableElementInvalidModelException;
use oat\taoQtiItem\model\portableElement\common\exception\PortableElementNotFoundException;
use oat\taoQtiItem\model\portableElement\common\model\PortableElementModel;
use oat\taoQtiItem\model\portableElement\common\PortableElementFactory;
use oat\taoQtiItem\model\portableElement\common\PortableElementModelTrait;
use oat\taoQtiItem\model\portableElement\common\validator\Validator;
use oat\taoQtiItem\model\portableElement\pci\model\PciModel;
use Zend\ServiceManager\ServiceLocatorAwareInterface;
use Zend\ServiceManager\ServiceLocatorAwareTrait;

class PortableElementService implements ServiceLocatorAwareInterface
{
    use ServiceLocatorAwareTrait;
    use PortableElementModelTrait;

    /**
     * Validate a model using associated validator
     *
     * @param PortableElementModel $model
     * @param null $source Directory of portable element, if not null it will be checked
     * @param array $validationGroup Fields to be checked, empty=$validator->getConstraints()
     * @return bool
     * @throws common\exception\PortableElementInconsistencyModelException
     */

    /**
     * @param PortableElementModel $model
     * @param null $source
     * @param array $validationGroup
     * @throws PortableElementInvalidModelException
     * @throws common\exception\PortableElementInconsistencyModelException
     */
    public function validate(PortableElementModel $model, $source=null, $validationGroup=array())
    {
        $validator = PortableElementFactory::getValidator($model);
        Validator::validate($validator, $validationGroup);
        if ($source) {
            $validator->validateAssets($source);
        }
    }

    /**
     * Import a Portable element from an uploaded zip file
     *
     * @param $zipFile
     * @return PortableElementModel
     * @throws \common_Exception
     * @throws common\exception\PortableElementExtractException
     * @throws common\exception\PortableElementInconsistencyModelException
     * @throws common\exception\PortableElementParserException
     */
    public function import($zipFile)
    {
        $parser = PortableElementFactory::getPackageParser($zipFile);
        $source = $parser->extract();
        $model = $parser->getModel();

        $this->registerModel($model, $source);

        \tao_helpers_File::delTree($source);

        return $model;
    }

    /**
     * Register a $model with $source into registryEntries & filesystem
     *
     * @param PortableElementModel $model
     * @param $source
     * @return bool
     * @throws PortableElementInvalidModelException
     * @throws common\exception\PortableElementVersionIncompatibilityException
     */
    public function registerModel(PortableElementModel $model, $source)
    {
        $validationGroup = array('typeIdentifier', 'version', 'runtime');
        $this->validate($model, $source, $validationGroup);

        PortableElementFactory::getRegistry($model)->setSource($source);
        PortableElementFactory::getRegistry($model)->register($model);

        return true;
    }

    /**
     * Export a model with files into a ZIP
     *
     * @param $identifier
     * @param null $version
     * @return string
     * @throws PortableElementNotFoundException
     * @throws \common_Exception
     */
    public function export($identifier, $version=null)
    {
        $model = $this->getModel();
        $model->setTypeIdentifier($identifier);
        $model->setVersion($version);
        $model = PortableElementFactory::getRegistry($this->getModel())->fetch($model);
        if (is_null($model)) {
            throw new PortableElementNotFoundException(
                'Unable to find a PCI associated to identifier: ' . $model->getTypeIndentifier()
            );
        }
        $this->validate($model);
        return PortableElementFactory::getRegistry($this->getModel())->export($model);
    }

    /**
     * Extract a valid model from a zip
     *
     * @param $zipFile
     * @return PortableElementModel
     * @throws PortableElementInvalidModelException
     * @throws common\exception\PortableElementExtractException
     * @throws common\exception\PortableElementInconsistencyModelException
     * @throws common\exception\PortableElementParserException
     */
    public function getValidPortableElementFromZipSource($zipFile)
    {
        $parser = PortableElementFactory::getPackageParser($zipFile);
        $source = $parser->extract();
        $model = $parser->getModel();

        // Validate Portable Element Model
        $this->validate($model, $source);

        return $model;
    }

    /**
     * @param $directory
     * @return null|PortableElementModel
     * @throws common\exception\PortableElementInconsistencyModelException
     * @throws common\exception\PortableElementParserException
     */
    public function getValidPortableElementFromDirectorySource($directory)
    {
        $parser = PortableElementFactory::getDirectoryParser($directory);
        $source = $parser->extract();
        $model = $parser->getModel();

        // Validate Portable Element  Model

        try {
            $this->validate($model, $source);
        } catch (PortableElementInvalidModelException $e) {
            \common_Logger::i($e->getMessage());
//            var_dump($directory, $source, $model, $e->getMessage());
            return null;
        }

        return $model;
    }

    /**
     * Get model from identifier & version
     *
     * @param $identifier
     * @param null $version
     * @return PortableElementModel
     * @throws PortableElementNotFoundException
     */
    public function getPciByIdentifier($identifier, $version=null)
    {
        $model = new PciModel($identifier, $version);
        return PortableElementFactory::getRegistry($this->getModel())->fetch($model);
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
        $model = $this->getValidPortableElementFromDirectorySource($directory);
        if (is_null($model)) {
            throw new PortableElementNotFoundException('no valid portable element model found in the directory '.$directory);
        }

        return $this->registerModel($model, $directory);
    }

    /**
     * Fill all values of a model based on $model->getTypeIdentifier, $model->getVersion
     *
     * @param PortableElementModel $model
     * @return $this|null
     */
    public function hydrateModel(PortableElementModel $model)
    {
        return PortableElementFactory::getRegistry($model)->fetch($model);
    }

    /**
     * Return the stream of a file model
     *
     * @param PortableElementModel $model
     * @param $file
     * @return bool|false|resource
     * @throws \tao_models_classes_FileNotFoundException
     */
    public function getFileStream(PortableElementModel $model, $file)
    {
        return PortableElementFactory::getRegistry($model)->getFileStream($model, $file);
    }
}