// do not remove the following comment
// JALANGI DO NOT INSTRUMENT


(function (sandbox) {

    function MyAnalysis () {

        var inCondBranch = 0;

        var iidToLocation = function(iid) {
            var loc = sandbox.iidToLocation(J$.getGlobalIID(iid)).split(":").slice(-4, -2);
            return "line: " + loc[0];
        };

        function ArrayReference(base, name, iid) {
            var optVer = JSON.parse(JSON.stringify(base));
            var isOpt = false;
            var locked = false;
            var lockedValues = {};
            var references = [];

            var allFree = function() {
                var value;
                if (!checkLock()) {
                    return false;
                }
                for(value in lockedValues) {
                    if(lockedValues.hasOwnProperty(value) && lockedValues[value]) {
                        return false;
                    }
                }
                return true;
            };

            var checkLock = function(index) {
                if (index === undefined) {
                    // check for last index
                    return (!locked && inCondBranch == 0);
                } else {
                    return (checkLock() && !lockedValues[index])
                }
            };

            this.concat = function(args) {
                if (checkLock()) {
                    var i = 0;
                    while(args.hasOwnProperty(i + "") && args[i] instanceof Array) {
                        optVer = optVer.concat(args[i]);
                        i++;
                    }
                    isOpt = true;
                } else {
                    locked = true;
                }
            };

            this.callOnUnlocked = function(f, args) {
                if (allFree()) {
                    f.apply(optVer, args);
                    isOpt = true;
                } else {
                    locked = true;
                }
            };

            this.push = function(val) {
                if (checkLock(optVer.length + 1)) {
                    optVer.push(val);
                    isOpt = true;
                } else {
                    lockedValues[optVer.length + 1] = true;
                }
            };

            this.pop = function() {
                if (checkLock(optVer.length + 1)) {
                    optVer.pop();
                    isOpt = true;
                } else {
                    lockedValues[optVer.length + 1] = true;
                }
            };

            this.update = function(offset, val) {
                if (checkLock(offset)) {
                    optVer[offset] = val;
                    isOpt = true;
                } else {
                    lockedValues[offset] = true;
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
                if (num === undefined || num === "length") {
                    locked = true;
                } else {
                    lockedValues[num] = true;
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

            this.getReferences = function() {
                var out = [];
                for(var i=0; i < references.length; i++) {
                    out.push(references[i].name + "(" + references[i].loc + ")");
                }
                return JSON.stringify(out);
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
            var ref;
            if (base instanceof Array) {
                if ((ref = getRef(base))) {
                    if (offset >= 0) {
                        console.log("Update " + ref.getReferences() + "[" + offset +"] = " + val + " at " +
                            iidToLocation(iid));
                        ref.update(offset, val);
                    }
                }
            } else if (base instanceof Object) {
                if ((ref = getRef(base))) {
                    if (val instanceof Function) {
                        console.log("Assigned function to " + ref.getReferences() + "[" + offset + "]. Lock that value");
                        ref.lock(offset);
                    } else {
                        console.log("Update " + ref.getReferences() + "[" + offset + "] = " + val + " at " +
                            iidToLocation(iid));
                        ref.update(offset, val);
                    }
                }
            }
        };

        this.write = function(iid, name, val, lhs, isGlobal, isScriptLocal) {
            var ref;
            if (val instanceof Array) {
                if ((ref = getRef(val))) {
                    console.log("Add array reference " + name + " at " + iidToLocation(iid));
                    ref.addRef(name, iid);
                } else {
                    console.log("Create array reference " + name + " at " + iidToLocation(iid));
                    initArrays.push(new ArrayReference(val, name, iid));
                }
            } else if (val instanceof Object) {
                if ((ref = getRef(val))) {
                    console.log("Add object reference " + name + " at " + iidToLocation(iid));
                    ref.addRef(name, iid);
                } else {
                    console.log("Create object reference " + name + " at " + iidToLocation(iid));
                    initArrays.push(new ArrayReference(val, name, iid));
                }
            }
        };

        this.getFieldPre = function(iid, base, offset, val, isComputed, isOpAssign, isMethodCall) {
            var i, ref;
            if (base instanceof Array) {
                if (offset === 'length') {
                    if ((ref = getRef(base))) {
                        console.log("Lock array " + ref.getReferences() + " at " + iidToLocation(iid));
                        ref.lock();
                    }
                } else if (offset >= 0) {
                    if ((ref = getRef(base))) {
                        console.log("Lock array " + ref.getReferences() + " element " + offset + " at " +
                            iidToLocation(iid));
                        ref.lock(offset);
                    }
                }
            } else if (base instanceof Object) {
                if ((ref = getRef(base))) {
                    console.log("Lock object " + ref.getReferences() + " element " + offset + " at " +
                        iidToLocation(iid));
                    ref.lock(offset);
                }
            }
        };

        this.invokeFunPre = function(iid, f, base, args, result, isConstructor, isMethod, functionIid) {
            // Methods according to http://www.ecma-international.org/ecma-262/5.1/#sec-15.4.4
            var ref;
            // TODO: slice may only lock used values
            var ignore = [Object.prototype.isPrototypeOf];

            var methodsLockObject = [
                Object.prototype.toString, Object.prototype.toLocaleString, Object.prototype.valueOf,
                Object.prototype.hasOwnProperty
            ];

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
            } else if (methodsLockArray.indexOf(f) !== -1 || methodsLockObject.indexOf(f) !== -1) {
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
            } else if (f === Object.prototype.propertyIsEnumerable) {
                if ((ref = getRef(base))) {
                    ref.lock(args[0]);
                }
            }
        };

        this.endExecution = function() {
            console.log();
            console.log("----------------------------------");
            for(var i = 0; i < initArrays.length; i++) {
                initArrays[i].debug();
            }

            var out = [];
            for(i = 0; i < initArrays.length; i++) {
                out.push(initArrays[i].get());
            }
            console.log(JSON.stringify(out));
        };

        this.conditional = function(iid, result) {
            if (inCondBranch == 0) {
                inCondBranch = 1;
            }
        };

        this.functionEnter = function(iid, f, dis, args) {
            if (inCondBranch > 0) {
                inCondBranch++;
            }
        };

        this.functionExit = function(iid, returnVal, wrappedExceptionVal) {
            if (inCondBranch > 0) {
                inCondBranch--;
            }
        }
    }

    sandbox.analysis = new MyAnalysis();
})(J$);
