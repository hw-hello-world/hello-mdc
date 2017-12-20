import MDCFoundation from '@material/base/foundation';
import {cssClasses, strings, numbers} from './constants';


class OktaInfoboxFoundation extends MDCFoundation {

  static get cssClasses() {
    return cssClasses;
  }

  static get strings() {
    return strings;
  }

  static get numbers() {
    return numbers;
  }

  static get defaultAdapter() {
    return ({
      dismiss() {}
    });
  }

  constructor(adapter) {
    super(Object.assign(OktaInfoboxFoundation.defaultAdapter, adapter));
  }

  dismiss() {
    this.adapter_.dismiss();
  }

  init() {
  }

  destroy() {
  }

}


export default OktaInfoboxFoundation;
