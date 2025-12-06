"""
rFactor 2 / KartSim Telemetry Parser

Parses CSV files from rF2 Telemetry Tool plugin (v15.04+)
File structure:
  Line 1: Metadata (player, version, driver_name, 0, session_id)
  Line 2: Lap summary header
  Line 3: Lap summary data (game, version, date, track, car, event, laptime, sectors...)
  Line 4: Session header
  Line 5: Session data (track_id, track_len, weather, tire, valid, lap_number...)
  Line 6: Setup header
  Line 7: Setup data
  Line 8: Telemetry header (113 columns)
  Line 9+: Telemetry data samples
"""

import csv
from datetime import datetime
from pathlib import Path
from typing import Iterator

from . import (
    LapMetadata,
    LapSummary,
    ParsedTelemetry,
    ParserRegistry,
    TelemetryDataPoint,
    TelemetryParser,
)


class RF2Parser(TelemetryParser):
    """Parser for rFactor 2 / KartSim telemetry files"""

    @property
    def format_name(self) -> str:
        return "RF2"

    def can_parse(self, file_path: Path) -> bool:
        """Check if file is RF2 format by examining first line"""
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                first_line = f.readline().strip()
                # RF2 format starts with: player,v8,DriverName,0,SessionID
                parts = first_line.split(",")
                return len(parts) >= 3 and parts[0] == "player"
        except Exception:
            return False

    def parse_metadata(self, file_path: Path) -> LapMetadata:
        """Extract metadata without full parse"""
        with open(file_path, "r", encoding="utf-8") as f:
            lines = [f.readline().strip() for _ in range(6)]

        # Line 1: player,v8,DriverName,0,SessionID
        meta_parts = lines[0].split(",")
        driver_name = meta_parts[2] if len(meta_parts) > 2 else "Unknown"

        # Line 3: Game,version,date,track,car,event,laptime,S1,S2,S3
        lap_parts = lines[2].split(",")
        session_date_str = lap_parts[2] if len(lap_parts) > 2 else ""
        track_name = lap_parts[3] if len(lap_parts) > 3 else "Unknown Track"
        car_name = lap_parts[4] if len(lap_parts) > 4 else "Unknown Kart"
        event_type = lap_parts[5] if len(lap_parts) > 5 else "Practice"

        # Parse date
        try:
            session_date = datetime.strptime(session_date_str, "%Y-%m-%d %H:%M:%S")
        except ValueError:
            try:
                session_date = datetime.strptime(session_date_str, "%Y-%m-%d")
            except ValueError:
                session_date = datetime.now()

        return LapMetadata(
            driver_name=driver_name,
            track_name=track_name,
            car_name=car_name,
            event_type=event_type,
            session_date=session_date,
            source_format=self.format_name,
        )

    def parse(self, file_path: Path) -> ParsedTelemetry:
        """Full parse of RF2 telemetry file"""
        with open(file_path, "r", encoding="utf-8") as f:
            lines = [f.readline().strip() for _ in range(8)]

        metadata = self.parse_metadata(file_path)

        # Line 3: Lap summary
        lap_parts = lines[2].split(",")
        lap_time_s = float(lap_parts[6]) if len(lap_parts) > 6 else 0.0
        s1 = float(lap_parts[7]) if len(lap_parts) > 7 and lap_parts[7] else None
        s2 = float(lap_parts[8]) if len(lap_parts) > 8 and lap_parts[8] else None
        s3 = float(lap_parts[9]) if len(lap_parts) > 9 and lap_parts[9] else None
        s4 = float(lap_parts[10]) if len(lap_parts) > 10 and lap_parts[10] else None

        # Line 5: Session data
        session_parts = lines[4].split(",")
        weather = session_parts[4] if len(session_parts) > 4 else None
        tire = session_parts[6] if len(session_parts) > 6 else None
        valid_str = session_parts[7] if len(session_parts) > 7 else "true"
        valid = valid_str.lower() == "true"
        lap_number = int(session_parts[10]) if len(session_parts) > 10 else 1
        track_temp = float(session_parts[16]) if len(session_parts) > 16 else None
        air_temp = float(session_parts[17]) if len(session_parts) > 17 else None

        lap_summary = LapSummary(
            lap_number=lap_number,
            lap_time_ms=int(lap_time_s * 1000),
            sector1_ms=int(s1 * 1000) if s1 else None,
            sector2_ms=int(s2 * 1000) if s2 else None,
            sector3_ms=int(s3 * 1000) if s3 else None,
            sector4_ms=int(s4 * 1000) if s4 else None,
            valid=valid,
            weather=weather,
            track_temp_c=track_temp,
            air_temp_c=air_temp,
            tire_compound=tire,
        )

        # Line 8: Telemetry header
        telemetry_columns = lines[7].split(",") if len(lines) > 7 else []

        return ParsedTelemetry(
            metadata=metadata,
            lap_summary=lap_summary,
            original_filename=file_path.name,
            file_path=str(file_path),
            telemetry_columns=telemetry_columns,
            has_detailed_telemetry=True,
        )

    def stream_telemetry(self, file_path: Path) -> Iterator[TelemetryDataPoint]:
        """Stream telemetry data points from file"""
        with open(file_path, "r", encoding="utf-8") as f:
            # Skip header lines (first 8 lines)
            for _ in range(8):
                f.readline()

            reader = csv.reader(f)
            for row in reader:
                if len(row) < 10:
                    continue

                try:
                    yield TelemetryDataPoint(
                        distance_m=float(row[0]) if row[0] else 0.0,
                        time_s=float(row[2]) if row[2] else 0.0,
                        speed_kmh=float(row[5]) if row[5] else 0.0,
                        throttle_pct=float(row[7]) if row[7] else 0.0,
                        brake_pct=float(row[8]) if row[8] else 0.0,
                        steering_pct=float(row[9]) if row[9] else 0.0,
                        gear=int(float(row[11])) if row[11] else 0,
                        rpm=float(row[6]) if row[6] else 0.0,
                        g_lat=float(row[25]) if len(row) > 25 and row[25] else None,
                        g_long=float(row[26]) if len(row) > 26 and row[26] else None,
                    )
                except (ValueError, IndexError):
                    continue


# Register the parser
ParserRegistry.register(RF2Parser())
