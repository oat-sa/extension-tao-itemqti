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

class ParsedMetadatum
{
    /** @var string */
    private $metadatum;

    /** @var string */
    private $alias;

    /** @var string */
    private $aliasUri;

    public function __construct(string $metadatum, string $alias, string $aliasUri = null)
    {
        $this->metadatum = $metadatum;
        $this->alias = $alias;
        $this->aliasUri = $aliasUri;
    }

    public function getMetadatum(): string
    {
        return $this->metadatum;
    }

    public function getAlias(): string
    {
        return $this->alias;
    }

    public function getAliasUri(): ?string
    {
        return $this->aliasUri;
    }

    public function setAliasUri(string $aliasUri): void
    {
        $this->aliasUri = $aliasUri;
    }


}
