<?php

namespace oat\taoQtiItem\test\unit\model\qti;

use oat\generis\test\TestCase;
use oat\taoQtiItem\model\qti\TestClass;

class TestClassTest extends TestCase
{
    public function testConstructor()
    {
        $this->assertInstanceOf(TestClass::class, new TestClass(13));
    }

    public function testAdd()
    {
        $testClass = new TestClass(13);
        $testClass->add(13);

        $this->assertSame('26', $testClass->toString());
    }
}
