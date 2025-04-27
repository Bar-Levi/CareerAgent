import React, { useState, useEffect } from 'react';
import RegistrationForm from '../components/RegistrationForm';
import LoginForm from '../components/LoginForm';
import { useLocation, useNavigate } from 'react-router-dom';
import Notification from '../components/Notification';
import Botpress from '../botpress/Botpress';
import { jwtDecode } from 'jwt-decode';

const AuthenticationPage = () => {
    const [isFlipped, setIsFlipped] = useState(false);
    const [mouseX, setMouseX] = useState(0);
    const [mouseY, setMouseY] = useState(0);
    const [userType, setUserType] = useState('JobSeeker');
    const { state } = useLocation();
    const navigate = useNavigate();
    const [isCheckingToken, setIsCheckingToken] = useState(true);

    const [notification, setNotification] = useState(null);
    const notificationSource  = state?.notificationSource;
    const notificationType = state?.notificationType;
    const notificationMessage = state?.notificationMessage;

    // Show notification
    const showNotification = (type, message) => {
        setNotification({ type, message });
        setTimeout(() => setNotification(null), 4000);
    };

    // Check for existing token and verify it
    useEffect(() => {
        const checkExistingToken = async () => {
            // Skip token checking if coming from logout
            if (state?.fromLogout) {
                setIsCheckingToken(false);
                return;
            }
            
            setIsCheckingToken(true);
            
            const token = localStorage.getItem('token');
            
            // Start a timer
            const timerPromise = new Promise(resolve => {
                setTimeout(() => resolve('timer_completed'), 800);
            });
            
            // Token verification process
            const verificationPromise = (async () => {
                if (!token) {
                    return 'no_token';
                }
                
                try {
                    // Check if token is valid and not expired
                    const decoded = jwtDecode(token);
                    
                    // Check if token is expired
                    const currentTime = Date.now() / 1000;
                    if (decoded.exp < currentTime) {
                        console.log('Token expired');
                        localStorage.removeItem('token');
                        return 'token_expired';
                    }
                    
                    // Token is valid, fetch user details
                    if (decoded.id) {
                        const response = await fetch(
                            `${process.env.REACT_APP_BACKEND_URL}/api/auth/user-details?id=${decoded.id}`,
                            {
                                headers: {
                                    Authorization: `Bearer ${token}`
                                }
                            }
                        );
                        
                        if (response.ok) {
                            const userData = await response.json();
                            return { valid: true, userData };
                        } else {
                            // Invalid response, clear token
                            localStorage.removeItem('token');
                            return 'invalid_response';
                        }
                    } else {
                        return 'no_id_in_token';
                    }
                } catch (error) {
                    console.error('Error verifying token:', error);
                    localStorage.removeItem('token');
                    return 'error';
                }
            })();
            
            // Wait for both the timer and verification to complete
            const [verificationResult, _] = await Promise.all([
                verificationPromise,
                timerPromise
            ]);
            
            // Now handle the verification result
            if (verificationResult.valid) {
                // Navigate to dashboard with user data
                navigate('/dashboard', { 
                    state: { 
                        user: verificationResult.userData,
                        isVerified: true 
                    } 
                });
            } else {
                // Any other result means we show the auth forms
                setIsCheckingToken(false);
            }
        };
        
        checkExistingToken();
    }, [navigate, state?.fromLogout]);

    useEffect(() => {
        if (notificationSource) {
            showNotification(notificationType, notificationMessage);
        }
        const handleMouseMove = (e) => {
            setMouseX(e.clientX / window.innerWidth);
            setMouseY(e.clientY / window.innerHeight);
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [notificationSource, notificationType, notificationMessage]);

    const toggleForm = () => {
        setIsFlipped((prev) => !prev);
    };

    const descriptions = {
        JobSeeker: {
            login: {
                heading: 'Your Next Career Step Awaits',
                body: 'Dive back into your personalized dashboard and explore new job opportunities tailored just for you.',
                cta: 'Your next career move is just a login away.',
            },
            register: {
                heading: 'Step into Your Future',
                body: 'Create an account and unlock a world of job opportunities that match your skills and goals.',
                cta: 'Your career transformation begins now.',
            },
        },
        Recruiter: {
            login: {
                heading: 'Your Next Great Hire Awaits',
                body: 'Access your recruiter dashboard and manage job postings with ease. Discover, review, and connect with top candidates faster than ever before.',
                cta: 'Log in and build the future of your team today.',
            },
            register: {
                heading: 'Find Your Perfect Hire',
                body: 'Join our platform to access a pool of exceptional talents and streamline your hiring process.',
                cta: 'Start hiring smarter today.',
            },
        },
    };

    const userDescriptions = descriptions[userType];

    // Constants for Form and Description Styling
    const formContainerStyles = {
        transformStyle: 'preserve-3d',
        transition: 'transform 1s ease-in-out',
        animation: isFlipped
            ? 'flipCardBack 1s ease-in-out forwards'
            : 'flipCardFront 1s ease-in-out forwards',
    };

    const formStyles = (rotation) => ({
        backfaceVisibility: 'hidden',
        transform: `rotateY(${rotation})`,
    });

    const descriptionStyles = {
        animation: isFlipped
            ? 'slideFadeIn 1s ease-in-out forwards'
            : 'slideFadeOut 1s ease-in-out forwards',
    };

    const descriptionBoxStyles = {
        base: 'text-gray-800 text-base md:text-lg bg-white/90 backdrop-blur-md p-4 md:p-6 rounded-lg shadow-md border border-gray-200',
        heading: 'text-2xl md:text-3xl font-extrabold mb-4 tracking-tight text-gray-900',
        paragraph: 'mb-2 md:mb-3 text-gray-700 leading-relaxed',
        italic: 'text-gray-500 font-light italic',
    };

    // Loading screen while checking token
    if (isCheckingToken) {
        return (
            <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-indigo-900 via-blue-800 to-purple-900 overflow-hidden relative">
                {/* Enhanced Background Elements */}
                <div className="absolute inset-0">
                    {/* Grid floor */}
                    <div className="absolute inset-0">
                        <div className="grid-floor"></div>
                    </div>
                    
                    {/* Glowing orbs */}
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-gradient-to-r from-blue-500/20 to-indigo-500/20 blur-xl animate-glow-slow"></div>
                    <div className="absolute bottom-1/3 right-1/3 w-64 h-64 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 blur-lg animate-glow-medium"></div>
                    <div className="absolute top-1/2 left-1/2 w-80 h-80 rounded-full bg-gradient-to-r from-indigo-500/20 to-cyan-500/20 blur-xl animate-glow-fast"></div>
                    
                    {/* Scanning lines */}
                    <div className="absolute top-0 w-full h-px bg-gradient-to-r from-transparent via-blue-400/50 to-transparent animate-scan-y"></div>
                    <div className="absolute bottom-0 w-full h-px bg-gradient-to-r from-transparent via-purple-400/50 to-transparent animate-scan-y-reverse"></div>
                    <div className="absolute left-0 h-full w-px bg-gradient-to-b from-transparent via-indigo-400/50 to-transparent animate-scan-x"></div>
                    <div className="absolute right-0 h-full w-px bg-gradient-to-b from-transparent via-cyan-400/50 to-transparent animate-scan-x-reverse"></div>
                    
                    {/* Floating particles */}
                    <div className="absolute top-0 left-0 w-full h-full">
                        {[...Array(30)].map((_, i) => (
                            <div 
                                key={i}
                                className="absolute w-1 h-1 md:w-2 md:h-2 rounded-full bg-white/60"
                                style={{
                                    top: `${Math.random() * 100}%`,
                                    left: `${Math.random() * 100}%`,
                                    animation: `floating-particle ${Math.random() * 10 + 10}s infinite linear`
                                }}
                            ></div>
                        ))}
                    </div>
                </div>
                
                {/* Center Content */}
                <div className="relative z-10 flex flex-col items-center justify-center p-8 text-center">
                    {/* Advanced Loading Ring */}
                    <div className="relative mb-10">
                        <div className="w-32 h-32 md:w-40 md:h-40 relative perspective-800">
                            <div className="loading-ring"></div>
                            <div className="loading-ring"></div>
                            <div className="loading-ring"></div>
                            <div className="loading-ring"></div>
                            
                            {/* Center icon with glow */}
                            <div className="absolute inset-0 flex items-center justify-center">
                                <svg className="w-16 h-16 md:w-20 md:h-20 text-blue-200 icon-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                    
                    {/* Enhanced Text Content */}
                    <h1 className="text-3xl md:text-5xl font-extrabold mb-3 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-200 via-indigo-300 to-purple-200 animate-text-gradient">
                        Career<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-400">Agent</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-md">
                        <span className="font-medium tracking-wide animate-pulse-text">Verifying your session</span>
                    </p>
                    
                    {/* Enhanced loading indicator */}
                    <div className="flex space-x-3 mt-4">
                        <div className="w-3 h-3 rounded-full bg-blue-300 animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-3 h-3 rounded-full bg-blue-300 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-3 h-3 rounded-full bg-blue-300 animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                    </div>
                </div>
                
                {/* Add custom styles for animations */}
                <style jsx>{`
                    .grid-floor {
                        position: absolute;
                        width: 200%;
                        height: 200%;
                        bottom: -50%;
                        left: -50%;
                        background-image: 
                            linear-gradient(rgba(50, 138, 241, 0.15) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(50, 138, 241, 0.15) 1px, transparent 1px);
                        background-size: 40px 40px;
                        transform: perspective(500px) rotateX(60deg);
                        animation: grid-animation 20s linear infinite;
                    }
                    
                    @keyframes grid-animation {
                        0% {
                            background-position: 0 0;
                        }
                        100% {
                            background-position: 0 40px;
                        }
                    }
                    
                    @keyframes floating-particle {
                        0% {
                            transform: translateY(0) translateX(0);
                            opacity: 0.3;
                        }
                        25% {
                            transform: translateY(-30px) translateX(20px);
                            opacity: 0.9;
                        }
                        50% {
                            transform: translateY(-10px) translateX(40px);
                            opacity: 0.5;
                        }
                        75% {
                            transform: translateY(20px) translateX(10px);
                            opacity: 0.7;
                        }
                        100% {
                            transform: translateY(0) translateX(0);
                            opacity: 0.3;
                        }
                    }
                    
                    .loading-ring {
                        position: absolute;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        border: 2px solid transparent;
                        border-radius: 50%;
                        animation: spin 3s linear infinite;
                    }
                    
                    .loading-ring:nth-child(1) {
                        border-top: 2px solid rgba(147, 197, 253, 0.8);
                        animation-duration: 3s;
                    }
                    
                    .loading-ring:nth-child(2) {
                        border-right: 2px solid rgba(139, 92, 246, 0.8);
                        animation-duration: 4s;
                    }
                    
                    .loading-ring:nth-child(3) {
                        border-bottom: 2px solid rgba(167, 139, 250, 0.8);
                        animation-duration: 5s;
                    }
                    
                    .loading-ring:nth-child(4) {
                        border-left: 2px solid rgba(96, 165, 250, 0.8);
                        animation-duration: 6s;
                    }
                    
                    @keyframes spin {
                        0% {
                            transform: rotate(0deg);
                        }
                        100% {
                            transform: rotate(360deg);
                        }
                    }
                    
                    @keyframes glow-animation-slow {
                        0%, 100% {
                            opacity: 0.3;
                            transform: scale(1);
                        }
                        50% {
                            opacity: 0.5;
                            transform: scale(1.1);
                        }
                    }
                    
                    @keyframes glow-animation-medium {
                        0%, 100% {
                            opacity: 0.2;
                            transform: scale(1);
                        }
                        50% {
                            opacity: 0.4;
                            transform: scale(1.15);
                        }
                    }
                    
                    @keyframes glow-animation-fast {
                        0%, 100% {
                            opacity: 0.1;
                            transform: scale(1);
                        }
                        50% {
                            opacity: 0.3;
                            transform: scale(1.2);
                        }
                    }
                    
                    .animate-glow-slow {
                        animation: glow-animation-slow 8s ease-in-out infinite;
                    }
                    
                    .animate-glow-medium {
                        animation: glow-animation-medium 6s ease-in-out infinite;
                    }
                    
                    .animate-glow-fast {
                        animation: glow-animation-fast 4s ease-in-out infinite;
                    }
                    
                    .animate-text-gradient {
                        background-size: 200% auto;
                        animation: text-gradient 4s linear infinite;
                    }
                    
                    @keyframes text-gradient {
                        0% {
                            background-position: 0% center;
                        }
                        100% {
                            background-position: 200% center;
                        }
                    }
                    
                    .animate-pulse-text {
                        animation: pulse-text 2s ease-in-out infinite;
                    }
                    
                    @keyframes pulse-text {
                        0%, 100% {
                            opacity: 0.9;
                        }
                        50% {
                            opacity: 0.7;
                        }
                    }
                    
                    @keyframes scan-y {
                        0% {
                            top: 0;
                            opacity: 0;
                        }
                        20% {
                            opacity: 1;
                        }
                        80% {
                            opacity: 1;
                        }
                        100% {
                            top: 100%;
                            opacity: 0;
                        }
                    }
                    
                    @keyframes scan-y-reverse {
                        0% {
                            bottom: 0;
                            opacity: 0;
                        }
                        20% {
                            opacity: 1;
                        }
                        80% {
                            opacity: 1;
                        }
                        100% {
                            bottom: 100%;
                            opacity: 0;
                        }
                    }
                    
                    @keyframes scan-x {
                        0% {
                            left: 0;
                            opacity: 0;
                        }
                        20% {
                            opacity: 1;
                        }
                        80% {
                            opacity: 1;
                        }
                        100% {
                            left: 100%;
                            opacity: 0;
                        }
                    }
                    
                    @keyframes scan-x-reverse {
                        0% {
                            right: 0;
                            opacity: 0;
                        }
                        20% {
                            opacity: 1;
                        }
                        80% {
                            opacity: 1;
                        }
                        100% {
                            right: 100%;
                            opacity: 0;
                        }
                    }
                    
                    .animate-scan-y {
                        animation: scan-y 8s linear infinite;
                    }
                    
                    .animate-scan-y-reverse {
                        animation: scan-y-reverse 8s linear infinite;
                        animation-delay: 4s;
                    }
                    
                    .animate-scan-x {
                        animation: scan-x 8s linear infinite;
                        animation-delay: 2s;
                    }
                    
                    .animate-scan-x-reverse {
                        animation: scan-x-reverse 8s linear infinite;
                        animation-delay: 6s;
                    }
                    
                    .perspective-800 {
                        perspective: 800px;
                        transform-style: preserve-3d;
                    }
                    
                    .icon-pulse {
                        filter: drop-shadow(0 0 8px rgba(191, 219, 254, 0.8));
                        animation: icon-pulse 2s ease-in-out infinite alternate;
                    }
                    
                    @keyframes icon-pulse {
                        0% {
                            transform: scale(0.95);
                            opacity: 0.7;
                        }
                        100% {
                            transform: scale(1.05);
                            opacity: 1;
                        }
                    }
                `}</style>
            </div>
        );
    }

    return (
        <div
            className="min-h-screen flex justify-center items-center overflow-hidden relative"
            style={{
                perspective: '1200px',
                background: 'linear-gradient(135deg, #ffffff, #a0a0a0, #999999)',
                backgroundSize: 'cover',
            }}
        >
            {notification && (
                <Notification
                    type={notification.type}
                    message={notification.message}
                    onClose={() => setNotification(null)}
                />
            )}
            <Botpress />
            {/* Animated Lines */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div
                    className="absolute top-0 left-1/4 w-1 h-full bg-gradient-to-b from-gray-600/80 to-transparent animate-pulse-fast"
                    style={{ transform: `translateY(${mouseY * 20}px)` }}
                />
                <div
                    className="absolute top-0 left-3/4 w-1 h-full bg-gradient-to-b from-gray-600/80 to-transparent animate-pulse-fast-reverse"
                    style={{ transform: `translateY(-${mouseY * 20}px)` }}
                />
                <div
                    className="absolute top-1/3 left-0 w-full h-1 bg-gradient-to-r from-gray-600/80 to-transparent animate-sweep-fast"
                    style={{ transform: `translateX(${mouseX * 20}px)` }}
                />
                <div
                    className="absolute top-2/3 left-0 w-full h-1 bg-gradient-to-r from-gray-600/80 to-transparent animate-sweep-fast-reverse"
                    style={{ transform: `translateX(-${mouseX * 20}px)` }}
                />
            </div>

            {/* Sliding + Flipping Form */}
            <div
                className="absolute h-full w-full sm:w-3/4 md:w-1/2 lg:w-1/2 flex justify-center items-center px-6 md:px-10"
                style={formContainerStyles}
            >
                {/* Front Side - Login */}
                <div
                    className="absolute w-full h-full flex justify-center items-center md:p-6"
                    style={formStyles('0deg')}
                >
                    <RegistrationForm toggleForm={toggleForm} setUserType={setUserType}/>
                </div>

                {/* Back Side - Registration */}
                <div
                    className="absolute w-full h-full flex justify-center items-center md:p-6"
                    style={formStyles('180deg')}
                >
                    <LoginForm toggleForm={toggleForm} setUserType={setUserType}/>
                </div>
            </div>

            {/* Description Text */}
            <div
                className="absolute h-full w-full sm:w-3/4 md:w-1/2 lg:w-1/2 flex justify-center items-center px-6 md:px-10"
                style={descriptionStyles}
            >
                {!isFlipped ? (
                    <div className={descriptionBoxStyles.base}>
                        <h2 className={descriptionBoxStyles.heading}>
                            {userDescriptions.login.heading}
                        </h2>
                        <p className={descriptionBoxStyles.paragraph}>
                            {userDescriptions.login.body}
                        </p>
                        <p className={descriptionBoxStyles.italic}>
                            {userDescriptions.login.cta}
                        </p>
                    </div>
                ) : (
                    <div className={descriptionBoxStyles.base}>
                        <h2 className={descriptionBoxStyles.heading}>
                            {userDescriptions.register.heading}
                        </h2>
                        <p className={descriptionBoxStyles.paragraph}>
                            {userDescriptions.register.body}
                        </p>
                        <p className={descriptionBoxStyles.italic}>
                            {userDescriptions.register.cta}
                        </p>
                    </div>
                )}
            </div>

            {/* Keyframes */}
            <style>
                {`
                @keyframes slideFadeIn {
                    0% {
                        left: 100%;
                        opacity: 0;
                        scale: 0;
                    }
                    100% {
                        left: 0%;
                        opacity: 1;
                        scale: 1;
                    }
                }

                @keyframes slideFadeOut {
                    0% {
                        left: -50%;
                        opacity: 0;
                        scale: 0;
                    }
                    100% {
                        left: 50%;
                        opacity: 1;
                        scale: 1;
                    }
                }

                @keyframes flipCardFront {
                    0% {
                        transform: translateX(40%) rotateY(0deg);
                    }
                    100% {
                        transform: translateX(-40%) rotateY(180deg);
                    }
                }

                @keyframes flipCardBack {
                    0% {
                        transform: translateX(-40%) rotateY(180deg);
                    }
                    100% {
                        transform: translateX(40%) rotateY(0deg);
                    }
                }

                `}
            </style>
        </div>
    );
};

export default AuthenticationPage;