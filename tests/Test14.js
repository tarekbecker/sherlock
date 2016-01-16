eval("var array = [0, 1];array[2] = 2;array.pop();array.push(3);");

var obj = {};

obj.a = "foo";

obj.b = "bar";

var obj2 = {a: "foo"};

var tmp = obj2.toString();

obj2.a = "bar";

var obj3 = {a: "foo"};

var tmp = obj3.toLocaleString();

obj3.a = "bar";

var obj4 = {a: "foo"};

var tmp = obj4.hasOwnProperty("a");

obj4.a = "bar";

var obj5 = {a: "foo"};

var tmp = obj5.hasOwnProperty("a");

obj5.a = "bar";

var array = [0, double(1)];

array[1] = 1;

var obj2 = {a: "foo", b: "init"};

var tmp = obj2.a;

obj2.a = "init";

obj2.b = "bar";

function double(a) {

    return a * 2;
}