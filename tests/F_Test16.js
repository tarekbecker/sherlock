var myFunc = function() {
  return true;
};

var a = {};

a.x = myFunc;

var c = a.x();

a.x = 0;

var b = [];

b[0] = myFunc;

var d = b[0]();

b[0] = 0;