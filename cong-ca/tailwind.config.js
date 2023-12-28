/** @type {import('tailwindcss').Config} */
module.exports = {
    corePlugins: {
        preflight: false,
    },
    content: [
        "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                danger: "#F64E60",
                success: "#1bc5bd",
                primary: "#1b84ff",
                "primary-light": "#E1F0FF"
            },
            boxShadow: {
                lg: '0px 0px 50px 0px rgba(82, 63, 105, 0.15)',
                sm: '0px 0px 20px 0px rgba(76, 87, 125, 0.02)'
            },
        },
    },
    plugins: [],
}