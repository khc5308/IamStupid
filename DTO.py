from pydantic import BaseModel
from typing import List, Dict

# 1. 특정 이벤트의 특정 드라이버 랩 데이터 응답 DTO
class DriverLapStatsResponse(BaseModel):
    driver: str
    year: int
    event: str
    total_laps: int
    fastest_lap: str
    average_lap_time: str
    compound_usage: Dict[str, int]

# 2. 드라이버 기본 정보 DTO
class DriverInfo(BaseModel):
    number: str
    abbreviation: str
    full_name: str
    team: str

# 2-1. 특정 이벤트 드라이버 목록 응답 DTO
class DriverListResponse(BaseModel):
    year: int
    event: str
    drivers: List[DriverInfo]

# 3. 이벤트 상세 정보 DTO
class EventInfo(BaseModel):
    round: int
    country: str
    location: str
    official_name: str

# 3-1. 특정 연도 개최 이벤트 목록 응답 DTO
class EventListResponse(BaseModel):
    year: int
    events: List[EventInfo]