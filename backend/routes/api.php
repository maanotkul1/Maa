<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\JobController;
use App\Http\Controllers\Api\OdpController;
use App\Http\Controllers\Api\UserController;
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

    // Jobs
    Route::get('/jobs', [JobController::class, 'index']);
    Route::get('/jobs/{id}', [JobController::class, 'show']);
    Route::post('/jobs', [JobController::class, 'store']);
    Route::put('/jobs/{id}', [JobController::class, 'update']);
    Route::delete('/jobs/{id}', [JobController::class, 'destroy']);
    Route::post('/jobs/{id}/status', [JobController::class, 'updateStatus']);
    Route::post('/jobs/{id}/cancel', [JobController::class, 'cancel']);
    Route::post('/jobs/{id}/notes', [JobController::class, 'addNote']);
    Route::post('/jobs/{id}/photos', [JobController::class, 'uploadPhoto']);
    Route::delete('/jobs/{id}/photos/{photoId}', [JobController::class, 'deletePhoto']);
    Route::post('/jobs/sync-google-sheets', [JobController::class, 'syncToGoogleSheets']);
    
    // Job Trash (Riwayat)
    Route::get('/jobs-trash', [JobController::class, 'trash']);
    Route::post('/jobs/{id}/restore', [JobController::class, 'restore']);
    Route::delete('/jobs/{id}/force', [JobController::class, 'forceDelete']);

    // Users
    Route::get('/users', [UserController::class, 'index']);
    Route::get('/users/field-engineers', [UserController::class, 'getFieldEngineers']);
    Route::get('/users/{id}', [UserController::class, 'show']);
    Route::post('/users', [UserController::class, 'store']);
    Route::put('/users/{id}', [UserController::class, 'update']);
    Route::post('/users/{id}/change-password', [UserController::class, 'changePassword']);
    Route::delete('/users/{id}', [UserController::class, 'destroy']);

    // ODP Master Data
    Route::get('/odps', [OdpController::class, 'index']);
    Route::get('/odps/areas', [OdpController::class, 'getAreas']);
    Route::get('/odps/select', [OdpController::class, 'getForSelect']);
    Route::get('/odps/statistics', [OdpController::class, 'statistics']);
    Route::get('/odps/{odp}', [OdpController::class, 'show']);
    Route::post('/odps', [OdpController::class, 'store']);
    Route::put('/odps/{odp}', [OdpController::class, 'update']);
    Route::delete('/odps/{odp}', [OdpController::class, 'destroy']);
});

