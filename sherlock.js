// do not remove the following comment
// JALANGI DO NOT INSTRUMENT


(function (sandbox) {

    function MyAnalysis () {
        var iidToLocation = function(iid) {
            var loc = sandbox.iidToLocation(J$.getGlobalIID(iid)).split(":").slice(-4, -2);
            return "row: " + loc[0];
        };

        function ArrayReference(base, name, iid) {
            var optVer = JSON.parse(JSON.stringify(base));
            var isOpt = false;
            var locked = false;
            var lockedValues = {};
            var references = [];

            var allFree = function() {
                var value;
                for(value in lockedValues) {
                    if(lockedValues.hasOwnProperty(value) && lockedValues[value]) {
                        return false;
                    }
                }
                return true;
            };

            this.concat = function(args) {
                if (!locked) {
                    var i = 0;
                    while(args.hasOwnProperty(i + "") && args[i] instanceof Array) {
                        optVer = optVer.concat(args[i]);
                        i++;
                    }
                    isOpt = true;
                }
            };

            this.callOnUnlocked = function(f, args) {
                if (!locked && allFree()) {
                    f.apply(optVer, args);
                    isOpt = true;
                } else {
                    locked = true;
                }
            };

            this.push = function(val) {
                if (!locked && !lockedValues[optVer.length + 1]) {
                    optVer.push(val);
                    isOpt = true;
                }
            };

            this.pop = function() {
                if (!locked && !lockedValues[optVer.length - 1]) {
                    optVer.pop();
                    isOpt = true;
                }
            };

            this.update = function(offset, val) {
                if (!locked && !lockedValues[offset]) {
                    optVer[offset] = val;
                    isOpt = true;
                }
            };

            this.addRef = function(name, iid) {
                references.push({
                    name: name,
                    loc: iidToLocation(iid)
                });
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

            this.debug = function() {
                console.log("references " + JSON.stringify(references));
                console.log("is opt " + JSON.stringify(isOpt));
                console.log("opt version " + JSON.stringify(optVer));
                console.log("allFree " + JSON.stringify(allFree));
                console.log("locked " + JSON.stringify(locked));
                console.log("locked values " + JSON.stringify(lockedValues));
                console.log();
            };

            this.get = function() {
                return {
                    isOptimized: isOpt,
                    optimizedVersion: optVer,
                    references: references
                }
            };


            this.addRef(name, iid);
        }

        var initArrays = [];

        var getRef = function(base) {
            for(var i = 0; i < initArrays.length; i++) {
                if (initArrays[i].equals(base)) {
                    return initArrays[i];
                }
            }
        };

        this.putFieldPre = function(iid, base, offset, val, isComputed, isOpAssign) {
            if (base instanceof Array) {
                var ref;
                if ((ref = getRef(base))) {
                    if (offset >= 0) {
                        ref.update(offset, val);
                    }
                }
            }
        };

        this.write = function(iid, name, val, lhs, isGlobal, isScriptLocal) {
            if (val instanceof Array) {
                var ref;
                if ((ref = getRef(val))) {
                    ref.addRef(name, iid);
                } else {
                    initArrays.push(new ArrayReference(val, name, iid));
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
            // Methods according to http://www.ecma-international.org/ecma-262/5.1/#sec-15.4.4
            var ref;
            // TODO: slice may only lock used values
            var methodsLockArray = [
                Array.prototype.toString, Array.prototype.toLocaleString, Array.prototype.indexOf,
                Array.prototype.lastIndexOf, Array.prototype.every, Array.prototype.some, Array.prototype.forEach,
                Array.prototype.map, Array.prototype.reduce, Array.prototype.reduceRight, Array.prototype.join,
                Array.prototype.filter, Array.prototype.slice
            ];

            var callOnUnlocked = [
                Array.prototype.reverse, Array.prototype.shift, Array.prototype.sort, Array.prototype.splice,
                Array.prototype.unshift
            ];

            if (callOnUnlocked.indexOf(f) !== -1) {
                if ((ref = getRef(base))) {
                    ref.callOnUnlocked(f, args);
                }
            } else if (methodsLockArray.indexOf(f) !== -1) {
                if ((ref = getRef(base))) {
                    ref.lock();
                }
            } else if (f == Array.prototype.concat) {
                if ((ref = getRef(base))) {
                    ref.concat(args)
                }
            } else if (f === Array.prototype.push) {
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
                initArrays[i].debug();
            }

            var out = [];
            for(i = 0; i < initArrays.length; i++) {
                out.push(initArrays[i].get());
            }
            console.log(JSON.stringify(out));
        }
    }

    sandbox.analysis = new MyAnalysis();
})(J$);
