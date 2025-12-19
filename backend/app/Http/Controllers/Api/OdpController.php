<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Odp;
use Illuminate\Http\Request;

class OdpController extends Controller
{
    public function index(Request $request)
    {
        $query = Odp::query();

        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('kode_odp', 'like', "%{$search}%")
                  ->orWhere('nama_odp', 'like', "%{$search}%")
                  ->orWhere('area_cluster', 'like', "%{$search}%")
                  ->orWhere('alamat', 'like', "%{$search}%");
            });
        }

        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        if ($request->has('area') && $request->area) {
            $query->where('area_cluster', $request->area);
        }

        $odps = $query->withCount('jobs')->orderBy('created_at', 'desc')->get();

        return response()->json([
            'success' => true,
            'data' => $odps,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'kode_odp' => 'required|string|max:50|unique:odps,kode_odp',
            'nama_odp' => 'required|string|max:255',
            'area_cluster' => 'nullable|string|max:100',
            'alamat' => 'nullable|string',
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
            'status' => 'nullable|in:active,inactive,maintenance',
            'keterangan' => 'nullable|string',
        ]);

        $odp = Odp::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'ODP berhasil ditambahkan',
            'data' => $odp,
        ], 201);
    }

    public function show(Odp $odp)
    {
        $odp->load(['jobs' => function ($query) {
            $query->latest()->limit(10);
        }]);
        $odp->loadCount('jobs');

        return response()->json([
            'success' => true,
            'data' => $odp,
        ]);
    }

    public function update(Request $request, Odp $odp)
    {
        $validated = $request->validate([
            'kode_odp' => 'required|string|max:50|unique:odps,kode_odp,' . $odp->id,
            'nama_odp' => 'required|string|max:255',
            'area_cluster' => 'nullable|string|max:100',
            'alamat' => 'nullable|string',
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
            'status' => 'nullable|in:active,inactive,maintenance',
            'keterangan' => 'nullable|string',
        ]);

        $odp->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'ODP berhasil diupdate',
            'data' => $odp,
        ]);
    }

    public function destroy(Odp $odp)
    {
        $odp->delete();

        return response()->json([
            'success' => true,
            'message' => 'ODP berhasil dihapus',
        ]);
    }

    public function getAreas()
    {
        $areas = Odp::whereNotNull('area_cluster')
            ->distinct()
            ->pluck('area_cluster');

        return response()->json([
            'success' => true,
            'data' => $areas,
        ]);
    }

    public function getForSelect()
    {
        $odps = Odp::where('status', 'active')
            ->select('id', 'kode_odp', 'nama_odp', 'alamat', 'latitude', 'longitude', 'area_cluster')
            ->orderBy('kode_odp')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $odps,
        ]);
    }

    public function statistics()
    {
        $total = Odp::count();
        $active = Odp::where('status', 'active')->count();
        $inactive = Odp::where('status', 'inactive')->count();
        $maintenance = Odp::where('status', 'maintenance')->count();

        $byArea = Odp::selectRaw('area_cluster, count(*) as total')
            ->whereNotNull('area_cluster')
            ->groupBy('area_cluster')
            ->get();

        $withActiveJobs = Odp::whereHas('activeJobs')->count();

        return response()->json([
            'success' => true,
            'data' => [
                'total' => $total,
                'active' => $active,
                'inactive' => $inactive,
                'maintenance' => $maintenance,
                'by_area' => $byArea,
                'with_active_jobs' => $withActiveJobs,
            ],
        ]);
    }
}

