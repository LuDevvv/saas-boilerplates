import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/stores/useAuth";
import toast from "react-hot-toast";

export const useVerifyEmail = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const location = useLocation();
    const fromSignup = location.state?.fromSignup;

    const {
        verifyEmail,
        checkAuthStatus,
        resendVerificationCode,
        logout,
        loading,
        pendingVerificationEmail,
        setPendingVerificationEmail,
        user,
        isAuthenticated,
    } = useAuth();

    const [code, setCode] = useState(["", "", "", "", "", ""]);
    const [resendCooldown, setResendCooldown] = useState(fromSignup ? 60 : 0);
    const [canResend, setCanResend] = useState(!fromSignup);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    // Obtenemos el email de varias fuentes posibles, priorizando el parámetro de la URL
    const email = useMemo(() => {
        const fromUrl = searchParams.get("email");
        if (fromUrl && fromUrl !== "undefined" && fromUrl.trim() !== "") {
            return fromUrl;
        }

        if (user?.email && user.email.trim() !== "") {
            return user.email;
        }

        if (pendingVerificationEmail && pendingVerificationEmail.trim() !== "") {
            return pendingVerificationEmail;
        }

        return "";
    }, [searchParams, user?.email, pendingVerificationEmail]);

    // Registro de depuración
    useEffect(() => {
        if (!loading && !email) {
            console.warn("[VerifyEmail] Email missing from all sources:", {
                urlParam: searchParams.get("email"),
                userEmail: user?.email,
                pendingEmail: pendingVerificationEmail,
                isAuthenticated
            });
        }
    }, [email, loading, searchParams, user?.email, pendingVerificationEmail, isAuthenticated]);

    // Redirección si ya está verificado
    useEffect(() => {
        if (isAuthenticated && user?.isEmailVerified) {
            if (location.pathname !== "/") {
                navigate("/", { replace: true });
            }
        }
    }, [isAuthenticated, user?.isEmailVerified, navigate, location.pathname]);

    // Redirección si no hay email
    useEffect(() => {
        if (!loading && !email && !isAuthenticated) {
            if (location.pathname !== "/auth/sign-up") {
                toast.error("No se encontró el correo para verificar.");
                navigate("/auth/sign-up", { replace: true });
            }
        }
    }, [email, loading, isAuthenticated, navigate, location.pathname]);

    useEffect(() => {
        if (resendCooldown <= 0) {
            setCanResend(true);
            return;
        }
        const timer = setInterval(() => {
            setResendCooldown((prev) => prev - 1);
        }, 1000);
        return () => clearInterval(timer);
    }, [resendCooldown]);

    const handleVerify = useCallback(
        async (codeToVerify?: string) => {
            const verificationCode = codeToVerify || code.join("");
            if (verificationCode.length !== 6) {
                toast.error("El código debe tener 6 dígitos");
                return;
            }
            if (!email) {
                toast.error("No se pudo identificar tu correo.");
                return;
            }
            const success = await verifyEmail(email, verificationCode);
            if (success) {
                toast.success("¡Email verificado con éxito!");
                // Forzamos actualización para que el ProtectedRoute detecte el cambio
                await checkAuthStatus();
                setPendingVerificationEmail(undefined);

                const pendingToken = sessionStorage.getItem("pending_invite_token");
                const redirect = searchParams.get("redirect") || (pendingToken ? `/invitation/${pendingToken}` : "/create-company");
                navigate(redirect);
            }
        },
        [code, email, navigate, setPendingVerificationEmail, verifyEmail, checkAuthStatus]
    );

    const handleChange = useCallback(
        (index: number, value: string) => {
            if (!/^\d*$/.test(value)) return;
            const newCode = [...code];
            newCode[index] = value;
            setCode(newCode);
            if (value && index < 5) inputRefs.current[index + 1]?.focus();
            if (newCode.every(digit => digit !== "") && newCode.join("").length === 6) {
                handleVerify(newCode.join(""));
            }
        },
        [code, handleVerify]
    );

    const handleKeyDown = useCallback(
        (index: number, e: React.KeyboardEvent) => {
            if (e.key === "Backspace" && !code[index] && index > 0) {
                inputRefs.current[index - 1]?.focus();
            }
        },
        [code]
    );

    const handlePaste = useCallback(
        (e: React.ClipboardEvent) => {
            e.preventDefault();
            const pastedData = e.clipboardData.getData("text").slice(0, 6);
            if (!/^\d+$/.test(pastedData)) return;
            const newCodeArray = pastedData.split("");
            const finalCode = [...newCodeArray, ...Array(6 - newCodeArray.length).fill("")];
            setCode(finalCode);
            if (newCodeArray.length === 6) handleVerify(pastedData);
        },
        [handleVerify]
    );

    const handleResend = useCallback(async () => {
        if (!email) return;
        const success = await resendVerificationCode(email);
        if (success) {
            toast.success("Código reenviado.");
            setResendCooldown(60);
            setCanResend(false);
            setCode(["", "", "", "", "", ""]);
            inputRefs.current[0]?.focus();
        }
    }, [email, resendVerificationCode]);

    const handleLogout = useCallback(async () => {
        await logout();
        navigate("/auth/sign-in", { replace: true });
    }, [logout, navigate]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    return {
        code,
        email,
        loading,
        resendCooldown,
        canResend,
        inputRefs,
        handleChange,
        handleKeyDown,
        handlePaste,
        handleVerify,
        handleResend,
        handleLogout,
        formatTime,
    };
};
