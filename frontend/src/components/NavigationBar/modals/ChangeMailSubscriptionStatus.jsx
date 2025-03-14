import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

const changeMailSubscriptionStatus = async (user) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      Swal.fire("Error", "No token found. Please log in again.", "error");
      return;
    }

    // Fetch current subscription status
    const response = await fetch(
      `${process.env.REACT_APP_BACKEND_URL}/api/personal/getIsSubscribed?email=${encodeURIComponent(user.email)}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.message || "Failed to fetch subscription status.");
    }

    const data = await response.json();
    const isSubscribed = data.isSubscribed;
    const buttonText = isSubscribed ? "Unsubscribe" : "Subscribe";

    // Display the modal with current status and toggle button
    const result = await MySwal.fire({
      title: "Change Mail Subscription Status",
      html: `
        <div class="flex flex-col items-center space-y-4">
          <p class="text-lg font-semibold">Your current status is:</p>
          <p class="text-blue-600 font-bold">${isSubscribed ? "Subscribed" : "Unsubscribed"}</p>
          <p class="text-sm text-gray-600">Do you want to ${isSubscribed ? "unsubscribe" : "subscribe"}?</p>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: buttonText,
      cancelButtonText: "Cancel",
      preConfirm: async () => {
        // Send POST request to toggle subscription status
        const postResponse = await fetch(
          `${process.env.REACT_APP_BACKEND_URL}/api/personal/subscribeOrUnsubscribe`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ email: user.email }),
          }
        );

        if (!postResponse.ok) {
          const errorData = await postResponse.json();
          Swal.showValidationMessage(`Request failed: ${errorData.message}`);
          return;
        }

        const postData = await postResponse.json();
        return postData;
      },
    });

    if (result.isConfirmed) {
      // Display the result from the toggle request
      Swal.fire("Success", result.value.message, "success");
    }
  } catch (error) {
    Swal.fire("Error", error.message || "An error occurred", "error");
  }
};

export default changeMailSubscriptionStatus;
