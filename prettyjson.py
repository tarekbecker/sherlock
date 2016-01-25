#!/usr/bin/env python
import sys
import json
import pprint

pretty = ""

with open(sys.argv[1]) as f:
    result = json.load(f)
    pretty = json.dumps(result, sort_keys=True,
        indent=4, separators=(',', ': '))

with open(sys.argv[1], 'w') as f:
    f.write(pretty)