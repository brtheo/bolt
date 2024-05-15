import { refreshApex } from '@salesforce/apex';
/**
 * @param {Constructor<any>} genericConstructor 
 * @param {{resolveCondition: [Function, string] | string | Function, wiredMethod: string, maxIteration: number, interval: number}} params
 * @returns {Constructor<any>}
 */
export const usePoller = (genericConstructor, {resolveCondition, wiredMethod, maxIteration, interval}) => {     
  return class extends genericConstructor {
    __POLLER_MXN_INTERVAL__;
    POLLER_PROGRESS = 0;
    POLLER_ITTERATION = 0;
    __POLLER_MXN_MAX_ITERATION__ = maxIteration;
    initPoller() {
      let triggerProp = resolveCondition;
      this.__POLLER_MXN_INTERVAL__ = window.setInterval(() => {
        this.POLLER_ITTERATION ++;
        this.POLLER_PROGRESS += Math.round(100 / this.__POLLER_MXN_MAX_ITERATION__);
        if(resolveCondition instanceof Array) {
          const [fun, _prop] = resolveCondition;
          if(fun(this?.[wiredMethod]?.data?.at(0)?.[_prop]))
            this.pollingHasEnded('OK');
        } else {
          if(typeof resolveCondition === 'function') 
            triggerProp = resolveCondition(this?.[wiredMethod]?.data?.at(0));
          if(this?.[wiredMethod]?.data?.at(0)?.[triggerProp])
            this.pollingHasEnded('OK');
        }
        
        
        if(this.POLLER_ITTERATION === this.__POLLER_MXN_MAX_ITERATION__)
          this.pollingHasEnded('POLLING_LIMIT_EXCEEDED');

        refreshApex(this?.[wiredMethod]);
      }, interval);
    }
    pollingHasEnded(status) {
      this.POLLER_PROGRESS = 100;
      window.clearInterval(this.__POLLER_MXN_INTERVAL__);
      this.dispatchEvent(
        new CustomEvent('polling:end', {
          detail: {
            response: this?.[wiredMethod]?.data?.at(0),
            status
          }
        })
      );
    }
  }
}