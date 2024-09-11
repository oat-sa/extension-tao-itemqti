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
 * Copyright (c) 2024 (original work) Open Assessment Technologies SA.
 */

declare(strict_types=1);

namespace oat\taoQtiItem\test\unit\model\Translation\Form\Modifier;

use core_kernel_classes_Resource;
use oat\generis\model\data\Ontology;
use oat\tao\model\featureFlag\FeatureFlagCheckerInterface;
use oat\tao\model\TaoOntology;
use oat\taoQtiItem\model\qti\Item;
use oat\taoQtiItem\model\qti\Service;
use oat\taoQtiItem\model\Translation\Form\Modifier\TranslationFormModifier;
use PHPUnit\Framework\MockObject\MockObject;
use PHPUnit\Framework\TestCase;
use tao_helpers_form_Form;
use tao_helpers_form_FormElement;
use tao_helpers_Uri;

class TranslationFormModifierTest extends TestCase
{
    /** @var tao_helpers_form_Form|MockObject */
    private tao_helpers_form_Form $form;

    /** @var Ontology|MockObject */
    private Ontology $ontology;

    /** @var Service|MockObject */
    private Service $itemQtiService;

    /** @var FeatureFlagCheckerInterface|MockObject */
    private FeatureFlagCheckerInterface $featureFlagChecker;

    private TranslationFormModifier $sut;

    protected function setUp(): void
    {
        $this->form = $this->createMock(tao_helpers_form_Form::class);
        $this->ontology = $this->createMock(Ontology::class);
        $this->itemQtiService = $this->createMock(Service::class);
        $this->featureFlagChecker = $this->createMock(FeatureFlagCheckerInterface::class);
        $this->sut = new TranslationFormModifier(
            $this->ontology,
            $this->itemQtiService,
            $this->featureFlagChecker
        );
    }

    public function testModifyTranslationDisabled(): void
    {
        $this->featureFlagChecker
            ->expects($this->once())
            ->method('isEnabled')
            ->with('FEATURE_TRANSLATION_ENABLED')
            ->willReturn(false);

        $this->form
            ->expects($this->never())
            ->method($this->anything());

        $this->ontology
            ->expects($this->never())
            ->method($this->anything());

        $this->itemQtiService
            ->expects($this->never())
            ->method($this->anything());

        $this->sut->modify($this->form);
    }

    public function testModifyTranslationEnabledButNoElement(): void
    {
        $this->featureFlagChecker
            ->expects($this->once())
            ->method('isEnabled')
            ->with('FEATURE_TRANSLATION_ENABLED')
            ->willReturn(true);

        $this->form
            ->expects($this->once())
            ->method('getElement')
            ->with(tao_helpers_Uri::encode(TaoOntology::PROPERTY_UNIQUE_IDENTIFIER))
            ->willReturn(null);

        $this->ontology
            ->expects($this->never())
            ->method($this->anything());
        $this->itemQtiService
            ->expects($this->never())
            ->method($this->anything());

        $this->sut->modify($this->form);
    }

    public function testModifyTranslationEnabledButElementValueAlreadySet(): void
    {
        $this->featureFlagChecker
            ->expects($this->once())
            ->method('isEnabled')
            ->with('FEATURE_TRANSLATION_ENABLED')
            ->willReturn(true);

        $element = $this->createMock(tao_helpers_form_FormElement::class);
        $element
            ->expects($this->once())
            ->method('getRawValue')
            ->willReturn('value');

        $this->form
            ->expects($this->once())
            ->method('getElement')
            ->with(tao_helpers_Uri::encode(TaoOntology::PROPERTY_UNIQUE_IDENTIFIER))
            ->willReturn($element);

        $this->ontology
            ->expects($this->never())
            ->method($this->anything());
        $this->itemQtiService
            ->expects($this->never())
            ->method($this->anything());

        $this->sut->modify($this->form);
    }

    public function testModifyTranslationEnabledButNoElementValueAndNoItemData(): void
    {
        $this->featureFlagChecker
            ->expects($this->once())
            ->method('isEnabled')
            ->with('FEATURE_TRANSLATION_ENABLED')
            ->willReturn(true);

        $element = $this->createMock(tao_helpers_form_FormElement::class);
        $element
            ->expects($this->once())
            ->method('getRawValue')
            ->willReturn(null);

        $this->form
            ->expects($this->once())
            ->method('getElement')
            ->with(tao_helpers_Uri::encode(TaoOntology::PROPERTY_UNIQUE_IDENTIFIER))
            ->willReturn($element);

        $this->form
            ->expects($this->once())
            ->method('getValue')
            ->with('uri')
            ->willReturn('instanceUri');

        $instance = $this->createMock(core_kernel_classes_Resource::class);

        $this->ontology
            ->expects($this->once())
            ->method('getResource')
            ->with('instanceUri')
            ->willReturn($instance);

        $this->itemQtiService
            ->expects($this->once())
            ->method('getDataItemByRdfItem')
            ->with($instance)
            ->willReturn(null);

        $element
            ->expects($this->never())
            ->method('setValue');

        $this->sut->modify($this->form);
    }

    public function testModifyTranslationEnabledButNoElementValue(): void
    {
        $this->featureFlagChecker
            ->expects($this->once())
            ->method('isEnabled')
            ->with('FEATURE_TRANSLATION_ENABLED')
            ->willReturn(true);

        $element = $this->createMock(tao_helpers_form_FormElement::class);
        $element
            ->expects($this->once())
            ->method('getRawValue')
            ->willReturn(null);

        $this->form
            ->expects($this->once())
            ->method('getElement')
            ->with(tao_helpers_Uri::encode(TaoOntology::PROPERTY_UNIQUE_IDENTIFIER))
            ->willReturn($element);

        $this->form
            ->expects($this->once())
            ->method('getValue')
            ->with('uri')
            ->willReturn('instanceUri');

        $instance = $this->createMock(core_kernel_classes_Resource::class);

        $this->ontology
            ->expects($this->once())
            ->method('getResource')
            ->with('instanceUri')
            ->willReturn($instance);

        $itemData = $this->createMock(Item::class);
        $itemData
            ->expects($this->once())
            ->method('getIdentifier')
            ->willReturn('Item Identifier');

        $this->itemQtiService
            ->expects($this->once())
            ->method('getDataItemByRdfItem')
            ->with($instance)
            ->willReturn($itemData);

        $element
            ->expects($this->once())
            ->method('setValue')
            ->with('Item Identifier');

        $this->sut->modify($this->form);
    }
}
