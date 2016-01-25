var a = {};
a.x = 5;
var z = a.x;
a.y = 6;
a.y = 7;
a.x = 10;
a.t = function() {return z;};