import { LightningElement} from 'lwc';
import { mix, sanitizeApiName } from './utils';

function boltBind(e)  {
  const {detail: {mode, recordField}} = e;
  const [objectApiName] = Object.keys(recordField);
  const target = mode === 'edit' 
    ? objectApiName
    : `${sanitizeApiName(objectApiName)}ref`;
    if(this?.[target])
      this[target] = Object.assign(
        {...this[target]}, 
        recordField[objectApiName]
      );
}

export class BoltElement extends LightningElement {
  skeletonRows = 2;
  skeletonLabels = true;
  usingSkeletons = false;

  connectedCallback() {
    this.template.addEventListener('bolt-bind', boltBind.bind(this))
    this.template.addEventListener('all-settled', () => {
      if('__SET_EXTERNAL_STYLES__' in this) this.__SET_EXTERNAL_STYLES__();
      if('suspendedCallback' in this) this.suspendedCallback();
    }, {once:true})
  }
}