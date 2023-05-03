<?php

/*
 *
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
 * Copyright (c) 2021  (original work) Open Assessment Technologies SA;
 */

declare(strict_types=1);

namespace oat\taoQtiItem\model\import\Decorator;

use oat\taoQtiItem\model\import\ItemInterface;
use oat\taoQtiItem\model\import\TemplateInterface;

class CvsToQtiTemplateDecorator
{
    /**
     * @var array
     */
    private $csvColumns;

    /**
     * @var string
     */
    private $qtiTemplatePath;

    public function __construct(TemplateInterface $template)
    {
        $this->qtiTemplatePath = $template->getDefinition()['target']['templatePath'] ?? [];
        $this->csvColumns = $template->getDefinition()['columns'] ?? [];
    }

    public function getCsvColumns(): array
    {
        return $this->csvColumns;
    }

    public function getQtiTemplatePath(ItemInterface $item): string
    {
        if ($item->isNoneResponse()) {
            return $this->qtiTemplatePath['noResponse'];
        }

        if ($item->isMapResponse()) {
            return $this->qtiTemplatePath['mapResponse'];
        }

        if ($item->isMatchCorrectResponse()) {
            return $this->qtiTemplatePath['matchCorrectResponse'];
        }
    }
}
