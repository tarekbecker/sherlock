// do not remove the following comment
// JALANGI DO NOT INSTRUMENT


(function (sandbox) {

    function ArrayReference(base, name) {
        var optVer = JSON.parse(JSON.stringify(base));
        var locked = false;
        var lockedValues = {};
        var references = {};

        this.push = function(val) {
          if (!locked && !lockedValues[optVer.length + 1]) {
              optVer.push(val);
          }
        };

        this.pop = function() {
            if (!locked && !lockedValues[optVer.length - 1]) {
                optVer.pop();
            }
        };

        this.addRef = function(name) {
            references[name] = true;
        };

        this.equals = function(val) {
            return base === val;
        };

        this.lock = function(num) {
            if (num >= 0) {
                lockedValues[num] = true;
            } else {
                locked = true;
            }
        };

        this.print = function() {
            console.log("references " + JSON.stringify(references));
            console.log("opt version " + JSON.stringify(optVer));
            console.log("locked " + JSON.stringify(locked));
            console.log("locked values " + JSON.stringify(lockedValues));
            console.log();
        };

        this.addRef(name);
    }

    function MyAnalysis () {
        var iidToLocation = sandbox.iidToLocation;
        var Constants = sandbox.Constants;

        var initArrays = [];
        var stack = [];
        var finished = [];

        var getRef = function(base) {
            for(var i = 0; i < initArrays.length; i++) {
                if (initArrays[i].equals(base)) {
                    return initArrays[i];
                }
            }
        };

        this.functionEnter = function(iid, f, dis, args) {
            stack.push(initArrays);
            initArrays = [];
        };

        this.functionExit = function(iid, returnVal, wrappedExceptionVal) {
            finished.push(initArrays);
            initArrays = stack.pop();
        };

        this.write = function(iid, name, val, lhs, isGlobal, isScriptLocal) {
            if (val instanceof Array) {
                var ref;
                if ((ref = getRef(val))) {
                    ref.addRef(name);
                } else {
                    initArrays.push(new ArrayReference(val, name));
                }
            }
        };

        this.getFieldPre = function(iid, base, offset, val, isComputed, isOpAssign, isMethodCall) {
            var i, ref;
            if (offset === 'length') {
                if ((ref = getRef(base))) {
                    ref.lock();
                }
            } else if (offset >= 0) {
                if ((ref = getRef(base))) {
                    ref.lock(offset);
                }
            }
        };

        this.invokeFunPre = function(iid, f, base, args, result, isConstructor, isMethod, functionIid) {
            var ref;
            if (f === Array.prototype.push) {
                if ((ref = getRef(base))) {
                    ref.push(args["0"]);
                }
            } else if (f === Array.prototype.pop) {
                if ((ref = getRef(base))) {
                    ref.pop();
                }
            }
        };

        this.endExecution = function() {
            for(var i = 0; i < initArrays.length; i++) {
                initArrays[i].print();
            }
            console.log("-------------------");
            console.log("-------------------");
            for (i = 0; i < finished.length; i++) {
                for (var j=0; j < finished[i].length; j++) {
                    finished[i][j].print();
                }
                console.log("----------------");
            }
        }
    }

    sandbox.analysis = new MyAnalysis();
})(J$);
