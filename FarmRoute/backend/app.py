"""Live mandi discovery and routing API for FarmRoute.

The service deliberately contains no mandi CSV. Every location lookup queries OSM
through Overpass and routes discovered markets through an OSRM-compatible server.
"""
from __future__ import annotations

import asyncio
import math
import os
import re
from pathlib import Path
from typing import Any

import httpx
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

OVERPASS_URL = os.getenv("OVERPASS_URL", "https://overpass-api.de/api/interpreter")
OSRM_URL = os.getenv("OSRM_URL", "https://router.project-osrm.org")
TIMEOUT_SECONDS = float(os.getenv("HTTP_TIMEOUT_SECONDS", "15"))
MAX_ROUTE_DESTINATIONS = 80  # Keeps public-OSRM URLs below practical limits.

app = FastAPI(title="FarmRoute live mandi API", version="1.0.0")
WEB_ROOT = Path(__file__).resolve().parent.parent
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "http://127.0.0.1:8000,http://localhost:8000,http://127.0.0.1:5500,http://localhost:5500,http://127.0.0.1:5501,http://localhost:5501").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)


class FarmerLocation(BaseModel):
    latitude: float = Field(ge=-90, le=90)
    longitude: float = Field(ge=-180, le=180)


def haversine_km(origin: FarmerLocation, latitude: float, longitude: float) -> float:
    """Straight-line distance, used only to order/chunk live routing candidates."""
    radius = 6371.0
    d_lat = math.radians(latitude - origin.latitude)
    d_lon = math.radians(longitude - origin.longitude)
    a = math.sin(d_lat / 2) ** 2 + math.cos(math.radians(origin.latitude)) * math.cos(math.radians(latitude)) * math.sin(d_lon / 2) ** 2
    return radius * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


async def request_json(client: httpx.AsyncClient, method: str, url: str, **kwargs: Any) -> dict[str, Any]:
    """Retry transient remote failures once and expose a useful upstream error."""
    last_error: Exception | None = None
    for attempt in range(2):
        try:
            response = await client.request(method, url, timeout=TIMEOUT_SECONDS, **kwargs)
            response.raise_for_status()
            return response.json()
        except (httpx.TimeoutException, httpx.HTTPStatusError, httpx.NetworkError, ValueError) as error:
            last_error = error
            if attempt == 0:
                await asyncio.sleep(0.4)
    raise RuntimeError(f"Upstream request failed: {last_error}")


def overpass_query(location: FarmerLocation, radius_km: int) -> str:
    radius_m = radius_km * 1000
    # nwr includes nodes, ways and relations; `out center` gives a usable point for ways/relations.
    return f"""
    [out:json][timeout:25];
    (
      nwr[\"amenity\"=\"marketplace\"](around:{radius_m},{location.latitude},{location.longitude});
      nwr[\"industrial\"=\"market\"](around:{radius_m},{location.latitude},{location.longitude});
      nwr[\"name\"~\"sabji|vegetable|krushi|agri.*mandi|mandi|apmc\",i](around:{radius_m},{location.latitude},{location.longitude});
    );
    out center tags;
    """


def parse_mandis(payload: dict[str, Any], farmer: FarmerLocation) -> list[dict[str, Any]]:
    mandis: list[dict[str, Any]] = []
    seen: set[str] = set()
    for element in payload.get("elements", []):
        point = element if "lat" in element else element.get("center", {})
        latitude, longitude = point.get("lat"), point.get("lon")
        if latitude is None or longitude is None:
            continue
        mandi_id = f"{element.get('type', 'node')}/{element.get('id')}"
        if mandi_id in seen:
            continue
        seen.add(mandi_id)
        tags = element.get("tags", {})
        name = tags.get("name") or tags.get("name:en") or f"Unnamed marketplace ({mandi_id})"
        mandis.append({
            "osm_id": mandi_id,
            "name": name,
            "is_named_sabji_mandi": bool(re.search(r"sabji|vegetable|mandi|apmc", name, re.IGNORECASE)),
            "latitude": float(latitude),
            "longitude": float(longitude),
            "aerial_distance_km": round(haversine_km(farmer, float(latitude), float(longitude)), 2),
        })
    return sorted(mandis, key=lambda mandi: mandi["aerial_distance_km"])


async def discover_mandis(client: httpx.AsyncClient, farmer: FarmerLocation) -> tuple[list[dict[str, Any]], int]:
    """Search 50 km first, then expand live OSM search to 100 km if empty."""
    for radius in (50, 100):
        payload = await request_json(client, "POST", OVERPASS_URL, data={"data": overpass_query(farmer, radius)})
        mandis = parse_mandis(payload, farmer)
        if mandis:
            # Prefer explicitly named Sabji / vegetable / APMC mandis. A live marketplace
            # fallback is retained because OSM tagging is often incomplete in rural areas.
            named_mandis = [mandi for mandi in mandis if mandi["is_named_sabji_mandi"]]
            return named_mandis or mandis, radius
    return [], 100


async def route_chunk(client: httpx.AsyncClient, farmer: FarmerLocation, mandis: list[dict[str, Any]]) -> list[dict[str, Any]]:
    coordinates = [f"{farmer.longitude:.6f},{farmer.latitude:.6f}"] + [f"{mandi['longitude']:.6f},{mandi['latitude']:.6f}" for mandi in mandis]
    destination_indexes = ";".join(str(index) for index in range(1, len(coordinates)))
    url = f"{OSRM_URL.rstrip('/')}/table/v1/driving/{';'.join(coordinates)}"
    payload = await request_json(client, "GET", url, params={"sources": "0", "destinations": destination_indexes, "annotations": "duration,distance"})
    durations = payload.get("durations", [[]])[0]
    distances = payload.get("distances", [[]])[0]
    routed: list[dict[str, Any]] = []
    for mandi, seconds, metres in zip(mandis, durations, distances):
        if seconds is None or metres is None:
            continue
        routed.append({**mandi, "road_distance_km": round(metres / 1000, 2), "travel_time_minutes": round(seconds / 60, 1)})
    return routed


async def route_mandis(client: httpx.AsyncClient, farmer: FarmerLocation, mandis: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Use OSRM's table API in batches: one request routes farmer -> every mandi in a batch."""
    chunks = [mandis[index:index + MAX_ROUTE_DESTINATIONS] for index in range(0, len(mandis), MAX_ROUTE_DESTINATIONS)]
    batches = await asyncio.gather(*(route_chunk(client, farmer, chunk) for chunk in chunks))
    return [mandi for batch in batches for mandi in batch]


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok", "source": "live OSM + OSRM"}


@app.post("/api/mandis/nearest")
async def nearest_mandis(farmer: FarmerLocation) -> dict[str, Any]:
    async with httpx.AsyncClient(headers={"User-Agent": "FarmRoute/1.0 live mandi discovery"}) as client:
        try:
            mandis, radius_used = await discover_mandis(client, farmer)
        except RuntimeError as error:
            raise HTTPException(status_code=503, detail="Live OSM mandi lookup is temporarily unavailable.") from error
        if not mandis:
            raise HTTPException(status_code=404, detail="No OSM marketplaces were found within 100 km. Try again from a more precise location.")
        try:
            routed = await route_mandis(client, farmer, mandis)
            routing_mode = "road"
        except RuntimeError:
            # Dynamic fallback: never use a CSV. Return live OSM results ordered by aerial distance.
            routed = mandis
            routing_mode = "aerial_fallback"
        if not routed:
            raise HTTPException(status_code=503, detail="Markets were found, but routing data is temporarily unavailable.")
    if routing_mode == "road":
        ranked = sorted(routed, key=lambda mandi: (mandi["travel_time_minutes"], mandi["road_distance_km"]))
    else:
        ranked = sorted(routed, key=lambda mandi: mandi["aerial_distance_km"])
    return {
        "farmer": farmer.model_dump(),
        "search_radius_km": radius_used,
        "routing_mode": routing_mode,
        "optimal_mandi": ranked[0],
        "alternatives": ranked[1:4],
        "warning": None if routing_mode == "road" else "OSRM timed out; results are temporarily ranked by live aerial distance.",
    }


# Keep this mount last: API routes above retain priority while the same process serves the website.
app.mount("/", StaticFiles(directory=WEB_ROOT, html=True), name="website")
