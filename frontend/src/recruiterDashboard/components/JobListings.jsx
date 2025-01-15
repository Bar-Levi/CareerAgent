import React, { useState, useEffect } from "react";

// Subcomponent for the settings menu
const SettingsMenu = ({ onRemove }) => {
    return (
        <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg z-50">
            <button
                onClick={onRemove}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
                Remove Job Listing
            </button>
        </div>
    );
};

const JobListings = ({jobListings, setJobListings}) => {
    const [menuOpen, setMenuOpen] = useState(null); // Track which menu is open

    // Fetch job listings from API
    const refreshListings = async () => {
        try {
            const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/joblistings`);
            if (!response.ok) {
                throw new Error("Failed to fetch job listings.");
            }
            const data = await response.json();
            setJobListings(data.jobListings);
        } catch (error) {
            console.error("Error fetching job listings:", error.message);
        }
    };

    useEffect(() => {
        refreshListings();
    }, []);

    const handleMenuToggle = (id) => {
        setMenuOpen((prev) => (prev === id ? null : id));
    };

    const onRemove = async (id) => {
        try {
            const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/joblistings/${id}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                throw new Error(`Failed to remove job listing with ID ${id}.`);
            }

            console.log(`Job listing with ID ${id} deleted.`);
            refreshListings(); // Refresh listings
        } catch (error) {
            console.error("Error removing job listing:", error.message);
        } finally {
            setMenuOpen(null); // Close menu
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
                                <div className="flex items-center space-x-4">
                                    <p className="text-gray-600">
                                        Applicants: {listing.applicants?.length || 0}
                                    </p>
                                    <span
                                        className={`px-3 py-1 text-sm rounded-full ${
                                            listing.status === "Active"
                                                ? "bg-green-100 text-green-800"
                                                : "bg-gray-100 text-gray-800"
                                        }`}
                                    >
                                        {listing.status}
                                    </span>
                                    <>
                                        <button
                                            onClick={() => handleMenuToggle(listing._id)}
                                            className="text-gray-500 hover:text-gray-700"
                                        >
                                            &#x2026; {/* Unicode for 3-dots */}
                                        </button>
                                        {menuOpen === listing._id && (
                                            <SettingsMenu
                                                onRemove={() => onRemove(listing._id)}
                                            />
                                        )}
                                    </>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default JobListings;
