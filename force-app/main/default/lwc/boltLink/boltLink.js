import { LightningElement, api } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';

export default class BoltLink extends NavigationMixin(LightningElement) {
  @api href
  handleNavigate(e) {
      this[NavigationMixin.Navigate]({
        type: 'standard__webPage',
        attributes: {
            url: this.href,
        },
      });
  }
}