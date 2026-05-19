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
 * Copyright (c) 2026 (original work) Open Assessment Technologies SA;
 */

declare(strict_types=1);

namespace oat\taoQtiItem\model\qti\metadata\guardians;

use oat\generis\model\OntologyRdfs;
use oat\generis\model\OntologyAwareTrait;
use oat\oatbox\service\ConfigurableService;
use oat\taoQtiItem\model\qti\metadata\MetadataValue;
use oat\taoQtiItem\model\qti\metadata\MetadataGuardian as MetadataGuardianInterface;
use oat\taoQtiItem\model\qti\metadata\ScopedMetadataGuardian;

/**
 * Finds existing items in the item bank by their rdfs:label (item label).
 */
class ItemLabelMetadataGuardian extends ConfigurableService implements MetadataGuardianInterface, ScopedMetadataGuardian
{
    use OntologyAwareTrait;
    use ScopedItemMetadataGuardianTrait;

    public const SERVICE_ID = 'taoQtiItem/ItemLabelMetadataGuardian';

    /** @var string Config key for metadata paths that carry the item label value */
    public const OPTION_EXPECTED_PATHS = 'expectedPaths';

    /** @var string The property URI whose value is matched against metadata */
    public const OPTION_PROPERTY_URI = 'propertyUri';

    public function guard(array $metadataValues)
    {
        $expectedPaths = $this->getOption(self::OPTION_EXPECTED_PATHS, $this->getDefaultExpectedPaths());
        $propertyUri = $this->getOption(self::OPTION_PROPERTY_URI, OntologyRdfs::RDFS_LABEL);
        $class = $this->getSearchClass();

        /** @var MetadataValue $metadataValue */
        foreach ($metadataValues as $metadataValue) {
            foreach ($expectedPaths as $expectedPath) {
                if ($metadataValue->getPath() !== $expectedPath) {
                    continue;
                }

                $label = trim($metadataValue->getValue());
                if ($label === '') {
                    continue;
                }

                $instances = $class->searchInstances(
                    [$propertyUri => $label],
                    ['like' => false, 'recursive' => true]
                );

                if (!empty($instances)) {
                    return reset($instances);
                }
            }
        }

        return false;
    }

    /**
     * @return array<int, array<int, string>>
     */
    private function getDefaultExpectedPaths(): array
    {
        return [
            [OntologyRdfs::RDFS_LABEL],
            [
                'http://ltsc.ieee.org/xsd/LOM#lom',
                OntologyRdfs::RDFS_LABEL,
            ],
        ];
    }
}
