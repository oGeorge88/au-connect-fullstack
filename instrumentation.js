// instrumentation.js
export function register() {
    console.log("Instrumentation Hook Registered");

    // Save the original fetch function
    const originalFetch = global.fetch;

    // Override the global fetch function
    global.fetch = async (...args) => {
        const response = await originalFetch(...args);
        console.log('Fetch made:', args);  // Log the fetch call and its arguments
        return response;  // Return the original response
    };
}
