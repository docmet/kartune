from typing import Optional

from pydantic import BaseModel


class TelemetryDataPoint(BaseModel):
    """
    Validation schema for telemetry data points.
    Mirrors services.parsers.TelemetryDataPoint dataclass
    """

    distance_m: float
    time_s: float
    speed_kmh: float
    throttle_pct: float
    brake_pct: float
    steering_pct: float
    gear: int
    rpm: float
    g_lat: Optional[float] = None
    g_long: Optional[float] = None
