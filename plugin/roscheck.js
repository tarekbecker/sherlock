//node src/js/commands/jalangi.js --inlineIID --inlineSource --analysis sherlock/plugin/roscheck.js sherlock/testcase/one.js 

(function (sandbox) {
    function MyAnalysis () {
        var iidToLocation = sandbox.iidToLocation;
        
        
        result = {}; //for storing object default initial values
        
        
        function showLocation(iid) {
        	//for finding the location
          console.log(' Source Location: ' + iidToLocation(iid));
        }

        var oldbase;
        this.invokeFunPre = function (iid, f, base, args, isConstructor) {
            console.log('function call intercepted before invoking: ' + typeof base + base);
          //  showLocation(iid);
            var oldbase = eval(JSON.stringify(base));
            
            if(typeof base == "object")
            {
                result.a = oldbase; //Find a way how to fetch object name and change with a.
                console.log(result);
            }
           
          };
        
		this.invokeFun = function (iid, f, base, args, val, isConstructor, isMethod, functionIid) {
		  console.log('function call intercepted after invoking: ' + typeof base + base);
		 // showLocation(iid);
		  

		  
		  if(result.a.length < base.length) // Doesnot work for lot of conditions
			  {
			   console.log("This object has been inserted with new elements in this function");
			   
			  }
		  else{
			  console.log("This object has not been pushed ");
		  }
		  
		  
		};
      
        
    	
        
   
	    this.endExecution = function () {    	
	    	console.log("Done with Analysis");
    }
 }
  
    sandbox.analysis = new MyAnalysis();
    
})(J$);



