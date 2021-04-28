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
 * Copyright (c) 2021  (original work) Open Assessment Technologies SA;
 */

namespace oat\taoQtiItem\test\unit\model\import;

use oat\taoQtiItem\model\import\ItemInterface;
use oat\taoQtiItem\model\import\Template\ItemsQtiTemplateRender;
use oat\taoQtiItem\model\import\TemplateInterface;
use PHPUnit\Framework\TestCase;
use Renderer;

class ItemsQtiTemplateRenderTest extends TestCase
{

    public function testProcess()
    {
        $renderMock = $this->createMock(Renderer::class);
        $renderMock->expects($this->once())->method('render')->willReturn('');

        $itemMock = $this->createMock(ItemInterface::class);
        $itemMock->expects($this->once())->method('getName');

        $templateMock = $this->createMock(TemplateInterface::class);
        $templateMock->expects($this->once())->method('getQtiTemplate');

        $subject = new ItemsQtiTemplateRender();
        $subject->withRenderer($renderMock);
        $this->assertSame('', $subject->processItem($itemMock, $templateMock));
    }
}

