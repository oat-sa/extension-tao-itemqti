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
 * Foundation, Inc., 31 Milk St # 960789 Boston, MA 02196 USA.
 *
 * Copyright (c) 2026 (original work) Open Assessment Technologies SA;
 */

declare(strict_types=1);

namespace oat\taoQtiItem\test\unit\helpers;

use oat\taoQtiItem\helpers\UmfiTextEntryXmlAttributes;
use PHPUnit\Framework\TestCase;

class UmfiTextEntryXmlAttributesTest extends TestCase
{
    public function testRelocateMovesFeatureAttrsToFirstTextEntryInteraction(): void
    {
        $xml = <<<'XML'
<?xml version="1.0" encoding="UTF-8"?>
<assessmentItem xmlns="http://www.imsglobal.org/xsd/imsqti_v2p2" identifier="x" title="t">
  <itemBody>
    <p>
      <textEntryInteraction responseIdentifier="RESPONSE_2" base="10" placeholderText=""/>
      <textEntryInteraction responseIdentifier="RESPONSE_3" base="10" placeholderText=""/>
      <textEntryInteraction responseIdentifier="RESPONSE" base="10" placeholderText="" data-item-type="umfi-closed" data-umfi-values="[{&quot;group&quot;:&quot;GROUP_1_FOUND&quot;,&quot;canonical&quot;:&quot;Poland&quot;,&quot;variants&quot;:[&quot;Poland&quot;]}]" data-case-sensitive="false"/>
      <textEntryInteraction responseIdentifier="RESPONSE_1" base="10" placeholderText=""/>
    </p>
  </itemBody>
</assessmentItem>
XML;

        $relocated = UmfiTextEntryXmlAttributes::relocateFeatureDataAttrsToFirstTextEntry($xml);

        preg_match_all('/<textEntryInteraction\b[^>]*\/?>/', $relocated, $matches);
        $tags = $matches[0];

        $this->assertCount(4, $tags);
        $this->assertStringContainsString('responseIdentifier="RESPONSE_2"', $tags[0]);
        $this->assertStringContainsString('data-item-type="umfi-closed"', $tags[0]);
        $this->assertStringContainsString('data-case-sensitive="false"', $tags[0]);
        $this->assertStringContainsString('data-umfi-values=', $tags[0]);
        $this->assertStringNotContainsString('data-item-type', $tags[1]);
        $this->assertStringNotContainsString('data-item-type', $tags[2]);
        $this->assertStringNotContainsString('data-umfi-values', $tags[2]);
        $this->assertStringNotContainsString('data-item-type', $tags[3]);
    }

    public function testRelocateIsNoOpWithoutFeatureAttrs(): void
    {
        $xml = '<itemBody><textEntryInteraction responseIdentifier="RESPONSE" /></itemBody>';

        $this->assertSame($xml, UmfiTextEntryXmlAttributes::relocateFeatureDataAttrsToFirstTextEntry($xml));
    }
}
