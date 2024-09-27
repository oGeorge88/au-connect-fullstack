// instrumentation.js
export function register() {
    console.log("Instrumentation Hook Registered");

    // Save the original fetch function
    const originalFetch = global.fetch;

    // Override the global fetch function
    global.fetch = async (...args) => {
        try {
            const response = await originalFetch(...args);
            console.log('Fetch made:', args);  // Log the fetch call and its arguments
            console.log('Response status:', response.status);  // Log the response status
            return response;  // Return the original response
        } catch (error) {
            console.error('Fetch error:', error, 'with arguments:', args);
            throw error;  // Rethrow the error to maintain original behavior
        }
    };

    // Return a function to restore the original fetch
    return () => {
        global.fetch = originalFetch;
        console.log("Restored original fetch function");
    };
}
