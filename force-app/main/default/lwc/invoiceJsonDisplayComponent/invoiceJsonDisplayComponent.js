import { LightningElement, wire } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import { CurrentPageReference } from 'lightning/navigation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import createInvoice from '@salesforce/apex/InvoiceCreationController.createInvoice';

export default class InvoiceJsonDisplayComponent extends NavigationMixin(LightningElement) {
    @wire(CurrentPageReference)
    getStateParameters(currentPageReference) {
        if (currentPageReference) {
            const state = currentPageReference.state;
            const jsonData = state.c__invoiceData;

            if (jsonData) {
                this.invoiceData = JSON.parse(jsonData);
            } else {
                this.invoiceData = null;
            }
        }
    }

    get hasData() {
        return this.invoiceData !== null;
    }

    get invoiceDataString() {
        return JSON.stringify(this.invoiceData, null, 2);
    }

    handleCreateInvoice() {
        console.log('Creating Invoice with Data:', this.invoiceData);
        if (this.invoiceData) {

            this.invoiceData.invoiceDate = new Date().toISOString().substring(0, 10);

            if (this.invoiceData.DueDate) {
                this.invoiceData.invoiceDueDate = this.formatDateToISO(this.invoiceData.DueDate);
            }

            delete this.invoiceData.DueDate;

            const jsonData = JSON.stringify(this.invoiceData);
            createInvoice({ jsonData })
                .then((result) => {
                    console.log('Invoice created successfully:', result);
                    this.navigateToRecord(result.Id);
                    this.showToast('Success', 'Invoice created successfully!', 'success');
                })
                .catch((error) => {
                    console.error('Error creating invoice:', JSON.stringify(error));
                    this.showToast('Error', error.body ? error.body.message : 'Unknown error', 'error');
                });
        } else {
            console.error('No invoice data available to create invoice.');
        }
    }
    formatDateToISO(dateString) {
        const [day, month, year] = dateString.split('/');
        return `${year}-${month}-${day}`;
    }

    navigateToRecord(recordId) {
        console.log('Navigating to Record:', recordId);
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: recordId,
                objectApiName: 'Master_Invoice__c',
                actionName: 'view'
            }
        });
    }

    showToast(title, message, variant) {
        const event = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant
        });
        this.dispatchEvent(event);
    }
}
