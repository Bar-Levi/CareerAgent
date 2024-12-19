module.exports = {
    content: ['./src/**/*.{js,jsx}', './public/index.html'],
    theme: {
        extend: {
            animation: {
                // Faster pulse and sweep animations
                'pulse-fast': 'pulse 2s infinite',
                'pulse-fast-reverse': 'pulse-reverse 2s infinite',
                'sweep-fast': 'sweep 4s linear infinite',
                'sweep-fast-reverse': 'sweep-reverse 4s linear infinite',

                // Standard animations
                'pulse': 'pulse 3s infinite',
                'float': 'float 6s ease-in-out infinite',

                // Sliding and fading animations
                'slide-in': 'slide-in 0.8s ease-out',
                'slide-up-fast': 'slide-up 0.8s ease-out',
                'slide-down-fast': 'slide-down 0.8s ease-out',
                'slide-down': 'slide-down 0.8s ease-out',
                'fade-in': 'fade-in 1s ease-in-out',
                'fade-in-fast': 'fade-in 0.5s ease-in-out',
            },
            keyframes: {
                // Sweeping effects
                sweep: {
                    '0%': { transform: 'translateX(-100%)' },
                    '100%': { transform: 'translateX(100%)' },
                },
                'sweep-reverse': {
                    '0%': { transform: 'translateX(100%)' },
                    '100%': { transform: 'translateX(-100%)' },
                },

                // Pulsing effects
                pulse: {
                    '0%, 100%': { opacity: 0.5 },
                    '50%': { opacity: 1 },
                },
                'pulse-reverse': {
                    '0%, 100%': { opacity: 1 },
                    '50%': { opacity: 0.5 },
                },

                // Floating effects
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-10px)' },
                },

                // Sliding effects
                'slide-in': {
                    '0%': { opacity: 0, transform: 'translateY(100px)' },
                    '100%': { opacity: 1, transform: 'translateY(0)' },
                },
                'slide-up': {
                    '0%': { transform: 'translateY(100%)' },
                    '100%': { transform: 'translateY(0)' },
                },
                'slide-down': {
                    '0%': { transform: 'translateY(-100px)', opacity: 0 },
                    '100%': { transform: 'translateY(0)', opacity: 1 },
                },

                // Fading effects
                'fade-in': {
                    '0%': { opacity: 0 },
                    '100%': { opacity: 1 },
                },
            },
        },
    },
};
