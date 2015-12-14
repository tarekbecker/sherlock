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

