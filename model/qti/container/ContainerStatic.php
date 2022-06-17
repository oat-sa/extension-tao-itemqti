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
 * Copyright (c) 2013-2022 (original work) Open Assessment Technologies SA (under the project TAO-PRODUCT);
 */

namespace oat\taoQtiItem\model\qti\container;

use oat\taoQtiItem\model\qti\feedback\Feedback;
use oat\taoQtiItem\model\qti\Figure;
use oat\taoQtiItem\model\qti\Img;
use oat\taoQtiItem\model\qti\Math;
use oat\taoQtiItem\model\qti\QtiObject;
use oat\taoQtiItem\model\qti\Table;
use oat\taoQtiItem\model\qti\Tooltip;
use oat\taoQtiItem\model\qti\XInclude;

/**
 * The QTI_Container object represents the generic element container
 *
 * @access public
 * @author Sam, <sam@taotesting.com>
 * @package taoQTI
 */
class ContainerStatic extends Container
{
    /**
     * @inheritDoc
     */
    public function getValidElementTypes(): array
    {
        return [
            Feedback::class,
            Figure::class,
            Img::class,
            Math::class,
            QtiObject::class,
            Table::class,
            Tooltip::class,
            XInclude::class,
        ];
    }

    /**
     * Fix erroneously self-closing elements
     *
     * @return string
     */
    public function getBody()
    {
        return $this->fixNonvoidTags(parent::getBody());
    }
}
