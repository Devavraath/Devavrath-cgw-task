public with sharing class FetchOpportunityLineItems {
    @AuraEnabled(cacheable=true)
    public static List<OpportunityLineItem> FetchOpportunityLineItems(Id opportunityID, String field1, String field2, String field3) {
        String query = 'SELECT Id';
        if (String.isNotBlank(field1)) {
            query += ', ' + field1;
        }
        if (String.isNotBlank(field2)) {
            query += ', ' + field2;
        }
        if (String.isNotBlank(field3)) {
            query += ', ' + field3;
        }
        query += ' FROM OpportunityLineItem WHERE OpportunityId = :opportunityID';
        return Database.query(query);
    }
}
