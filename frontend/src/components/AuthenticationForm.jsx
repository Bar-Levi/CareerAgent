import React, { useState, useEffect } from 'react';
import RegistrationForm from './RegistrationForm';
import LoginForm from './LoginForm';

const AuthenticationForm = () => {
    const [isFlipped, setIsFlipped] = useState(false);
    const [mouseX, setMouseX] = useState(0);
    const [mouseY, setMouseY] = useState(0);

    useEffect(() => {
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
                    <LoginForm toggleForm={toggleForm} />
                </div>

                {/* Back Side - Registration */}
                <div
                    className="absolute w-full h-full flex justify-center items-center md:p-6"
                    style={formStyles('180deg')}
                >
                    <RegistrationForm toggleForm={toggleForm} />
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
                            Already have an account?
                        </h2>
                        <p className={descriptionBoxStyles.paragraph}>
                            Log in to access your personalized dashboard and continue your journey with us.
                        </p>
                        <p className={descriptionBoxStyles.italic}>
                            Find your dream job or connect with top talents effortlessly.
                        </p>
                    </div>
                ) : (
                    <div className={descriptionBoxStyles.base}>
                        <h2 className={descriptionBoxStyles.heading}>
                            New here?
                        </h2>
                        <p className={descriptionBoxStyles.paragraph}>
                            Create an account to unlock amazing opportunities tailored just for you.
                        </p>
                        <p className={descriptionBoxStyles.italic}>
                            Start your journey towards success today!
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

export default AuthenticationForm;
