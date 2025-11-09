export type Recording = {
  filename: string;
  path: string;
  url: string;          // "/videos/<file>.mp4"
  size_bytes: number;
  started_at: string;   // ISO8601
  duration_sec: number; // usually 600
};

export type Page<T> = {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  has_next: boolean;
  has_prev: boolean;
};