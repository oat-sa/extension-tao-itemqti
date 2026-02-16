<?php

declare(strict_types=1);

namespace oat\taoQtiItem\test\unit\model\qti\interaction;

use oat\taoQtiItem\model\qti\attribute\DataInteractionSubtype;
use oat\taoQtiItem\model\qti\interaction\GraphicAssociateInteraction;
use PHPUnit\Framework\TestCase;

class GraphicAssociateInteractionTest extends TestCase
{
    public function testConstructorSetsBaseTypeFromSubtype(): void
    {
        $interaction = new GraphicAssociateInteraction(['data-interaction-subtype' => 'arrow']);

        self::assertSame('directedpair', $interaction->getBaseType());
    }

    public function testSetBaseTypeInvalidFallsBackToPair(): void
    {
        $interaction = new GraphicAssociateInteraction();
        $interaction->setBaseType('invalid');

        self::assertSame('pair', $interaction->getBaseType());
    }

    public function testDataInteractionSubtypeUsesExplicitAttribute(): void
    {
        $interaction = new class (['data-interaction-subtype' => 'arrow']) extends GraphicAssociateInteraction {
            public function getAttributeClassName(string $name): ?string
            {
                $attribute = $this->getAttribute($name);

                return $attribute ? get_class($attribute) : null;
            }
        };

        self::assertSame(
            DataInteractionSubtype::class,
            $interaction->getAttributeClassName('data-interaction-subtype')
        );
        self::assertSame('arrow', $interaction->getAttributeValue('data-interaction-subtype'));
    }
}
