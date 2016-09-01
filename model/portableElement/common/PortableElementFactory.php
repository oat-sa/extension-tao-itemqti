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
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301, USA.
 *
 * Copyright (c) 2016 (original work) Open Assessment Technologies SA;
 *
 */

namespace oat\taoQtiItem\model\portableElement\common;

use oat\oatbox\AbstractRegistry;
use oat\oatbox\service\ConfigurableService;
use oat\oatbox\service\ServiceManager;
use oat\taoQtiItem\model\portableElement\common\exception\PortableElementParserException;
use oat\taoQtiItem\model\portableElement\common\model\PortableElementModel;
use oat\taoQtiItem\model\portableElement\common\parser\PortableElementDirectoryParser;
use oat\taoQtiItem\model\portableElement\common\parser\PortableElementPackageParser;
use oat\taoQtiItem\model\portableElement\common\validator\PortableElementModelValidator;
use oat\taoQtiItem\model\portableElement\pci\model\PciModel;
use oat\taoQtiItem\model\portableElement\pci\validator\PciValidator;
use oat\taoQtiItem\model\portableElement\pic\model\PicModel;
use oat\taoQtiItem\model\portableElement\pic\validator\PicValidator;
use oat\taoQtiItem\model\portableElement\PortableElementRegistry;
use oat\taoQtiItem\model\portableElement\PortableElementService;

/**
 * Factory to create components implementation based on PortableElementModel
 *
 * Class PortableElementFactory
 * @package oat\qtiItemPci\model\common
 */
class PortableElementFactory extends ConfigurableService
{
    static protected $registries = [];
    static protected $services = [];

    /**
     * Get a list of available $model implementation
     * @return array
     */
    static protected function getAvailableModels()
    {
        return [
            new PciModel(),
            new PicModel()
        ];
    }

    public function getModel(array $data) {

    }

    /**
     * Get the registry associated to $model, from config
     *
     * @param PortableElementModel $model
     * @return PortableElementRegistry
     * @throws \common_Exception
     */
    static function getRegistry(PortableElementModel $model)
    {
        if (! isset(self::$registries[get_class($model)])) {
            $registry = PortableElementRegistry::getRegistry();
            $registry
                ->setServiceLocator(ServiceManager::getServiceManager())
                ->setModel($model);
            self::$registries[get_class($model)] = $registry;
        }
        return self::$registries[get_class($model)];
    }

    /**
     * @param PortableElementModel $model
     * @return PortableElementService
     */
    static function getService(PortableElementModel $model)
    {
        if (! isset(self::$services[get_class($model)])) {
            $service = new PortableElementService();
            $service
                ->setServiceLocator(ServiceManager::getServiceManager())
                ->setModel($model);
            self::$services[get_class($model)] = $service;
        }
        return self::$services[get_class($model)];
    }

    /**
     * Get packageParser related to $source e.q. zipfile
     * $forceModel try only to apply a given PortableElementModel
     *
     * @param $source
     * @param PortableElementModel|null $forceModel
     * @return PortableElementPackageParser
     * @throws PortableElementParserException
     */
    static public function getPackageParser($source, PortableElementModel $forceModel=null)
    {
        try {
            $parser = new PortableElementPackageParser($source);
        } catch (\common_exception_Error $e) {
            throw new PortableElementParserException('Unable to parse Portable package', 0, $e);
        }

        if ($forceModel) {
            if ($parser->hasValidModel($forceModel)) {
                return $parser;
            }
        } else {
            $models = self::getAvailableModels();
            foreach ($models as $model) {
                if ($parser->hasValidModel($model)) {
                    return $parser;
                }
            }
        }

        throw new PortableElementParserException(
            'This zip source is not compatible neither with PCI or PIC model. Manifest and/or engine file are missing.'
        );
    }

    /**
     * Get directoryParser related to $source e.q. directory
     *
     * @param $source
     * @param PortableElementModel|null $forceModel
     * @return bool|PortableElementDirectoryParser
     * @throws \common_Exception
     */
    static public function getDirectoryParser($source, PortableElementModel $forceModel=null)
    {
        try {
            $parser = new PortableElementDirectoryParser($source);
        } catch (\common_exception_Error $e) {
            throw new PortableElementParserException('Unable to parse Portable package', 0, $e);
        }

        $models = self::getAvailableModels();

        if ($forceModel) {
            return $parser->hasValidModel($forceModel);
        }

        foreach ($models as $model) {
            if ($parser->hasValidModel($model)) {
                return $parser;
            }
        }

        throw new PortableElementParserException('This directory source is not compatible neither with PCI or PIC model. Manifest and/or engine file are missing.');
    }

    /**
     * Get validator component associated to a model
     *
     * @param PortableElementModel $model
     * @return PortableElementModelValidator|PciValidator|PicValidator
     */
    static public function getValidator(PortableElementModel $model)
    {
        switch (get_class($model)) {
            case PciModel::class :
                $validator = new PciValidator();
                break;
            case PicModel::class :
                $validator = new PicValidator();
                break;
            default:
                $validator = new PortableElementModelValidator();
                break;
        }
        $validator->setModel($model);
        return $validator;
    }
}