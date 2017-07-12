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
 * Copyright (c) 2017 (original work) Open Assessment Technologies SA
 *
 */

namespace oat\taoQtiItem\model\qti\metadata\imsManifest;


use oat\taoQtiItem\model\qti\metadata\simple\SimpleMetadataValue;

class LomIdentifierExtractor extends ImsManifestMetadataExtractor
{
    public function extract($manifest)
    {
        $values = parent::extract($manifest);
        $newValues = array();

        $expectedPath = array(
            'http://www.imsglobal.org/xsd/imsmd_v1p2#lom',
            'http://www.imsglobal.org/xsd/imsmd_v1p2#general',
            'http://www.imsglobal.org/xsd/imsmd_v1p2#identifier'
        );

        foreach ($values as $resourceIdentifier => $metadataValueCollection) {
            $classificationMetadataValue = null;

            /** @var SimpleMetadataValue $metadataValue */
            foreach ($metadataValueCollection as $metadataValue) {
                $path = $metadataValue->getPath();

                if ($path === $expectedPath) {
                    $newValues[$resourceIdentifier][] = $metadataValue;
                }
            }
        }

        return $newValues;
    }
}