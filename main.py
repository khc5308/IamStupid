import os
import json
import asyncio
import requests
from urllib3.util import Retry
from requests.adapters import HTTPAdapter
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
@app.get("/machines")
async def machines():
    return FileResponse('./template/machines.html')



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

 # GET | 모든 드라이버 정보

# GET | 모든 드라이버 세부 정보
@app.get('/drivers/info/all')
async def get_all_drivers():
    with open('./data/all_drivers.txt', 'r', encoding='utf-8') as f:
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
            
            for k, v in info_dict.items():
                if pd.isna(v):
                    info_dict[k] = "N/A"
                elif isinstance(v, pd.Timestamp):
                    info_dict[k] = v.strftime('%Y-%m-%d')
                    
            driver_info[driver_name] = info_dict
            
            name = f"{info_dict.get('givenName', '')} {info_dict.get('familyName', '')}"
            driver_number = info_dict.get('number', 'N/A')
            driver_code = info_dict.get('code', 'N/A')
            
    return driver_info

# GET | 특정 이벤트 드라이버 목록
@app.get("/drivers/{year}/{event}/{session_type}", response_model=DriverListResponse)
def get_driver_list(year: int, event: str, session_type: str):
    try:
        event_id = int(event) if event.isdigit() else event
        session = fastf1.get_session(year, event_id, session_type)
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

        if len(driver_list) == 0:
            raise HTTPException(status_code=404, detail="No drivers found for this session")

        return {
            "year": year,
            "event": session.event['EventName'],
            "drivers": driver_list
        }
    except Exception as e:
        raise HTTPException(status_code=404, detail="해당 세션의 데이터를 찾을 수 없습니다.")


@app.get("/live-timing/{year}/{event}/{session_type}")
def get_live_timing(year: int, event: str, session_type: str):
    try:
        event_id = int(event) if event.isdigit() else event
        try:
            session = fastf1.get_session(year, event_id, session_type)
            session.load(telemetry=False, weather=False, messages=False)
        except Exception:
            raise HTTPException(status_code=404, detail="해당 세션의 데이터를 찾을 수 없습니다.")

        laps = session.laps
        if len(laps) == 0:
            return {"timing": []}
            
        s1_fastest = laps['Sector1Time'].min()
        s2_fastest = laps['Sector2Time'].min()
        s3_fastest = laps['Sector3Time'].min()
        lap_fastest = laps['LapTime'].min()

        timing_data = []
        for drv in session.drivers:
            drv_laps = laps.pick_driver(drv)
            if len(drv_laps) == 0: continue
            
            fastest = drv_laps.pick_fastest()
            if fastest is None or (isinstance(fastest, pd.Series) and fastest.empty) or pd.isna(fastest.get('LapTime')): continue
            
            drv_s1_best = drv_laps['Sector1Time'].min()
            drv_s2_best = drv_laps['Sector2Time'].min()
            drv_s3_best = drv_laps['Sector3Time'].min()
            
            def to_str(td):
                if pd.isna(td): return ''
                ts = td.total_seconds()
                m = int(ts // 60)
                s = ts % 60
                if m > 0: return f'{m}:{s:06.3f}'
                return f'{s:06.3f}'
                
            def get_color(val, overall, pb):
                if pd.isna(val): return 'gray'
                if val == overall: return 'purple'
                if val == pb: return 'green'
                return 'yellow'

            timing_data.append({
                'driver': fastest['Driver'],
                'team': fastest['Team'],
                'lap_time': to_str(fastest['LapTime']),
                'lap_color': get_color(fastest['LapTime'], lap_fastest, fastest['LapTime']),
                's1': to_str(fastest['Sector1Time']),
                's1_color': get_color(fastest['Sector1Time'], s1_fastest, drv_s1_best),
                's2': to_str(fastest['Sector2Time']),
                's2_color': get_color(fastest['Sector2Time'], s2_fastest, drv_s2_best),
                's3': to_str(fastest['Sector3Time']),
                's3_color': get_color(fastest['Sector3Time'], s3_fastest, drv_s3_best),
                'compound': str(fastest['Compound']),
                'time_sec': fastest['LapTime'].total_seconds()
            })

        timing_data.sort(key=lambda x: x['time_sec'])
        return {"timing": timing_data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/telemetry/{year}/{event}/{session_type}/{driver}")
def get_driver_telemetry(year: int, event: str, session_type: str, driver: str):
    try:
        session = None
        loaded_year = year
        loaded_event = event
        event_id = int(event) if event.isdigit() else event
        
        try:
            session = fastf1.get_session(year, event_id, session_type)
            session.load(laps=True, telemetry=True, weather=False)
        except Exception:
            raise HTTPException(status_code=404, detail="해당 세션의 데이터를 찾을 수 없습니다.")
                
        driver_code = driver.upper()
        
        laps = session.laps.pick_drivers(driver_code)
        if len(laps) == 0:
            matched_driver_id = None
            for d in session.drivers:
                try:
                    info = session.get_driver(d)
                    if info['Abbreviation'].upper() == driver_code or driver_code in info['FullName'].upper():
                        matched_driver_id = d
                        break
                except Exception:
                    pass
            if matched_driver_id:
                laps = session.laps.pick_drivers(matched_driver_id)
                
        if len(laps) == 0:
            lap = session.laps.pick_fastest()
        else:
            lap = laps.pick_fastest()
            
        driver_name = lap['Driver']
        try:
            telemetry = lap.get_telemetry()
        except Exception:
            car_data = lap.get_car_data()
            if len(car_data) == 0:
                raise HTTPException(status_code=404, detail="No telemetry data available")
            speed_mps = car_data['Speed'] / 3.6
            time_sec = car_data['Time'].dt.total_seconds()
            time_diffs = time_sec.diff().fillna(0.0)
            distance = (speed_mps * time_diffs).cumsum()
            telemetry = car_data.copy()
            telemetry['Distance'] = distance
            telemetry['X'] = 0.0
            telemetry['Y'] = 0.0
            telemetry['Z'] = 0.0
            
        total_points = len(telemetry)
        if total_points == 0:
            raise HTTPException(status_code=404, detail="No telemetry data available")
            
        step = max(1, total_points // 250)
        sampled_telemetry = telemetry.iloc[::step]
        
        points = []
        for idx, row in sampled_telemetry.iterrows():
            time_sec = row['Time'].total_seconds() if pd.notna(row['Time']) else 0.0
            points.append({
                "time": time_sec,
                "distance": float(row['Distance']) if pd.notna(row['Distance']) else 0.0,
                "speed": float(row['Speed']) if pd.notna(row['Speed']) else 0.0,
                "rpm": float(row['RPM']) if pd.notna(row['RPM']) else 0.0,
                "gear": int(row['nGear']) if pd.notna(row['nGear']) else 0,
                "throttle": float(row['Throttle']) if pd.notna(row['Throttle']) else 0.0,
                "brake": bool(row['Brake']) if pd.notna(row['Brake']) else False,
                "drs": int(row['DRS']) if pd.notna(row['DRS']) else 0,
                "x": float(row['X']) if pd.notna(row['X']) else 0.0,
                "y": float(row['Y']) if pd.notna(row['Y']) else 0.0,
                "z": float(row['Z']) if pd.notna(row['Z']) else 0.0
            })
            
        def to_str(val):
            if pd.isna(val): return "N/A"
            if hasattr(val, 'total_seconds'):
                sec = val.total_seconds()
                mins = int(sec // 60)
                s = sec % 60
                return f"{mins}:{s:06.3f}" if mins > 0 else f"{s:.3f}"
            return str(val)

        return {
            "driver": driver_name,
            "year": loaded_year,
            "event": loaded_event,
            "session": session_type,
            "lap_time": to_str(lap['LapTime']),
            "lap_time_sec": lap['LapTime'].total_seconds() if pd.notna(lap['LapTime']) else 0.0,
            "s1": to_str(lap['Sector1Time']),
            "s1_sec": lap['Sector1Time'].total_seconds() if pd.notna(lap['Sector1Time']) else 0.0,
            "s2": to_str(lap['Sector2Time']),
            "s2_sec": lap['Sector2Time'].total_seconds() if pd.notna(lap['Sector2Time']) else 0.0,
            "s3": to_str(lap['Sector3Time']),
            "s3_sec": lap['Sector3Time'].total_seconds() if pd.notna(lap['Sector3Time']) else 0.0,
            "compound": str(lap['Compound']) if pd.notna(lap['Compound']) else "N/A",
            "tyre_life": float(lap['TyreLife']) if pd.notna(lap['TyreLife']) else 0.0,
            "telemetry": points
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/race-simulation/{year}/{event}/{session_type}")
def get_race_simulation(year: int, event: str, session_type: str, drivers: str = None):
    try:
        event_id = int(event) if event.isdigit() else event
        try:
            session = fastf1.get_session(year, event_id, session_type)
            session.load(laps=True, telemetry=True, weather=False)
        except Exception:
            raise HTTPException(status_code=404, detail="해당 세션의 데이터를 찾을 수 없습니다.")

        def to_str(val):
            if pd.isna(val): return "N/A"
            if hasattr(val, 'total_seconds'):
                sec = val.total_seconds()
                mins = int(sec // 60)
                s = sec % 60
                return f"{mins}:{s:06.3f}" if mins > 0 else f"{s:.3f}"
            return str(val)

        # Parse selected drivers
        selected_driver_ids = []
        if drivers:
            drvs = [d.strip().upper() for d in drivers.split(',')]
            for d in session.drivers:
                info = session.get_driver(d)
                if info['Abbreviation'].upper() in drvs:
                    selected_driver_ids.append(d)
        else:
            selected_driver_ids = list(session.drivers)

        # 1. Track map data (using fastest lap telemetry)
        fastest_lap = session.laps.pick_fastest()
        track_data = []
        track_tel = None
        if not pd.isna(fastest_lap['Time']):
            try:
                track_tel = fastest_lap.get_telemetry()
            except Exception:
                pass
        
        # Fallback to any lap that has valid telemetry/positions
        if track_tel is None or len(track_tel) == 0:
            for _, lap in session.laps.pick_quicklaps().iterrows():
                try:
                    track_tel = lap.get_telemetry()
                    if track_tel is not None and len(track_tel) > 0:
                        break
                except Exception:
                    continue
                    
        if track_tel is not None and len(track_tel) > 0:
            track_step = max(1, len(track_tel) // 250)
            for _, row in track_tel.iloc[::track_step].iterrows():
                track_data.append({
                    "x": float(row['X']) if pd.notna(row['X']) else 0.0,
                    "y": float(row['Y']) if pd.notna(row['Y']) else 0.0,
                    "distance": float(row['Distance']) if pd.notna(row['Distance']) else 0.0,
                    "time": row['Time'].total_seconds() if pd.notna(row['Time']) else 0.0
                })

        # 2. Position data for selected drivers
        positions = {}
        if hasattr(session, 'pos_data'):
            for drv in selected_driver_ids:
                if drv not in session.pos_data: continue
                pos = session.pos_data[drv]
                if pos.empty: continue
                # Downsample to ~2Hz (FastF1 pos_data is usually ~3-4Hz, so step of 2)
                p_step = max(1, len(pos) // 10000)
                pts = []
                for _, row in pos.iloc[::p_step].iterrows():
                    sec = row['SessionTime'].total_seconds() if pd.notna(row['SessionTime']) else 0
                    x = float(row['X']) if pd.notna(row['X']) else 0.0
                    y = float(row['Y']) if pd.notna(row['Y']) else 0.0
                    pts.append([round(sec, 2), round(x, 1), round(y, 1)])
                # Store by abbreviation
                abbr = session.get_driver(drv)['Abbreviation']
                positions[abbr] = pts

        # 3. Laps data
        laps_dict = {}
        for drv in selected_driver_ids:
            drv_laps = session.laps.pick_driver(drv)
            drv_info = []
            for _, lap in drv_laps.iterrows():
                drv_info.append({
                    "lap_num": int(lap['LapNumber']),
                    "start_time": lap['LapStartTime'].total_seconds() if pd.notna(lap['LapStartTime']) else 0,
                    "time": lap['Time'].total_seconds() if pd.notna(lap['Time']) else 0, # end time
                    "lap_time": to_str(lap['LapTime']),
                    "lap_time_sec": lap['LapTime'].total_seconds() if pd.notna(lap['LapTime']) else 0,
                    "s1": to_str(lap['Sector1Time']),
                    "s1_sec": lap['Sector1Time'].total_seconds() if pd.notna(lap['Sector1Time']) else 0,
                    "s2": to_str(lap['Sector2Time']),
                    "s2_sec": lap['Sector2Time'].total_seconds() if pd.notna(lap['Sector2Time']) else 0,
                    "s3": to_str(lap['Sector3Time']),
                    "s3_sec": lap['Sector3Time'].total_seconds() if pd.notna(lap['Sector3Time']) else 0,
                    "compound": str(lap['Compound']) if pd.notna(lap['Compound']) else "N/A",
                    "tyre_life": float(lap['TyreLife']) if pd.notna(lap['TyreLife']) else 0,
                    "pit_in": lap['PitInTime'].total_seconds() if pd.notna(lap['PitInTime']) else None,
                    "pit_out": lap['PitOutTime'].total_seconds() if pd.notna(lap['PitOutTime']) else None
                })
            abbr = session.get_driver(drv)['Abbreviation']
            laps_dict[abbr] = drv_info

        return {
            "track": track_data,
            "positions": positions,
            "laps": laps_dict
        }
    except Exception as e:
        raise HTTPException(status_code=404, detail="해당 세션의 데이터를 찾을 수 없습니다.")

@app.get("/telemetry-lap/{year}/{event}/{session_type}/{driver}/{lap_number}")
def get_telemetry_lap(year: int, event: str, session_type: str, driver: str, lap_number: int):
    try:
        event_id = int(event) if event.isdigit() else event
        try:
            session = fastf1.get_session(year, event_id, session_type)
            session.load(laps=True, telemetry=True, weather=False)
        except Exception:
            raise HTTPException(status_code=404, detail="해당 세션의 데이터를 찾을 수 없습니다.")
            
        driver_code = driver.upper()
        laps = session.laps.pick_drivers(driver_code)
        if len(laps) == 0:
            for d in session.drivers:
                try:
                    info = session.get_driver(d)
                    if info['Abbreviation'].upper() == driver_code:
                        laps = session.laps.pick_drivers(d)
                        break
                except Exception:
                    pass
                    
        lap = laps[laps['LapNumber'] == lap_number]
        if len(lap) == 0:
            raise HTTPException(status_code=404, detail="해당 랩의 데이터를 찾을 수 없습니다.")
            
        lap = lap.iloc[0]
        try:
            telemetry = lap.get_telemetry()
        except Exception:
            car_data = lap.get_car_data()
            if len(car_data) == 0:
                raise HTTPException(status_code=404, detail="No telemetry data available")
            speed_mps = car_data['Speed'] / 3.6
            time_sec = car_data['Time'].dt.total_seconds()
            time_diffs = time_sec.diff().fillna(0.0)
            distance = (speed_mps * time_diffs).cumsum()
            telemetry = car_data.copy()
            telemetry['Distance'] = distance
            
        if len(telemetry) == 0:
            raise HTTPException(status_code=404, detail="No telemetry data available")
            
        step = max(1, len(telemetry) // 250)
        sampled_telemetry = telemetry.iloc[::step]
        
        points = []
        for _, row in sampled_telemetry.iterrows():
            points.append({
                "time": row['Time'].total_seconds() if pd.notna(row['Time']) else 0.0,
                "distance": float(row['Distance']) if pd.notna(row['Distance']) else 0.0,
                "speed": float(row['Speed']) if pd.notna(row['Speed']) else 0.0,
                "rpm": float(row['RPM']) if pd.notna(row['RPM']) else 0.0,
                "gear": int(row['nGear']) if pd.notna(row['nGear']) else 0,
                "throttle": float(row['Throttle']) if pd.notna(row['Throttle']) else 0.0,
                "brake": bool(row['Brake']) if pd.notna(row['Brake']) else False,
                "drs": int(row['DRS']) if pd.notna(row['DRS']) else 0
            })
            
        return {
            "driver": driver_code,
            "lap_number": lap_number,
            "lap_time": str(lap['LapTime']) if pd.notna(lap['LapTime']) else "N/A",
            "telemetry": points
        }
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))

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
            event_date = "N/A"
            if 'EventDate' in row and not pd.isna(row['EventDate']):
                event_date = row['EventDate'].strftime('%Y-%m-%d')
                
            event_list.append({
                "round": row['RoundNumber'],
                "country": row['Country'],
                "location": row['Location'],
                "official_name": row['EventName'],
                "date": event_date
            })
            
        return {"year": year, "events": event_list}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# GET | 특정 연도 드라이버 & 컨스트럭터 챔피언십 스탠딩
@app.get("/standings/{year}")
async def get_standings(year: int):
    try:
        # Load driver standings
        ds = await asyncio.to_thread(ergast.get_driver_standings, season=year)
        driver_list = []
        if ds.content:
            df = ds.content[0]
            for _, row in df.iterrows():
                c_names = row.get('constructorNames', [])
                team_name = c_names[0] if c_names else 'N/A'
                driver_list.append({
                    "position": int(row['position']),
                    "points": float(row['points']),
                    "wins": int(row['wins']),
                    "driverId": str(row['driverId']),
                    "givenName": str(row['givenName']),
                    "familyName": str(row['familyName']),
                    "driverCode": str(row.get('driverCode', 'N/A')),
                    "driverNationality": str(row.get('driverNationality', '')),
                    "team": team_name
                })
        
        # Load constructor standings
        cs = await asyncio.to_thread(ergast.get_constructor_standings, season=year)
        constructor_list = []
        if cs.content:
            df_c = cs.content[0]
            for _, row in df_c.iterrows():
                constructor_list.append({
                    "position": int(row['position']),
                    "points": float(row['points']),
                    "wins": int(row['wins']),
                    "constructorId": str(row['constructorId']),
                    "constructorName": str(row['constructorName']),
                    "constructorNationality": str(row.get('constructorNationality', ''))
                })
                
        return {
            "year": year,
            "drivers": driver_list,
            "constructors": constructor_list
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# 드라이버 현역 수동 데이터 매핑 (월드챔피언, 최고 순위, 그랜드슬램)
with open('./data/manual_stats.json', 'r', encoding='utf-8') as f:
    MANUAL_STATS = json.load(f)


def fetch_ergast_paginated(url: str):
    all_data = []
    limit = 100
    offset = 0
    
    session = requests.Session()
    retries = Retry(total=3, backoff_factor=0.5, status_forcelist=[500, 502, 503, 504])
    session.mount('https://', HTTPAdapter(max_retries=retries))
    
    while True:
        try:
            resp = session.get(f"{url}?limit={limit}&offset={offset}", timeout=10)
            if resp.status_code != 200:
                break
            data = resp.json()
            races = data.get("MRData", {}).get("RaceTable", {}).get("Races", [])
            if not races:
                break
            all_data.extend(races)
            
            total = int(data.get("MRData", {}).get("total", 0))
            offset += limit
            if offset >= total:
                break
        except requests.exceptions.RequestException as e:
            # 외부 API 장애 시 진행을 중단하고 빈 데이터라도 반환
            print(f"Jolpi API Error: {e}")
            break
            
    return all_data


driver_stats_cache = {}

# GET | 특정 드라이버 기록
@app.get("/driver-stats/{driver_id}")
async def get_driver_stats(driver_id: str):
    if driver_id in driver_stats_cache:
        return driver_stats_cache[driver_id]
        
    try:
        results = await asyncio.to_thread(fetch_ergast_paginated, f"https://api.jolpi.ca/ergast/f1/drivers/{driver_id}/results.json")
        sprints = await asyncio.to_thread(fetch_ergast_paginated, f"https://api.jolpi.ca/ergast/f1/drivers/{driver_id}/sprint.json")
        
        entries = len(results)
        wins = 0
        podiums = 0
        poles = 0
        fastest_laps = 0
        sprint_wins = 0
        sprint_poles = 0
        pole_to_win = 0
        hat_tricks = 0
        points = 0.0
        
        first_race = None
        first_win = None
        first_podium = None
        first_pole = None
        
        latest_win = None
        latest_podium = None
        latest_pole = None
        
        highest_finish = 999
        highest_grid = 999

        for race in results:
            race_name = race.get("raceName", "")
            season = race.get("season", "")
            race_str = f"{season} {race_name}"
            
            if not first_race:
                first_race = race_str
                
            for res in race.get("Results", []):
                pts = float(res.get("points", 0))
                points += pts
                pos = int(res.get("position", 999))
                grid = int(res.get("grid", 999))
                
                # fastest lap
                fl = res.get("FastestLap", {})
                fl_rank = fl.get("rank", "")
                has_fl = (str(fl_rank).strip() == "1")
                if has_fl:
                    fastest_laps += 1
                
                if pos > 0 and pos < highest_finish: highest_finish = pos
                if grid > 0 and grid < highest_grid: highest_grid = grid
                
                is_win = (pos == 1)
                is_podium = (pos <= 3 and pos > 0)
                is_pole = (grid == 1)
                
                if is_win:
                    wins += 1
                    latest_win = race_str
                    if not first_win: first_win = race_str
                if is_podium:
                    podiums += 1
                    latest_podium = race_str
                    if not first_podium: first_podium = race_str
                if is_pole:
                    poles += 1
                    latest_pole = race_str
                    if not first_pole: first_pole = race_str
                    
                if is_pole and is_win:
                    pole_to_win += 1
                    if has_fl:
                        hat_tricks += 1

        for race in sprints:
            for res in race.get("SprintResults", []):
                pts = float(res.get("points", 0))
                points += pts
                pos = int(res.get("position", 999))
                grid = int(res.get("grid", 999))
                
                if pos == 1: sprint_wins += 1
                if grid == 1: sprint_poles += 1

        manual = MANUAL_STATS.get(driver_id, {"championships": "N/A", "highest_champ": "N/A", "grand_slams": "N/A", "hat_tricks": "N/A"})
        
        # Use manual hat_tricks if specified, otherwise fallback to calculated
        final_hat_tricks = manual.get("hat_tricks", "N/A")
        if final_hat_tricks == "N/A":
            final_hat_tricks = hat_tricks
        
        stats = {
            "entries": entries,
            "championships": manual["championships"],
            "wins": wins,
            "podiums": podiums,
            "poles": poles,
            "fastest_laps": fastest_laps,
            "sprint_wins": sprint_wins,
            "sprint_poles": sprint_poles,
            "pole_to_win": pole_to_win,
            "hat_tricks": final_hat_tricks,
            "grand_slams": manual["grand_slams"],
            "points": int(points) if points.is_integer() else round(points, 1),
            "first_race": first_race or "N/A",
            "first_win": first_win or "N/A",
            "first_podium": first_podium or "N/A",
            "first_pole": first_pole or "N/A",
            "latest_win": latest_win or "N/A",
            "latest_podium": latest_podium or "N/A",
            "latest_pole": latest_pole or "N/A",
            "highest_champ": manual["highest_champ"],
            "highest_finish": highest_finish if highest_finish != 999 else "N/A",
            "highest_grid": highest_grid if highest_grid != 999 else "N/A",
        }
        
        driver_stats_cache[driver_id] = stats
        return stats
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)