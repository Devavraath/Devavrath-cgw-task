import { LightningElement, wire } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import { CurrentPageReference } from 'lightning/navigation';
import FetchOpportunityLineItems from '@salesforce/apex/FetchOpportunityLineItems.FetchOpportunityLineItems';

export default class InvoiceDataDisplayComponent extends  NavigationMixin(LightningElement) {
    originRecordId;
    accountId;
    invoiceDate;
    invoiceDueDate;
    childRelationshipName;
    opportunityLineItems = [];

    @wire(CurrentPageReference)
    getStateParameters(currentPageReference) {
        if (currentPageReference) {
            const state = currentPageReference.state;

            // Extract URL parameters
            this.originRecordId = state.c__origin_record;
            this.accountId = state.c__account;
            this.invoiceDate = state.c__invoice_date;
            this.invoiceDueDate = state.c__invoice_due_date;
            this.childRelationshipName = state.c__child_relationship_name;

            // Fetch Opportunity Line Items
            this.getOpportunityLineItems(this.originRecordId);
        }
    }

    getOpportunityLineItems(opportunityID){
        FetchOpportunityLineItems({ opportunityID })
            .then((result) => {
                this.opportunityLineItems = result;
            })
            .catch((error) => {
                console.error('Error fetching opportunity line items:', error);
            });
    }

    handleNext() {
        const invoiceData = {
            originRecordId: this.originRecordId,
            accountId: this.accountId,
            invoiceDate: this.invoiceDate,
            invoiceDueDate: this.invoiceDueDate,
            opportunityLineItems: this.opportunityLineItems
        };
    
        console.log('Navigating with the following invoice data:', invoiceData);
    
        const jsonData = JSON.stringify(invoiceData);
    
        // Navigate to next page with JSON data as parameter
        this[NavigationMixin.Navigate]({
            type: 'standard__navItemPage',
            attributes: {
                apiName: 'JSON_Data'
            },
            state: {
                c__invoiceData: jsonData
            }
        });
    }
    
    
}