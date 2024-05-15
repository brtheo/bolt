/**
 * @example <caption>Basic Usage</caption>
 * // html
 * <lightning-input
 *  data-bind="myField__c"
 *  value={myField__c}
 *  onchange={bind}
 * >Some input</lightning-input>
 * // js
 * import {useReactiveBinding} from 'c/bolt';
 * export class myLwc extends useReactiveBinding(LightningElement) {
 *  ㅤ@track myField__c // value of input will always reflect back onto the bound prop
 * }
 */
/**
 * @param {Constructor<any>} genericConstructor 
 * @returns {Constructor<any>}
 */
export function useReactiveBinding(genericConstructor) {
  return class extends genericConstructor {
    /**
     * Automatically assign the changed input to the bound variable
     * @param {InputEvent} e 
     */
    bind(e) {
      const {currentTarget} = e;
      const _bind = currentTarget.dataset['bind'];
      if(!_bind.includes('.')) {
        this[_bind] = typeof this[_bind] === 'number' ? parseInt(e.detail.value) : e.detail.value;
      }
      else {
        const [k,v] = _bind.split('.');
        const copy = this[k];
        copy[v] = e.detail.value;
        this[k] = copy;
      }
    }
  }
}