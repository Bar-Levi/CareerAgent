import React, { useState, useEffect, useRef } from "react";
import { FaEllipsisV, FaSpinner } from "react-icons/fa";

// Subcomponent for the settings menu
const SettingsMenu = ({ onRemove, onClose, loading }) => {
    const menuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                onClose(); // Close the menu if clicking outside
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [onClose]);

    return (
        <div
            ref={menuRef}
            className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg z-50"
        >
            {loading ? (
                <div className="flex items-center justify-center px-4 py-2">
                    <FaSpinner className="animate-spin text-gray-700 text-lg" />
                    <span className="ml-2 text-gray-700 text-sm">Removing...</span>
                </div>
            ) : (
                <button
                    onClick={onRemove}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                    Remove Job Listing
                </button>
            )}
        </div>
    );
};

// Subcomponent for the status menu
const StatusMenu = ({ currentStatus, onChangeStatus, onClose }) => {
    const menuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                onClose();
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [onClose]);

    const statuses = [
        { label: "Active", color: "bg-green-100 text-green-800" },
        { label: "Paused", color: "bg-yellow-100 text-yellow-800" },
        { label: "Closed", color: "bg-red-100 text-red-800" },
    ];

    return (
        <div
            ref={menuRef}
            className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg z-50"
        >
            {statuses.map((status) => (
                <button
                    key={status.label}
                    onClick={() => onChangeStatus(status.label)}
                    className={`block w-full text-left px-4 py-2 text-sm font-semibold ${status.color} hover:bg-gray-100`}
                >
                    {status.label}
                </button>
            ))}
        </div>
    );
};

// Main component for job listings
const MyJobListings = ({ jobListings, setJobListings, showNotification }) => {
    const [menuOpen, setMenuOpen] = useState(null);
    const [settingsMenuOpen, setSettingsMenuOpen] = useState(null);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [loading, setLoading] = useState(false); // Global loading for Remove All
    const [individualLoading, setIndividualLoading] = useState({}); // Track individual loading states

    const handleStatusMenuToggle = (id) => {
        setMenuOpen((prev) => (prev === id ? null : id));
    };

    const handleSettingsMenuToggle = (id) => {
        setSettingsMenuOpen((prev) => (prev === id ? null : id));
    };

    const onRemove = async (id) => {
        setIndividualLoading((prev) => ({ ...prev, [id]: true })); // Set individual loading state
        const originalListings = [...jobListings];
        setJobListings((prev) => prev.filter((listing) => listing._id !== id));

        try {
            const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/joblistings/${id}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });

            if (!response.ok) {
                throw new Error(`Failed to remove job listing with ID ${id}.`);
            }

            showNotification("success", "Job listing removed successfully.");
        } catch (error) {
            console.error("Error removing job listing:", error.message);
            showNotification("error", "Failed to remove job listing. Restoring it...");
            setJobListings(originalListings);
        } finally {
            setIndividualLoading((prev) => ({ ...prev, [id]: false })); // Reset individual loading state
        }
    };

    const onRemoveAll = async () => {
        setLoading(true); // Start global loading for Remove All
        const currentListings = [...jobListings];

        try {
            for (const listing of currentListings) {
                await onRemove(listing._id);
            }
            showNotification("success", "All job listings removed successfully.");
        } catch (error) {
            console.error("Error removing all job listings:", error.message);
            showNotification("error", "Failed to remove all job listings. Some might remain.");
        } finally {
            setLoading(false); // Reset global loading state
            setShowConfirmDialog(false);
        }
    };

    const onStatusChange = async (id, newStatus) => {
        try {
            setJobListings((prevListings) =>
                prevListings.map((listing) =>
                    listing._id === id ? { ...listing, status: newStatus } : listing
                )
            );

            const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/joblistings/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify({ status: newStatus }),
            });

            if (!response.ok) {
                throw new Error(`Failed to update status for job listing with ID ${id}.`);
            }

            showNotification("success", `Status updated to ${newStatus}`);
        } catch (error) {
            console.error("Error updating job listing status:", error.message);
            showNotification("error", "Failed to update status. Please try again.");
        } finally {
            setMenuOpen(null);
        }
    };

    return (
        <div className="w-full max-w-5xl">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">My Job Listings</h2>
                {jobListings.length > 0 && (
                    <button
                        onClick={() => setShowConfirmDialog(true)}
                        className="px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded hover:bg-red-700"
                    >
                        Remove All Job Listings
                    </button>
                )}
            </div>
            <div className="bg-white shadow rounded-lg p-4">
                {jobListings.length === 0 ? (
                    <p className="text-gray-500">No active job listings.</p>
                ) : (
                    <ul className="divide-y divide-gray-200">
                        {jobListings.map((listing) => (
                            <li
                                key={listing._id}
                                className="py-4 flex justify-between items-center relative"
                            >
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800">
                                        {listing.jobRole}
                                    </h3>
                                    <p className="text-sm text-gray-500">{listing.location}</p>
                                </div>
                                <div className="flex items-center space-x-4 relative">
                                    <p className="text-gray-600">
                                        Applicants: {listing.applicants?.length || 0}
                                    </p>
                                    <button
                                        onClick={() => handleStatusMenuToggle(listing._id)}
                                        className={`px-3 py-1 text-sm rounded-full ${
                                            listing.status === "Active"
                                                ? "bg-green-100 text-green-800"
                                                : listing.status === "Paused"
                                                ? "bg-yellow-100 text-yellow-800"
                                                : "bg-red-100 text-red-800"
                                        }`}
                                    >
                                        {listing.status}
                                    </button>
                                    {menuOpen === listing._id && (
                                        <StatusMenu
                                            currentStatus={listing.status}
                                            onChangeStatus={(newStatus) =>
                                                onStatusChange(listing._id, newStatus)
                                            }
                                            onClose={() => setMenuOpen(null)}
                                        />
                                    )}

                                    <button
                                        onClick={() => handleSettingsMenuToggle(listing._id)}
                                        className="text-gray-500 hover:text-gray-700"
                                    >
                                        <FaEllipsisV />
                                    </button>
                                    {settingsMenuOpen === listing._id && (
                                        <SettingsMenu
                                            onRemove={() => onRemove(listing._id)}
                                            onClose={() => setSettingsMenuOpen(null)}
                                            loading={individualLoading[listing._id] || false}
                                        />
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
            {showConfirmDialog && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        {loading ? (
                            <div className="flex items-center justify-center">
                                <FaSpinner className="animate-spin text-2xl text-gray-700" />
                                <span className="ml-3 text-gray-700">Removing all job listings...</span>
                            </div>
                        ) : (
                            <>
                                <h3 className="text-lg font-bold text-gray-800 mb-4">
                                    Confirm Removal
                                </h3>
                                <p className="text-sm text-gray-600 mb-6">
                                    Are you sure you want to remove all job listings? This action cannot be undone.
                                </p>
                                <div className="flex justify-end space-x-4">
                                    <button
                                        onClick={() => setShowConfirmDialog(false)}
                                        className="px-4 py-2 text-sm text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={onRemoveAll}
                                        className="px-4 py-2 text-sm text-white bg-red-600 rounded hover:bg-red-700"
                                    >
                                        Confirm
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyJobListings;
