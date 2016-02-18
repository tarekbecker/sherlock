# Sherlock
[![Build Status](https://travis-ci.org/tarekauel/sherlock.svg)](https://travis-ci.org/tarekauel/sherlock)

Recommended node.js version: "0.12"

Jalangi should be available, best in same folder:
`git clone https://github.com/Samsung/jalangi2 ./jalangi2`
`cd ./jalangi2 && npm install`
`npm install`

`sherlock.js`, implemented plugin

`preprocess.js`, preprocessing for instrumenting js files

`./testrunner.py`, runs all tests
Arguments:
    - `--jalangi`, path to jalangi, default `./jalangi2`
    - `--sherlock`, path to sherlock, defualt `./sherlock.js`
    - `--tests`, path to test folder. Each js file of test folder is checked. A `json` file with the same name
        should contain the result
        
`./octante.py` run optimization on octane benchmark
    - `--jalangi`, path to jalangi, default `./jalangi2`
    - `--sherlock`, path to sherlock, defualt `./sherlock.js`
    - `--test`, name of octane test e.g. splay, default richards
    
The result is stored in new file in the working directory.
    
`./tests/` contains all tests. All tests that start with `F_Test` show a minimal example for a feature of Sherlock.
The corresponding `json` file contains the expected result. All tests with that start with `Test_` are more complex
and contain combinations of multiple optimizations. The corresponding `json` files contain the expected results.

`.travis.yml` contains the configuration for Travis CI which was used for continious integration testing.

`npm test` can be used to run the tests with default parameters.
    