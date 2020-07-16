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
 * Copyright (c) 2020 (original work) Open Assessment Technologies SA;
 */

declare(strict_types=1);

namespace oat\taoQtiItem\model\qti;

class ElementReferences
{
    private const INCLUDE_ELEMENT_REFERENCES_KEY = 'includeElementReferences';
    private const OBJECT_ELEMENT_REFERENCES_KEY = 'objectElementReferences';
    private const IMG_ELEMENT_REFERENCES_KEY = 'imgElementReferences';

    /** @var string[] */
    private $xIncludeReferences;

    /** @var string[] */
    private $objectReferences;

    /** @var string[] */
    private $imgReferences;

    public function __construct(array $xIncludeReferences, array $objectReferences, array $imgReferences)
    {
        $this->xIncludeReferences = $xIncludeReferences;
        $this->objectReferences = $objectReferences;
        $this->imgReferences = $imgReferences;
    }

    public function getXIncludeReferences(): array
    {
        return $this->xIncludeReferences;
    }

    public function getObjectReferences(): array
    {
        return $this->objectReferences;
    }

    public function getImgReferences(): array
    {
        return $this->imgReferences;
    }

    public function extractReferences(): array
    {
        return [
            self::INCLUDE_ELEMENT_REFERENCES_KEY => $this->getXIncludeReferences(),
            self::OBJECT_ELEMENT_REFERENCES_KEY => $this->getObjectReferences(),
            self::IMG_ELEMENT_REFERENCES_KEY => $this->getImgReferences(),
        ];
    }
}
