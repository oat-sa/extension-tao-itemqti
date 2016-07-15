<?php

namespace oat\taoQtiItem\model\portableElement\common\exception;

class PortableElementInvalidModelException extends PortableElementException
{
    public function setMessages(array $messages)
    {
        $this->message = print_r($messages, true);
    }
}