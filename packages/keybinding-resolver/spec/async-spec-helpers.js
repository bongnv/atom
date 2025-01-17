/** @babel */

export function beforeEach(fn) {
  global.beforeEach(function () {
    const result = fn();
    if (result instanceof Promise) {
      waitsForPromise(() => result);
    }
  });
}

export function afterEach(fn) {
  global.afterEach(function () {
    const result = fn();
    if (result instanceof Promise) {
      waitsForPromise(() => result);
    }
  });
}

['it', 'fit', 'ffit', 'fffit'].forEach(function (name) {
  module.exports[name] = function (description, fn) {
    global[name](description, function () {
      const result = fn();
      if (result instanceof Promise) {
        waitsForPromise(() => result);
      }
    });
  };
});

function waitsForPromise(fn) {
  const promise = fn();
  global.waitsFor('spec promise to resolve', function (done) {
    promise.then(done, function (error) {
      jasmine.getEnv().currentSpec.fail(error);
      done();
    });
  });
}
