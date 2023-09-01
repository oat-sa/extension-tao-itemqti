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
 * Copyright (c) 2017 (original work) Open Assessment Technologies SA (under the project TAO-PRODUCT);
 *
 *
 */

namespace oat\taoQtiItem\model\Export\Extractor;

use core_kernel_classes_Class;
use core_kernel_classes_Resource;
use oat\taoQtiItem\model\Export\Extractor\Strategy\Strategy;
use oat\taoQtiItem\model\Export\Extractor\Strategy\StrategyFactory;
use oat\taoQtiItem\model\flyExporter\extractor\Extractor;
use oat\taoQtiItem\model\flyExporter\extractor\ExtractorException;
use tao_helpers_form_GenerisFormFactory;

class MetaDataOntologyExtractor implements Extractor
{
    /**
     * Item to export
     * @var \core_kernel_classes_Resource
     */
    protected $item;

    /**
     * Request columns
     * @var array
     */
    protected $columns = [];

    /**
     * Output of data
     * @var array
     */
    protected $data = [];

    /**
     * Meta data properties available for export.
     *
     * @var array
     */
    private $metaDataProperties = [];


    public function setItem(\core_kernel_classes_Resource $item)
    {
        $this->item = $item;

        return $this;
    }

    /**
     * Add column to export
     * Check if core_kernel_classes_Property exists into $config
     *
     * @param $column
     * @param array $config
     * @throws ExtractorException
     * @return Extractor $this
     */
    public function addColumn($column, array $config)
    {
        $this->columns[$column] = $config;

        return $this;
    }

    /**
     * @inheritdoc
     */
    public function run()
    {
        if (empty($this->item) || !($this->item instanceof \core_kernel_classes_Resource)) {
            throw new ExtractorException('Export item not set.');
        }

        $this->data = [];

        foreach ($this->columns as $column => $config) {
            $strategy = $this->chooseStrategy($config, $column);

            foreach ($this->metaDataProperties as $dataProperty) {
                $strategy->addHashEntry(OntologyExtractorRunner::run($this->item, $dataProperty));
            }

            $this->data = array_merge($this->data, $strategy->toArray());
        }

        return $this;
    }

    /**
     * Return output data
     *
     * @return array
     */
    public function getData()
    {
        return $this->data;
    }

    /**
     * @inheritdoc
     */
    public function __toPhpCode()
    {
        return 'new ' . get_class($this) . '()';
    }


    /**
     * @param array $config
     * @param string $column
     * @return Strategy
     */
    protected function chooseStrategy(array $config, $column)
    {
        $this->setMetaDataProperties($config);

        return StrategyFactory::create($config, $column, $this->metaDataProperties);
    }


    /**
     * Setting the meta data properties available for export.
     *
     * @param array $config
     * @throws ExtractorException
     */
    protected function setMetaDataProperties(array $config)
    {
        $itemTypes = $this->item->getTypes();
        $classType = reset($itemTypes);

        if (!$classType->isClass()) {
            throw new ExtractorException('Item class type do not exists');
        }

        $this->metaDataProperties = $this->getAvailableMetaDataProperties($classType, $config['excludedProperties']);
    }

    /**
     * @param core_kernel_classes_Class $classToExport
     *
     * @param array $excludedProperties
     * @return array
     */
    protected function getAvailableMetaDataProperties($classToExport, array $excludedProperties)
    {
        $props = tao_helpers_form_GenerisFormFactory::getClassProperties($classToExport);

        return array_filter($props, function ($prop) use ($excludedProperties) {
            /**@var $prop core_kernel_classes_Resource */
            return !in_array($prop->getUri(), $excludedProperties);
        });
    }
}
