import os
import fastf1
import pandas as pd
from fastf1.ergast import Ergast
from fastapi import FastAPI, HTTPException
from typing import Dict, Any
from DTO import DriverLapStatsResponse, DriverInfo, DriverListResponse, EventInfo,EventListResponse
import datetime
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.mount("/js", StaticFiles(directory="js"), name="js")
app.mount("/css", StaticFiles(directory="css"), name="css")
app.mount("/template", StaticFiles(directory="template"), name="template")
app.mount("/data", StaticFiles(directory="data"), name="data")

ergast = Ergast()

cache_path = './cache'
if not os.path.exists(cache_path):
    os.makedirs(cache_path)
fastf1.Cache.enable_cache(cache_path)


@app.get("/")
async def home():
    return FileResponse('./template/index.html')
@app.get("/dashboard")
async def dashboard():
    return FileResponse('./template/dashboard.html')
@app.get("/tracks")
async def tracks():
    return FileResponse('./template/tracks.html')
@app.get("/drivers")
async def drivers():
    return FileResponse('./template/drivers.html')
@app.get("/teams")
async def teams():
    return FileResponse('./template/teams.html')
@app.get("/events")
async def events():
    return FileResponse('./template/events.html')
@app.get("/faq")
async def faq():
    return FileResponse('./template/faq.html')


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

# GET | 최신  이벤트
@app.get("/events/last")
async def get_latest_event():

    today = datetime.datetime.now()
    schedule = fastf1.get_event_schedule(today.year)
    
    past_events = schedule[schedule['EventDate'] <= today]
    
    if past_events.empty:
        return {"message": "아직 종료된 이벤트가 없습니다."}
    
    latest_event = past_events.iloc[-1]
    
    return {
        "event_name": str(latest_event['EventName']),
        "round_number": int(latest_event['RoundNumber']),
        "event_date": latest_event['EventDate'].strftime('%Y-%m-%d'),
        "location": str(latest_event['Location']),
        "country": str(latest_event['Country']),
        "event_format": str(latest_event['EventFormat'])
    }

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
 # GET | 드라이버 정보
@app.get('/drivers/info/all')
async def get_all_drivers():
    with open('all_drivers.txt', 'r', encoding='utf-8') as f:
        driver_list = [line.strip().lower() for line in f if line.strip()]
            
    all_dfs = []
    offset = 0
    limit = 100
    
    while True:
        df_page = ergast.get_driver_info(limit=limit, offset=offset)
        if len(df_page) == 0:
            break
        all_dfs.append(df_page)
        offset += limit
        
    import pandas as pd
    if all_dfs:
        df = pd.concat(all_dfs, ignore_index=True)
    else:
        df = pd.DataFrame()
        
    if not df.empty:
        df['fullName'] = (df['givenName'] + " " + df['familyName']).str.lower()

    driver_info = {}
    
    for driver_name in driver_list:
        matched_row = df[df['fullName'] == driver_name]
        if not matched_row.empty:
            info_dict = matched_row.iloc[0].to_dict()
            driver_info[driver_name] = info_dict
            
            name = f"{info_dict.get('givenName', '')} {info_dict.get('familyName', '')}"
            driver_number = info_dict.get('number', 'N/A')
            driver_code = info_dict.get('code', 'N/A')
            
    return driver_info


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)