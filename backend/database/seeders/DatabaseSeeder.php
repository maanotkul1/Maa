<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create Admin User
        User::updateOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name' => 'Admin',
                'password' => Hash::make('password'),
                'role' => 'admin',
                'status' => 'active',
                'phone' => '081234567890',
            ]
        );

        // Create Field Engineer Users
        User::updateOrCreate(
            ['email' => 'fe1@example.com'],
            [
                'name' => 'Field Engineer 1',
                'password' => Hash::make('password'),
                'role' => 'fe',
                'status' => 'active',
                'phone' => '081234567891',
            ]
        );

        User::updateOrCreate(
            ['email' => 'fe2@example.com'],
            [
                'name' => 'Field Engineer 2',
                'password' => Hash::make('password'),
                'role' => 'fe',
                'status' => 'active',
                'phone' => '081234567892',
            ]
        );
    }
}
