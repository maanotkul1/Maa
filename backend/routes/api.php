<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\HistoryJobController;
use App\Http\Controllers\Api\ToolDataController;
use App\Http\Controllers\Api\ToolController;
use App\Http\Controllers\Api\GoogleSheetController;
use App\Http\Controllers\Api\QRCodeController;
use Illuminate\Support\Facades\Route;

// Public routes
Route::post('/auth/login', [AuthController::class, 'login']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Auth
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);

    // Dashboard
    Route::get('/dashboard/admin', [DashboardController::class, 'admin']);
    Route::get('/dashboard/fe', [DashboardController::class, 'fe']);

    // Google Sheets
    Route::get('/sheets/status', [GoogleSheetController::class, 'status']);
    Route::post('/sheets/sync-history-jobs', [GoogleSheetController::class, 'syncHistoryJobs']);
    Route::post('/sheets/sync-tools', [GoogleSheetController::class, 'syncTools']);
    Route::post('/sheets/sync-all', [GoogleSheetController::class, 'syncAll']);

    // History Jobs
    Route::get('/history-jobs', [HistoryJobController::class, 'index']);
    Route::get('/history-jobs/{id}', [HistoryJobController::class, 'show']);
    Route::post('/history-jobs', [HistoryJobController::class, 'store']);
    Route::put('/history-jobs/{id}', [HistoryJobController::class, 'update']);
    Route::delete('/history-jobs/{id}', [HistoryJobController::class, 'destroy']);
    Route::post('/history-jobs/{id}/photos', [HistoryJobController::class, 'uploadPhoto']);
    Route::delete('/history-jobs/{id}/photos/{photoId}', [HistoryJobController::class, 'deletePhoto']);

    // Tool Data Management - Non-ID routes OUTSIDE prefix for clarity
    Route::post('/tool-data/scan-qr', [ToolDataController::class, 'scanCustomQR']);
    Route::get('/tool-data/statistics', [ToolDataController::class, 'getStatistics']);
    Route::get('/tool-data/monthly-update-status', [ToolDataController::class, 'getMonthlyUpdateStatus']);
    Route::post('/tool-data/generate-recaps', [ToolDataController::class, 'generateRecaps']);
    Route::get('/tool-data/generate-code', [ToolDataController::class, 'generateToolCode']);
    Route::post('/tool-data/{id}/update-instant', [ToolDataController::class, 'updateToolInstant']);

    // QR Code endpoints for tools
    Route::get('/tool-data/{id}/qr-code', [ToolDataController::class, 'getQRCode'])->where('id', '[0-9]+');
    Route::get('/tool-data/{id}/qr-code/download', [ToolDataController::class, 'downloadQRCode'])->where('id', '[0-9]+');

    // QR Code Generation
    Route::get('/qr-code/{id}/svg', [QRCodeController::class, 'generateQRSvg']);
    Route::get('/qr-code/{id}/identifier', [QRCodeController::class, 'getQRIdentifier']);

    // Tool Data Management - ID-based routes
    Route::prefix('tool-data')->group(function () {
        Route::get('/', [ToolDataController::class, 'index']);
        Route::post('/', [ToolDataController::class, 'store']);
        Route::get('/{id}', [ToolDataController::class, 'show'])->where('id', '[0-9]+');
        Route::put('/{id}', [ToolDataController::class, 'update'])->where('id', '[0-9]+');
        Route::delete('/{id}', [ToolDataController::class, 'destroy'])->where('id', '[0-9]+');
        Route::get('/{id}/history', [ToolDataController::class, 'getHistory'])->where('id', '[0-9]+');
        Route::get('/{id}/rekap-bulanan', [ToolDataController::class, 'getMonthlyRecaps'])->where('id', '[0-9]+');
    });

    // Tools Management
    Route::prefix('tools')->group(function () {
        Route::get('/', [ToolController::class, 'index']);
        Route::post('/', [ToolController::class, 'store']);
        Route::get('/{id}', [ToolController::class, 'show']);
        Route::put('/{id}', [ToolController::class, 'update']);
        Route::delete('/{id}', [ToolController::class, 'destroy']);
    });
});
