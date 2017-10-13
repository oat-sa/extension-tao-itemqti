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

use core_kernel_classes_Property;
use core_kernel_classes_Resource;
use oat\taoQtiItem\model\flyExporter\extractor\OntologyExtractor;

class OntologyExtractorRunner
{
    /**
     * @param core_kernel_classes_Resource $item
     * @param core_kernel_classes_Property $classProperty
     *
     * @return HashEntry
     * @throws \oat\taoQtiItem\model\flyExporter\extractor\ExtractorException
     * @throws \Exception
     */
    public static function run(core_kernel_classes_Resource $item, core_kernel_classes_Property $classProperty)
    {
        $itemProperty = $item->getProperty($classProperty->getUri());
        $labelItemProperty = $itemProperty->getLabel();

        $extractor = new OntologyExtractor();
        $extractor->addColumn($labelItemProperty, ['property' => $classProperty->getUri()]);
        $extractor->setItem($item);
        $extractor->run();
        $data = $extractor->getData();

        return new HashEntry($labelItemProperty, $data[$labelItemProperty]);
    }
}