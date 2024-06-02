import { LightningElement, api} from 'lwc';

export default class BoltSkeleton extends LightningElement {
  @api rows = 1;
  @api withLabels;
  get _rows() {
    return Array.from({length: +this.rows}, (_,i) => Object({id:i}));
  }
}