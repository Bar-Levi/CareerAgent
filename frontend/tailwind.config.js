module.exports = {
    content: [
        './src/**/*.{js,jsx}',
        './public/index.html'
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ["Inter", "system-ui", "sans-serif"],
                heading: ["Plus Jakarta Sans", "sans-serif"],
                display: ["Outfit", "sans-serif"],
                modern: ["Space Grotesk", "sans-serif"],
                elegant: ["Manrope", "sans-serif"],
            },
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
                "slide-up": "slide-up 0.3s ease-out",
                
                // Flipping and rotating animations
                'flip': 'flip 1s ease-in-out',
                'rotate-scale': 'rotate-scale 1s ease-in-out',
                'scale-up': 'scale-up 0.5s ease-in-out',
                'scale-down': 'scale-down 0.5s ease-in-out',
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

                // Flipping effect
                flip: {
                    '0%': { transform: 'rotateY(0)' },
                    '50%': { transform: 'rotateY(90deg)' },
                    '100%': { transform: 'rotateY(0)' },
                },

                // Rotating and scaling effect
                'rotate-scale': {
                    '0%': { transform: 'rotate(0deg) scale(1)' },
                    '50%': { transform: 'rotate(180deg) scale(1.2)' },
                    '100%': { transform: 'rotate(360deg) scale(1)' },
                },

                // Scaling up and down effects
                'scale-up': {
                    '0%': { transform: 'scale(0.8)' },
                    '100%': { transform: 'scale(1)' },
                },
                'scale-down': {
                    '0%': { transform: 'scale(1)' },
                    '100%': { transform: 'scale(0.8)' },
                },
                "slide-up": {
                    "0%": { transform: "translateY(100%)", opacity: 0 },
                    "100%": { transform: "translateY(0)", opacity: 1 },
                    },
            },
            colors: {
                // Custom colors for brand or themes
                brand: {
                    primary: '#425260',
                    secondary: '#dde2e8',
                    accent: '#edf2f6',
                },
                gray: {
                    100: '#f7f7f7',
                    200: '#e5e5e5',
                    300: '#d4d4d4',
                    400: '#a3a3a3',
                    500: '#6b7280',
                    600: '#4b5563',
                    700: '#374151',
                    800: '#1f2937',
                    900: '#111827',
                },
                card: {
                    DEFAULT: 'rgb(17, 17, 17)',
                    foreground: 'rgb(250, 250, 250)'
                },
            },
        },
    },
    plugins: [],
};
