<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    /**
     * Get list of users
     */
    public function index(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $query = User::query();

        if ($request->has('role')) {
            $query->where('role', $request->role);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $perPage = $request->get('per_page', 15);
        $users = $query->orderBy('created_at', 'desc')->paginate($perPage);

        return response()->json($users);
    }

    /**
     * Get single user
     */
    public function show($id)
    {
        $user = User::findOrFail($id);

        // FE can only view their own profile
        if (request()->user()->role === 'fe' && request()->user()->id !== $id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return response()->json($user);
    }

    /**
     * Create new user (Admin only)
     */
    public function store(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8',
            'phone' => 'nullable|string',
            'role' => 'required|in:admin,fe',
            'status' => 'sometimes|in:active,inactive',
        ]);

        $validated['password'] = Hash::make($validated['password']);
        $validated['status'] = $validated['status'] ?? 'active';

        $user = User::create($validated);

        return response()->json($user, 201);
    }

    /**
     * Update user
     */
    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);
        $currentUser = $request->user();

        // FE can only update their own profile (limited fields)
        if ($currentUser->role === 'fe' && $currentUser->id !== $id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $rules = [
            'name' => 'sometimes|string|max:255',
            'email' => ['sometimes', 'email', Rule::unique('users')->ignore($id)],
            'phone' => 'nullable|string',
        ];

        // Admin can update more fields
        if ($currentUser->role === 'admin') {
            $rules['role'] = 'sometimes|in:admin,fe';
            $rules['status'] = 'sometimes|in:active,inactive';
        }

        // FE can update their own profile
        if ($currentUser->role === 'fe' && $currentUser->id === $id) {
            // FE can only update name, phone, avatar
            $rules['avatar_url'] = 'nullable|string';
        }

        $validated = $request->validate($rules);

        $user->update($validated);

        return response()->json($user);
    }

    /**
     * Change password
     */
    public function changePassword(Request $request, $id)
    {
        $user = User::findOrFail($id);
        $currentUser = $request->user();

        // Users can only change their own password, or admin can change any
        if ($currentUser->role !== 'admin' && $currentUser->id !== $id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'current_password' => 'required_without:admin_override',
            'new_password' => 'required|string|min:8|confirmed',
            'admin_override' => 'sometimes|boolean',
        ]);

        // Check current password (unless admin override)
        if (!($validated['admin_override'] ?? false) && $currentUser->role !== 'admin') {
            if (!Hash::check($validated['current_password'], $user->password)) {
                return response()->json(['message' => 'Current password is incorrect'], 400);
            }
        }

        $user->password = Hash::make($validated['new_password']);
        $user->save();

        return response()->json(['message' => 'Password changed successfully']);
    }

    /**
     * Delete/Deactivate user (Admin only)
     */
    public function destroy(Request $request, $id)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $user = User::findOrFail($id);

        // Prevent deleting yourself
        if ($user->id === $request->user()->id) {
            return response()->json(['message' => 'Cannot delete your own account'], 400);
        }

        // Soft delete by setting status to inactive
        $user->status = 'inactive';
        $user->save();

        return response()->json(['message' => 'User deactivated successfully']);
    }

    /**
     * Get list of FE users (for dropdown)
     */
    public function getFieldEngineers(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $fes = User::where('role', 'fe')
            ->where('status', 'active')
            ->select('id', 'name', 'email', 'phone')
            ->orderBy('name')
            ->get();

        return response()->json($fes);
    }
}

