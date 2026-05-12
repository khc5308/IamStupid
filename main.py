import os
import fastf1
import pandas as pd
from fastapi import FastAPI, HTTPException
from typing import Dict, Any
from DTO import DriverLapStatsResponse, DriverInfo, DriverListResponse, EventInfo,EventListResponse

app = FastAPI()

cache_path = './cache'
if not os.path.exists(cache_path):
    os.makedirs(cache_path)
fastf1.Cache.enable_cache(cache_path)

# GET | 특정 이벤트의 특정 드라이버 랩 데이터
@app.get("/lap-stats/{year}/{event}/{driver}", response_model=DriverLapStatsResponse)
def get_driver_stats(year: int, event: str, driver: str):
    try:
        session = fastf1.get_session(year, event, 'R')
        session.load()
        driver_laps = session.laps.pick_drivers(driver).pick_quicklaps()

        if len(driver_laps) == 0:
            raise HTTPException(status_code=404, detail="Driver not found or no laps recorded")

        return {
            "driver": driver,
            "year": year,
            "event": event,
            "total_laps": len(driver_laps),
            "fastest_lap": str(driver_laps['LapTime'].min()),
            "average_lap_time": str(driver_laps['LapTime'].mean()),
            "compound_usage": driver_laps.groupby('Compound').size().to_dict()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# GET | 특정 이벤트 드라이버 목록
@app.get("/drivers/{year}/{event}", response_model=DriverListResponse)
def get_driver_list(year: int, event: str):
    try:
        session = fastf1.get_session(year, event, 'R')
        session.load(laps=False, telemetry=False, weather=False)

        driver_list = []
        for i in session.drivers:
            dr_info = session.get_driver(i)
            driver_list.append({
                "number": i,
                "abbreviation": dr_info['Abbreviation'],
                "full_name": dr_info['FullName'],
                "team": dr_info['TeamName'],
            })

        return {
            "year": year,
            "event": session.event['EventName'],
            "drivers": driver_list
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# GET | 특정 연도 개최 이벤트
@app.get("/events/{year}", response_model=EventListResponse)
def get_event_list(year: int):
    try:
        schedule = fastf1.get_event_schedule(year)
        
        event_list = []
        for _, row in schedule.iterrows():
            event_list.append({
                "round": row['RoundNumber'],
                "country": row['Country'],
                "location": row['Location'],
                "official_name": row['EventName']
            })
            
        return {"year": year, "events": event_list}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))






if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)