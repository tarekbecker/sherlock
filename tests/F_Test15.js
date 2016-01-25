var myFunc = function() {
  return true;
};

var a = {};

a.x = myFunc;

a.x = 0;

var b = [];

b[0] = myFunc;

b[0] = 0;