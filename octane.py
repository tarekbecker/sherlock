#!/usr/bin/env python
#!/usr/bin/env python
import os
import argparse
import sys
import subprocess
import json
from pprint import pprint

def check_extension(file, ext):
    return file.split('.')[-1] == ext


defaults = {
    'octane': './benchmark-octane',
    'jalangi': './jalangi2',
    'sherlock': './sherlock.js',
    'tests': './tests'
}

parser = argparse.ArgumentParser()
parser.add_argument('-o', '--octane')
namespace = parser.parse_args(sys.argv[1:])
cli_args = {k: v for k, v in vars(namespace).items() if v}

d = defaults.copy()
d.update(os.environ)
d.update(cli_args)

passed_tests = []
failed_tests = []
failed_tests_output = []
test = None

#test_list = ['box2d','code-load','crypto','deltablue','earley-boyer','gbemu','navier-stokes','pdfjs',
#             'raytrace','regexp','richards','splay','typescript']
test_list = ['richards']

with open('output.txt', 'wb') as f:
    for t in test_list:
        command = 'node preprocess.js ' + d['jalangi'] + '/tests/octane/'  + '/' + t + '.js' + \
                  ' ' + d['jalangi'] + '/tests/octane/'  + '/' + t + '_processed.js'
        p = subprocess.Popen(command, shell=True,stdout=None, stderr=None)
        p.wait()
        command = 'node ' + d['jalangi'] + \
                  '/src/js/commands/jalangi.js ' +\
                  '--inlineIID --inlineSource ' + \
                  ' --analysis ' + d['sherlock'] + ' ' + \
                  d['jalangi'] + '/tests/octane/' + t + '_processed.js'
        p = subprocess.Popen(command, shell=True,
                             stdout=f,
                             stderr=f)
        p.wait()
        print 'finished', t