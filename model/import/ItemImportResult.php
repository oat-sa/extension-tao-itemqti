<?php

/*
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
 * Copyright (c) 2021 (original work) Open Assessment Technologies SA (under the project TAO-PRODUCT);
 */

declare(strict_types=1);

namespace oat\taoQtiItem\model\import;

use oat\taoQtiItem\model\import\Parser\InvalidImportException;
use oat\taoQtiItem\model\import\Parser\WarningImportException;

class ItemImportResult
{
    /** @var ItemInterface[] */
    private $items;

    /** @var WarningImportException[] */
    private $warningReports;
    /**
     * @var InvalidImportException[]
     */
    private $errorReports;

    /**
     * @param  ItemInterface[]  $items
     * @param  WarningImportException[]  $warningReports
     * @param  InvalidImportException[]  $errorReports
     */
    public function __construct(array $items, array $warningReports, array $errorReports)
    {
        $this->items = $items;
        $this->warningReports = $warningReports;
        $this->errorReports = $errorReports;
    }

    /**
     * @return ItemInterface[]
     */
    public function getItems(): array
    {
        return $this->items;
    }

    /**
     * @return InvalidImportException[]
     */
    public function getWarningReports(): array
    {
        return $this->warningReports;
    }

    /**
     * @return WarningImportException[]
     */
    public function getErrorReports(): array
    {
        return $this->errorReports;
    }

}
