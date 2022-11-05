/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/main/docs/suggestions.md
 */
let LaunchModeView;
module.exports = LaunchModeView = class LaunchModeView {
  constructor({ safeMode, devMode } = {}) {
    this.element = document.createElement('status-bar-launch-mode');
    this.element.classList.add('inline-block', 'icon', 'icon-color-mode');
    if (devMode) {
      this.element.classList.add('text-error');
      this.tooltipDisposable = atom.tooltips.add(this.element, {
        title: 'This window is in dev mode',
      });
    } else if (safeMode) {
      this.element.classList.add('text-success');
      this.tooltipDisposable = atom.tooltips.add(this.element, {
        title: 'This window is in safe mode',
      });
    }
  }

  detachedCallback() {
    return this.tooltipDisposable != null
      ? this.tooltipDisposable.dispose()
      : undefined;
  }
};
