import os, subprocess, fnmatch
def main(TC_DIR, JALANGI_FILE, PLUG_FILE):
    
#     pattern = "[^_]*.js"

    
#     jalangi = "node src/js/commands/jalangi.js --inlineIID --inlineSource --analysis sherlock/plugin/roscheck.js sherlock/testcase/one.js" 

    
    for root, dirs, files in os.walk(TC_DIR):
        i = 1
        for file in files: 
            
#             if fnmatch.fnmatch(file, pattern):       
            if file.endswith(".js"):
                filepath = os.path.join(root, file)
                print "Picked Test case: " + filepath
                jalangicmd = "node" + " " + JALANGI_FILE + " --inlineIID --inlineSource --analysis " +\
                PLUG_FILE + " " + filepath
                runner = subprocess.Popen(jalangicmd, stdout=subprocess.PIPE,
                stderr=subprocess.PIPE, shell='True')
                stdout, stderror = runner.communicate() 
                print stdout, stderror #Just printing for time being
                print "Executed TC_"+ str(i)
            i += 1
                
                


if __name__ == '__main__':
    print " check path of directories before running this"
#     Planning to move this to another parameter.py file
    TC_DIR = "sherlock/testcase/"
    JALANGI_FILE = "src/js/commands/jalangi.js"
    PLUG_FILE = "sherlock/sherlock.js"
    main(TC_DIR, JALANGI_FILE, PLUG_FILE)