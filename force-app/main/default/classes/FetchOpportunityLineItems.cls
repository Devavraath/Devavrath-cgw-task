public with sharing class FetchOpportunityLineItems {
    @AuraEnabled(cacheable=true)
    public static List<OpportunityLineItem> FetchOpportunityLineItems(Id opportunityID) {
        return [SELECT Id, Description, Quantity, UnitPrice FROM OpportunityLineItem WHERE OpportunityId = :opportunityID];
    }
}