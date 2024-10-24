public with sharing class InvoiceCreationController {
    @AuraEnabled
    public static Master_Invoice__c createInvoice(String jsonData) {

        Map<String, Object> invoiceData = (Map<String, Object>) JSON.deserializeUntyped(jsonData);

        Master_Invoice__c newInvoice = new Master_Invoice__c(
            Account__c = (Id) invoiceData.get('Account'),
            Opportunity__c = (Id) invoiceData.get('Opportunity'),
            Invoice_Date__c = Date.valueOf((String) invoiceData.get('invoiceDate')),
            Due_Date__c = Date.valueOf((String) invoiceData.get('invoiceDueDate'))
        );

        insert newInvoice;

        List<Child_Invoice_Line__c> lineItems = new List<Child_Invoice_Line__c>();
        Object oppLineItemsObj = invoiceData.get('LineItems');

        if (oppLineItemsObj instanceof List<Object>) {
            List<Object> oppLineItemsList = (List<Object>) oppLineItemsObj;

            for (Object lineItemData : oppLineItemsList) {
                Map<String, Object> lineItemMap = (Map<String, Object>) lineItemData;

                Child_Invoice_Line__c lineItem = new Child_Invoice_Line__c(
                    Master_Invoice__c = newInvoice.Id,
                    Line_Description__c = (String) lineItemMap.get('Description'),
                    Quantity__c = (Decimal) lineItemMap.get('Quantity'),
                    UnitPrice__c = (Decimal) lineItemMap.get('UnitPrice')
                );
                lineItems.add(lineItem);
            }
        }
        if (!lineItems.isEmpty()) {
            insert lineItems;
        }

        return newInvoice;
    }
}