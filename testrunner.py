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
    'jalangi': './jalangi2',
    'sherlock': './sherlock.js',
    'tests': './tests'
}

parser = argparse.ArgumentParser()
parser.add_argument('-j', '--jalangi')
parser.add_argument('-s', '--sherlock')
parser.add_argument('-t', '--tests')
namespace = parser.parse_args(sys.argv[1:])
cli_args = {k: v for k, v in vars(namespace).items() if v}

d = defaults.copy()
d.update(os.environ)
d.update(cli_args)

passed_tests = []
failed_tests = []
failed_tests_output = []
test = None
for file in os.listdir(d['tests']):
    if not test:
        if check_extension(file, 'js'):
            test = file
    else:
        if check_extension(file, 'json'):
            with open(os.path.join(d['tests'], file), 'r') as result_file:
                result = json.loads('{ "result":' + result_file.read() + '}')
                command = 'node ' + d['jalangi'] + \
                          '/src/js/commands/jalangi.js ' +\
                          '--inlineIID --inlineSource --analysis ' + \
                          d['jalangi'] + \
                          '/src/js/sample_analyses/ChainedAnalyses.js ' + \
                          ' --analysis ' + d['sherlock'] + ' ' + \
                          d['tests'] + '/' + test
                p = subprocess.Popen(command, shell=True,
                                     stdout=subprocess.PIPE,
                                     stderr=subprocess.STDOUT)
                stdout = p.stdout.readlines()
                try:
                    output = json.loads('{ "result":' + stdout[-1] + '}')
                    p.wait()
                    if result == output:
                        passed_tests.append(test)
                    else:
                        for line in stdout:
                            print line
                        pprint(output)
                        pprint(result)
                        failed_tests.append(test)
                except ValueError:
                    failed_tests.append(test)
                    print stdout
                try:
                    os.remove(os.path.join(d['tests'], test[:-3] +
                                           '_jalangi_.js'))
                    os.remove(os.path.join(d['tests'], test[:-3] +
                                           '_jalangi_.json'))
                except OSError:
                    sys.stderr.write('Error while removing files\n')
        test = None

if not failed_tests:
    print '\033[92m' + 'Passed all tests' + '\033[0m'
    exit(0)
else:
    print '\033[91m' + str(len(failed_tests)), 'test(s) failed'
    for i, test in enumerate(failed_tests):
        if i == len(failed_tests) - 1:
            print test + '\033[0m'
        else:
            print test
    exit(1)
