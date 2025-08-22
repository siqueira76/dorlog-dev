import { UnifiedReportService, UnifiedReportOptions } from '@/services/unifiedReportService';

/**
 * Utility functions for unified report generation
 */

/**
 * Quick report generation function
 */
export async function generateQuickReport(
  userId: string, 
  startDate: string, 
  endDate: string
) {
  const periods = [`${startDate}_${endDate}`];
  const periodsText = formatPeriodRange(startDate, endDate);
  
  const options: UnifiedReportOptions = {
    userId,
    periods,
    periodsText
  };
  
  return await UnifiedReportService.generateReport(options);
}

/**
 * Generate report with password protection
 */
export async function generateProtectedReport(
  userId: string,
  periods: string[],
  periodsText: string,
  password: string
) {
  const options: UnifiedReportOptions = {
    userId,
    periods,
    periodsText,
    withPassword: true,
    password
  };
  
  return await UnifiedReportService.generateReport(options);
}

/**
 * Format period range for display
 */
export function formatPeriodRange(startDate: string, endDate: string): string {
  const start = new Date(startDate).toLocaleDateString('pt-BR');
  const end = new Date(endDate).toLocaleDateString('pt-BR');
  return `${start} - ${end}`;
}

/**
 * Convert date range to period strings
 */
export function datesToPeriods(dateRanges: { start: Date; end: Date }[]): string[] {
  return dateRanges.map(range => {
    const start = range.start.toISOString().split('T')[0];
    const end = range.end.toISOString().split('T')[0];
    return `${start}_${end}`;
  });
}

/**
 * Validate period strings
 */
export function validatePeriods(periods: string[]): boolean {
  return periods.every(period => {
    const [start, end] = period.split('_');
    
    if (!start || !end) return false;
    
    const startDate = new Date(start);
    const endDate = new Date(end);
    
    return !isNaN(startDate.getTime()) && 
           !isNaN(endDate.getTime()) &&
           startDate <= endDate;
  });
}

/**
 * Get system readiness status
 */
export function getUnifiedSystemStatus() {
  return UnifiedReportService.checkConfiguration();
}

/**
 * Generate test data periods for demo
 */
export function generateTestPeriods(): { periods: string[]; periodsText: string } {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30); // Last 30 days
  
  const periods = [
    `${startDate.toISOString().split('T')[0]}_${endDate.toISOString().split('T')[0]}`
  ];
  
  const periodsText = formatPeriodRange(
    startDate.toISOString().split('T')[0],
    endDate.toISOString().split('T')[0]
  );
  
  return { periods, periodsText };
}