public with sharing class InvoiceCreationController {
    @AuraEnabled
    public static Master_Invoice__c createInvoice(String jsonData) {
        // Step 1: Parse JSON data
        Map<String, Object> invoiceData = (Map<String, Object>) JSON.deserializeUntyped(jsonData);

        // Step 2: Create the Master_Invoice__c record
        Master_Invoice__c newInvoice = new Master_Invoice__c(
            Account__c = (Id) invoiceData.get('accountId'),
            Opportunity__c = (Id) invoiceData.get('originRecordId'),
            Invoice_Date__c = Date.valueOf((String) invoiceData.get('invoiceDate')),
            Due_Date__c = Date.valueOf((String) invoiceData.get('invoiceDueDate'))
        );

        // Insert the Master Invoice
        insert newInvoice;

        // Step 3: Handle Opportunity Line Items
        List<Child_Invoice_Line__c> lineItems = new List<Child_Invoice_Line__c>();
        Object oppLineItemsObj = invoiceData.get('opportunityLineItems');

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

        // Insert the line items
        if (!lineItems.isEmpty()) {
            insert lineItems;
        }

        return newInvoice;
    }
}