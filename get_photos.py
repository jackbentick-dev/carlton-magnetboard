#!/usr/bin/env python3
"""Download official Carlton 2026 headshots into a players/ folder next to the
magnetboard HTML, so photos also work offline. The board uses these local files
first and falls back to the same URLs online.

Usage:  python3 get_photos.py
"""
import os
import urllib.request

PHOTO_IDS = {2: 1021353, 3: 1017700, 4: 1023495, 5: 1002239, 6: 294685, 7: 1028515, 8: 1002228, 9: 990704, 10: 1000953, 11: 297255, 12: 998130, 13: 296294, 14: 998103, 15: 1027678, 16: 1027282, 17: 1009241, 18: 1006094, 19: 997100, 20: 1012862, 21: 1022452, 22: 1028526, 23: 993832, 24: 297907, 25: 1023346, 26: 295265, 27: 298290, 28: 1028496, 29: 294036, 30: 1033066, 31: 1017057, 32: 1027964, 33: 997316, 34: 1035129, 35: 1033084, 36: 1032108, 37: 1002795, 38: 1027903, 39: 1036426, 40: 1023489, 41: 1039720, 42: 295461, 43: 1020097, 44: 1017255, 45: 1020877, 46: 1008154, 47: 1016140}

BASE = "https://s.afl.com.au/staticfile/AFL%20Tenant/AFL/Players/ChampIDImages/AFL/2026014/"

os.makedirs("players", exist_ok=True)
ok = fail = 0
for number, photo_id in sorted(PHOTO_IDS.items()):
    dest = os.path.join("players", f"{number}.png")
    if os.path.exists(dest):
        print(f"#{number:>2}  already exists, skipping")
        ok += 1
        continue
    url = f"{BASE}{photo_id}.png?im=Scale,width=0.5,height=0.5"
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=20) as r, open(dest, "wb") as f:
            f.write(r.read())
        print(f"#{number:>2}  saved {dest}")
        ok += 1
    except Exception as e:
        print(f"#{number:>2}  FAILED: {e}")
        fail += 1

print(f"\nDone: {ok} saved/present, {fail} failed.")
