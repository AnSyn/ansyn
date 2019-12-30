#!/bin/bash
url=$1
[ -z "$url" ] && url="http://platform.ansyn.io:8081"
echo "Initial schemas..."
status=$(curl -s -o /dev/null -w "%{http_code}" "$url/api/store/layers")
if [ "$status" = 200 ]; then echo "layers Ok"; else curl -XPOST -s "$url/api/store/layers"; fi
status=$(curl -s -o /dev/null -w "%{http_code}" "$url/api/store/cases")
if [ "$status" = 200 ]; then echo "cases Ok"; else curl -XPOST -s "$url/api/store/cases"; fi
status=$(curl -s -o /dev/null -w "%{http_code}" "$url/api/store/contexts")
if [ "$status" = 200 ]; then echo "contexts Ok"; else curl -XPOST -s "$url/api/store/contexts"; fi
status=$(curl -s -o /dev/null -w "%{http_code}" "$url/api/store/tasks")
if [ "$status" = 200 ]; then echo "tasks Ok"; else curl -XPOST -s "$url/api/store/tasks"; fi

echo "Initial contexts"
status=$(curl -s -o /dev/null -w "%{http_code}" "$url/api/store/contexts/areaAnalysis")
if [ "$status" = 200 ]; then echo "areaAnalysis is alerady set "; else curl -XPOST -s -H "Content-Type: application/json" -d @resources/contexts/areaContext.json "$url/api/store/contexts/areaAnalysis"; fi
status=$(curl -s -o /dev/null -w "%{http_code}" "$url/api/store/contexts/infoEntity")
if [ "$status" = 200 ]; then echo "infoEntity is alerady set "; else curl -XPOST -s -H "Content-Type: application/json" -d @resources/contexts/infoEntity.json "$url/api/store/contexts/infoEntity"; fi


echo "Initials Layers"
status=$(curl -s -o /dev/null -w "%{http_code}" "$url/api/store/layers/1e2a8166-37a4-485f-8bdd-4f92e675ca35")
if [ "$status" = 200 ]; then echo "biking-trails is alerady set "; else curl -XPOST -s -H "Content-Type: application/json" -d @resources/layers/biking-trails.json "$url/api/store/layers/1e2a8166-37a4-485f-8bdd-4f92e675ca35"; fi
status=$(curl -s -o /dev/null -w "%{http_code}" "$url/api/store/layers/63fec41f-d15b-4c2a-b65c-623c7fa5c6a4")
if [ "$status" = 200 ]; then echo "countries-borders-geoJson is alerady set "; else curl -XPOST -s -H "Content-Type: application/json" -d @resources/layers/countries-borders-geoJson.json "$url/api/store/layers/63fec41f-d15b-4c2a-b65c-623c7fa5c6a4"; fi
status=$(curl -s -o /dev/null -w "%{http_code}" "$url/api/store/layers/c7661d18-2c25-4696-b831-ea6c4421eab1")
if [ "$status" = 200 ]; then echo "Hike & Bike Map is alerady set "; else curl -XPOST -s -H "Content-Type: application/json" -d @resources/layers/hike-and-bike-map.json "$url/api/store/layers/c7661d18-2c25-4696-b831-ea6c4421eab1"; fi
status=$(curl -s -o /dev/null -w "%{http_code}" "$url/api/store/layers/fe8e6a07-b96a-42a3-b146-c348a0615965")
if [ "$status" = 200 ]; then echo "hiking-trails is alerady set "; else curl -XPOST -s -H "Content-Type: application/json" -d @resources/layers/hiking-trails.json "$url/api/store/layers/fe8e6a07-b96a-42a3-b146-c348a0615965"; fi
status=$(curl -s -o /dev/null -w "%{http_code}" "$url/api/store/layers/bdb5d3e2-750a-4a5d-93ee-cbdb05273e7b")
if [ "$status" = 200 ]; then echo "open-railway-map is alerady set "; else curl -XPOST -s -H "Content-Type: application/json" -d @resources/layers/open-railway-map.json "$url/api/store/layers/bdb5d3e2-750a-4a5d-93ee-cbdb05273e7b"; fi
status=$(curl -s -o /dev/null -w "%{http_code}" "$url/api/store/layers/b78adfbe-8c2f-461b-b531-2df05257fc08")
if [ "$status" = 200 ]; then echo "open-sea-map is alerady set "; else curl -XPOST -s -H "Content-Type: application/json" -d @resources/layers/open-sea-map.json "$url/api/store/layers/b78adfbe-8c2f-461b-b531-2df05257fc08"; fi
status=$(curl -s -o /dev/null -w "%{http_code}" "$url/api/store/layers/2682d4f0-e6e6-4d13-864e-713033a2f975")
if [ "$status" = 200 ]; then echo "transport-overlay is alerady set "; else curl -XPOST -s -H "Content-Type: application/json" -d @resources/layers/transport-overlay.json "$url/api/store/layers/2682d4f0-e6e6-4d13-864e-713033a2f975"; fi
