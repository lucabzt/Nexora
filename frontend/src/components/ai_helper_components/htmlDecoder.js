import he from 'he';

/**
 * Simple but effective HTML entity decoder that preserves syntax-critical entities
 */
function simpleSafeHtmlDecode(code) {
    // Step 1: Fix ALL single-quoted JS strings that contain apostrophes or &apos;
    let processedCode = code;

    // Match any single-quoted string (handling escaped quotes properly)
    const singleQuotePattern = /'((?:[^'\\]|\\.)*)'/g;

    processedCode = processedCode.replace(singleQuotePattern, (match, content) => {
        // Check if this string contains apostrophes (either literal or &apos;)
        const hasApostrophe = content.includes("'") || content.includes("&apos;");

        if (hasApostrophe) {
            // Convert &apos; to literal apostrophes
            const cleanContent = content.replace(/&apos;/g, "'");

            // Escape any double quotes in the content and wrap in double quotes
            const escapedContent = cleanContent.replace(/"/g, '\\"');
            return `"${escapedContent}"`;
        }

        // Keep as single-quoted if no apostrophes
        return match;
    });

    // Step 2: Protect JSX-critical entities before decoding
    const protectedEntities = {
        '&lt;': '__PROTECTED_LT__',
        '&gt;': '__PROTECTED_GT__',
        '&amp;': '__PROTECTED_AMP__',
        // Also protect numeric/hex versions
        '&#60;': '__PROTECTED_LT__',
        '&#62;': '__PROTECTED_GT__',
        '&#38;': '__PROTECTED_AMP__',
        '&#x3C;': '__PROTECTED_LT__',
        '&#x3E;': '__PROTECTED_GT__',
        '&#x26;': '__PROTECTED_AMP__'
    };

    // Replace protected entities with placeholders
    Object.entries(protectedEntities).forEach(([entity, placeholder]) => {
        processedCode = processedCode.replace(new RegExp(entity, 'g'), placeholder);
    });

    // Step 3: Decode all other entities safely
    processedCode = he.decode(processedCode);

    // Step 4: Restore protected entities
    Object.entries(protectedEntities).forEach(([entity, placeholder]) => {
        processedCode = processedCode.replace(new RegExp(placeholder, 'g'), entity);
    });

    return processedCode;
}

export default simpleSafeHtmlDecode;