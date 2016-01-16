var a = [];
a.push(1);

(function() {
    if (true) {
        (function () {
        })();
        a[1] = 5;
    }
})();

a.push(6);