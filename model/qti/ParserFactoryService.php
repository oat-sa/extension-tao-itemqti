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
use DOMDocument;
use oat\oatbox\service\ConfigurableService;

class ParserFactoryService extends ConfigurableService
{
    const SERVICE_ID = 'taoQtiItem/parserFactoryService';

    const OPTION_PARSER_FACTORY_CLASS = 'parser_factory';

    /**
     * @param DOMDocument $data
     * @return mixed
     * @throws common_exception_Error
     */
    public function create(DOMDocument $data)
    {
        $class = $this->getOption(self::OPTION_PARSER_FACTORY_CLASS);
        if ($class !== ParserFactory::class && !is_subclass_of($class, ParserFactory::class)) {
            throw new common_exception_Error(sprintf('Qti parser factory class "%s" have to implement "%s"', $class, ParserFactory::class));
        }
        return new $class($data);
    }
}
