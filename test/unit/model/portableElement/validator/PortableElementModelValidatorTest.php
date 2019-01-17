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
use oat\taoQtiItem\model\portableElement\validator\PortableElementModelValidator;
use oat\taoQtiItem\model\portableElement\validator\Validator;

class PortableElementModelValidatorTest extends TestCase
{
    /** @var DummyPortableElementModelValidator */
    private $subject;

    protected function setUp()
    {
        parent::setUp();

        $this->subject = new DummyPortableElementModelValidator();
    }

    public function testGetConstraints()
    {
        $this->assertEquals(
            [
                'typeIdentifier' => [Validator::isTypeIdentifier, Validator::NotEmpty],
                'short'          => [Validator::isString, Validator::NotEmpty],
                'description'    => [Validator::isString, Validator::NotEmpty],
                'version'        => [Validator::isVersion, Validator::isSemVer],
                'author'         => [Validator::isString, Validator::NotEmpty],
                'email'          => [Validator::Email, Validator::NotEmpty],
                'tags'           => [Validator::isArray],
                'runtime'        => [Validator::NotEmpty, Validator::isArray],
            ],
            $this->subject->getConstraints()
        );
    }

    public function testGetAssetConstraints()
    {
        $this->assertEquals(
            [
                'hook',
                'libraries',
                'stylesheets',
                'mediaFiles',
                'src'
            ],
            $this->subject->getAssetConstraints('runtime')
        );

        $this->assertEquals(
            [
                'icon',
                'hook',
                'libraries',
                'stylesheets',
                'mediaFiles',
                'src'
            ],
            $this->subject->getAssetConstraints('creator')
        );
    }

    public function testIsOptionalConstraint()
    {
        $this->assertTrue($this->subject->isOptionalConstraint('runtime', 'libraries'));
        $this->assertFalse($this->subject->isOptionalConstraint('runtime', 'other'));
    }
}

/**
 * For above tests purposes (cannot use anonymous class due to php5.6 support).
 */
class DummyPortableElementModelValidator extends PortableElementModelValidator
{
}