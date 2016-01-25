var a = [];
a.push(1);

if (true) {
    (function(){})();
    a[0] = 5;
}

a.push(6);