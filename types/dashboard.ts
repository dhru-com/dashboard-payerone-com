export interface DashboardStats {
  current_total: number;
  previous_total: number;
  change_percentage: number;
  label: string;
}

export interface DashboardChartDataset {
  label: string;
  data: number[];
  is_current: boolean;
}

export interface DashboardChartData {
  intervals: string[];
  datasets: DashboardChartDataset[];
}

export interface DashboardData {
  module: string;
  date: string;
  stats: DashboardStats;
  chart_data: DashboardChartData;
  currency_totals: unknown[];
}

export interface DashboardSummaryData {
  module: string;
  date: string;
  total_gross_volume: DashboardStats;
  express_wallet: DashboardStats;
}
