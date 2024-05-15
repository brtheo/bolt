import { setExternalStyles } from "./utils";

/**
 * Will plug an external stylesheet to an element that has an attribute [data-style]
 * @example <caption>Basic usage</caption>
 * // lwc.html
 * <div data-style></div>
 * ...rest of my component
 * // lwc.js
 * import {useUnscopedStyling} from 'c/bolt';
 * const styles = `
 *   .toastMessage.forceActionsText{
 *     white-space : pre-line !important;
 *   }
 * `;
 * export default class lwc extends useUnscopedStyling(LightningElement, styles) {...}
 * @param {Constructor<any>} genericConstructor 
 * @param {string} styles
 */
export function useExternalStyles(genericConstructor, styles) {
  return class extends genericConstructor { 
    suspendedCallback() {
      if('__SUSPENSE_MXN_ALL_SETTLED__' in this ? this.__SUSPENSE_MXN_ALL_SETTLED__ : true) 
        setExternalStyles.call(this, styles);
    }
  }
}