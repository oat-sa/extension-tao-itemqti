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
 * Copyright (c) 2021  (original work) Open Assessment Technologies SA;
 *
 */

declare(strict_types=1);

namespace oat\taoQtiItem\test\unit\model;

use oat\generis\test\TestCase;
use oat\taoQtiItem\model\search\Tokenizer\Filter\NotBase64ContentFilter;

class NotBase64ContentFilterTest extends TestCase
{
    public function testFilter()
    {
        $subject = new NotBase64ContentFilter();
        $this->assertSame('text', $subject->filter('text'));
        $this->assertSame('', $subject->filter('data:audio/mpeg;base64,SUQzBAAAAA'));
        $this->assertSame(
            '[{"x1":"Test 1","x":"',
            $subject->filter(
                '[{"x1":"Test 1","x":"data:audio/mpeg;base64,SUQzBAAAAABKElRQRTEAAAAHAAADU2hpcHMAVElUMgAAABMAAANBc'
            )
        );
    }
}
