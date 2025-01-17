const quicksort = function () {
  const sort = function (items) {
    if (items.length <= 1) {
      return items;
    }
    let pivot = items.shift(),
      current,
      left = [],
      right = [];
    while (items.length > 0) {
      current = items.shift();
      current < pivot ? left.push(current) : right.push(current);
    }
    return sort(left).concat(pivot).concat(sort(right));
  };

  return sort(Array.apply(this, arguments));
};
