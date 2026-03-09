'use client';

import React, { useState, useRef, useEffect } from 'react';

interface DatePickerProps {
    label?: string;
    value: string;
    onChange: (date: string) => void;
    required?: boolean;
    error?: string;
    className?: string;
    maxDate?: Date;
    minDate?: Date;
}

export function DatePicker({
    label,
    value,
    onChange,
    required,
    error,
    className = '',
    maxDate,
    minDate
}: DatePickerProps) {
    const [isOpen, setIsOpen] = useState(false);

    // Parse the value to get the selected date
    const selectedDate = value ? new Date(value.includes('T') ? value : value + 'T00:00:00') : null;

    // Initialize currentMonth based on value or today's date
    const getInitialMonth = () => {
        if (selectedDate && !isNaN(selectedDate.getTime())) {
            return new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
        }
        return new Date();
    };

    const [currentMonth, setCurrentMonth] = useState(getInitialMonth());
    const calendarRef = useRef<HTMLDivElement>(null);
    const initializedRef = useRef(false);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [isOpen]);

    // Update currentMonth when value changes (but only if calendar is closed)
    useEffect(() => {
        if (!isOpen && selectedDate && !isNaN(selectedDate.getTime())) {
            const newMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
            setCurrentMonth(newMonth);
        }
    }, [value, isOpen]);

    const formatDisplayDate = (dateString: string): string => {
        if (!dateString) return '';
        const date = new Date(dateString.includes('T') ? dateString : dateString + 'T00:00:00');
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    };

    const formatInputValue = (date: Date): string => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const handleDateSelect = (date: Date) => {
        if (maxDate && date > maxDate) return;
        if (minDate && date < minDate) return;

        onChange(formatInputValue(date));
        setIsOpen(false);
    };

    const getDaysInMonth = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (date: Date) => {
        const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
        return firstDay.getDay();
    };

    const handlePrevMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
    };

    const handleYearChange = (year: number) => {
        setCurrentMonth((prevMonth) => new Date(year, prevMonth.getMonth(), 1));
    };

    const handleMonthChange = (month: number) => {
        setCurrentMonth((prevMonth) => new Date(prevMonth.getFullYear(), month, 1));
    };

    const handleToday = () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        handleDateSelect(today);
    };

    // Generate year options (from 1900 to current year + 10)
    const getYearOptions = () => {
        const currentYear = new Date().getFullYear();
        const startYear = 1900;
        const endYear = currentYear + 10;
        const years = [];
        for (let year = endYear; year >= startYear; year--) {
            years.push(year);
        }
        return years;
    };

    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
        days.push(null);
    }

    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
        days.push(day);
    }

    const isToday = (day: number) => {
        const today = new Date();
        return (
            day === today.getDate() &&
            currentMonth.getMonth() === today.getMonth() &&
            currentMonth.getFullYear() === today.getFullYear()
        );
    };

    const isSelected = (day: number) => {
        if (!selectedDate) return false;
        return (
            day === selectedDate.getDate() &&
            currentMonth.getMonth() === selectedDate.getMonth() &&
            currentMonth.getFullYear() === selectedDate.getFullYear()
        );
    };

    const isDisabled = (day: number) => {
        const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
        if (maxDate && date > maxDate) return true;
        if (minDate && date < minDate) return true;
        return false;
    };

    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
        <div className={`w-full relative ${className}`} ref={calendarRef}>
            {label && (
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}
            <div className="relative">
                <input
                    type="text"
                    readOnly
                    value={formatDisplayDate(value)}
                    onClick={() => setIsOpen(!isOpen)}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer ${error ? 'border-red-500' : 'border-gray-300'
                        }`}
                    placeholder="Select a date"
                />
                <svg
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                </svg>
            </div>

            {isOpen && (
                <div className="absolute z-50 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-4 w-80">
                    {/* Calendar Header */}
                    <div className="flex items-center justify-between mb-4">
                        <button
                            type="button"
                            onClick={handlePrevMonth}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <div className="flex items-center gap-2">
                            <select
                                value={currentMonth.getMonth()}
                                onChange={(e) => handleMonthChange(parseInt(e.target.value))}
                                className="px-3 py-1 text-base font-semibold text-gray-800 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                            >
                                {monthNames.map((month, index) => (
                                    <option key={month} value={index}>
                                        {month}
                                    </option>
                                ))}
                            </select>
                            <select
                                value={currentMonth.getFullYear()}
                                onChange={(e) => handleYearChange(parseInt(e.target.value))}
                                className="px-3 py-1 text-base font-semibold text-gray-800 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                            >
                                {getYearOptions().map((year) => (
                                    <option key={year} value={year}>
                                        {year}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <button
                            type="button"
                            onClick={handleNextMonth}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>

                    {/* Day Names */}
                    <div className="grid grid-cols-7 gap-1 mb-2">
                        {dayNames.map((day) => (
                            <div key={day} className="text-center text-sm font-medium text-gray-600 py-1">
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Calendar Days */}
                    <div className="grid grid-cols-7 gap-1">
                        {days.map((day, index) => {
                            if (day === null) {
                                return <div key={index} className="py-2" />;
                            }

                            const disabled = isDisabled(day);
                            const selected = isSelected(day);
                            const today = isToday(day);

                            return (
                                <button
                                    key={day}
                                    type="button"
                                    onClick={() => {
                                        const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
                                        handleDateSelect(date);
                                    }}
                                    disabled={disabled}
                                    className={`
                    py-2 text-sm rounded-lg transition-colors
                    ${disabled
                                            ? 'text-gray-300 cursor-not-allowed'
                                            : selected
                                                ? 'bg-blue-600 text-white font-semibold'
                                                : today
                                                    ? 'bg-blue-100 text-blue-700 font-semibold hover:bg-blue-200'
                                                    : 'text-gray-700 hover:bg-gray-100'
                                        }
                  `}
                                >
                                    {day}
                                </button>
                            );
                        })}
                    </div>

                    {/* Today Button */}
                    <div className="mt-4 pt-4 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={handleToday}
                            className="w-full px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                            Today
                        </button>
                    </div>
                </div>
            )}

            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        </div>
    );
}

