<?php
namespace oat\taoQtiItem\test\unit\model\Export\Extractor\Strategy;

use oat\taoQtiItem\model\Export\Extractor\HashEntry;
use oat\taoQtiItem\model\Export\Extractor\Strategy\ColumnStrategy;
use PHPUnit\Framework\TestCase;

class ColumnStrategyTest extends TestCase
{
    public function testLineStrategyBehaviorWithMoreProperty()
    {
        $lineStrategy = new ColumnStrategy(false, 'column1');

        $lineStrategy->addHashEntry($this->buildHashEntry('myKey1', 'myValue1'));
        $lineStrategy->addHashEntry($this->buildHashEntry('myKey2', 'myValue2'));

        $this->assertEquals([
                'column1' =>
                    [
                        'myKey1' => 'myValue1',
                        'myKey2' => 'myValue2',
                    ]
            ], $lineStrategy->toArray());
    }

    public function testLineStrategyBehaviorWithOneProperty()
    {
        $lineStrategy = new ColumnStrategy(true, 'column1');
        $lineStrategy->addHashEntry($this->buildHashEntry('myKey1', 'myValue1'));

        $this->assertEquals([
            'myKey1' => 'myValue1'
        ], $lineStrategy->toArray());
    }

    protected function buildHashEntry($key, $value)
    {
        $hashEntry = $this->getMockBuilder(HashEntry::class)->disableOriginalConstructor()->getMock();

        $hashEntry
            ->expects($this->once())
            ->method('getKey')
            ->willReturn($key);
        $hashEntry
            ->expects($this->once())
            ->method('getValue')
            ->willReturn($value);

        return $hashEntry;
    }
}
