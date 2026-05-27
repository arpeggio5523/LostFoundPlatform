import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import NavBar from "../components/NavBar";
import AuthButton from "../components/AuthButton";
import AuthInput from "../components/AuthInput";
import { buildApiUrl, apiFetch } from "../services/apiClient";

const verificationRequestCache = new Map();

const verifyEmailRequest = async ({ email, token }) => {
  const cacheKey = `${email}:${token}`;

  if (!verificationRequestCache.has(cacheKey)) {
    verificationRequestCache.set(
      cacheKey,
      apiFetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token }),
      })
        .then(async (response) => {
          const result = await response.json();

          return {
            ok: response.ok,
            message: result.message || "Unable to verify email.",
          };
        })
        .finally(() => {
          verificationRequestCache.delete(cacheKey);
        })
    );
  }

  return verificationRequestCache.get(cacheKey);
};

function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const emailFromQuery = searchParams.get("email") || "";
  const tokenFromQuery = searchParams.get("token") || "";

  const [status, setStatus] = useState(tokenFromQuery && emailFromQuery ? "verifying" : "idle");
  const [message, setMessage] = useState(
    tokenFromQuery && emailFromQuery
      ? "Verifying your email address..."
      : "Open the verification link from your email to complete account activation."
  );
  const [resendEmail, setResendEmail] = useState(emailFromQuery);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    if (!emailFromQuery || !tokenFromQuery) {
      return;
    }

    let isMounted = true;

    const verifyEmail = async () => {
      try {
        const result = await verifyEmailRequest({
          email: emailFromQuery,
          token: tokenFromQuery,
        });

        if (!isMounted) {
          return;
        }

        if (result.ok) {
          setStatus("success");
          setMessage(result.message || "Email verified successfully.");
          return;
        }

        setStatus("error");
        setMessage(result.message || "Unable to verify email.");
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setStatus("error");
        setMessage("Could not connect to the server.");
      }
    };

    verifyEmail();

    return () => {
      isMounted = false;
    };
  }, [emailFromQuery, tokenFromQuery]);

  const handleResendVerification = async (event) => {
    event.preventDefault();
    setIsResending(true);

    try {
      const response = await apiFetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resendEmail }),
      });

      const result = await response.json();
      setMessage(
        result.message ||
          "If an account with that email exists and is not yet verified, a verification email will be sent."
      );
      setStatus(response.ok ? "resent" : "error");
    } catch (error) {
      setStatus("error");
      setMessage("Could not connect to the server.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg-base)]">
      <NavBar />
      <div className="mx-auto flex min-h-[80vh] max-w-lg items-center justify-center px-4 pt-12 pb-10">
        <div className="grid w-full overflow-hidden rounded-3xl bg-[var(--color-bg-surface)] shadow-xl border border-[var(--color-border)]">
          <div className="p-8 md:p-10">
            <h2 className="text-2xl font-semibold text-[var(--color-text-primary)]">Verify Your Email</h2>
            <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
              Complete email verification before signing in to your account.
            </p>

            <div
              className={`mt-6 rounded-2xl border px-4 py-4 text-sm ${
                status === "success"
                  ? "border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-900/30 dark:text-green-300"
                  : status === "error"
                    ? "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-300"
                    : "border-[var(--color-border)] bg-[var(--color-bg-raised)] text-[var(--color-text-secondary)]"
              }`}
            >
              {message}
            </div>

            {status === "success" ? (
              <div className="mt-6">
                <Link
                  to={`/login${emailFromQuery ? `?email=${encodeURIComponent(emailFromQuery)}` : ""}`}
                  className="block w-full rounded-lg bg-[var(--color-brand)] px-4 py-3 text-center font-semibold text-[var(--color-brand-text)] transition hover:opacity-90"
                >
                  Go To Login
                </Link>
              </div>
            ) : (
              <form onSubmit={handleResendVerification} className="mt-8 space-y-4">
                <AuthInput
                  label="Email"
                  type="email"
                  placeholder="your.email@university.edu"
                  value={resendEmail}
                  onChange={(event) => setResendEmail(event.target.value)}
                  required
                />
                <AuthButton type="submit">
                  {isResending ? "Sending..." : "Resend Verification Email"}
                </AuthButton>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default VerifyEmailPage;
