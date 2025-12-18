
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, getISOWeek, addDays, subDays } from 'date-fns';
import { de } from 'date-fns/locale';

/**
 * Calculates Easter Sunday for a given year using Meeus/Jones/Butcher algorithm
 */
export const getEaster = (year: number): Date => {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
};

/**
 * Checks if a date is a public holiday in Baden-Württemberg (BW), Germany
 */
export const isHolidayBW = (date: Date): boolean => {
  const d = date.getDate();
  const m = date.getMonth(); // 0-indexed
  const y = date.getFullYear();

  // Fixed date holidays
  if (d === 1 && m === 0) return true; // Neujahr
  if (d === 6 && m === 0) return true; // Heilige Drei Könige
  if (d === 1 && m === 4) return true; // Tag der Arbeit
  if (d === 3 && m === 9) return true; // Tag der Deutschen Einheit
  if (d === 1 && m === 10) return true; // Allerheiligen
  if (d === 25 && m === 11) return true; // 1. Weihnachtstag
  if (d === 26 && m === 11) return true; // 2. Weihnachtstag

  // Movable holidays based on Easter
  const easter = getEaster(y);
  const easterTime = easter.getTime();
  const dayMs = 24 * 60 * 60 * 1000;

  const karfreitag = new Date(easterTime - 2 * dayMs);
  const ostermontag = new Date(easterTime + 1 * dayMs);
  const christiHimmelfahrt = new Date(easterTime + 39 * dayMs);
  const pfingstmontag = new Date(easterTime + 50 * dayMs);
  const fronleichnam = new Date(easterTime + 60 * dayMs);

  const movableHolidays = [karfreitag, ostermontag, christiHimmelfahrt, pfingstmontag, fronleichnam];

  return movableHolidays.some(h => 
    h.getDate() === d && h.getMonth() === m && h.getFullYear() === y
  );
};

export const getSplitWeekData = (baseDate: Date) => {
  const startOfWk = startOfWeek(baseDate, { weekStartsOn: 1 });
  const endOfWk = endOfWeek(baseDate, { weekStartsOn: 1 });
  
  const daysInWeek = eachDayOfInterval({ start: startOfWk, end: endOfWk });
  
  const splitWeeks: { start: Date; end: Date; label: string; days: Date[] }[] = [];
  
  let currentStart = startOfWk;
  let currentDays: Date[] = [];
  
  for (let i = 0; i < daysInWeek.length; i++) {
    const day = daysInWeek[i];
    currentDays.push(day);
    
    const nextDay = daysInWeek[i + 1];
    
    // If next day is in a different month, or we are at the end of the week
    if (nextDay && !isSameMonth(day, nextDay)) {
      const kw = getISOWeek(day);
      splitWeeks.push({
        start: currentStart,
        end: day,
        label: `KW ${kw}`, // First part is just KW X
        days: [...currentDays]
      });
      currentStart = nextDay;
      currentDays = [];
    } else if (!nextDay) {
      const kw = getISOWeek(day);
      // If it was split before, this second part is KW X/1
      const label = splitWeeks.length > 0 ? `KW ${kw}/1` : `KW ${kw}`;
      splitWeeks.push({
        start: currentStart,
        end: day,
        label: label,
        days: [...currentDays]
      });
    }
  }
  
  return splitWeeks;
};

export const formatDateRange = (start: Date, end: Date) => {
  return `${format(start, 'dd.MM.yyyy')} - ${format(end, 'dd.MM.yyyy')}`;
};

export const getDayName = (date: Date) => {
  return format(date, 'EEEEEE', { locale: de });
};

export const getDayLabel = (date: Date) => {
  return format(date, 'dd.MM.');
};
