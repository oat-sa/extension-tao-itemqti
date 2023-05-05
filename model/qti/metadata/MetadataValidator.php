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
 * Copyright (c) 2017 (original work) Open Assessment Technologies SA (under the project TAO-PRODUCT);
 *
 */

namespace oat\taoQtiItem\model\qti\metadata;

use common_report_Report;

/**
 * MetadataValidator interface.
 *
 * @author Aleh Hutnikau <hutnikau@1pt.com>
 *
 */
interface MetadataValidator
{
    /**
     * Check whether metadata values are valid
     *
     * @param array $metadataValues An array of MetadataValue objects that were previously identified to belong to
     *                              a given item.
     * @return common_report_Report
     */
    public function validate(array $metadataValues = null);
}
