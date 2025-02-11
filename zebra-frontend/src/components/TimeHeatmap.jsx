"use client";

import { useState, useEffect } from 'react';
import { format, eachDayOfInterval, subYears, isSameDay, addDays, startOfWeek, getDay } from 'date-fns';

function getContributionLevel(hours) {
  if (hours === 0) return 0;
  if (hours < 1) return 1;
  if (hours < 3) return 2;
  if (hours < 5) return 3;
  return 4;
}

export default function TimeHeatmap({ sessions }) {
  const [heatmapData, setHeatmapData] = useState([]);
  const [hoveredDay, setHoveredDay] = useState(null);
  
  useEffect(() => {
    // Get dates for the last year
    const endDate = new Date();
    const startDate = subYears(endDate, 1);
    const daysArray = eachDayOfInterval({ start: startDate, end: endDate });

    // Calculate hours for each day
    const dayData = daysArray.map(day => {
      const daySessions = sessions.filter(session => 
        isSameDay(new Date(session.startTime), day)
      );
      
      const totalHours = daySessions.reduce((acc, session) => 
        acc + (session.duration || 0) / (1000 * 60 * 60), 0
      );

      return {
        date: day,
        hours: totalHours,
        level: getContributionLevel(totalHours),
        sessions: daySessions
      };
    });

    // Fill in missing days at the start to align with the week
    const firstDay = dayData[0].date;
    const daysToAdd = getDay(firstDay);
    for (let i = 0; i < daysToAdd; i++) {
      const date = addDays(firstDay, -(i + 1));
      dayData.unshift({
        date,
        hours: 0,
        level: 0,
        sessions: []
      });
    }

    setHeatmapData(dayData);
  }, [sessions]);

  const weeks = [];
  for (let i = 0; i < heatmapData.length; i += 7) {
    weeks.push(heatmapData.slice(i, i + 7));
  }

  const formatTooltipDate = (date) => {
    return format(date, 'MMM d, yyyy');
  };

  const formatHours = (hours) => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    if (h === 0) return `${m}m`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}m`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Time Contributions</h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Less</span>
          <div className="flex gap-1">
            {[0, 1, 2, 3, 4].map(level => (
              <div
                key={level}
                className={`h-3 w-3 rounded-sm ${
                  level === 0
                    ? 'bg-gray-100'
                    : level === 1
                    ? 'bg-emerald-200'
                    : level === 2
                    ? 'bg-emerald-400'
                    : level === 3
                    ? 'bg-emerald-600'
                    : 'bg-emerald-800'
                }`}
              />
            ))}
          </div>
          <span className="text-sm text-gray-600">More</span>
        </div>
      </div>

      <div className="relative">
        <div className="flex text-xs text-gray-500 mb-2">
          <div className="w-8" />
          <div className="flex-1 grid grid-cols-[repeat(53,_minmax(0,_1fr))] gap-1">
            {Array.from({ length: 12 }).map((_, i) => {
              const date = addDays(heatmapData[0]?.date || new Date(), i * 28);
              return (
                <div key={i} className="col-span-4 text-center">
                  {format(date, 'MMM')}
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex">
          <div className="w-8 grid grid-rows-7 text-xs text-gray-500 text-center gap-1 pt-1">
            <span>Mon</span>
            <span>Wed</span>
            <span>Fri</span>
          </div>
          <div className="flex-1 grid grid-cols-[repeat(53,_minmax(0,_1fr))] gap-1">
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="grid grid-rows-7 gap-1">
                {week.map((day, dayIndex) => (
                  <div
                    key={dayIndex}
                    className={`
                      relative h-3 w-3 rounded-sm cursor-pointer
                      ${
                        day.level === 0
                          ? 'bg-gray-100'
                          : day.level === 1
                          ? 'bg-emerald-200'
                          : day.level === 2
                          ? 'bg-emerald-400'
                          : day.level === 3
                          ? 'bg-emerald-600'
                          : 'bg-emerald-800'
                      }
                      hover:ring-2 hover:ring-black/5 hover:ring-offset-1
                    `}
                    onMouseEnter={() => setHoveredDay(day)}
                    onMouseLeave={() => setHoveredDay(null)}
                  >
                    {hoveredDay === day && (
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-50">
                        <div className="bg-gray-900 text-white text-xs rounded-lg py-2 px-3 whitespace-nowrap">
                          <div className="font-medium">
                            {formatTooltipDate(day.date)}
                          </div>
                          <div>
                            {day.hours === 0
                              ? 'No time logged'
                              : `${formatHours(day.hours)} logged`}
                          </div>
                          {day.sessions.length > 0 && (
                            <div className="text-gray-300">
                              {day.sessions.length} session{day.sessions.length !== 1 ? 's' : ''}
                            </div>
                          )}
                        </div>
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1.5">
                          <div className="border-8 border-transparent border-t-gray-900" />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
