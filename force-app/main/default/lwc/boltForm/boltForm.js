import { LightningElement, api } from 'lwc';
import { mix, useFormValidation } from 'c/bolt';

export default class BoltForm extends mix([useFormValidation], LightningElement) {
  @api record;
  @api records;
  get _record() {
    return this.record ?? this.records.reduce((records, record) => 
      Object.assign(records, record), {}
    )
  }
  get recordFields () {
    return Object.values(this._record);
  }
  @api get validity() {
    return this.formValidity;
  }
}