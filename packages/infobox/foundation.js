import MDCFoundation from '@material/base/foundation';
import {cssClasses, strings, numbers} from './constants';


class OktaInfoboxFoundation extends MDCFoundation {
  /** @return enum {cssClasses} */
  static get cssClasses() {
    return cssClasses;
  }

  /** @return enum {strings} */
  static get strings() {
    return strings;
  }

  /** @return enum {numbers} */
  static get numbers() {
    return numbers;
  }

  static get defaultAdapter() {
    return ({
      registerCloseEndHandler(handler) {}
    });
  }

  constructor(adapter) {
    super(Object.assign(OktaInfoboxFoundation.defaultAdapter, adapter));
  }

  init() {
  }

  destroy() {
  }

}


export default OktaInfoboxFoundation;
