#!/bin/bash
port=$1
[ -z "$port" ] && port=8081
echo "Initial schemas..."
status=$(curl -s -o /dev/null -w "%{http_code}" "http://platform.ansyn.io:$port/api/store/layers")
if [ "$status" = 200 ]; then echo "layers Ok"; else curl -XPOST -s "http://platform.ansyn.io:$port/api/store/layers"; fi
status=$(curl -s -o /dev/null -w "%{http_code}" "http://platform.ansyn.io:$port/api/store/cases")
if [ "$status" = 200 ]; then echo "cases Ok"; else curl -XPOST -s "http://platform.ansyn.io:$port/api/store/cases"; fi
status=$(curl -s -o /dev/null -w "%{http_code}" "http://platform.ansyn.io:$port/api/store/contexts")
if [ "$status" = 200 ]; then echo "contexts Ok"; else curl -XPOST -s "http://platform.ansyn.io:$port/api/store/contexts"; fi
status=$(curl -s -o /dev/null -w "%{http_code}" "http://platform.ansyn.io:$port/api/store/tasks")
if [ "$status" = 200 ]; then echo "tasks Ok"; else curl -XPOST -s "http://platform.ansyn.io:$port/api/store/tasks"; fi

echo "Initial contexts"
status=$(curl -s -o /dev/null -w "%{http_code}" "http://platform.ansyn.io:$port/api/store/contexts/areaAnalysis")
if [ "$status" = 200 ]; then echo "areaAnalysis is set "; else curl -XPOST -s  -H "Content-Type: application/json" -d @resources/contexts/areaContext.json "http://platform.ansyn.io:$port/api/store/contexts/areaAnalysis"; fi
status=$(curl -s -o /dev/null -w "%{http_code}" "http://platform.ansyn.io:$port/api/store/contexts/infoEntity")
if [ "$status" = 200 ]; then echo "infoEntity is set "; else curl -XPOST -s  -H "Content-Type: application/json" -d @resources/contexts/infoEntity.json "http://platform.ansyn.io:$port/api/store/contexts/infoEntity"; fi

echo "Initials Layers"
status=$(curl -s -o /dev/null -w "%{http_code}" "http://platform.ansyn.io:$port/api/store/layers/1e2a8166-37a4-485f-8bdd-4f92e675ca35")
if [ "$status" = 200 ]; then echo "biking-trails is set "; else curl -XPOST -s  -H "Content-Type: application/json" -d @resources/layers/biking-trails.json "http://platform.ansyn.io:$port/api/store/contexts/1e2a8166-37a4-485f-8bdd-4f92e675ca35"; fi
status=$(curl -s -o /dev/null -w "%{http_code}" "http://platform.ansyn.io:$port/api/store/layers/63fec41f-d15b-4c2a-b65c-623c7fa5c6a4")
if [ "$status" = 200 ]; then echo "biking-trails is set "; else curl -XPOST -s  -H "Content-Type: application/json" -d @resources/layers/countries-borders-geoJson.json "http://platform.ansyn.io:$port/api/store/contexts/63fec41f-d15b-4c2a-b65c-623c7fa5c6a4"; fi
status=$(curl -s -o /dev/null -w "%{http_code}" "http://platform.ansyn.io:$port/api/store/layers/c7661d18-2c25-4696-b831-ea6c4421eab1")
if [ "$status" = 200 ]; then echo "Hike & Bike Map is set "; else curl -XPOST -s  -H "Content-Type: application/json" -d @resources/layers/hike-and-bike-map.json "http://platform.ansyn.io:$port/api/store/contexts/c7661d18-2c25-4696-b831-ea6c4421eab1"; fi
status=$(curl -s -o /dev/null -w "%{http_code}" "http://platform.ansyn.io:$port/api/store/layers/fe8e6a07-b96a-42a3-b146-c348a0615965")
if [ "$status" = 200 ]; then echo "hiking-trails is set "; else curl -XPOST -s  -H "Content-Type: application/json" -d @resources/layers/hiking-trails.json "http://platform.ansyn.io:$port/api/store/contexts/fe8e6a07-b96a-42a3-b146-c348a0615965"; fi
status=$(curl -s -o /dev/null -w "%{http_code}" "http://platform.ansyn.io:$port/api/store/layers/bdb5d3e2-750a-4a5d-93ee-cbdb05273e7b")
if [ "$status" = 200 ]; then echo "open-railway-map is set "; else curl -XPOST -s  -H "Content-Type: application/json" -d @resources/layers/open-railway-map.json "http://platform.ansyn.io:$port/api/store/contexts/bdb5d3e2-750a-4a5d-93ee-cbdb05273e7b"; fi
status=$(curl -s -o /dev/null -w "%{http_code}" "http://platform.ansyn.io:$port/api/store/layers/b78adfbe-8c2f-461b-b531-2df05257fc08")
if [ "$status" = 200 ]; then echo "open-sea-map is set "; else curl -XPOST -s  -H "Content-Type: application/json" -d @resources/layers/open-sea-map.json "http://platform.ansyn.io:$port/api/store/contexts/b78adfbe-8c2f-461b-b531-2df05257fc08"; fi
status=$(curl -s -o /dev/null -w "%{http_code}" "http://platform.ansyn.io:$port/api/store/layers/2682d4f0-e6e6-4d13-864e-713033a2f975")
if [ "$status" = 200 ]; then echo "transport-overlay is set "; else curl -XPOST -s  -H "Content-Type: application/json" -d @resources/layers/transport-overlay.json "http://platform.ansyn.io:$port/api/store/contexts/2682d4f0-e6e6-4d13-864e-713033a2f975"; fi
