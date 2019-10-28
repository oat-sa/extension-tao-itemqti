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
 * Copyright (c) 2019  (original work) Open Assessment Technologies SA;
 *
 * @author Oleksandr Zagovorychev <zagovorichev@gmail.com>
 */

namespace oat\taoQtiItem\model\qti;


use common_exception_Error;
use oat\oatbox\filesystem\Directory;
use oat\oatbox\service\ConfigurableService;

class AssetParserFactoryService extends ConfigurableService
{
    const SERVICE_ID = 'taoQtiItem/assetParserFactoryService';

    const OPTION_ASSET_PARSER = 'asset_parser';

    /**
     * @param Item $item
     * @param Directory $directory
     * @return AssetParser
     * @throws common_exception_Error
     */
    public function create(Item $item, Directory $directory)
    {
        $class = $this->getOption(self::OPTION_ASSET_PARSER);
        if (!is_subclass_of($class, AssetParser::class)) {
            throw new common_exception_Error(sprintf('Asset parser implement %s', AssetParser::class));
        }
        return new $class($item, $directory);
    }
}
