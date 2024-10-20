import { LightningElement} from 'lwc';
/**
 * @typedef {String} ObjectApiName 
 * @typedef {{[key:String]:any}} FieldValue
 * @typedef BoltBindEventDetail
 * @prop {'edit' | 'insert'} mode
 * @prop {[ObjectApiName, FieldValue]} recordField
 */

/**
 * @param {CustomEvent<BoltBindEventDetail>} param
 */
function $bind({
  detail: {
    mode, 
    recordField: [objectApiName, fieldValue]
  }
}) {
  const target = mode === 'edit' 
    ? objectApiName
    : `${sanitizeApiName(objectApiName)}ref`;
    if(this?.[target])
      this[target] = Object.assign(
        {...this[target]}, 
        fieldValue
      );
}
export class BoltElement extends LightningElement {
  skeletonRows = 2;
  skeletonLabels = true;
  usingSkeletons = false;

  /**
   * When called, continues the binding mechanism in case a field update was listened for 
   * @param {CustomEvent<{detail:{next:CustomEvent<BoltBindEventDetail>}}>} e 
   */
  next(e) {
    console.log("next")
    $bind.call(this, e.detail.next);
  }

  connectedCallback() {
    // Default binding mechanism for any non specifically listened field updates
    this.template.addEventListener('boltbind', $bind.bind(this))
    this.template.addEventListener('all-settled', () => {
      if('__SET_EXTERNAL_STYLES__' in this) this.__SET_EXTERNAL_STYLES__();
      if('suspendedCallback' in this) this.suspendedCallback();
    })
  }
}