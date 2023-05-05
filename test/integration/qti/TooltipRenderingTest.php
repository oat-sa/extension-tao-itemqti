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
 * Copyright (c) 2017 (original work) Open Assessment Technologies SA;
 */

/**
 * @author Christophe Noël <christophe@taotesting.com>
 */

namespace oat\taoQtiItem\test\integration\qti;

use oat\taoQtiItem\model\qti\Tooltip;
use oat\generis\test\TestCase;

// phpcs:disable PSR1.Files.SideEffects
include_once dirname(__FILE__) . '/../../../includes/raw_start.php';
// phpcs:enable PSR1.Files.SideEffects

class TooltipRenderingTest extends TestCase
{
    public function testRenderTooltipToQTI()
    {
        $tooltip = new Tooltip([
            'data-role' => 'tooltip-target',
            'aria-describedby' => 'tooltip_id'
        ]);
        $tooltip->getBody()->edit('tooltip <i>target</i>');
        $tooltip->setContent('tooltip <strong>content</strong>');

        $rendering = $tooltip->toQTI();
        $this->assertEquals(
            '<span data-role="tooltip-target" aria-describedby="tooltip_id">tooltip <i>target</i></span>'
                . '<span data-role="tooltip-content" aria-hidden="true" id="tooltip_id">tooltip '
                . '<strong>content</strong></span>',
            $rendering,
            'Tooltip has been rendered as expected'
        );
    }
}
