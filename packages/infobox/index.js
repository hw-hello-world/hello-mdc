import MDCComponent from '@material/base/component';
import OktaInfoboxFoundation from './foundation';
import { cssClasses } from './constants';

/**
 * @extends MDCComponent<!MDCCheckboxFoundation>
 * @implements {MDCSelectionControl}
 */
class OktaInfobox extends MDCComponent {
  static attachTo(root) {
    return new OktaInfobox(root);
  }

  getDefaultFoundation() {
    return new OktaInfoboxFoundation({
      dismiss: () => {
        this.root_.remove();
      }
    });
  }

  initialize() {
    if (this.root_.classList.contains(cssClasses.INFOBOX_DISMISS)) {
      const dismissLink = this.root_.querySelector(`.${cssClasses.INFOBOX_DISMISS_LINK}`);

      if (!dismissLink) {
        return;
      }

      dismissLink.addEventListener('click', (event) => {
        this.foundation_.dismiss();
      });
    }
  }

}

export { OktaInfoboxFoundation, OktaInfobox };
