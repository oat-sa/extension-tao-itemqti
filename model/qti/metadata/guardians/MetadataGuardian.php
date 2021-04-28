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
 * Copyright (c) 2021 (original work) Open Assessment Technologies SA;
 */

declare(strict_types=1);

namespace oat\taoQtiItem\model\qti\metadata\guardians;

use core_kernel_classes_Class;
use oat\tao\model\TaoOntology;
use oat\oatbox\service\ConfigurableService;
use oat\taoQtiItem\model\qti\metadata\MetadataValue;
use oat\taoQtiItem\model\qti\metadata\MetadataGuardian as MetadataGuardianInterface;

class MetadataGuardian extends ConfigurableService implements MetadataGuardianInterface
{
    public const SERVICE_ID = 'taoQtiItem/MetadataGuardian';

    /** Path to find metadata value */
    public const OPTION_EXPECTED_PATH = 'expectedPath';

    /** The property URI whose value need to check */
    public const OPTION_PROPERTY_URI = 'propertyUri';

    public function guard(array $metadataValues)
    {
        $expectedPath = $this->getOption(self::OPTION_EXPECTED_PATH, []);
        $propertyUri = $this->getOption(self::OPTION_PROPERTY_URI, '');
        $class = new core_kernel_classes_Class(TaoOntology::CLASS_URI_ITEM);

        /** @var MetadataValue $metadataValue */
        foreach ($metadataValues as $metadataValue) {
            if ($metadataValue->getPath() === $expectedPath) {
                $instances = $class->searchInstances(
                    [$propertyUri => $metadataValue->getValue()],
                    ['like' => false, 'recursive' => true]
                );

                if (!empty($instances)) {
                    return reset($instances);
                }
            }
        }

        return false;
    }
}
