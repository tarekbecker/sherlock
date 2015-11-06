//node src/js/commands/jalangi.js --inlineIID --inlineSource --analysis sherlock/plugin/roscheck.js sherlock/testcase/one.js 

(function (sandbox) {
    function MyAnalysis () {
        var iidToLocation = sandbox.iidToLocation;
        
        
        result = {}; //for storing which object can be optimized/not optimized
        
        
        function showLocation(iid) {
        	//for finding the location
          console.log(' Source Location: ' + iidToLocation(iid));
        }
        
        
//		this.literal = function (iid, val) {
//		    console.log('creating literal operation intercepted: ' + val);
//		    showLocation(iid);
//		    return val;
//		  };
        
        this.invokeFunPre = function (iid, f, base, args, isConstructor) {
            console.log('function call intercepted before invoking: ' + typeof base + base);
          //  showLocation(iid);
          };
        
		this.invokeFun = function (iid, f, base, args, val, isConstructor, isMethod, functionIid) {
		  console.log('function call intercepted after invoking: ' + typeof base + base);
		 // showLocation(iid);
		  return val;
		};
      
        
    	
        
   
	    this.endExecution = function () {    	
	    	console.log("Done with Analysis");
    }
 }
  
    sandbox.analysis = new MyAnalysis();
    
})(J$);



