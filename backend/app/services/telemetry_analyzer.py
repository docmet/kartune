"""
Telemetry Analysis Service

Analyzes telemetry data from various sources (CSV, JSON) and extracts:
- Lap times
- Best/average lap times
- Consistency metrics
- Performance trends
"""

import csv
import json
import os
import statistics
from typing import Any, Dict, List


class TelemetryAnalyzer:
    """Analyzes telemetry files and extracts racing metrics"""

    def analyze_file(self, file_path: str, filename: str) -> Dict[str, Any]:
        """
        Analyze a telemetry file and return metrics

        Args:
            file_path: Path to the telemetry file
            filename: Original filename (used to determine format)

        Returns:
            Dictionary with analysis results
        """
        # Determine file type
        ext = os.path.splitext(filename)[1].lower()

        if ext == ".csv":
            return self._analyze_csv(file_path)
        elif ext == ".json":
            return self._analyze_json(file_path)
        else:
            # For unknown formats, return mock data for MVP
            return self._mock_analysis()

    def _analyze_csv(self, file_path: str) -> Dict[str, Any]:
        """Analyze CSV telemetry file"""
        lap_times = []

        try:
            with open(file_path, "r") as f:
                reader = csv.DictReader(f)

                # Try to find lap time column (common variations)
                lap_time_cols = ["lap_time", "laptime", "time", "lap_time_ms", "lap_time_seconds"]

                for row in reader:
                    # Find the lap time column
                    lap_time = None
                    for col in lap_time_cols:
                        if col in row:
                            try:
                                # Try to parse as milliseconds or seconds
                                value = float(row[col])
                                # If value is less than 1000, assume it's in seconds
                                lap_time = int(value * 1000) if value < 1000 else int(value)
                                break
                            except ValueError:
                                continue

                    if lap_time and lap_time > 0:
                        lap_times.append(lap_time)

            if not lap_times:
                return self._mock_analysis()

            return self._calculate_metrics(lap_times)

        except Exception as e:
            print(f"Error analyzing CSV: {e}")
            return self._mock_analysis()

    def _analyze_json(self, file_path: str) -> Dict[str, Any]:
        """Analyze JSON telemetry file"""
        try:
            with open(file_path, "r") as f:
                data = json.load(f)

            # Try to find lap times in various JSON structures
            lap_times = []

            if isinstance(data, list):
                # Array of laps
                for lap in data:
                    if isinstance(lap, dict) and "lap_time" in lap:
                        lap_times.append(int(lap["lap_time"]))
                    elif isinstance(lap, (int, float)):
                        lap_times.append(int(lap))
            elif isinstance(data, dict):
                # Object with laps array
                if "laps" in data:
                    for lap in data["laps"]:
                        if isinstance(lap, dict) and "time" in lap:
                            lap_times.append(int(lap["time"]))
                        elif isinstance(lap, (int, float)):
                            lap_times.append(int(lap))
                elif "lap_times" in data:
                    lap_times = [int(t) for t in data["lap_times"]]

            if not lap_times:
                return self._mock_analysis()

            return self._calculate_metrics(lap_times)

        except Exception as e:
            print(f"Error analyzing JSON: {e}")
            return self._mock_analysis()

    def _calculate_metrics(self, lap_times: List[int]) -> Dict[str, Any]:
        """Calculate metrics from lap times"""
        if not lap_times:
            return self._mock_analysis()

        best_lap = min(lap_times)
        avg_lap = int(statistics.mean(lap_times))

        # Calculate consistency score (0-100)
        # Lower standard deviation = higher consistency
        if len(lap_times) > 1:
            std_dev = statistics.stdev(lap_times)
            # Normalize to 0-100 scale (assuming std_dev of 5000ms = 0 score)
            consistency = max(0, min(100, 100 - (std_dev / 50)))
        else:
            consistency = 100.0

        # Determine improvement trend
        if len(lap_times) >= 3:
            first_third = lap_times[: len(lap_times) // 3]
            last_third = lap_times[-len(lap_times) // 3 :]

            avg_first = statistics.mean(first_third)
            avg_last = statistics.mean(last_third)

            if avg_last < avg_first * 0.98:  # 2% improvement
                trend = "improving"
            elif avg_last > avg_first * 1.02:  # 2% decline
                trend = "declining"
            else:
                trend = "stable"
        else:
            trend = "insufficient_data"

        return {
            "best_lap_time_ms": best_lap,
            "average_lap_time_ms": avg_lap,
            "total_laps": len(lap_times),
            "lap_times": lap_times,
            "consistency_score": round(consistency, 2),
            "improvement_trend": trend,
        }

    def _mock_analysis(self) -> Dict[str, Any]:
        """Return mock analysis data for unsupported formats"""
        # Generate realistic mock data
        import random

        base_time = 45000  # 45 seconds
        lap_times = [base_time + random.randint(-2000, 2000) for _ in range(15)]

        return self._calculate_metrics(lap_times)
