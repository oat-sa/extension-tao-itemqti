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

class LocalAssetHandler implements AssetHandler
{
    /**
     * @var LocalItemSource
     */
    protected $itemSource;

    /**
     * Always return true, local source is the last fallback
     *
     * @param $relativePath
     * @throws \common_Exception
     * @return bool
     */
    public function isApplicable($relativePath)
    {
        return true;
    }

    /**
     * Handle the process to add file from $itemSource->add()
     *
     * @param $absolutePath
     * @param $relativePath
     * @return array
     * @throws \common_Exception
     * @throws \common_exception_Error
     */
    public function handle($absolutePath, $relativePath)
    {
        if (!$this->itemSource) {
            throw new \common_Exception('Missing required parameter: item source');
        }

        // store locally, in a safe directory
        $safePath = '';
        if (dirname($relativePath) !== '.') {
            $safePath = str_replace('../', '', dirname($relativePath)) . '/';
        }

        $info = $this->itemSource->add($absolutePath, basename($absolutePath), $safePath);
        \common_Logger::i('Asset file \'' . $absolutePath . '\' copied.');
        return $info;
    }

    /**
     * Getter of $itemSource
     * @return LocalItemSource
     */
    public function getItemSource()
    {
        return $this->itemSource;
    }

    /**
     * Setter of itemSource
     * @param LocalItemSource $itemSource
     * @return $this
     */
    public function setItemSource(LocalItemSource $itemSource)
    {
        $this->itemSource = $itemSource;
        return $this;
    }

    /**
     * @inherit
     */
    public function finalize()
    {
        // Nothing to do
    }
}