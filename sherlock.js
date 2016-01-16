// do not remove the following comment
// JALANGI DO NOT INSTRUMENT


(function (sandbox) {

    function Sherlock () {

        var inCondBranch = 0;

        var logLevel = 0;
        var verbose = logLevel <= 0;
        var debug = logLevel <= 1;

        var callStack = [];
        var checkLengthToLock = null;
        var lastPutField = null;

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

            /**
             * Check if no index of the reference (either an array or an object) is blocked.
             * Does also check if the code is in a conditional branch right now
             * @returns {boolean} true, if nothing is locked, false if any item is blocked or
             *  the coding might be in a conditional branch right now.
             */
            var allFree = function() {
                var value;

                if (!checkLock()) {
                    return false;
                } else {
                    for (value in lockedValues) {
                        if (lockedValues.hasOwnProperty(value) && lockedValues[value]) {
                            return false;
                        }
                    }
                }
                return true;
            };

            /**
             * Checks if a given index of the reference is blocked. If the reference is null
             * it will just check if the full element is not blocked and it's not in a
             * conditional branch right now
             *
             * @param index the index that should be checked, either an int for arrays, any
             *  value of objects or undefined.
             *
             * @returns {boolean} true, if it's not locked, false, if it's locked
             */
            var checkLock = function(index) {
                if (index === undefined) {
                    return (!locked && inCondBranch == 0);
                } else {
                    return (checkLock() && !lockedValues[index])
                }
            };

            /**
             * Checks if the reference is an array or an object
             * @returns {boolean} true, if it's an array, false if not
             */
            var isArray = function() {
                return optVer instanceof Array
            };

            /**
             * Implementation for array.concat.
             * @param args array to concatenate
             */
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

            /**
             * Generic caller for function that are just allow to called on objects or
             * array without any lock on any value. (e.g. reverse; fucntions that mutate
             * every element of the object/array)
             * @param f function that will be called
             * @param args arguments of the function
             */
            this.callOnUnlocked = function(f, args) {
                if (allFree()) {
                    f.apply(optVer, args);
                    isOpt = true;
                } else {
                    locked = true;
                }
            };

            /**
             * Implementation for array.push
             * @param val value that should be pushed
             */
            this.push = function(val) {
                if (checkLock(optVer.length + 1)) {
                    optVer.push(val);
                    isOpt = true;
                } else {
                    lockedValues[optVer.length + 1] = true;
                }
            };

            /**
             * Implementation for array.pop
             */
            this.pop = function() {
                if (checkLock(optVer.length - 1)) {
                    optVer.pop();
                    isOpt = true;
                } else {
                    lockedValues[optVer.length - 1] = true;
                }
            };

            /**
             * Implementation for updating an object property / array
             * field by index/offset
             * @param offset the offset or index of the property
             * @param val the value that should be written
             */
            this.update = function(offset, val) {
                if (checkLock(offset)) {
                    optVer[offset] = val;
                    isOpt = true;
                } else {
                    lockedValues[offset] = true;
                }
            };

            /**
             * Adds a new reference to an array or object
             * @param name variable name
             * @param iid id to identify the call
             */
            this.addRef = function(name, iid) {
                references.push({
                    name: name,
                    loc: iidToLocation(iid)
                });
            };

            this.equals = function(val) {
                return base === val;
            };

            /**
             * Lock a value of a reference by it's index
             * @param num index that should be logged, if num === undefined
             * or (num === "length" && isArray()) the total element will be locked
             */
            this.lock = function(num) {
                if (num === undefined || (num === "length" && isArray())) {
                    locked = true;
                } else {
                    lockedValues[num] = true;
                }
            };

            this.debug = function() {
                if (debug) {
                    console.log("references " + JSON.stringify(references));
                    console.log("is opt " + JSON.stringify(isOpt));
                    console.log("opt version " + JSON.stringify(optVer));
                    console.log("allFree " + JSON.stringify(allFree));
                    console.log("locked " + JSON.stringify(locked));
                    console.log("locked values " + JSON.stringify(lockedValues));
                    console.log();
                }
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
            callStack.push("putFieldPre");
            if (verbose) {
                console.log("putFieldPre:", iid, base, offset, val, isComputed, isOpAssign);
            }
            var ref;
            if ((ref = getRef(base)))
            if (base instanceof Array && offset >= 0) {
                // check if return value of function is assigned
                lastPutField = { ref: ref, offset: offset, val: val};
            } else if (base instanceof Object) {
                if (val instanceof Function) {
                    if (debug) {
                        console.log("Assigned function to " + ref.getReferences() + "[" + offset + "]. Lock that value");
                    }
                    ref.lock(offset);
                } else {
                    lastPutField = { ref: ref, offset: offset, val: val};
                }
            }
        };

        this.write = function(iid, name, val, lhs, isGlobal, isScriptLocal) {
            callStack.push("write");
            if (verbose) {
                console.log("write:", iid, name, val, lhs, isGlobal, isScriptLocal);
            }
            var ref;
            if (ref = getRef(val)) {
                if (debug) {
                    console.log("Add reference " + name + " at " + iidToLocation(iid));
                }
                ref.addRef(name, iid);
            } else if (val instanceof Array || val instanceof Object) {
                if (debug) {
                    console.log("Create reference " + name + " at " + iidToLocation(iid));
                }
                ref = new ArrayReference(val, name, iid);
                initArrays.push(ref);
            }
            if (ref && callStack[0] == "functionExit") {
                ref.lock();
            }
        };

        this.binary = function(iid, op, left, right, result, isOpAssign, isSwitchCaseComparison, isComputed) {
            callStack.push("binary");
            if (verbose) {
                console.log("binary:", iid, op, left, right, result, isOpAssign, isSwitchCaseComparison, isComputed);
            }
        };

        this.literal = function(iid, val, hasGetterSetter) {
            callStack.push("literal");
            if (verbose) {
                if (val instanceof Function) {
                    val = "function"
                }
                console.log("literal:", iid, val, hasGetterSetter);
            }
        };

        this.getFieldPre = function(iid, base, offset, val, isComputed, isOpAssign, isMethodCall) {
            callStack.push("getFieldPre" + offset);
            if (verbose) {
                console.log("getFieldPre:", iid, base, offset, val, isComputed, isOpAssign, isMethodCall);
            }
            var i, ref;
            if ((ref = getRef(base))) {
                if (base instanceof Array && offset === 'length') {
                    checkLengthToLock = ref;
                } else {
                    if (debug) {
                        console.log("Lock " + ref.getReferences() + " element/property " + offset + " at " +
                          iidToLocation(iid));
                    }
                    ref.lock(offset);
                }
            }
        };

        this.invokeFunPre = function(iid, f, base, args, result, isConstructor, isMethod, functionIid) {
            callStack.push("invokeFunPre");
            if (verbose) {
                console.log("invokeFunPre:", iid);
            }
            // Methods according to http://www.ecma-international.org/ecma-262/5.1/#sec-15.4.4
            var ref;
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

            if ((ref = getRef(base))) {
                if (callOnUnlocked.indexOf(f) !== -1) {
                    ref.callOnUnlocked(f, args);
                } else if (methodsLockArray.indexOf(f) !== -1 || methodsLockObject.indexOf(f) !== -1) {
                    ref.lock();
                } else if (f == Array.prototype.concat) {
                    ref.concat(args)
                } else if (f === Array.prototype.push) {
                    ref.push(args["0"]);
                } else if (f === Array.prototype.pop) {
                    ref.pop();
                } else if (f === Object.prototype.propertyIsEnumerable) {
                    ref.lock(args[0]);
                }
            }
        };

        this.endExpression = function(iid) {
            callStack.push("endExpression");
            if (verbose) {
                console.log(JSON.stringify(callStack));
                console.log("endExpression:", iid);
            }
            if (checkLengthToLock !== null) {
                var i, getFieldFound = false;
                for(i=0; i <= callStack.length; i++) {
                    if (callStack[i] === "getFieldPrelength") {
                        getFieldFound = true;
                    } else if (getFieldFound = true) {
                        if (callStack[i] == "binary") {
                            checkLengthToLock.lock();
                            callStack = [];
                            checkLengthToLock = null;
                            lastPutField = null;
                            return;
                        }
                    }
                }
                if (lastPutField !== null) {
                    lastPutField.ref.update(lastPutField.offset, lastPutField.val);
                }
            } else if (lastPutField !== null) {
                var functionExitFound = false;
                for (i = 0; i <= callStack.length; i++) {
                    if (callStack[i] === "functionExit") {
                        functionExitFound = true;
                        lastPutField.ref.lock(lastPutField.offset);
                        // lock
                        callStack = [];
                        checkLengthToLock = null;
                        lastPutField = null;
                        return;
                    }
                }
                lastPutField.ref.update(lastPutField.offset, lastPutField.val);
            }
            callStack = [];
            checkLengthToLock = null;
            lastPutField = null;
        };

        this.endExecution = function() {
            callStack.push("endExecution");
            if (verbose) {
                console.log("endExecution:");
            }
            if (debug) {
                console.log(JSON.stringify(callStack));
                console.log();
                console.log("----------------------------------");

                for (var i = 0; i < initArrays.length; i++) {
                    initArrays[i].debug();
                }

                var out = [];
                for (i = 0; i < initArrays.length; i++) {
                    out.push(initArrays[i].get());
                }
                console.log(JSON.stringify(out));
            }
        };

        this.conditional = function(iid, result) {
            callStack.push("conditional");
            if (verbose) {
                console.log("conditional:", iid, result);
            }
            if (inCondBranch == 0) {
                inCondBranch = 1;
            }
        };

        this.functionEnter = function(iid, f, dis, args) {
            callStack.push("functionEnter");
            if (verbose) {
                console.log("functionEnter:", iid);
            }
            if (inCondBranch > 0) {
                inCondBranch++;
            }
        };

        this.functionExit = function(iid, returnVal, wrappedExceptionVal) {
            callStack.push("functionExit");
            if (verbose) {
                console.log("functionExit:", iid, returnVal, wrappedExceptionVal);
            }
            if (inCondBranch > 0) {
                inCondBranch--;
            }
        }
    }

    sandbox.analysis = new Sherlock();
})(J$);
