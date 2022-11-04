/** @babel */
/** @jsx etch.dom */

import etch from 'etch';

export default class CachePanelView {
  constructor() {
    etch.initialize(this);
  }

  update() {}

  destroy() {
    return etch.destroy(this);
  }

  render() {
    return (
      <div className="tool-panel padded package-panel">
        <div className="inset-panel">
          <div className="panel-heading">Compile Cache</div>
          <div className="panel-body padded">
            <div className="timing">
              <span className="inline-block">Less files compiled</span>
              <span className="inline-block" ref="lessCompileCount">
                Loading…
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  populate() {
    this.refs.lessCompileCount.classList.add('highlight-info');
    this.refs.lessCompileCount.textContent = this.getLessCompiles();
  }

  getLessCompiles() {
    const lessCache = atom.themes.lessCache;
    if (
      lessCache &&
      lessCache.cache &&
      lessCache.cache.stats &&
      lessCache.cache.stats.misses
    ) {
      return lessCache.cache.stats.misses || 0;
    } else {
      return 0;
    }
  }
}
