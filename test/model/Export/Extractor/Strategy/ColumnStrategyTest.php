<?php

namespace oat\taoQtiItem\test\model\Export\Extractor\Strategy;

use oat\taoQtiItem\model\Export\Extractor\HashEntry;
use oat\taoQtiItem\model\Export\Extractor\Strategy\ColumnStrategy;
use PHPUnit\Framework\TestCase;

class ColumnStrategyTest extends TestCase
{
    public function testColumnStrategyBehavior()
    {
        $columnStrategy = new ColumnStrategy('column1');

        $columnStrategy->addHashEntry($this->buildHashEntry('myKey1', 'myValue1'));
        $columnStrategy->addHashEntry($this->buildHashEntry('myKey2', 'myValue2'));

        $this->assertEquals([
            'column1' => 'myValue1|myValue2'
        ], $columnStrategy->toArray());
    }

    protected function buildHashEntry($key, $value)
    {
        $hashEntry = $this->getMockBuilder(HashEntry::class)->disableOriginalConstructor()->getMock();

        $hashEntry
            ->expects($this->once())
            ->method('getValue')
            ->willReturn($value);

        return $hashEntry;
    }
}
