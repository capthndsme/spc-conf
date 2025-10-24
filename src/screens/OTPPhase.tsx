import { useEffect, useState, useRef, useCallback } from "react";
import { useDashContext } from "../components/DashWrap";
import { toast } from "sonner";
import { useNavigate, useParams } from "react-router-dom"; // Assuming react-router-dom
import { useSendOtp } from "../api/useSendOtp"; // Ensure this path is correct
import { Spinner } from "../components/Spinner"; // Ensure this path is correct
import useVerifyOtp from "../api/useVerifyOtp";
import { useCancelOrder } from "../api/useCancelOrder";

const MAX_RESEND_ATTEMPTS = 3;
const RESEND_COOLDOWN_SECONDS = 30;

const OTPPhase = () => {
  const ds = useDashContext();
  const { id } = useParams();
  const navigate = useNavigate();
  const sendOtpMutation = useSendOtp();
  const verifyMutation = useVerifyOtp();

  // State Machine: Controls the UI flow
  const [stateMachine, setStateMachine] = useState<"WAITING_NUMBER" | "SENDING_OTP" | "WAITING_OTP" | "VERIFYING_OTP">(
    "WAITING_NUMBER"
  );

  // Loading States
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false); // New state for verification loading

  // Form Inputs
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const cancelApi = useCancelOrder();
  // Resend Logic State
  const [resendAttempts, setResendAttempts] = useState(0);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [canResend, setCanResend] = useState(false); // Initially false, enabled after first send + cooldown
  const cooldownTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Set sidebar content on mount
  useEffect(() => {
    ds.setLeftSideElement(
      <div>
        <div className="text-3xl font-light">Rider contact</div>
        <div>Order {id}</div>
        Enter your phone number so we can validate your identity.
        <br />
        <button onClick={() => {
          if (id) {
            cancelApi.mutate({ orderId: id })
            navigate(-1)
          }
        }} className="text-white mt-4">
          Cancel
        </button>
      </div>
    );
    // Cleanup function if needed
    // return () => ds.setLeftSideElement(null);
  }, [ds, id, navigate]); // Added dependencies

  // --- Phone Number Validation ---
  const validatePhoneNumber = (number: string): boolean => {
    if (!number.startsWith("09")) {
      toast.error("Invalid phone number: Must start with '09'.");
      return false;
    }
    if (number.length !== 11) { // Philippine mobile numbers are typically 11 digits (09xxxxxxxxx)
      toast.error("Invalid phone number: Must be 11 digits long.");
      return false;
    }
    // Could add more regex validation if needed
    return true;
  };

  // --- OTP Cooldown Timer ---
  useEffect(() => {
    if (resendCooldown > 0) {
      setCanResend(false); // Ensure button is disabled during cooldown
      cooldownTimerRef.current = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(cooldownTimerRef.current!);
            setCanResend(resendAttempts < MAX_RESEND_ATTEMPTS); // Allow resend if attempts not maxed out
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    // Cleanup timer on component unmount or when cooldown finishes
    return () => {
      if (cooldownTimerRef.current) {
        clearInterval(cooldownTimerRef.current);
      }
    };
  }, [resendCooldown, resendAttempts]); // Rerun effect when cooldown or attempts change

  const startCooldown = () => {
    setResendCooldown(RESEND_COOLDOWN_SECONDS);
    setCanResend(false);
  }

  // --- Send/Resend OTP Logic ---
  const handleSendOtp = useCallback(async () => {
    if (isSendingOtp || !id) return; // Prevent parallel requests
    if (stateMachine === 'WAITING_OTP' && (!canResend || resendAttempts >= MAX_RESEND_ATTEMPTS)) {
      toast.warning("Cannot resend OTP at this time.");
      return; // Don't proceed if resend conditions aren't met
    }

    // Format number only once before sending
    const formattedNumber = "+63" + phoneNumber.trim().substring(phoneNumber.startsWith("0") ? 1 : 0);

    setIsSendingOtp(true);
    setStateMachine("SENDING_OTP");
    toast("Sending OTP...");

    try {
      const res = await sendOtpMutation.mutateAsync({
        orderId: id,
        number: formattedNumber,
      });

      console.log("Send OTP Response:", res); // Optional logging

      if (res) { // Adjust condition based on your actual API response structure
        toast.success("OTP sent successfully!");
        setStateMachine("WAITING_OTP");
        setResendAttempts((prev) => prev + 1); // Increment attempts *after* successful send
        startCooldown(); // Start cooldown after successful send
      } else {
        // Handle cases where API indicates failure without throwing error
        toast.error("Failed to send OTP. Please try again.");
        // Decide if state should reset: Resetting to number entry might be best if initial send fails
        if (resendAttempts === 0) {
          setStateMachine("WAITING_NUMBER");
        } else {
          // If a resend fails, stay in OTP phase but allow retry after cooldown
          setCanResend(true); // Allow trying again immediately (or enforce cooldown depending on UX)
          setResendCooldown(0); // Reset cooldown if API fails? Or let it run? Let's reset for immediate feedback.
          setStateMachine("WAITING_OTP"); // Stay in OTP phase
        }
      }
    } catch (error) {
      console.error("Send OTP Error:", error);
      toast.error("An error occurred while sending OTP. Please try again.");
      // Reset state based on whether it was the first attempt or a resend
      if (resendAttempts === 0) {
        setStateMachine("WAITING_NUMBER"); // Go back to number input on initial failure
      } else {
        // If a resend fails via error, stay in OTP phase
        setStateMachine("WAITING_OTP");
        setCanResend(true); // Allow trying again
        setResendCooldown(0); // Reset cooldown
      }
    } finally {
      setIsSendingOtp(false);
    }
  }, [
    id,
    phoneNumber,
    isSendingOtp,
    sendOtpMutation,
    stateMachine,
    canResend,
    resendAttempts
  ]); // Dependencies for the callback


  // --- Submit Phone Number ---
  const submitNumber = () => {
    if (!validatePhoneNumber(phoneNumber)) {
      return;
    }
    // Reset attempts when submitting a new number (or potentially the same number again)
    setResendAttempts(0);
    setResendCooldown(0);
    setCanResend(false); // Can't resend until first attempt is done
    if (cooldownTimerRef.current) clearInterval(cooldownTimerRef.current); // Clear any previous timer

    handleSendOtp(); // Call the unified send logic
  };


  // --- Verify OTP Logic (Placeholder) ---
  const handleVerifyOtp = async (enteredOtp: string) => {
    if (isVerifyingOtp || isSendingOtp || !id) return; // Prevent parallel requests

    // Basic OTP validation (e.g., length)
    if (!enteredOtp || enteredOtp.length < 4 || enteredOtp.length > 6) { // Adjust length as needed
      toast.error("Invalid OTP format.");
      return;
    }

    console.log("Attempting to verify OTP:", enteredOtp);
    setIsVerifyingOtp(true);
    setStateMachine("VERIFYING_OTP");
    toast("Verifying OTP...");

    try {
      // --- REPLACE WITH YOUR ACTUAL API CALL ---
      // Example: Simulate API call delay

      const isOtpValid = await (await verifyMutation.mutateAsync({ orderId: id, otp: enteredOtp })).data;
      // --- END OF API CALL SIMULATION ---

      if (isOtpValid) {
        toast.success("OTP Verified Successfully!");
        // Navigate to the next step or update application state
        console.log("OTP Correct! Navigating or completing action...");
        navigate(`/dashuix/select-slot/${id}`)
        //navigate(`/dashuix/parcel-entry/${id}`); // Example navigation
      } else {
        toast.error("Incorrect OTP. Please try again.");
        setOtp(""); // Clear OTP input on failure
        setStateMachine("WAITING_OTP"); // Go back to waiting for OTP input
      }

    } catch (error) {
      console.error("Verify OTP Error:", error);
      toast.error("Verification failure in OTP. Please try again.");
      setStateMachine("WAITING_OTP"); // Go back to waiting state on error
    } finally {
      setIsVerifyingOtp(false);
    }
  };


  // --- Render ---
  const isLoading = isSendingOtp || isVerifyingOtp;

  return (
    <div>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-50 z-10">
          <Spinner />
        </div>
      )}

      {/* Phone Number Input Section */}
      {(stateMachine === "WAITING_NUMBER" || stateMachine === "SENDING_OTP") && (
        <div style={{ opacity: isLoading || stateMachine !== 'WAITING_NUMBER' ? 0.6 : 1 }}>
          <h2 className="font-light text-xl mb-2">Enter Phone Number</h2>
          <input
            type="number" // Use "tel" for phone numbers
            placeholder="09xxxxxxxxx"
            inputMode="numeric" // Helps mobile keyboards
            pattern="[0-9]*"   // Further hints numeric input
            className="w-full border border-black rounded-sm p-2"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !isLoading && stateMachine === 'WAITING_NUMBER') {
                submitNumber();
              }
            }}
            onChange={(e) => setPhoneNumber(e.target.value.replace(/[^0-9]/g, ''))} // Allow only numbers
            value={phoneNumber}
            disabled={isLoading || stateMachine !== "WAITING_NUMBER"}
            maxLength={11} // Max length for PH mobile
          />
          <button
            className="text-white w-full mt-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 py-2 rounded"
            onClick={submitNumber}
            disabled={isLoading || stateMachine !== "WAITING_NUMBER" || !phoneNumber}
          >
            Continue
          </button>
        </div>
      )}

      {/* OTP Input Section */}
      {(stateMachine === "WAITING_OTP" || stateMachine === "VERIFYING_OTP") && (
        <div className="mt-6" style={{ opacity: isLoading || stateMachine !== 'WAITING_OTP' ? 0.6 : 1 }}>
          <h2 className="font-light text-xl mb-2">Enter OTP</h2>
          <input
            type="number" // Use "tel" for OTPs often too
            placeholder="Enter OTP"
            inputMode="numeric"
            pattern="[0-9]*"
            className="w-full border border-black rounded-sm p-2"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !isLoading && stateMachine === 'WAITING_OTP') {
                handleVerifyOtp(otp);
              }
            }}
            onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
            value={otp}
            disabled={isLoading || stateMachine !== "WAITING_OTP"}
            maxLength={6} // Typical OTP length
          />
          <button
            className="text-white w-full mt-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 py-2 rounded"
            onClick={() => handleVerifyOtp(otp)}
            disabled={isLoading || stateMachine !== "WAITING_OTP" || !otp}
          >
            Verify OTP
          </button>

          {/* Resend Button & Info */}
          <div className="mt-4 text-sm text-center">
            {resendAttempts < MAX_RESEND_ATTEMPTS ? (
              <button
                onClick={handleSendOtp} // Reuse handleSendOtp for resending
                disabled={isLoading || !canResend || resendCooldown > 0}
                className="text-blue-600 hover:text-blue-800 disabled:text-gray-500 disabled:cursor-not-allowed"
              >
                Resend OTP {resendCooldown > 0 ? `(wait ${resendCooldown}s)` : ''}
              </button>
            ) : (
              <span className="text-gray-600">Maximum resend attempts reached.</span>
            )}
            <span className="ml-2 text-gray-500">({resendAttempts}/{MAX_RESEND_ATTEMPTS} attempts)</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default OTPPhase;