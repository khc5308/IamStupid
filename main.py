import os
import fastf1
import pandas as pd
from fastapi import FastAPI, HTTPException
from typing import Dict, Any

app = FastAPI()

# 1. 캐시 폴더 설정 (서버 실행 시 1회 수행)
cache_path = './cache'
if not os.path.exists(cache_path):
    os.makedirs(cache_path)
fastf1.Cache.enable_cache(cache_path)

@app.get("/lap-stats/{year}/{event}/{driver}")
def get_driver_stats(year: int, event: str, driver: str):
    try:
        session = fastf1.get_session(year, event, 'R')
        session.load()

        driver_laps = session.laps.pick_drivers(driver).pick_quicklaps()

        if len(driver_laps) == 0:
            raise HTTPException(status_code=404, detail="No data found for the given driver/event")

        # 4. 통계 계산
        # Timedelta 객체는 JSON 직렬화가 안 되므로 문자열로 변환합니다.
        fastest_lap = str(driver_laps['LapTime'].min())
        avg_lap = str(driver_laps['LapTime'].mean())
        
        # 타이어 컴파운드 사용량 (Series -> Dict 변환)
        compound_usage = driver_laps.groupby('Compound').size().to_dict()

        return {
            "driver": driver,
            "year": year,
            "event": event,
            "total_laps": len(driver_laps),
            "fastest_lap": fastest_lap,
            "average_lap_time": avg_lap,
            "compound_usage": compound_usage
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/drivers/{year}/{event}")
def get_driver_list(year: int, event: str):
    try:
        # 세션 정보 로드 (가벼운 메타데이터만 로드하기 위해 load_laps=False 권장)
        session = fastf1.get_session(year, event, 'R')
        session.load(laps=False, telemetry=False, weather=False)

        driver_list = []
        # session.drivers에는 드라이버 번호(문자열) 리스트가 들어있습니다.
        for driver_number in session.drivers:
            # 개별 드라이버의 결과 정보 추출
            dr_info = session.get_driver(driver_number)
            driver_list.append({
                "number": driver_number,
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

@app.get("/events/{year}")
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
    # 서버 실행: python main.py
    uvicorn.run(app, host="0.0.0.0", port=8000)