<?php

namespace oat\taoQtiItem\model\portableElement\common\exception;

class PortableElementInvalidModelException extends PortableElementException
{
    protected $messages;

    public function setMessages(array $messages)
    {
        $this->message = print_r($messages, true);
        $this->messages = $messages;
    }

    public function getLastMessage()
    {
        $message = reset($this->messages);
        $field = key($message);
        return 'Error related to field "' . $field . '" : ' . reset($message[$field]);
    }
}