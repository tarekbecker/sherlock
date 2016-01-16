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
command = 'node ' + d['jalangi'] + \
          '/src/js/commands/jalangi.js ' +\
          '--inlineIID --inlineSource --analysis ' + \
          d['jalangi'] + \
          '/src/js/sample_analyses/ChainedAnalyses.js ' + \
          ' --analysis ' + d['sherlock'] + ' ' + \
          d['octane'] + '/run.js'
p = subprocess.Popen(command, shell=True,
                     stdout=subprocess.PIPE,
                     stderr=subprocess.STDOUT)
lines = p.stdout.readlines()
for l in lines:
    print l