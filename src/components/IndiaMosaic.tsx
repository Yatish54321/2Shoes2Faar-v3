import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  RotateCcw,
  Search,
  Users,
  Sparkles,
  MapPin,
  Compass,
  Grid,
  ChevronRight,
  Info,
  ExternalLink
} from 'lucide-react';
import { Supporter, MosaicCell } from '../types';
import { SupporterAvatar, TRAVELER_PALETTES } from './SupporterAvatar';
import { getRegionForLocation } from '../data/indiaGrid';

/**
 * Renders a single mosaic tile's avatar with automatic fallback to the
 * stylized traveler illustration matching the supporter page.
 */
const MosaicTileAvatar: React.FC<{ sup: Supporter }> = ({ sup }) => {
  const [imageError, setImageError] = useState(false);
  const hasRealPhoto = Boolean(sup.photoUrl && sup.photoUrl.trim() && !imageError);

  const seed = (sup.supporterNumber || 0) + (sup.id ? sup.id.charCodeAt(0) + sup.id.length : 0) + (sup.fullName ? sup.fullName.charCodeAt(0) : 0);
  const paletteIndex = Math.abs(seed) % TRAVELER_PALETTES.length;
  const palette = TRAVELER_PALETTES[paletteIndex];
  const initial = (sup.fullName ? sup.fullName.trim().charAt(0).toUpperCase() : 'S') || 'S';

  if (hasRealPhoto) {
    return (
      <img
        src={sup.photoUrl!}
        alt={sup.fullName}
        className="w-full h-full object-cover"
        referrerPolicy="no-referrer"
        onError={() => setImageError(true)}
      />
    );
  }

  return (
    <div
      className={`w-full h-full relative overflow-hidden bg-gradient-to-br ${palette.bg} flex items-center justify-center`}
      title={`${sup.fullName} • #${sup.supporterNumber}`}
    >
      <svg
        viewBox="0 0 64 64"
        className="absolute inset-0 w-full h-full opacity-50 mix-blend-overlay pointer-events-none"
        fill="none"
      >
        <circle cx="48" cy="18" r="8" fill={palette.skyAccent} fillOpacity="0.8" />
        <path d="M0 50 L18 26 L36 46 L48 32 L64 54 L64 64 Z" fill={palette.mountains} fillOpacity="0.9" />
        <path d="M28 38 C28 35 31 35 31 32 C31 30 29 29 29 27 C29 24.5 31 23 33 23 C35 23 37 24.5 37 27 C37 29 35 30 35 32 C35 35 38 35 38 38 L39 48 L35 48 L35 44 L31 44 L31 48 L27 48 Z" fill="#FFFFFF" fillOpacity="0.65" />
      </svg>
      <span className="relative z-10 font-black text-[7px] text-white drop-shadow-sm leading-none font-mono">
        {initial}
      </span>
    </div>
  );
};

export interface IndiaMosaicProps {
  cells?: MosaicCell[];
  supporters?: Supporter[];
  onSelectSupporter?: (supporter: Supporter) => void;
  onOpenOrderModal?: () => void;
  selectedSupporterId?: string | null;
  highlightedCellId?: string | null;
  allowAdminEdit?: boolean;
  onCellClickAdmin?: (cell: MosaicCell) => void;
}

type ViewMode = 'artwork' | 'hotspots' | 'regions';
type RegionFilter = 'all' | 'north' | 'south' | 'east' | 'west' | 'central' | 'northeast' | 'islands';

export const IndiaMosaic: React.FC<IndiaMosaicProps> = ({
  cells = [],
  supporters = [],
  onSelectSupporter,
  onOpenOrderModal,
  selectedSupporterId,
  highlightedCellId,
  allowAdminEdit = false,
  onCellClickAdmin
}) => {
  // Zoom & Pan state: DEFAULT STRICTLY 100% (scale = 1, pan = 0,0)
  const [scale, setScale] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Filters & display toggles
  const [viewMode, setViewMode] = useState<ViewMode>('artwork');
  const [selectedRegion, setSelectedRegion] = useState<RegionFilter>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [showGridOutline, setShowGridOutline] = useState<boolean>(false);

  // Hover Tooltip state
  const [hoveredCell, setHoveredCell] = useState<MosaicCell | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Spotlighted Cell ID (pulsing highlight)
  const [spotlightCellId, setSpotlightCellId] = useState<string | null>(null);

  // DOM Refs
  const containerRef = useRef<HTMLDivElement | null>(null);
  const touchStartDistRef = useRef<number | null>(null);
  const touchStartScaleRef = useRef<number>(1);

  // Supporters Map lookup
  const supporterMap = useMemo(() => {
    const sMap = new Map<string, Supporter>();
    supporters.forEach(s => {
      if (s.id) sMap.set(s.id, s);
    });
    return sMap;
  }, [supporters]);

  // Total claimed count
  const occupiedCount = useMemo(() => {
    return cells.filter(c => c.supporterId || c.supporter).length;
  }, [cells]);

  // Live Supporter Search
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase().trim();
    return supporters
      .filter(s => {
        const nameMatch = s.fullName?.toLowerCase().includes(query);
        const numMatch = s.supporterNumber?.toString() === query.replace('#', '');
        const cityMatch = s.city?.toLowerCase().includes(query);
        const stateMatch = s.state?.toLowerCase().includes(query);
        return nameMatch || numMatch || cityMatch || stateMatch;
      })
      .slice(0, 6);
  }, [supporters, searchQuery]);

  // Highlight a specific cell with a radiant glow without jarring jumps
  const highlightCell = useCallback((cell: MosaicCell, smoothZoom: boolean = false) => {
    setSpotlightCellId(cell.cellId);

    if (smoothZoom && containerRef.current) {
      const containerW = containerRef.current.clientWidth;
      const containerH = containerRef.current.clientHeight;
      const targetScale = 2.0;

      const normX = (cell.leftPercent || 50) / 100;
      const normY = (cell.topPercent || 50) / 100;

      const targetPanX = (0.5 - normX) * containerW * targetScale;
      const targetPanY = (0.5 - normY) * containerH * targetScale;

      setScale(targetScale);
      setPan({ x: targetPanX, y: targetPanY });
    }

    setTimeout(() => {
      setSpotlightCellId(prev => (prev === cell.cellId ? null : prev));
    }, 6000);
  }, []);

  // Respond to prop changes for highlighted cell
  useEffect(() => {
    if (selectedSupporterId) {
      const matched = cells.find(c => c.supporterId === selectedSupporterId || c.supporter?.id === selectedSupporterId);
      if (matched) highlightCell(matched, false);
    } else if (highlightedCellId) {
      const matched = cells.find(c => c.cellId === highlightedCellId);
      if (matched) highlightCell(matched, false);
    }
  }, [selectedSupporterId, highlightedCellId, cells, highlightCell]);

  // Zoom Controls
  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.4, 3.5));
  };

  const handleZoomOut = () => {
    setScale(prev => {
      const next = Math.max(prev - 0.4, 1);
      if (next === 1) setPan({ x: 0, y: 0 });
      return next;
    });
  };

  const handleResetZoom = () => {
    setScale(1);
    setPan({ x: 0, y: 0 });
    setSpotlightCellId(null);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Mouse wheel zoom (smooth and bounded)
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    // Only zoom on wheel if ctrlKey is pressed or container has active focus
    if (!e.ctrlKey && scale === 1) {
      return; // allow natural page scrolling when at 100% zoom
    }
    e.preventDefault();
    if (!containerRef.current) return;

    const zoomFactor = e.deltaY < 0 ? 1.12 : 0.9;
    const newScale = Math.min(Math.max(scale * zoomFactor, 1), 3.5);

    if (newScale === 1) {
      setScale(1);
      setPan({ x: 0, y: 0 });
      return;
    }

    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left - rect.width / 2;
    const mouseY = e.clientY - rect.top - rect.height / 2;

    const newPanX = mouseX - (mouseX - pan.x) * (newScale / scale);
    const newPanY = mouseY - (mouseY - pan.y) * (newScale / scale);

    setScale(newScale);
    setPan({ x: newPanX, y: newPanY });
  };

  // Drag / Pan handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    if (scale <= 1) return; // Only pan when zoomed in
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const newPanX = e.clientX - dragStart.x;
    const newPanY = e.clientY - dragStart.y;

    const maxBoundX = (scale - 1) * 380;
    const maxBoundY = (scale - 1) * 320;

    setPan({
      x: Math.max(Math.min(newPanX, maxBoundX), -maxBoundX),
      y: Math.max(Math.min(newPanY, maxBoundY), -maxBoundY)
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch handlers for mobile
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      touchStartDistRef.current = Math.hypot(dx, dy);
      touchStartScaleRef.current = scale;
    } else if (e.touches.length === 1 && scale > 1) {
      setIsDragging(true);
      setDragStart({ x: e.touches[0].clientX - pan.x, y: e.touches[0].clientY - pan.y });
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 2 && touchStartDistRef.current !== null) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const currentDist = Math.hypot(dx, dy);
      const zoomRatio = currentDist / touchStartDistRef.current;
      const newScale = Math.min(Math.max(touchStartScaleRef.current * zoomRatio, 1), 3.5);
      setScale(newScale);
    } else if (e.touches.length === 1 && isDragging) {
      const newPanX = e.touches[0].clientX - dragStart.x;
      const newPanY = e.touches[0].clientY - dragStart.y;
      setPan({ x: newPanX, y: newPanY });
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    touchStartDistRef.current = null;
  };

  // Cell Hover & Click Handlers
  const handleCellHover = (cell: MosaicCell, e: React.MouseEvent) => {
    if (isDragging) return;
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const cursorX = e.clientX - rect.left;
    const cursorY = e.clientY - rect.top;

    let fullCell = cell;
    if (cell.supporterId && !cell.supporter) {
      const sup = supporterMap.get(cell.supporterId);
      if (sup) fullCell = { ...cell, supporter: sup };
    }

    setHoveredCell(fullCell);
    setTooltipPos({ x: cursorX, y: cursorY });
  };

  const handleCellLeave = () => {
    // Only clear on desktop mouse leave if no spotlight is active
    if (!spotlightCellId) {
      setHoveredCell(null);
    }
  };

  const handleCellClick = (cell: MosaicCell) => {
    if (isDragging) return;

    if (allowAdminEdit && onCellClickAdmin) {
      onCellClickAdmin(cell);
      return;
    }

    let fullCell = cell;
    if (cell.supporterId && !cell.supporter) {
      const sup = supporterMap.get(cell.supporterId);
      if (sup) fullCell = { ...cell, supporter: sup };
    }

    setSpotlightCellId(cell.cellId);
    setHoveredCell(fullCell);

    const sup = fullCell.supporter || (fullCell.supporterId ? supporterMap.get(fullCell.supporterId) : undefined);
    if (sup && onSelectSupporter) {
      onSelectSupporter(sup);
    } else if (!sup && onOpenOrderModal) {
      onOpenOrderModal();
    }
  };

  // Dynamic Tooltip position calculator that prevents clipping at top, bottom, left and right edges
  const getTooltipStyle = () => {
    if (!containerRef.current) return { left: `${tooltipPos.x}px`, top: `${tooltipPos.y}px` };

    const containerW = containerRef.current.clientWidth || 800;
    const containerH = containerRef.current.clientHeight || 600;

    const cardWidth = 280; // approximate width of the card
    const cardHeight = 160; // approximate height of the card

    // Vertical flip: if near the top edge (< 165px), display BELOW the cell, otherwise ABOVE
    const showBelow = tooltipPos.y < 165;

    let topPx = showBelow ? tooltipPos.y + 26 : tooltipPos.y - 12;
    let translateY = showBelow ? '0%' : '-100%';

    // Clamp vertical to prevent overflowing bottom
    if (showBelow && topPx + cardHeight > containerH - 16) {
      topPx = Math.max(16, containerH - cardHeight - 16);
    }
    if (!showBelow && topPx < 16) {
      topPx = 16;
      translateY = '0%';
    }

    // Horizontal alignment & clamping:
    let leftPx = tooltipPos.x;
    let translateX = '-50%';

    if (tooltipPos.x < cardWidth / 2 + 16) {
      // Near left boundary: align from left
      leftPx = 16;
      translateX = '0%';
    } else if (tooltipPos.x > containerW - cardWidth / 2 - 16) {
      // Near right boundary: align from right
      leftPx = containerW - 16;
      translateX = '-100%';
    }

    return {
      left: `${leftPx}px`,
      top: `${topPx}px`,
      transform: `translate(${translateX}, ${translateY})`
    };
  };

  return (
    <div className="space-y-4 select-none" id="india-mosaic-interactive-wrapper">
      {/* Top Controls Bar */}
      <div className="bg-white dark:bg-stone-900 rounded-3xl border border-[#E7E2DA] dark:border-stone-800 p-3 sm:p-4 shadow-sm flex flex-wrap items-center justify-between gap-3">
        {/* Region Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none max-w-full sm:max-w-xl">
          <span className="text-xs font-semibold text-[#78716C] dark:text-stone-400 flex items-center gap-1 shrink-0 mr-1">
            <Compass className="w-3.5 h-3.5 text-[#C2410C] dark:text-amber-400" />
            Region:
          </span>
          {(['all', 'north', 'west', 'central', 'south', 'east', 'northeast', 'islands'] as RegionFilter[]).map(reg => (
            <button
              key={reg}
              onClick={() => setSelectedRegion(reg)}
              className={`px-3 py-1 rounded-full text-xs font-medium capitalize transition-all cursor-pointer shrink-0 ${
                selectedRegion === reg
                  ? 'bg-[#C2410C] text-white shadow-xs font-semibold'
                  : 'bg-stone-100 dark:bg-stone-800 text-[#57534E] dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
              }`}
            >
              {reg === 'all' ? 'All India' : reg}
            </button>
          ))}
        </div>

        {/* Search & Modes */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          {/* Quick Supporter Search */}
          <div className="relative flex-1 sm:w-64">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#A8A29E]" />
              <input
                type="text"
                placeholder="Find supporter # / name..."
                value={searchQuery}
                onChange={e => {
                  setSearchQuery(e.target.value);
                  setIsSearchOpen(true);
                }}
                onFocus={() => setIsSearchOpen(true)}
                className="w-full pl-8 pr-3 py-1.5 bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-full text-xs text-[#1C1917] dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#C2410C]/40"
              />
            </div>

            {/* Live Search Dropdown */}
            {isSearchOpen && searchResults.length > 0 && (
              <div className="absolute top-full right-0 left-0 mt-1.5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-2xl shadow-xl z-50 overflow-hidden max-h-64 overflow-y-auto">
                <div className="p-2 border-b border-stone-100 dark:border-stone-800 text-[11px] font-bold uppercase text-stone-400">
                  Supporters Found ({searchResults.length})
                </div>
                {searchResults.map(sup => {
                  const cell = cells.find(c => c.supporterId === sup.id);
                  return (
                    <button
                      key={sup.id}
                      onClick={() => {
                        setIsSearchOpen(false);
                        setSearchQuery(sup.fullName);
                        if (cell) {
                          highlightCell(cell, true);
                        }
                        if (onSelectSupporter) {
                          onSelectSupporter(sup);
                        }
                      }}
                      className="w-full px-3 py-2 text-left hover:bg-stone-50 dark:hover:bg-stone-800/60 flex items-center gap-2.5 transition-colors border-b border-stone-50 dark:border-stone-800/40 last:border-0 cursor-pointer"
                    >
                      <SupporterAvatar
                        photoUrl={sup.photoUrl}
                        name={sup.fullName}
                        supporterNumber={sup.supporterNumber}
                        id={sup.id}
                        size="xs"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-[#1C1917] dark:text-stone-100 truncate">
                          {sup.fullName} <span className="text-[#C2410C] font-semibold">#{sup.supporterNumber}</span>
                        </div>
                        <div className="text-[11px] text-stone-400 truncate">
                          {sup.city}, {sup.state}
                        </div>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* View Mode Switch */}
          <div className="flex items-center bg-stone-100 dark:bg-stone-800 p-0.5 rounded-full border border-stone-200 dark:border-stone-700">
            <button
              onClick={() => setViewMode('artwork')}
              className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                viewMode === 'artwork'
                  ? 'bg-white dark:bg-stone-700 text-[#1C1917] dark:text-white shadow-2xs'
                  : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
              }`}
            >
              Artwork
            </button>
            <button
              onClick={() => setViewMode('hotspots')}
              className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                viewMode === 'hotspots'
                  ? 'bg-white dark:bg-stone-700 text-[#1C1917] dark:text-white shadow-2xs'
                  : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
              }`}
            >
              <Users className="w-3 h-3 text-[#C2410C]" />
              Hotspots
            </button>
            <button
              onClick={() => setShowGridOutline(!showGridOutline)}
              className={`px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                showGridOutline ? 'bg-[#C2410C] text-white' : 'text-stone-500'
              }`}
              title="Show Available Grid Cells"
            >
              <Grid className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Interactive Map Container (100% Zoom Default) */}
      <div
        ref={containerRef}
        id="interactive-india-mosaic-canvas"
        className={`relative w-full aspect-[1488/1291] min-h-[460px] sm:min-h-[560px] max-h-[820px] rounded-3xl overflow-hidden border border-stone-800 shadow-2xl bg-[#091117] transition-all ${
          scale > 1 ? (isDragging ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-default'
        } ${isFullscreen ? 'fixed inset-0 z-50 rounded-none max-h-none h-screen' : ''}`}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Subtle Background Ambience */}
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,rgba(194,65,12,0.06)_0,transparent_75%)]" />

        {/* Transformable Canvas Layer */}
        <div
          className="absolute inset-0 w-full h-full origin-center select-none will-change-transform"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
            transition: isDragging ? 'none' : 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
        >
          {/* Base Layer: Exact Uploaded Mosaic Image */}
          <img
            src="/assets/mosaic_map-1.jpg"
            alt="Living Mosaic India Map"
            className="w-full h-full object-fill pointer-events-none block"
            draggable={false}
          />

          {/* Interactive Precise Grid Tiles */}
          <div className="absolute inset-0 w-full h-full pointer-events-auto">
            {cells.map(cell => {
              const isOccupied = !!(cell.supporterId || cell.supporter);
              const sup = cell.supporter || (cell.supporterId ? supporterMap.get(cell.supporterId) : undefined);
              const isSpotlighted = spotlightCellId === cell.cellId;
              const isHovered = hoveredCell?.cellId === cell.cellId;

              // Filter by region if chosen
              const cellRegion = cell.region || (sup ? getRegionForLocation(sup.city, sup.state) : cell.supporter?.region);
              const isRegionMatched = selectedRegion === 'all' || cellRegion === selectedRegion;
              if (!isRegionMatched && selectedRegion !== 'all' && isOccupied) {
                return null;
              }

              const cellLeft = cell.leftPercent ?? ((cell.x / 41) * 100);
              const cellTop = cell.topPercent ?? ((cell.y / 48) * 100);
              const cellWidth = cell.widthPercent ?? 1.344;
              const cellHeight = cell.heightPercent ?? 1.549;

              return (
                <div
                  key={cell.cellId}
                  id={`mosaic-cell-${cell.x}-${cell.y}`}
                  style={{
                    left: `${cellLeft}%`,
                    top: `${cellTop}%`,
                    width: `${cellWidth}%`,
                    height: `${cellHeight}%`
                  }}
                  onMouseEnter={e => handleCellHover(cell, e)}
                  onMouseLeave={handleCellLeave}
                  onClick={() => handleCellClick(cell)}
                  className={`absolute group cursor-pointer transition-all duration-150 ${
                    showGridOutline && !isOccupied
                      ? 'border border-white/20 hover:border-amber-400 bg-white/5'
                      : ''
                  } ${
                    isOccupied
                      ? 'z-20'
                      : 'hover:bg-amber-400/30 hover:border hover:border-amber-400/80 z-10'
                  } ${selectedRegion !== 'all' && !isRegionMatched ? 'opacity-30' : 'opacity-100'}`}
                >
                  {/* Occupied Tile: Render Profile Photo or Traveler Avatar fitted inside grid box */}
                  {isOccupied && sup && (
                    <div
                      className={`w-full h-full rounded-[2px] overflow-hidden relative flex items-center justify-center transition-all ${
                        isSpotlighted
                          ? 'ring-3 ring-amber-300 ring-offset-2 ring-offset-black scale-150 sm:scale-175 z-40 shadow-[0_0_20px_rgba(251,191,36,1)]'
                          : isHovered
                          ? 'ring-2 ring-white scale-150 sm:scale-175 z-40 shadow-[0_0_15px_rgba(255,255,255,0.9)]'
                          : 'border-1.5 border-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.6)] hover:scale-125 hover:z-30'
                      }`}
                    >
                      <MosaicTileAvatar sup={sup} />

                      {/* Radar pulse dot */}
                      <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping opacity-75 pointer-events-none" />
                      <span className="absolute -top-0.5 -right-0.5 w-1 h-1 rounded-full bg-amber-300 shadow-xs pointer-events-none" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Hover Tooltip Card (Desktop & Hover with Smart Inversion and Clamping) */}
        {hoveredCell && (
          <div
            id="mosaic-hover-card"
            className="absolute z-50 pointer-events-none transition-all duration-100 ease-out hidden sm:block"
            style={getTooltipStyle()}
          >
            {hoveredCell.supporter || hoveredCell.supporterId ? (
              // OCCUPIED SUPPORTER CARD
              <div className="bg-[#1C1917]/95 text-white backdrop-blur-md rounded-2xl border border-amber-500/50 p-3.5 shadow-[0_10px_35px_rgba(0,0,0,0.8)] w-68 sm:w-76 space-y-2.5 animate-fadeIn ring-1 ring-white/10">
                <div className="flex items-center gap-3">
                  <SupporterAvatar
                    photoUrl={hoveredCell.supporter?.photoUrl}
                    name={hoveredCell.supporter?.fullName || 'Supporter'}
                    supporterNumber={hoveredCell.supporter?.supporterNumber}
                    id={hoveredCell.supporter?.id}
                    size="sm"
                    className="shadow-md ring-2 ring-amber-400 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-bold text-sm text-white truncate">
                        {hoveredCell.supporter?.fullName || 'Supporter'}
                      </h4>
                      <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-black px-1.5 py-0.2 rounded-full">
                        #{hoveredCell.supporter?.supporterNumber || '—'}
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-300 flex items-center gap-1 mt-0.5 truncate">
                      <MapPin className="w-3 h-3 text-[#C2410C] shrink-0" />
                      <span>
                        {[hoveredCell.supporter?.city, hoveredCell.supporter?.state].filter(Boolean).join(', ') || 'India'}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Region Tag */}
                {(() => {
                  const r = hoveredCell.region || (hoveredCell.supporter ? getRegionForLocation(hoveredCell.supporter.city, hoveredCell.supporter.state) : undefined);
                  return r ? (
                    <div className="flex items-center gap-1.5 flex-wrap text-[10px]">
                      <span className="bg-white/10 text-amber-300 px-2 py-0.5 rounded-full font-semibold capitalize border border-white/10">
                        {r} India
                      </span>
                    </div>
                  ) : null;
                })()}

                {/* Quote */}
                {hoveredCell.supporter?.travelComment && (
                  <div className="bg-white/10 rounded-xl p-2 text-xs italic text-stone-200 leading-snug line-clamp-2 border border-white/5">
                    "{hoveredCell.supporter.travelComment}"
                  </div>
                )}

                {/* Footer Action */}
                <div className="pt-1 border-t border-white/10 flex items-center justify-between text-[10px] text-stone-400 font-medium">
                  <span className="text-amber-300 font-semibold truncate max-w-[130px]">
                    Verified Backer
                  </span>
                  <span className="flex items-center gap-1 text-white font-semibold shrink-0">
                    Click for full story <ExternalLink className="w-2.5 h-2.5" />
                  </span>
                </div>
              </div>
            ) : (
              // VACANT SPOT CARD (Clean: No Fake Static Region/City)
              <div className="bg-[#1C1917]/95 text-white backdrop-blur-md rounded-2xl border border-amber-500/50 p-3.5 shadow-[0_10px_35px_rgba(0,0,0,0.8)] w-68 space-y-2.5 animate-fadeIn ring-1 ring-white/10">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-sm border border-amber-500/40 shrink-0">
                    +
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-white block">Available Mosaic Slot</span>
                    <span className="text-[10px] text-amber-300 font-medium block">
                      Open Spot • Ready to Claim
                    </span>
                  </div>
                </div>
                <p className="text-[11px] text-stone-300 leading-snug">
                  Claim this spot in the Living India Mosaic. Your verified location will be dynamically anchored here.
                </p>
                <div className="text-[10px] text-amber-300 font-semibold pt-1.5 border-t border-white/10 flex items-center justify-between">
                  <span>Pre-order & Claim Spot</span>
                  <Sparkles className="w-3 h-3 text-amber-400" />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Fullscreen Floating Controls (Only shown in Fullscreen mode so canvas is clean) */}
        {isFullscreen && (
          <div className="absolute bottom-6 right-6 z-50 bg-black/80 backdrop-blur-md rounded-2xl border border-white/20 p-2 flex items-center gap-2 shadow-2xl text-white">
            <button
              onClick={handleZoomIn}
              className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 flex items-center justify-center transition-all cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4 text-stone-200" />
            </button>
            <div className="text-xs font-mono font-bold px-2 text-amber-400 min-w-12 text-center">
              {Math.round(scale * 100)}%
            </div>
            <button
              onClick={handleZoomOut}
              className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 flex items-center justify-center transition-all cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4 text-stone-200" />
            </button>
            <div className="w-px h-5 bg-white/20 mx-0.5" />
            <button
              onClick={handleResetZoom}
              className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 flex items-center justify-center transition-all cursor-pointer"
              title="Reset 100% View"
            >
              <RotateCcw className="w-4 h-4 text-stone-200" />
            </button>
            <button
              onClick={toggleFullscreen}
              className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 flex items-center justify-center transition-all cursor-pointer"
              title="Exit Fullscreen"
            >
              <Minimize2 className="w-4 h-4 text-stone-200" />
            </button>
          </div>
        )}

        {/* Live Counter Badge (Top Left) */}
        <div className="absolute top-4 left-4 z-40 bg-black/75 backdrop-blur-md rounded-2xl border border-white/15 px-3 py-1.5 flex items-center gap-2.5 shadow-xl text-white pointer-events-none">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <div className="text-xs font-semibold">
            <span className="text-amber-400 font-bold">{occupiedCount}</span> / 1,000 Spots Claimed
          </div>
        </div>
      </div>

      {/* Mobile Active Cell Spotlight Card (Rendered directly BELOW the map so lower grid cells are 100% accessible) */}
      {hoveredCell && (
        <div className="sm:hidden animate-slideUp">
          <div className="bg-[#1C1917] text-white border border-amber-500/40 rounded-2xl p-3.5 shadow-xl">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                {hoveredCell.supporter ? (
                  <SupporterAvatar
                    photoUrl={hoveredCell.supporter.photoUrl}
                    name={hoveredCell.supporter.fullName}
                    supporterNumber={hoveredCell.supporter.supporterNumber}
                    id={hoveredCell.supporter.id}
                    size="sm"
                    className="ring-2 ring-amber-400 shrink-0"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-sm border border-amber-500/40 shrink-0">
                    +
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-bold text-xs text-white truncate">
                      {hoveredCell.supporter?.fullName || 'Available Mosaic Slot'}
                    </h4>
                    {hoveredCell.supporter?.supporterNumber && (
                      <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[9px] font-black px-1.5 rounded-full">
                        #{hoveredCell.supporter.supporterNumber}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-stone-300 truncate mt-0.5">
                    {hoveredCell.supporter
                      ? [hoveredCell.supporter.city, hoveredCell.supporter.state].filter(Boolean).join(', ') || 'India'
                      : 'Open Spot • Ready to Claim'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => handleCellClick(hoveredCell)}
                  className="px-3 py-1.5 bg-[#C2410C] hover:bg-[#9A3412] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-xs"
                >
                  {hoveredCell.supporter ? 'Story' : 'Claim'}
                </button>
                <button
                  onClick={() => {
                    setHoveredCell(null);
                    setSpotlightCellId(null);
                  }}
                  className="p-1.5 text-stone-400 hover:text-white rounded-xl bg-white/10 cursor-pointer"
                  title="Close Card"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dedicated Zoom & View Controls Ribbon (Positioned BELOW the map window for 100% Unobstructed Mobile & Desktop View) */}
      <div
        id="mosaic-viewport-controls"
        className="flex flex-wrap items-center justify-between gap-3 bg-[#131110] dark:bg-stone-900/90 text-stone-200 border border-stone-800 rounded-2xl p-2.5 sm:px-4 shadow-lg"
      >
        {/* Left: Quick Instructions & Live Status */}
        <div className="flex items-center gap-2 text-xs text-stone-400">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
          <span className="hidden sm:inline">Pinch / drag map to pan • Click any cell to inspect supporter details</span>
          <span className="sm:hidden text-[11px]">Drag/pinch to explore mosaic</span>
        </div>

        {/* Right: Zoom In, Percentage, Zoom Out, Reset, Fullscreen */}
        <div className="flex items-center gap-1.5 ml-auto">
          <button
            onClick={handleZoomIn}
            className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 flex items-center justify-center transition-all cursor-pointer text-stone-200"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <div className="text-xs font-mono font-bold px-2.5 text-amber-400 min-w-12 text-center bg-black/40 py-1 rounded-lg border border-white/5">
            {Math.round(scale * 100)}%
          </div>
          <button
            onClick={handleZoomOut}
            className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 flex items-center justify-center transition-all cursor-pointer text-stone-200"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <div className="w-px h-5 bg-white/20 mx-1" />
          <button
            onClick={handleResetZoom}
            className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 flex items-center justify-center transition-all cursor-pointer text-stone-200"
            title="Reset 100% View"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={toggleFullscreen}
            className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 flex items-center justify-center transition-all cursor-pointer text-stone-200"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Map Legend */}
      <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-[#78716C] dark:text-stone-400 px-2">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs border border-amber-400 bg-amber-500/40 shadow-xs" />
            <strong className="text-[#1C1917] dark:text-stone-200">Claimed Slot:</strong> Supporter profile photo
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs border border-stone-600 bg-stone-800/40" />
            <strong className="text-[#1C1917] dark:text-stone-200">Available Slot:</strong> Click to pre-order
          </span>
          <span className="flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-[#C2410C]" />
            Supporters are positioned directly within their home states
          </span>
        </div>

        {onOpenOrderModal && (
          <button
            onClick={onOpenOrderModal}
            className="px-4 py-1.5 bg-[#C2410C] hover:bg-[#9A3412] text-white font-bold rounded-full transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            Claim Your Spot on the Map
          </button>
        )}
      </div>
    </div>
  );
};
