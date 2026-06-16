import re

filepath = 'main.py'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

new_endpoints = """
@app.get("/race-results/{year}/{event}/{session_type}")
def get_race_results(year: int, event: str, session_type: str):
    try:
        event_id = int(event) if event.isdigit() else event
        try:
            session = fastf1.get_session(year, event_id, session_type)
            session.load(laps=False, telemetry=False, weather=False)
        except Exception:
            raise HTTPException(status_code=404, detail="해당 세션의 데이터를 찾을 수 없습니다.")
            
        if session.results is None or session.results.empty:
            raise HTTPException(status_code=404, detail="결과 데이터가 없습니다.")
            
        results = []
        for _, row in session.results.iterrows():
            def safe_str(val):
                return str(val) if pd.notna(val) else ""
            def safe_float(val):
                return float(val) if pd.notna(val) else 0.0
                
            gap = ""
            if pd.notna(row.get('Time')):
                try:
                    sec = row['Time'].total_seconds()
                    mins = int(sec // 60)
                    s = sec % 60
                    if sec < 0:
                        gap = str(row['Time'])
                    elif mins > 0:
                        gap = f"+{mins}:{s:06.3f}"
                    else:
                        gap = f"+{s:.3f}"
                except:
                    gap = str(row['Time'])
                    
            results.append({
                "position": safe_float(row.get('Position')),
                "driver": safe_str(row.get('Abbreviation')),
                "team": safe_str(row.get('TeamName')),
                "points": safe_float(row.get('Points')),
                "status": safe_str(row.get('Status')),
                "grid": safe_float(row.get('GridPosition')),
                "gap": gap
            })
            
        return {"results": results}
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"결과 에러: {str(e)}")

@app.get("/fastest-lap-telemetry/{year}/{event}/{session_type}")
def get_fastest_lap_telemetry(year: int, event: str, session_type: str, drivers: str = None):
    try:
        event_id = int(event) if event.isdigit() else event
        try:
            session = fastf1.get_session(year, event_id, session_type)
            session.load(laps=True, telemetry=True, weather=False)
        except Exception:
            raise HTTPException(status_code=404, detail="해당 세션의 데이터를 찾을 수 없습니다.")
            
        if not drivers:
            raise HTTPException(status_code=400, detail="drivers 파라미터가 필요합니다.")
            
        drvs = [d.strip().upper() for d in drivers.split(',')]
        data = {}
        
        for d in drvs:
            try:
                drv_laps = session.laps.pick_drivers(d)
                if drv_laps.empty:
                    # try fallback
                    for dr in session.drivers:
                        try:
                            info = session.get_driver(dr)
                            if info['Abbreviation'].upper() == d:
                                drv_laps = session.laps.pick_drivers(dr)
                                break
                        except: pass
                if drv_laps.empty: continue
                
                fastest = drv_laps.pick_fastest()
                if fastest.empty or pd.isna(fastest['Time']): continue
                
                tel = fastest.get_telemetry()
                if tel.empty: continue
                
                # downsample to ~5Hz to save payload
                step = max(1, len(tel) // 300)
                pts = []
                for _, r in tel.iloc[::step].iterrows():
                    pts.append({
                        "distance": float(r['Distance']) if pd.notna(r['Distance']) else 0.0,
                        "speed": float(r['Speed']) if pd.notna(r['Speed']) else 0.0,
                        "rpm": float(r['RPM']) if pd.notna(r['RPM']) else 0.0,
                        "gear": float(r['nGear']) if pd.notna(r['nGear']) else 0.0,
                        "throttle": float(r['Throttle']) if pd.notna(r['Throttle']) else 0.0,
                        "brake": 1 if r['Brake'] else 0
                    })
                data[d] = pts
            except Exception as e:
                print(f"Error fetching telemetry for {d}: {e}")
                pass
                
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"텔레메트리 에러: {str(e)}")

"""

content = content.replace('@app.get("/telemetry-lap/{year}/{event}/{session_type}/{driver}/{lap_number}")', new_endpoints + '\n@app.get("/telemetry-lap/{year}/{event}/{session_type}/{driver}/{lap_number}")')

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Patch applied to main.py")
