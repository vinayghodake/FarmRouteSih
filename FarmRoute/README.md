# FarmRoute web app

This is a self-contained browser version of the supplied FarmRoute Android app. No npm install, build process, database, or API key is required.

## Run it

Double-click `Run-FarmRoute-Live.bat`, then use the Chrome window it opens. Do not open `index.html` directly, as the live nearest-mandi lookup needs the local API server. The launcher starts the live OSM/OSRM service when Python is available; otherwise it starts a built-in localhost server so basic route-distance estimates still work.

## Included functionality

- Harvest profile: origin taluka, lot quantity, quality grade, storage duration, shelf life, and urgent-cash setting. Origin is set manually from the district/taluka dropdowns (defaults to the Nashik pilot address) — no current-location/GPS lookup is used.
- Rule-based ranking of the three Nashik mandis and eligible direct buyers.
- Net-realisation calculation: gross price minus mini-truck transport, storage, and marketplace/handling costs.
- Weighted decision score: 40% net price, 20% reliability, 15% demand, 15% price trend, and 10% storage suitability.
- Sell-now versus store-and-wait advice, distress-risk alert, market intelligence, buyer directory, warehouses, and local scenario saving.
- Quality-analysis workspace with two realistic onion lot profiles, shelf-life and storage guidance, and an optional photo selection.
- AGMARK certificate linking, including a verified grade premium applied transparently to each recommendation.
- Live Sabji-mandi API: Overpass discovers OSM marketplaces plus locations named Sabji, Vegetable, Mandi, or APMC inside 50 km; explicitly named vegetable mandis are preferred. An automatic 100 km OSM-only fallback runs if none are found; OSRM's table service batch-calculates real road distance and travel time; results are ranked by travel time and returned as one optimal mandi plus three alternatives.

## Data source

The supplied market and buyer figures are the sample Nashik onion data included with the Android project (dated 1 September 2026). The website accepts a farm origin anywhere in Maharashtra and estimates its route distance to the pilot markets. Connect district-level live market and buyer feeds before using non-Nashik price recommendations in production.
