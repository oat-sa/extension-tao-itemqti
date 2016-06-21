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
 * Copyright (c) 2016 (original work) Open Assessment Technologies SA (under the project TAO-PRODUCT);
 *
 */

namespace oat\taoQtiItem\model\qti\asset\handler;

use oat\taoItems\model\media\LocalItemSource;

class LocalAssetHandler extends AssetHandler
{
    /**
     * @var LocalItemSource
     */
    protected $itemSource;

    public function __construct($itemSource)
    {
        if (!$itemSource instanceof LocalItemSource) {
            throw new \common_Exception('LocalAssetHandler expects item source to be a valid LocalItemSource');
        }
        $this->itemSource = $itemSource;
        return $this;
    }

    public function handle($absolutePath, $relativePath)
    {
        // store locally, in a safe directory
        $safePath = '';
        if (dirname($relativePath) !== '.') {
            $safePath = str_replace('../', '', dirname($relativePath)) . '/';
        }

        $info = $this->itemSource->add($absolutePath, basename($absolutePath), $safePath);
        \common_Logger::i('Asset file \'' . $absolutePath . '\' copied.');
        return $info;
    }
}