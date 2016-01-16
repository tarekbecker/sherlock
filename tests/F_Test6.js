var a = [];
a.push(1);

(function() {
    if (true) {
        (function () {
        })();
        a.push(5);
    }
})();

a.push(6);