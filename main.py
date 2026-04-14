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

if __name__ == "__main__":
    import uvicorn
    # 서버 실행: python main.py
    uvicorn.run(app, host="0.0.0.0", port=8000)