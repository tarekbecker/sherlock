var a =  [];
var b = [1, 2, 3];
a.concat(b);

(function() {
    var a = [1, 2, 3];
    a.push(1);
    a.pop();
    a.push(5);
    a.reverse();
    a.concat([9]);
    a.sort();
})();
b[0] = 5;
var c = a[0];
a.filter(function (x) {return x > 2});

var a = {};
a.x = 5;
var z = a.x;
a.y = 6;
a.x = 10;
a.t = function() {return z};