import { LightningElement, wire } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import { CurrentPageReference } from 'lightning/navigation';
import FetchOpportunityLineItems from '@salesforce/apex/FetchOpportunityLineItems.FetchOpportunityLineItems';

export default class InvoiceDataDisplayComponent extends NavigationMixin(LightningElement) {
    originRecordId;
    accountId;
    invoiceDate;
    invoiceDueDate;
    childRelationshipName;
    lineItemDescriptionField;
    lineItemQuantityField;
    lineItemUnitPriceField;
    opportunityLineItems = [];
    isLoading = true;

    @wire(CurrentPageReference)
    getStateParameters(currentPageReference) {
        if (currentPageReference) {
            const state = currentPageReference.state;

            this.originRecordId = state.c__origin_record;
            this.accountId = state.c__account;
            this.invoiceDate = state.c__invoice_date;
            this.invoiceDueDate = state.c__invoice_due_date;
            this.childRelationshipName = state.c__child_relationship_name;
            this.lineItemDescriptionField = state.c__line_item_description;
            this.lineItemQuantityField = state.c__line_item_quantity;
            this.lineItemUnitPriceField = state.c__line_item_unit_price;

            this.getOpportunityLineItems(
                this.originRecordId,
                this.lineItemDescriptionField,
                this.lineItemQuantityField,
                this.lineItemUnitPriceField
            );
        }
    }

    getOpportunityLineItems(opportunityID, Field1, Field2, Field3) {
        this.isLoading = true;
        FetchOpportunityLineItems({
            opportunityID: opportunityID,
            field1: Field1,
            field2: Field2,
            field3: Field3
        })
        .then((result) => {
            this.opportunityLineItems = result.map(item => {
                let mappedItem = { Id: item.Id };
                if (Field1) mappedItem.Description = item[Field1];
                if (Field2) mappedItem.Quantity = item[Field2];
                if (Field3) mappedItem.UnitAmount = item[Field3];
                return mappedItem;
            });
            this.isLoading = false;
            console.log('Mapped Opportunity Line Items:', this.opportunityLineItems);
        })
        .catch((error) => {
            console.error('Error fetching opportunity line items:', error);
            this.isLoading = false;
        });
    }

    async handleNext() {
        try {   
            const invoiceData = {
                Type: "ACCREC",
                Contact: {
                    ContactID: "0000000"
                },
                Account: this.accountId,
                Opportunity: this.originRecordId,
                DueDate: this.invoiceDueDate,
                LineItems: this.opportunityLineItems.map(item => ({
                    Description: item.Description || "Default Description",
                    Quantity: item.Quantity || 1,
                    UnitPrice: item.UnitAmount || 0,
                    AccountCode: "200"
                })),
                Status: "AUTHORISED"
            };

            console.log('Constructed Invoice Data:', JSON.stringify(invoiceData, null, 2));

            const jsonData = JSON.stringify(invoiceData);
            this[NavigationMixin.Navigate]({
                type: 'standard__navItemPage',
                attributes: {
                    apiName: 'JSON_Data'
                },
                state: {
                    c__invoiceData: jsonData
                }
            });
        } catch (error) {
            console.error('Error in handleNext:', error);
        }
    }
}
