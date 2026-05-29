from pydantic import BaseModel
from typing import List, Dict

class DriverLapStatsResponse(BaseModel):
    driver: str
    year: int
    event: str
    total_laps: int
    fastest_lap: str
    average_lap_time: str
    compound_usage: Dict[str, int]

class DriverInfo(BaseModel):
    number: str
    abbreviation: str
    full_name: str
    team: str

class DriverListResponse(BaseModel):
    year: int
    event: str
    drivers: List[DriverInfo]

class EventInfo(BaseModel):
    round: int
    country: str
    location: str
    official_name: str
    date: str

class EventListResponse(BaseModel):
    year: int
    events: List[EventInfo]