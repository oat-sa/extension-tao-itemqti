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

class LomInjector extends ImsManifestMetadataInjector
{
    public function __construct($version = null)
    {
        $mappings = [];

        $mappings[] = new ImsManifestMapping(
            'http://ltsc.ieee.org/xsd/LOM',
            'imsmd',
            'http://www.imsglobal.org/xsd/imsmd_loose_v1p3p2.xsd'
        );
        parent::__construct($mappings);
    }

}