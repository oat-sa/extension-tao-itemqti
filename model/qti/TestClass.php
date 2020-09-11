<?php

namespace oat\taoQtiItem\model\qti;

class TestClass
{
    private $a;

    public function __construct(int $a)
    {
        $this->a = $a;
    }

    public function add(int $b)
    {
        return $this->a = $this->a + $b;
    }

    public function subtract(int $b)
    {
        return $this->a = $this->a - $b;
    }

    public function toString()
    {
        return (string)$this->a;
    }
}
