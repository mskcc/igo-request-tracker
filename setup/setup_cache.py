#!/usr/bin/env python
import json
import re
import sys
import requests
from requests.auth import HTTPBasicAuth

import config

REQUEST_TRACKER_API = "%s/request-tracker/api/requests" % config.HOST
url = "%s/all?days=1000" % (REQUEST_TRACKER_API)

print("Retrieving RequestInfo: %s" % (url))
resp = requests.get(url, auth=HTTPBasicAuth(config.API_USER, config.API_PASSWORD), verify=False)
content = json.loads(resp.content)
data = content['data']
if (resp.status_code != 200 or len(content) == 0):
    print("Failed: %s" % (url))
    sys.exit(1)

requestIds = map(lambda req: req['requestId'], data)
for requestId in requestIds:
    url = "%s/%s" % (REQUEST_TRACKER_API, requestId)
    print("Retrieving %s: %s" % (requestId, url))
    resp = requests.get(url, auth=HTTPBasicAuth(config.API_USER, config.API_PASSWORD), verify=False)
