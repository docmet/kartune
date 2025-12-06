"""
Telemetry Parser Plugin System

Base classes and interfaces for parsing telemetry data from various sources.
Supports: rF2/KartSim (now), Alfano/Micron (future)
"""

from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from datetime import datetime
from pathlib import Path
from typing import Iterator


@dataclass
class LapMetadata:
    """Metadata extracted from a telemetry file"""

    driver_name: str
    track_name: str
    car_name: str  # Kart class/model
    event_type: str  # Practice, Qualifying, Race
    session_date: datetime
    source_format: str  # RF2, Alfano, Micron, etc.


@dataclass
class LapSummary:
    """Summary data for a single lap"""

    lap_number: int
    lap_time_ms: int
    sector1_ms: int | None = None
    sector2_ms: int | None = None
    sector3_ms: int | None = None
    sector4_ms: int | None = None
    valid: bool = True

    # Conditions at time of lap
    weather: str | None = None
    track_temp_c: float | None = None
    air_temp_c: float | None = None
    tire_compound: str | None = None


@dataclass
class TelemetryDataPoint:
    """Single telemetry sample point"""

    distance_m: float
    time_s: float
    speed_kmh: float
    throttle_pct: float
    brake_pct: float
    steering_pct: float
    gear: int
    rpm: float
    g_lat: float | None = None
    g_long: float | None = None


@dataclass
class ParsedTelemetry:
    """Complete parsed telemetry file result"""

    metadata: LapMetadata
    lap_summary: LapSummary
    original_filename: str
    file_path: str
    telemetry_columns: list[str] = field(default_factory=list)
    has_detailed_telemetry: bool = True


class TelemetryParser(ABC):
    """Abstract base class for telemetry parsers"""

    @property
    @abstractmethod
    def format_name(self) -> str:
        """Return the format name (e.g., 'RF2', 'Alfano')"""
        pass

    @abstractmethod
    def can_parse(self, file_path: Path) -> bool:
        """Check if this parser can handle the given file"""
        pass

    @abstractmethod
    def parse_metadata(self, file_path: Path) -> LapMetadata:
        """Extract metadata from the file without full parsing"""
        pass

    @abstractmethod
    def parse(self, file_path: Path) -> ParsedTelemetry:
        """Full parse of the telemetry file"""
        pass

    @abstractmethod
    def stream_telemetry(self, file_path: Path) -> Iterator[TelemetryDataPoint]:
        """Stream telemetry data points for memory-efficient processing"""
        pass


class ParserRegistry:
    """Registry of available telemetry parsers"""

    _parsers: list[TelemetryParser] = []

    @classmethod
    def register(cls, parser: TelemetryParser) -> None:
        """Register a new parser"""
        cls._parsers.append(parser)

    @classmethod
    def detect_parser(cls, file_path: Path) -> TelemetryParser | None:
        """Auto-detect the appropriate parser for a file"""
        for parser in cls._parsers:
            if parser.can_parse(file_path):
                return parser
        return None

    @classmethod
    def get_parser(cls, format_name: str) -> TelemetryParser | None:
        """Get a specific parser by format name"""
        for parser in cls._parsers:
            if parser.format_name == format_name:
                return parser
        return None

    @classmethod
    def available_formats(cls) -> list[str]:
        """List all registered format names"""
        return [p.format_name for p in cls._parsers]
