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
 * Copyright (c) 2019 (original work) Open Assessment Technologies SA (under the project TAO-PRODUCT);
 *
 */

namespace oat\taoQtiItem\test\unit\model\portableElement\validator;

use oat\generis\test\TestCase;
use oat\taoQtiItem\model\portableElement\element\PortableElementObject;
use oat\taoQtiItem\model\portableElement\exception\PortableElementInvalidFieldException;
use oat\taoQtiItem\model\portableElement\exception\PortableElementInvalidModelException;
use oat\taoQtiItem\model\portableElement\validator\Validatable;
use oat\taoQtiItem\model\portableElement\validator\Validator;

class ValidatorTest extends TestCase
{
    /** @var Validator */
    private $subject;

    protected function setUp(): void
    {
        parent::setUp();

        $this->subject = new Validator();
    }

    public function testValidateWithInvalidPropertyValue()
    {
        $portableElementObject = new DummyPortableElementObject();

        $validatable = $this->createMock(Validatable::class);
        $validatable
            ->expects($this->any())
            ->method('getConstraints')
            ->willReturn(['property' => [Validator::isString]]);

        $this->expectException(PortableElementInvalidModelException::class);
        $this->subject->validate($portableElementObject, $validatable);
    }

    public function testValidateWithValidPropertyValue()
    {
        $portableElementObject = new DummyPortableElementObject();
        $portableElementObject->setProperty('string');

        $validatable = $this->createMock(Validatable::class);
        $validatable
            ->expects($this->any())
            ->method('getConstraints')
            ->willReturn(['property' => [Validator::isString]]);

        $this->assertTrue($this->subject->validate($portableElementObject, $validatable));
    }

    public function testValidateWithInvalidConstraint()
    {
        $portableElementObject = new DummyPortableElementObject();
        $portableElementObject->setProperty('string');

        $validatable = $this->createMock(Validatable::class);
        $validatable->expects($this->any())->method('getConstraints')->willReturn(['property' => [null]]);

        $this->assertFalse($this->subject->validate($portableElementObject, $validatable));
    }

    public function testIsValidString()
    {
        $this->assertTrue($this->subject->isValidString('string'));

        $this->expectException(PortableElementInvalidFieldException::class);
        $this->subject->isValidString(null);
    }

    public function testIsValidArray()
    {
        $this->assertTrue($this->subject->isValidArray([]));

        $this->expectException(PortableElementInvalidFieldException::class);
        $this->subject->isValidArray(null);
    }

    public function testIsValidVersion()
    {
        $this->assertTrue($this->subject->isValidVersion('1.2.3'));
        $this->assertTrue($this->subject->isValidVersion('v1.2.3'));

        $this->expectException(PortableElementInvalidFieldException::class);
        $this->subject->isValidVersion('invalid');
    }

    public function testIsTypeIdentifier()
    {
        $this->assertTrue($this->subject->isTypeIdentifier('abc'));
        $this->assertTrue($this->subject->isTypeIdentifier('123'));
        $this->assertTrue($this->subject->isTypeIdentifier('xyz:'));
        $this->assertTrue($this->subject->isTypeIdentifier('abc-123_xyz'));

        $this->expectException(PortableElementInvalidFieldException::class);
        $this->subject->isTypeIdentifier('???');
    }

    /**
     * @dataProvider validSemVerProvider
     */
    public function testIsValidSemVerSuccess($version)
    {
        $this->assertTrue($this->subject->isValidSemVer($version));
    }

    /**
     * @dataProvider invalidSemVerProvider
     */
    public function testIsValidSemVerFailure($version)
    {
        $this->expectException(PortableElementInvalidFieldException::class);
        $this->subject->isValidSemVer($version);
    }

    public function validSemVerProvider()
    {
        return [
            ['0.0.1'],
            ['1.2.3-beta'],
            ['1.2.3-alpha+beta'],
        ];
    }

    public function invalidSemVerProvider()
    {
        return [
            ['1'],
            ['1.2'],
            ['1.2.'],
            ['invalid'],
        ];
    }
}

/**
 * For above tests purposes (cannot use anonymous class due to php5.6 support).
 */
class DummyPortableElementObject extends PortableElementObject
{
    private $property;

    public function setProperty($value)
    {
        $this->property = $value;

        return $this;
    }

    public function getProperty()
    {
        return $this->property;
    }
}
