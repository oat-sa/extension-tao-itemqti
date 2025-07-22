<?php

namespace oat\taoQtiItem\model\qti\response;

class SimpleFeedbackRuleScore extends SimpleFeedbackRule
{
    private $xml;
    public function toArray($filterVariableContent = false, &$filtered = [])
    {
        $data = parent::toArray($filterVariableContent, $filtered);
        $data['condition'] = 'score.' . $data['condition'];

        return $data;
    }

    public function toQTI()
    {
        return (string) $this->xml;
    }

    public function setXml($xml)
    {
        $this->xml = $xml;
    }
}