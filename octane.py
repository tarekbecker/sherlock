#!/usr/bin/env python
#!/usr/bin/env python
import os
import argparse
import sys
import subprocess
import json
from datetime import datetime
from pprint import pprint

def check_extension(file, ext):
    return file.split('.')[-1] == ext


defaults = {
    'octane': './benchmark-octane',
    'jalangi': './jalangi2',
    'sherlock': './sherlock.js',
    'output': 'output_' + str(datetime.now().time()) + ' .txt',
    'test': 'richards'
}

parser = argparse.ArgumentParser()
parser.add_argument('-t', '--test')
parser.add_argument('-j', '--jalangi')
parser.add_argument('-s', '--sherlock')
namespace = parser.parse_args(sys.argv[1:])
cli_args = {k: v for k, v in vars(namespace).items() if v}

d = defaults.copy()
d.update(os.environ)
d.update(cli_args)

passed_tests = []
failed_tests = []
failed_tests_output = []
test = None

t = d['test']

with open(d['output'], 'wb') as f:
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