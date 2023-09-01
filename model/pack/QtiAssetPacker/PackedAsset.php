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
 * Copyright (c) 2020 (original work) Open Assessment Technologies SA (under the project TAO-PRODUCT);
 *
 */

declare(strict_types=1);

namespace oat\taoQtiItem\model\pack\QtiAssetPacker;

use oat\tao\model\media\MediaAsset;

class PackedAsset
{
    /** @var string */
    private $type;

    /** @var MediaAsset */
    private $mediaAsset;

    /** @var string */
    private $link;

    /** @var string */
    private $replacedBy;

    public function __construct(string $type, MediaAsset $mediaAsset, string $link, string $replacedBy = null)
    {
        $this->type = $type;
        $this->link = $link;
        $this->replacedBy = $replacedBy;
        $this->mediaAsset = $mediaAsset;
    }

    public function getType(): string
    {
        return $this->type;
    }

    public function getLink(): ?string
    {
        return $this->link;
    }

    public function getMediaAsset(): MediaAsset
    {
        return $this->mediaAsset;
    }

    public function getReplacedBy(): ?string
    {
        return $this->replacedBy;
    }

    public function setReplacedBy(string $replacedBy): self
    {
        $this->replacedBy = $replacedBy;

        return $this;
    }
}
