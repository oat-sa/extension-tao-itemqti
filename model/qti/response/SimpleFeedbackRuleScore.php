<?php

namespace oat\taoQtiItem\model\qti\response;

class SimpleFeedbackRuleScore extends SimpleFeedbackRule
{
    private string $xml;
    public function toArray($filterVariableContent = false, &$filtered = [])
    {
        $data = parent::toArray($filterVariableContent, $filtered);
        $data['condition'] = 'score.' . $data['condition'];

        return $data;
    }

    public function toQTI(): string
    {
        return $this->xml;
    }

    public function setXml(string $xml): void
    {
        $this->xml = $xml;
    }
}
