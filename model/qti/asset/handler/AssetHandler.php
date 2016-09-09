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

namespace oat\taoQtiItem\model\qti\asset\handler;

interface AssetHandler
{
    /**
     * Given a relative path to a file, Handler should be able to know if file is applicable for them
     *
     * @param $relativePath
     * @return bool
     */
    public function isApplicable($relativePath);

    /**
     * Process to manage a file of asset
     * Return an array of fileinfo
     *
     * @param $absolutePath
     * @param $relativePath
     * @return mixed
     */
    public function handle($absolutePath, $relativePath);

    /**
     * Finalize asset handling with post call
     */
    public function finalize();
}