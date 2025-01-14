import React, { useState, useEffect } from 'react';
import RegistrationForm from '../components/RegistrationForm';
import LoginForm from '../components/LoginForm';
import { useLocation } from 'react-router-dom';
import Notification from '../components/Notification';
import Botpress from '../botpress/Botpress';


const AuthenticationPage = () => {
    const [isFlipped, setIsFlipped] = useState(false);
    const [mouseX, setMouseX] = useState(0);
    const [mouseY, setMouseY] = useState(0);
    const [userType, setUserType] = useState('jobseeker');
    const { state } = useLocation();

    const [notification, setNotification] = useState(null);
    const notificationSource  = state?.notificationSource;
    const notificationType = state?.notificationType;
    const notificationMessage = state?.notificationMessage;

    // Show notification
    const showNotification = (type, message) => {
        setNotification({ type, message });
        setTimeout(() => setNotification(null), 4000);
    };

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
    }, []);

    const toggleForm = () => {
        setIsFlipped((prev) => !prev);
    };

    const descriptions = {
        jobseeker: {
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
        recruiter: {
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