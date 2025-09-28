import React, { useState, useMemo, useEffect } from "react";
import { useSelector } from "react-redux";
import { Search, Loader2, X } from "lucide-react";
import type { RootState } from "../../../store";
import type { Candidate } from "../../../types";
import CandidateDetailModal from "../interviewer/CandidateDetailModal";
import CandidateRow from "../interviewer/CandidateRow";
import CustomDropdown from "../../ui/dropdown/CustomDropdown";
import LoadingSpinner from "../../ui/loader/LoadingSpinner";
import { candidateSyncService } from "../../../services/candidateSyncService";
import { useDebouncedSearch } from "../../../hooks/useDebouncedSearch";

const InterviewerDashboard: React.FC = () => {
  const { questions } = useSelector((state: RootState) => state.interview);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState<"score" | "name" | "date">("score");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(
    null
  );
  const [filterStatus, setFilterStatus] = useState<
    "all" | "completed" | "in_progress"
  >("all");

  // ===== Debounced search with loading state ===== //
  const {
    searchTerm,
    debouncedSearchTerm,
    isSearching,
    setSearchTerm,
    clearSearch,
  } = useDebouncedSearch({
    delay: 300,
    minLength: 0,
  });

  // ===== Dropdown options ===== //
  const statusOptions = [
    { value: "all", label: "All Status" },
    { value: "completed", label: "Completed" },
    { value: "in_progress", label: "In Progress" },
  ];

  const sortOptions = [
    { value: "score", label: "Sort by Score" },
    { value: "name", label: "Sort by Name" },
    { value: "date", label: "Sort by Date" },
  ];

  // ===== Load candidates from IndexedDB with real-time updates ===== //
  useEffect(() => {
    const loadCandidates = async () => {
      try {
        setIsLoading(true);
        const candidatesData = await candidateSyncService.getAllCandidates();
        setCandidates(candidatesData);
      } catch (error) {
        console.error("Error loading candidates:", error);
        setCandidates([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadCandidates();

    // ===== Clean up duplicate candidates on first load ===== //
    candidateSyncService.cleanupDuplicateCandidates().then(() => {
      // ===== Reload candidates after cleanup ===== //
      candidateSyncService.getAllCandidates().then(setCandidates);
    });

    // ===== Set up real-time updates every 2 seconds ===== //
    const interval = setInterval(async () => {
      try {
        const candidatesData = await candidateSyncService.getAllCandidates();
        setCandidates(candidatesData);
      } catch {
        console.error("Error loading candidates:");
      }
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // ===== Filter and sort candidates ===== //
  const filteredAndSortedCandidates = useMemo(() => {
    const filtered = candidates.filter((candidate) => {
      // Additional safety checks
      if (!candidate || !candidate.name || !candidate.email) {
        return false;
      }

      const matchesSearch =
        candidate.name
          .toLowerCase()
          .includes(debouncedSearchTerm.toLowerCase()) ||
        candidate.email
          .toLowerCase()
          .includes(debouncedSearchTerm.toLowerCase());
      const matchesStatus = (() => {
        if (filterStatus === "all") return true;
        return candidate.interviewStatus === filterStatus;
      })();
      return matchesSearch && matchesStatus;
    });

    return filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case "score": {
          const scoreA = a.finalScore ?? 0;
          const scoreB = b.finalScore ?? 0;
          comparison = scoreA - scoreB;
          break;
        }
        case "name":
          comparison = a.name.localeCompare(b.name);
          break;
        case "date": {
          const dateA = a.endTime ? new Date(a.endTime).getTime() : 0;
          const dateB = b.endTime ? new Date(b.endTime).getTime() : 0;
          comparison = dateA - dateB;
          break;
        }
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });
  }, [candidates, debouncedSearchTerm, sortBy, sortOrder, filterStatus]);

  // ===== Show loading state while fetching candidates ===== //
  if (isLoading) {
    return (
      <LoadingSpinner
        title="Loading Candidates"
        description="Fetching candidate data from database..."
        size="lg"
        className="flex-1 h-screen bg-gray-50"
      />
    );
  }

  return (
    <div className="flex-1 flex flex-col h-screen bg-gray-50">
      <div className="flex-1 overflow-y-auto px-8 py-6">
        {/* ===== Header ===== */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Interview Dashboard
          </h1>
          <p className="text-gray-600">
            Manage and review candidate interviews
          </p>
        </div>

        {/* ===== Stats Cards ===== */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Total Candidates
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {candidates.length}
              </p>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">
                {
                  candidates.filter((c) => c.interviewStatus === "completed")
                    .length
                }
              </p>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div>
              <p className="text-sm font-medium text-gray-600">In Progress</p>
              <p className="text-2xl font-bold text-gray-900">
                {
                  candidates.filter((c) => c.interviewStatus === "in_progress")
                    .length
                }
              </p>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Score</p>
              <p className="text-2xl font-bold text-gray-900">
                {candidates.filter((c) => c.finalScore).length > 0
                  ? Math.round(
                      candidates
                        .filter((c) => c.finalScore)
                        .reduce((sum, c) => sum + (c.finalScore || 0), 0) /
                        candidates.filter((c) => c.finalScore).length
                    )
                  : 0}
              </p>
            </div>
          </div>
        </div>

        {/* ===== Filters and Search ===== */}
        <div className="bg-white border border-gray-200 rounded-lg mb-6 p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* ===== Search ===== */}
            <div className="flex-1 relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search candidates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 bg-white hover:bg-gray-50"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                  {isSearching ? (
                    <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                  ) : searchTerm ? (
                    <button
                      onClick={clearSearch}
                      className="w-4 h-4 text-gray-400 hover:text-gray-600 transition-colors"
                      aria-label="Clear search"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  ) : null}
                </div>
              </div>
            </div>

            {/* ===== Status Filter ===== */}
            <div className="flex gap-3">
              <CustomDropdown
                options={statusOptions}
                value={filterStatus}
                onChange={(value) =>
                  setFilterStatus(value as "all" | "completed" | "in_progress")
                }
                className="w-48"
              />
            </div>

            {/* ===== Sort ===== */}
            <div className="flex gap-3">
              <CustomDropdown
                options={sortOptions}
                value={sortBy}
                onChange={(value) =>
                  setSortBy(value as "score" | "name" | "date")
                }
                className="w-48"
              />
              <button
                onClick={() =>
                  setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                }
                className="px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 bg-white"
              >
                {sortOrder === "asc" ? "↑" : "↓"}
              </button>
            </div>
          </div>
        </div>

        {/* ===== Search Results Info ===== */}
        {debouncedSearchTerm && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Search className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-blue-800">
                  {isSearching
                    ? "Searching..."
                    : `Found ${filteredAndSortedCandidates.length} candidate${
                        filteredAndSortedCandidates.length !== 1 ? "s" : ""
                      } for "${debouncedSearchTerm}"`}
                </span>
              </div>
              <button
                onClick={clearSearch}
                className="text-sm text-blue-600 hover:text-blue-800 underline"
              >
                Clear search
              </button>
            </div>
          </div>
        )}

        {/* ===== Candidates List ===== */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          {filteredAndSortedCandidates.length === 0 ? (
            <div className="p-12 text-center">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No candidates found
              </h3>
              <p className="text-gray-600 max-w-md mx-auto">
                {debouncedSearchTerm || filterStatus !== "all"
                  ? "Try adjusting your search or filter criteria."
                  : "No candidates have been added yet."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-100 focus:outline-none">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Candidate
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Score
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {filteredAndSortedCandidates.map((candidate) => (
                    <CandidateRow
                      key={candidate.id}
                      candidate={candidate}
                      onViewDetails={setSelectedCandidate}
                      isSelected={selectedCandidate?.id === candidate.id}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Candidate Detail Modal */}
      {selectedCandidate && (
        <CandidateDetailModal
          candidate={selectedCandidate}
          onClose={() => setSelectedCandidate(null)}
          questions={questions}
        />
      )}
    </div>
  );
};

export default InterviewerDashboard;
