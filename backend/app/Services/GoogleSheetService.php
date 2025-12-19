<?php

namespace App\Services;

use Google\Client;
use Google\Service\Sheets;
use Google\Service\Sheets\ValueRange;
use App\Models\Job;
use Illuminate\Support\Facades\Log;

class GoogleSheetService
{
    protected $client;
    protected $service;
    protected $spreadsheetId;

    public function __construct()
    {
        $this->spreadsheetId = config('services.google.spreadsheet_id');
        
        if ($this->isConfigured()) {
            $this->initializeClient();
        }
    }

    /**
     * Check if Google Sheets is properly configured
     */
    public function isConfigured(): bool
    {
        $credentialsPath = $this->getCredentialsPath();
        return $this->spreadsheetId && $credentialsPath && file_exists($credentialsPath);
    }

    protected function getCredentialsPath(): string
    {
        $path = config('services.google.credentials_path');
        if ($path && !str_starts_with($path, '/') && !preg_match('/^[A-Z]:/i', $path)) {
            return base_path($path);
        }
        return $path ?? '';
    }

    /**
     * Initialize Google API Client
     */
    protected function initializeClient(): void
    {
        try {
            $this->client = new Client();
            $this->client->setApplicationName('Job Management System');
            $this->client->setScopes([Sheets::SPREADSHEETS]);
            $this->client->setAuthConfig($this->getCredentialsPath());
            $this->client->setAccessType('offline');
            
            $this->service = new Sheets($this->client);
        } catch (\Exception $e) {
            Log::error('Failed to initialize Google Sheets client: ' . $e->getMessage());
        }
    }

    /**
     * Get headers for the spreadsheet
     */
    protected function getHeaders(): array
    {
        return [
            'No', 'Tanggal', 'Kategori', 'Req By', 'Tiket All BNET',
            'ID-Nama/POP/ODP/JB', 'Tikor', 'Detail', 'Janji Datang',
            'Petugas 1', 'Petugas 2', 'Petugas 3', 'BA', 'Status', 'Remarks'
        ];
    }

    /**
     * Convert job to row data
     */
    protected function jobToRow(Job $job, $relativeNo = null): array
    {
        return [
            $relativeNo !== null ? (string) $relativeNo : (string) $job->no,
            $job->tanggal ? $job->tanggal->format('d/m/Y') : '',
            $job->kategori ?? '',
            $job->req_by ?? '',
            $job->tiket_all_bnet ?? '',
            $job->id_nama_pop_odp_jb ?? '',
            $job->tikor ?? '',
            $job->detail ?? '',
            $job->janji_datang ? (method_exists($job->janji_datang, 'format') ? $job->janji_datang->format('H:i') : $job->janji_datang) : '',
            $job->petugas_1 ?? '',
            $job->petugas_2 ?? '',
            $job->petugas_3 ?? '',
            $job->ba ? 'Ya' : 'Tidak',
            $job->status ?? '',
            $job->remarks ?? '',
        ];
    }

    /**
     * Create date header row
     */
    protected function createDateHeaderRow($date): array
    {
        $dateStr = $date ? $date->format('d/m/Y') : 'No Date';
        // Create row with date in Tanggal column (index 1), span to all columns
        $row = array_fill(0, 15, ''); // 15 columns (A-O)
        $row[1] = $dateStr; // Put date in Tanggal column
        return $row;
    }

    /**
     * Ensure headers exist in the spreadsheet
     */
    public function ensureHeaders(): bool
    {
        if (!$this->isConfigured() || !$this->service) {
            return false;
        }

        try {
            // Check if headers already exist
            $response = $this->service->spreadsheets_values->get(
                $this->spreadsheetId,
                'Sheet1!A1:O1'
            );
            
            $values = $response->getValues();
            
            if (empty($values)) {
                // Add headers
                $body = new ValueRange([
                    'values' => [$this->getHeaders()]
                ]);
                
                $this->service->spreadsheets_values->update(
                    $this->spreadsheetId,
                    'Sheet1!A1:O1',
                    $body,
                    ['valueInputOption' => 'RAW']
                );
            }
            
            return true;
        } catch (\Exception $e) {
            Log::error('Failed to ensure headers: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Find row number by job No
     */
    protected function findRowByJobNo($jobNo): ?int
    {
        try {
            $response = $this->service->spreadsheets_values->get(
                $this->spreadsheetId,
                'Sheet1!A:A'
            );
            
            $values = $response->getValues();
            
            if ($values) {
                foreach ($values as $index => $row) {
                    $cellValue = isset($row[0]) ? trim((string)$row[0]) : '';
                    $searchValue = trim((string)$jobNo);
                    
                    Log::debug("Comparing row {$index}: '{$cellValue}' vs '{$searchValue}'");
                    
                    if ($cellValue === $searchValue) {
                        return $index + 1; // Row numbers are 1-based
                    }
                }
            }
            
            return null;
        } catch (\Exception $e) {
            Log::error('Failed to find row by job No: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Sync job to Google Sheets (create or update)
     * For proper date grouping, we use full sync to maintain structure
     */
    public function syncJob(Job $job): bool
    {
        // Use full sync to ensure proper date grouping and formatting
        // This ensures date headers are always correct
        return $this->syncAllJobs();
    }

    /**
     * Delete job from Google Sheets
     */
    public function deleteJob($jobNo): bool
    {
        if (!$this->isConfigured() || !$this->service) {
            return false;
        }

        try {
            $rowNumber = $this->findRowByJobNo($jobNo);
            
            if ($rowNumber && $rowNumber > 1) {
                // Clear the row (Google Sheets API doesn't have direct delete)
                $range = "Sheet1!A{$rowNumber}:O{$rowNumber}";
                
                $this->service->spreadsheets_values->clear(
                    $this->spreadsheetId,
                    $range,
                    new \Google\Service\Sheets\ClearValuesRequest()
                );
                
                Log::info("Job No {$jobNo} deleted from Google Sheets at row {$rowNumber}");
                return true;
            }
            
            return false;
        } catch (\Exception $e) {
            Log::error('Failed to delete job from Google Sheets: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Sync all jobs to Google Sheets with date grouping
     */
    public function syncAllJobs(): bool
    {
        if (!$this->isConfigured() || !$this->service) {
            return false;
        }

        try {
            // Clear existing data (except headers)
            $this->service->spreadsheets_values->clear(
                $this->spreadsheetId,
                'Sheet1!A2:O',
                new \Google\Service\Sheets\ClearValuesRequest()
            );
            
            // Get all jobs ordered by tanggal desc, then no asc
            $jobs = Job::orderBy('tanggal', 'desc')
                ->orderByRaw('(no + 0) ASC')
                ->orderBy('created_at', 'asc')
                ->orderBy('id', 'asc')
                ->get();
            
            if ($jobs->isEmpty()) {
                return true;
            }
            
            // Group jobs by tanggal
            $grouped = [];
            foreach ($jobs as $job) {
                $dateKey = $job->tanggal ? $job->tanggal->format('Y-m-d') : 'no-date';
                if (!isset($grouped[$dateKey])) {
                    $grouped[$dateKey] = [];
                }
                $grouped[$dateKey][] = $job;
            }
            
            // Prepare all rows with date headers
            $rows = [$this->getHeaders()];
            $dateHeaderRows = []; // Track which rows are date headers for formatting (1-based, including header row)
            
            foreach ($grouped as $dateKey => $dateJobs) {
                // Add date header row
                $date = $dateJobs[0]->tanggal;
                $dateHeaderRow = $this->createDateHeaderRow($date);
                $rows[] = $dateHeaderRow;
                $dateHeaderRows[] = count($rows); // Store row number (1-based, including header row at row 1)
                
                // Add job rows with relative numbering (1, 2, 3, ...)
                foreach ($dateJobs as $index => $job) {
                    $rows[] = $this->jobToRow($job, $index + 1);
                }
            }
            
            // Write all data
            $body = new ValueRange([
                'values' => $rows
            ]);
            
            $this->service->spreadsheets_values->update(
                $this->spreadsheetId,
                'Sheet1!A1:O' . (count($rows)),
                $body,
                ['valueInputOption' => 'RAW']
            );
            
            // Apply formatting to date header rows (grey background)
            $this->formatDateHeaderRows($dateHeaderRows);
            
            Log::info('All jobs synced to Google Sheets with date grouping');
            return true;
        } catch (\Exception $e) {
            Log::error('Failed to sync all jobs to Google Sheets: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Format date header rows with grey background and merge cells
     */
    protected function formatDateHeaderRows(array $rowNumbers): void
    {
        if (empty($rowNumbers) || !$this->service) {
            return;
        }

        try {
            $requests = [];
            
            foreach ($rowNumbers as $rowNum) {
                // rowNum is 1-based (row 1 = header, row 2 = first data row, etc.)
                // Convert to 0-based index for Google Sheets API
                $rowIndex = $rowNum - 1;
                
                // Merge cells from column B (Tanggal, index 1) to column O (index 14)
                $requests[] = new \Google\Service\Sheets\Request([
                    'mergeCells' => [
                        'range' => [
                            'sheetId' => 0,
                            'startRowIndex' => $rowIndex,
                            'endRowIndex' => $rowIndex + 1,
                            'startColumnIndex' => 1, // Start from column B (Tanggal)
                            'endColumnIndex' => 15, // End at column O
                        ],
                        'mergeType' => 'MERGE_ALL',
                    ],
                ]);
                
                // Apply formatting to merged cells
                $requests[] = new \Google\Service\Sheets\Request([
                    'repeatCell' => [
                        'range' => [
                            'sheetId' => 0,
                            'startRowIndex' => $rowIndex,
                            'endRowIndex' => $rowIndex + 1,
                            'startColumnIndex' => 1, // Start from column B (Tanggal)
                            'endColumnIndex' => 15, // End at column O
                        ],
                        'cell' => [
                            'userEnteredFormat' => [
                                'backgroundColor' => [
                                    'red' => 0.4,
                                    'green' => 0.4,
                                    'blue' => 0.4,
                                ],
                                'textFormat' => [
                                    'foregroundColor' => [
                                        'red' => 1.0,
                                        'green' => 1.0,
                                        'blue' => 1.0,
                                    ],
                                    'bold' => true,
                                ],
                                'horizontalAlignment' => 'LEFT',
                            ],
                        ],
                        'fields' => 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment)',
                    ],
                ]);
            }
            
            if (!empty($requests)) {
                $batchUpdateRequest = new \Google\Service\Sheets\BatchUpdateSpreadsheetRequest([
                    'requests' => $requests
                ]);
                
                $this->service->spreadsheets->batchUpdate($this->spreadsheetId, $batchUpdateRequest);
            }
        } catch (\Exception $e) {
            Log::error('Failed to format date header rows: ' . $e->getMessage());
        }
    }
}

