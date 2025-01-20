import React, { useState, useEffect, useRef } from "react";
import { FaEllipsisV } from "react-icons/fa";

// Subcomponent for the settings menu
const SettingsMenu = ({ onRemove, onClose }) => {
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
            <button
                onClick={onRemove}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
                Remove Job Listing
            </button>
        </div>
    );
};

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

const MyJobListings = ({ jobListings, setJobListings, showNotification }) => {
    const [menuOpen, setMenuOpen] = useState(null);
    const [settingsMenuOpen, setSettingsMenuOpen] = useState(null);

    const handleStatusMenuToggle = (id) => {
        setMenuOpen((prev) => (prev === id ? null : id));
    };

    const handleSettingsMenuToggle = (id) => {
        setSettingsMenuOpen((prev) => (prev === id ? null : id));
    };

    const onRemove = async (id) => {
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

            console.log(`Job listing with ID ${id} deleted.`);
            setJobListings(jobListings.filter((listing) => listing._id !== id)); // Remove the listing from the state
        } catch (error) {
            console.error("Error removing job listing:", error.message);
        } finally {
            setMenuOpen(null); // Close menu
        }
    };

    const onStatusChange = async (id, newStatus) => {
        try {
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

            const updatedJob = await response.json();

            setJobListings((prevListings) =>
                prevListings.map((listing) =>
                    listing._id === id ? { ...listing, status: newStatus } : listing
                )
            );

            showNotification("success", `Status updated to ${newStatus}`);
        } catch (error) {
            console.error("Error updating job listing status:", error.message);
        } finally {
            setMenuOpen(null);
        }
    };

    return (
        <div className="w-full max-w-5xl">
            <h2 className="text-xl font-bold text-gray-800 mb-4">My Job Listings</h2>
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
                                        />
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default MyJobListings;
