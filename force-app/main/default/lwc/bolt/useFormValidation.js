import { log } from 'lightning/logger';
/**
 * Gives access to the class property isFormValid, 
 * returning either true or false and, if false, shows the field validation errors
 * @example <caption>Basic Usage</caption>
 * // html
 * <lightning-input data-checkable>some input</lightning-input>
 * <lightning-input data-checkable>some other input</lightning-input>
 * <lightning-button onclick={handleValidateForm}></lightning-button>
 * // js
 * import {useFormValidation} from 'c/bolt';
 * export class myLwc extends useDialog(LightningElement) {
 *  handleValidateForm() {
 *    if(this.isFormValid) //doSomething()
 *  }
 * }
 * @param {Constructor<any>} genericConstructor 
 * @returns {Constructor<any>}
 */
export function useFormValidation(genericConstructor) {
  return class extends genericConstructor {
    get isFormValid() {
      return [...this.template.querySelectorAll('[data-checkable]')]
      .reduce((acc,$input) => 
        acc && $input.reportValidity(), 
        true
      );
    }
    get formValidity() {
      return [...this.template.querySelectorAll('c-bolt-input')]
        .filter($input => !$input.hasAttribute('data-nocheck'))
        .reduce((acc, $input) => 
          acc && $input.reportValidity(), 
          true
        );
    }
  }
}