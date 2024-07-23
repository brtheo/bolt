import { ShowToastEvent } from 'lightning/platformShowToastEvent';
const TOAST_VARIANTS = ['error','success', 'info', 'warning'];

/**
 * @callback Toast
 * @param {string} message - The message parameter
 * @param {string} [title=''] - The optional title parameter
 * @returns {boolean} - The return value indicating success or failure
 */

/**
 * Short hand for sending toast message
 * @example <caption>Basic Usage</caption>
 * import {Toaster} from 'c/lwcToolbox';
 * Toaster.success('Message of the toast') //simple success toast with no title
 * Toaster.success('Message of the toast', 'Title of the toast') //simple success toast with no title
 * Toaster.error('Some error toast')
 * Toaster.warning('Some warning toast')
 * Toaster.info('Some info toast')
 * @typedef {Object} Toaster
 * @prop {Toast} error 
 * @prop {Toast} success 
 * @prop {Toast} info 
 * @prop {Toast} warning 
 */
const baseConf = {
  title: ' ', //put an extra space to mimic the presence of a title, otherwise lwc will throw an error stating that the toast lacks a label
  messageData: [],
  mode: 'dismissable'
}
/**
 * @type {Toaster}
 */
export const Toaster = TOAST_VARIANTS
  .reduce( (ret,variant) => Object.assign(ret, {
    [variant]: (message, conf = baseConf) => {
      conf = {...baseConf, ...conf};
      dispatchEvent(
        new ShowToastEvent({
          title: conf.title,
          message: message.replace('<br>','\n'),
          variant,
          messageData: conf.messageData,
          mode: conf.mode
        })
    )}
}),{});
