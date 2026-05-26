from fastf1.ergast import Ergast
ergast = Ergast()

ds = ergast.get_driver_standings(season=2026)
if ds.content:
    df = ds.content[0]
    print("--- 2026 Driver Standings ---")
    for _, row in df.iterrows():
        print(f"Pos {row['position']}: {row['givenName']} {row['familyName']} ({row['driverId']}) - Team: {row['constructorNames']} - Points: {row['points']}")

cs = ergast.get_constructor_standings(season=2026)
if cs.content:
    df_c = cs.content[0]
    print("\n--- 2026 Constructor Standings ---")
    for _, row in df_c.iterrows():
        print(f"Pos {row['position']}: {row['constructorName']} ({row['constructorId']}) - Points: {row['points']}")
