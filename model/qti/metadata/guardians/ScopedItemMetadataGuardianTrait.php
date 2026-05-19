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
 * Copyright (c) 2026 (original work) Open Assessment Technologies SA;
 */

declare(strict_types=1);

namespace oat\taoQtiItem\model\qti\metadata\guardians;

use core_kernel_classes_Class;
use oat\tao\model\TaoOntology;

trait ScopedItemMetadataGuardianTrait
{
    private ?core_kernel_classes_Class $scopeClass = null;

    public function setScopeClass(?core_kernel_classes_Class $class): void
    {
        $this->scopeClass = $class;
    }

    protected function getSearchClass(): core_kernel_classes_Class
    {
        if (
            $this->scopeClass !== null
            && $this->scopeClass->exists()
            && $this->scopeClass->getUri() !== TaoOntology::CLASS_URI_ITEM
        ) {
            return $this->scopeClass;
        }

        return $this->getClass(TaoOntology::CLASS_URI_ITEM);
    }
}
