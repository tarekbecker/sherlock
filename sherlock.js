// do not remove the following comment
// JALANGI DO NOT INSTRUMENT


(function (sandbox) {
    function MyAnalysis () {
        var iidToLocation = sandbox.iidToLocation;
        var Constants = sandbox.Constants;
        var HOP = Constants.HOP;
        var sort = Array.prototype.sort;

        var initializedArrays = {};
        var stack = [];
        var report = [];

        this.declare = function(iid, name, val, isArgument, argumentIndex, isCatchParam) {
            console.log("declare");
            console.log("name: " + JSON.stringify(name));
            console.log("val: " + JSON.stringify(val));
            console.log();
            this.endExpression();
        };

        this.putField = function(iid, base, offset, val, isComputed, isOpAssign) {
            console.log("putField");
            console.log(JSON.stringify(iid));
            console.log(JSON.stringify(sandbox.getGlobalIID(iid)));
            console.log(JSON.stringify(base));
            console.log(JSON.stringify(offset));
            console.log(JSON.stringify(val));
            console.log(JSON.stringify(isComputed));
            console.log(JSON.stringify(isOpAssign));
            stack.push({typ: "putField", offset: offset, val: val});
            console.log();
        };

        this.getField = function(iid, base, offset, val, isComputed, isOpAssign, isMethodcall) {
            console.log("getField");
            console.log("base: " + JSON.stringify(base));
            console.log("offset: " + JSON.stringify(offset));
            console.log("val: " + JSON.stringify(val));
            if (base instanceof Array) {
                var name = stack[stack.length - 1].name;
                if (initializedArrays[name] !== undefined) {
                    initializedArrays[name] = undefined;
                    console.log("Removed entry from initialized array " + name);
                }
            }
            console.log();
            stack.push({typ: "getField", offset: offset});
        };

        this.literal = function(iid, val, hasGetterSetter) {
            if (val instanceof Array) {
                console.log("literal");
                console.log(JSON.stringify(iid));
                console.log(JSON.stringify(sandbox.getGlobalIID(iid)));
                console.log(JSON.stringify(val));
                console.log(JSON.stringify(hasGetterSetter));
                console.log();
            }
        };

        this.invokeFun = function(iid, f, base, args, result, isConstructor, isMethod, functionIid) {
            console.log("invokeFun");
            console.log(JSON.stringify(iid));
            console.log(JSON.stringify(sandbox.getGlobalIID(iid)));
            console.log(JSON.stringify(f));
            //console.log(JSON.stringify(base));
            console.log(JSON.stringify(args));
            console.log(JSON.stringify(result));
            console.log(JSON.stringify(isConstructor));
            console.log(JSON.stringify(isMethod));
            console.log(JSON.stringify(functionIid));
            console.log();
            stack.push({typ: "invokeFun", args: args});
        };

        this.read = function(iid, name, val, isGlobal, isScriptLocal) {
            console.log("read");
            console.log("name: " + JSON.stringify(name));
            console.log("val:" + JSON.stringify(val));
            console.log();
            stack.push({typ: "read", name: name, val: val});
        };

        this.write = function(iid, name, val, lhs, isGlobal, isScriptLocal) {
            console.log("write");
            console.log("name:" + JSON.stringify(name));
            console.log("val:" + JSON.stringify(val));
            console.log("lhs:" + JSON.stringify(lhs));
            console.log();
            if (val instanceof Array) {
                initializedArrays[name] = JSON.parse(JSON.stringify(val));
            }
            stack.push({typ: "write", name: name});
        };

        this.endExecution = function() {
          console.log("\n\nReport:\n" + JSON.stringify(report));
        };

        this.endExpression = function() {
            console.log("Stack is " + JSON.stringify(stack));

            for (var i=0; i < stack.length; i++) {
                if (stack[i].typ === "read" && initializedArrays[stack[i].name] !== undefined) {
                    if (i < stack.length - 2) {
                        if (stack[i + 1].typ === "getField" && stack[i + 1].offset === "push") {
                            if (stack[i + 2].typ === "invokeFun") {
                                initializedArrays[stack[i].name].push(stack[i + 2].args["0"]);
                                var msg = stack[i].name + " may be initialized with: "
                                    + initializedArrays[stack[i].name];
                                report.push(msg);
                                console.log(msg);
                            }
                        }
                        if (stack[i + 1].typ === "getField" && stack[i + 1].offset === "pop") {
                            if (stack[i + 2].typ === "invokeFun") {
                                initializedArrays[stack[i].name].pop();
                                var msg = stack[i].name + " may be initialized with: "
                                    + initializedArrays[stack[i].name];
                                report.push(msg);
                                console.log(msg);
                            }
                        }
                    } else if (i < stack.length - 1) {
                        if (stack[i + 1].typ === "putField") {
                            initializedArrays[stack[i].name][stack[i + 1].offset] = stack[i + 1].val;
                            var msg = stack[i].name + " may be initialized with: "
                                + initializedArrays[stack[i].name];
                            report.push(msg);
                            console.log(msg);
                        }
                    }
                }
            }
            stack = [];
            console.log("Initialized array " + JSON.stringify(initializedArrays));
            console.log("-----------------------------");
        };
    }
    sandbox.analysis = new MyAnalysis();
})(J$);
