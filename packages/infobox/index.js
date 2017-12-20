import MDCComponent from '@material/base/component';
import MDCCheckboxFoundation from './foundation';

/**
 * @extends MDCComponent<!MDCCheckboxFoundation>
 * @implements {MDCSelectionControl}
 */
class OktaInfobox extends MDCComponent {
  static attachTo(root) {
    return new OktaInfobox(root);
  }
}

export { OktaInfoboxFoundation, OktaInfobox };
